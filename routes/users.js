import { Router } from "express";
import usersCollection from "../db/users-db.js";
import { requireRole } from "../middleware/auth.js";

const usersRouter = Router();

// ----------------------------
// GET MEMBERS OF MY CLUB
// ----------------------------
usersRouter.get("/", requireRole("treasurer"), async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.json([]);
    }
    const members = await usersCollection.findUsersByGroup(req.user.groupId);
    res.json(members);
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

export default usersRouter;
