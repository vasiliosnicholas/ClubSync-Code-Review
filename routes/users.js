import { Router } from "express";
import usersCollection from "../db/users-db.js";
import groupsCollection from "../db/groups-db.js";
import { requireRole } from "../middleware/auth.js";

const usersRouter = Router();

// ----------------------------
// GET MEMBERS OF MY CLUB
// ----------------------------
usersRouter.get("/", requireRole("treasurer"), async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.json({ members: [], total: 0, page: 1, pageSize: 15 });
    }
    // pageSize=all is for callers that need the whole
    // roster like CSV export, the discount assignment dropdown, the e-board
    // widget rather than just one page of it.
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize =
      req.query.pageSize === "all"
        ? 0
        : Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 15));
    const { total, items } = await usersCollection.findUsersByGroup(
      req.user.groupId,
      { page, pageSize }
    );
    res.json({
      members: items,
      total,
      page,
      pageSize: pageSize > 0 ? pageSize : total,
    });
  } catch (error) {
    console.error("Error fetching club members", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// GET THE TOTAL COUNT OF MEMBERS IN MY CLUB
// ----------------------------
usersRouter.get("/count", requireRole("admin"), async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.json({count: 0});
    }
    const membersCount = await usersCollection.getUserCountByGroup(req.user.groupId);
    res.json({membersCount});
  } catch (error) {
    console.error("Error fetching total member count", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// UPDATE A MEMBER'S ROLE
// ----------------------------
usersRouter.patch("/:id/role", requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body ?? {};
    if (!["member", "treasurer", "admin"].includes(role)) {
      return res.status(400).json({ message: "A valid role is required" });
    }

    // an admin may only change roles for members of their own club.
    const target = await usersCollection.findUserById(req.params.id);
    if (!target || String(target.groupId) !== String(req.user.groupId)) {
      return res.status(404).json({ message: "Member not found in your club" });
    }

    const updated = await usersCollection.setRole(req.params.id, role);
    res.json({ id: updated._id, role: updated.role });
  } catch (error) {
    console.error("Error updating member role", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// ASSIGN / CLEAR A MEMBER'S DISCOUNT
// ----------------------------
usersRouter.patch("/:id/discount", requireRole("treasurer"), async (req, res) => {
  try {
    // a treasurer may only touch members of their own club.
    const target = await usersCollection.findUserById(req.params.id);
    if (!target || String(target.groupId) !== String(req.user.groupId)) {
      return res.status(404).json({ message: "Member not found in your club" });
    }

    const { discount } = req.body ?? {};

    // null clears any discount
    if (discount === null) {
      const updated = await usersCollection.setDiscount(req.params.id, null);
      return res.json(updated);
    }

    // otherwise the name must match a discount the club defined; snapshot its
    // amount server-side so the client can't invent one.
    const group = await groupsCollection.findGroupById(req.user.groupId);
    const match = (group?.discountTypes || []).find(
      (d) => d.name === discount?.name
    );
    if (!match) {
      return res.status(400).json({ message: "Unknown discount for this club" });
    }

    const updated = await usersCollection.setDiscount(req.params.id, {
      name: match.name,
      amount: match.amount,
    });
    res.json(updated);
  } catch (error) {
    console.error("Error assigning discount", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default usersRouter;
