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

// Starts a fresh semester for the treasurer's own club: renames it, regenerates
// its join code, clears the roster (members detached, staff stay), and archives
// the term's pending dues.
groupsRouter.post("/semester", requireRole("treasurer"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "A semester name is required" });
    }
    if (!req.user.groupId) {
      return res.status(400).json({ message: "Create a club first" });
    }

    const groupId = req.user.groupId;
    await groupsCollection.updateGroup(groupId, { name });
    const joinCode = await groupsCollection.regenerateJoinCode(groupId);
    await usersCollection.resetGroupRoster(groupId);
    await duesSubmissionsCollection.archivePendingForGroup(groupId);

    res.json({ name, joinCode });
  } catch (error) {
    console.error("Error starting new semester", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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
