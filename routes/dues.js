import { Router } from "express";
import usersCollection from "../db/users-db.js";
import duesSubmissionsCollection from "../db/dues-submissions-db.js";
import groupsCollection from "../db/groups-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const duesRouter = Router();

// ----------------------------
// POST DUES SUBMISSION
// ----------------------------
duesRouter.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const { tier, paymentReference, paymentMethod } = req.body ?? {};

    if (!["gold", "silver"].includes(tier)) {
      return res
        .status(400)
        .json({ message: "A gold or silver tier is required" });
    }

    // a payment reference must match the pattern for its method, so junk
    // ("asdf", empty) can't be submitted. This is the real gate — the client
    // validates too, but never trust it.
    const PAYMENT_PATTERNS = {
      venmo: {
        regex: /^\d{6,25}$/,
        hint: "a 6–25 digit Venmo transaction/confirmation number",
      },
      check: { regex: /^\d{1,6}$/, hint: "a 1–6 digit check number" },
    };
    const rule = PAYMENT_PATTERNS[paymentMethod];
    if (!rule) {
      return res
        .status(400)
        .json({ message: "Choose a payment method (Venmo or Check)" });
    }
    const reference = String(paymentReference ?? "").trim();
    if (!rule.regex.test(reference)) {
      return res.status(400).json({ message: `Enter ${rule.hint}.` });
    }

    if (!req.user.groupId) {
      return res
        .status(400)
        .json({ message: "Join a club before submitting dues" });
    }

    const group = await groupsCollection.findGroupById(req.user.groupId);
    const amount = group?.duesAmounts?.[tier];
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        message: "Your treasurer hasn't set dues prices for this club yet",
      });
    }

    const updated = await usersCollection.submitDues(
      req.user._id,
      tier,
      amount
    );
    if (!updated) {
      return res.status(409).json({ message: "Dues already submitted" });
    }

    const submission = await duesSubmissionsCollection.createSubmission({
      userId: req.user._id,
      groupId: updated.groupId,
      tier: updated.duesTier,
      amount,
      paymentReference: reference,
      paymentMethod,
    });

    res.json({
      duesStatus: updated.duesStatus,
      submissionId: submission?.id,
      amount,
    });
  } catch (error) {
    console.error("Error submitting dues", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// GET MY LATEST DUES SUBMISSION
// ----------------------------
duesRouter.get("/mine", isAuthenticated, async (req, res) => {
  try {
    const submission = await duesSubmissionsCollection.getLatestForUser(
      req.user._id
    );

    if (!submission) {
      return res.json({ submission: null });
    }

    res.json({
      submission: {
        submissionId: submission._id,
        status: submission.status,
        tier: submission.tier,
        amount: submission.amount,
        reviewNote: submission.reviewNote,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching your dues submission", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// DELETE (WITHDRAW) MY DUES SUBMISSION
// ----------------------------
duesRouter.delete("/:submissionId", isAuthenticated, async (req, res) => {
  try {
    const deleted = await duesSubmissionsCollection.deleteSubmission(
      req.params.submissionId,
      req.user._id
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "No pending submission found to withdraw" });
    }

    await usersCollection.setDuesStatus(req.user._id, "not_submitted");

    res.json({ submissionId: deleted._id });
  } catch (error) {
    console.error("Error withdrawing dues submission", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// GET DUES STATS
// ----------------------------
duesRouter.get(
  "/stats/:groupId",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      const stats = await usersCollection.getDuesStats(req.params.groupId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dues stats", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// ----------------------------
// GET PENDING DUES VERIFICATIONS
// ----------------------------
duesRouter.get(
  "/pending/:groupId",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(req.query.pageSize, 10) || 10)
      );
      const { total, items } = await duesSubmissionsCollection.getPending(
        req.params.groupId,
        { page, pageSize }
      );

      const members = await usersCollection.findUsersByIds(
        items.map((s) => s.userId)
      );
      const membersById = new Map(members.map((m) => [String(m._id), m]));

      const pending = items.map((s) => {
        const member = membersById.get(String(s.userId));
        return {
          submissionId: s._id,
          userId: s.userId,
          firstName: member?.firstName ?? null,
          lastName: member?.lastName ?? null,
          email: member?.email ?? null,
          tier: s.tier,
          amount: s.amount,
          paymentReference: s.paymentReference,
          paymentMethod: s.paymentMethod,
          submittedAt: s.submittedAt,
        };
      });

      res.json({ total, pending, page, pageSize });
    } catch (error) {
      console.error("Error fetching pending dues", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// ----------------------------
// UPDATE A PENDING DUE SUBMISSION
// ----------------------------
duesRouter.patch(
  "/review/:submissionId",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      const { decision, reviewNote } = req.body ?? {};

      if (!["approved", "denied"].includes(decision)) {
        return res
          .status(400)
          .json({ message: "An approved or denied decision is required" });
      }

      const note = decision === "denied" ? (reviewNote ?? "").trim() : null;
      if (decision === "denied" && !note) {
        return res
          .status(400)
          .json({ message: "A reason is required to deny a submission" });
      }

      const submission = await duesSubmissionsCollection.reviewSubmission(
        req.params.submissionId,
        { status: decision, reviewNote: note, reviewedBy: req.user._id }
      );

      if (!submission) {
        return res
          .status(409)
          .json({ message: "Submission not found or already reviewed" });
      }

      await usersCollection.setDuesStatus(submission.userId, decision);

      res.json({ submissionId: submission._id, status: submission.status });
    } catch (error) {
      console.error("Error reviewing dues submission", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default duesRouter;
