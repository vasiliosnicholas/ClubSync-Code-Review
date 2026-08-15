import { Router } from "express";
import groupsCollection from "../db/groups-db.js";
import usersCollection from "../db/users-db.js";
import duesSubmissionsCollection from "../db/dues-submissions-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const groupsRouter = Router();

groupsRouter.get("/", requireRole("treasurer"), async (req, res) => {
  try {
    const groups = await groupsCollection.getAllGroups();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Starts a fresh semester for the admin's own club: renames it, regenerates
// its join code, clears the roster (members detached, staff stay), archives
// the term's pending dues, and clears the dues amounts so the treasurer must
// set new prices before anything else works this term.
groupsRouter.post("/semester", requireRole("admin"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "A semester name is required" });
    }
    if (!req.user.groupId) {
      return res.status(400).json({ message: "Create a club first" });
    }

    const groupId = req.user.groupId;
    await groupsCollection.updateGroup(groupId, {
      name,
      duesAmounts: null,
      discountTypes: [],
    });
    const joinCode = await groupsCollection.regenerateJoinCode(groupId);
    await usersCollection.resetGroupRoster(groupId);
    await duesSubmissionsCollection.archivePendingForGroup(groupId);

    res.json({ name, joinCode });
  } catch (error) {
    console.error("Error starting new semester", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Sets the gold/silver dues prices for the treasurer's own club. This is the
// gate the frontend checks before rendering the rest of the treasurer
// dashboard, and can be called again later to change the price mid-semester.
groupsRouter.put("/dues-amounts", requireRole("treasurer"), async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.status(400).json({ message: "Create a club first" });
    }

    const gold = Number(req.body?.gold);
    const silver = Number(req.body?.silver);
    if (!Number.isFinite(gold) || gold < 0 || !Number.isFinite(silver) || silver < 0) {
      return res.status(400).json({
        message: "Gold and silver prices must both be zero or a positive number",
      });
    }

    const updated = await groupsCollection.setDuesAmounts(req.user.groupId, {
      gold,
      silver,
    });
    res.json(updated);
  } catch (error) {
    console.error("Error setting dues amounts", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

groupsRouter.put(
  "/discount-types",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      if (!req.user.groupId) {
        return res.status(400).json({ message: "Create a club first" });
      }

      const { discountTypes } = req.body;
      if (!Array.isArray(discountTypes)) {
        return res
          .status(400)
          .json({ message: "discountTypes must be an array" });
      }

      // keep only clean {name, amount} entries — don't trust the client's shape
      const clean = discountTypes
        .filter(
          (d) =>
            d &&
            typeof d.name === "string" &&
            d.name.trim() !== "" &&
            Number.isFinite(Number(d.amount)) &&
            Number(d.amount) >= 0
        )
        .map((d) => ({ name: d.name.trim(), amount: Number(d.amount) }));

      const updated = await groupsCollection.setDiscountTypes(
        req.user.groupId,
        clean
      );
      res.json(updated);
    } catch (error) {
      console.error("Error setting discount types", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Lets a member join a club by entering its current join code.
groupsRouter.post("/join", isAuthenticated, async (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ message: "A join code is required" });
    }

    const group = await groupsCollection.findGroupByJoinCode(joinCode.trim());
    if (!group || !group.active) {
      return res.status(404).json({ message: "That join code is not valid" });
    }

    const updated = await usersCollection.joinClub(req.user._id, group._id);
    if (!updated) {
      return res.status(400).json({ message: "Could not join the group" });
    }

    res.json({ groupId: group._id, groupName: group.name });
  } catch (error) {
    console.error("Error joining group", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Lets a member leave the club they're currently in.
groupsRouter.post("/leave", isAuthenticated, async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.status(400).json({ message: "You are not in a club" });
    }

    const updated = await usersCollection.leaveClub(req.user._id);
    if (!updated) {
      return res.status(400).json({ message: "Could not leave the group" });
    }

    res.json({ groupId: null });
  } catch (error) {
    console.error("Error leaving group", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

groupsRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const group = await groupsCollection.findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    console.error("Error fetching group", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

groupsRouter.put("/:id", requireRole("treasurer"), async (req, res) => {
  try {
    const { name, active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (active !== undefined) updates.active = active;
    const updated = await groupsCollection.updateGroup(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating group", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default groupsRouter;
