import { Router } from "express";
import eventsCollection from "../db/events-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import usersCollection from "../db/users-db.js";

const eventRouter = Router();
const TIER_RANK = { none: 0, silver: 1, gold: 2 };

// Decide whether a user may RSVP. Returns a clear reason on failure so the UI
// can tell the member exactly WHY (your proposal calls for this).
function checkEligibility(user, event) {
  // "none" events are open to everyone — no dues required.
  if (event.requiredTier === "none") {
    return { eligible: true };
  }
  // Tiered events require approved dues first.
  if (user.duesStatus !== "approved") {
    return {
      eligible: false,
      reason: "You must have approved dues to RSVP for this event.",
    };
  }
  // And your approved tier must meet the event's required tier.
  const userRank = TIER_RANK[user.duesTier] ?? 0; // "null"/undefined → 0
  const requiredRank = TIER_RANK[event.requiredTier] ?? 0;
  if (userRank < requiredRank) {
    return {
      eligible: false,
      reason: `This event requires the ${event.requiredTier} tier.`,
    };
  }
  return { eligible: true };
}

eventRouter.get("/", isAuthenticated, async (req, res) => {
  try {
    // events are scoped to the user's own club — someone who hasn't joined a
    // group sees nothing, and never sees another club's events.
    if (!req.user.groupId) {
      return res.json([]);
    }
    const events = await eventsCollection.getEventsByGroup(req.user.groupId);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { name, type, date, location, requiredTier } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: "Name and date are required" });
    }

    // events attach to the admin's own club.
    if (!req.user.groupId) {
      return res
        .status(400)
        .json({ message: "Create a club before adding events" });
    }

    const result = await eventsCollection.createEvent({
      groupId: req.user.groupId,
      name,
      type,
      date: new Date(date),
      location,
      requiredTier: requiredTier || "none",
      createdBy: req.user._id,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/events/mine — events in the active group the current user RSVP'd to.
// MUST stay above "/:id" or Express treats "mine" as an event id.
eventRouter.get("/mine", isAuthenticated, async (req, res) => {
  try {
    if (!req.user.groupId) {
      return res.json([]);
    }
    const events = await eventsCollection.getEventsForUser(
      req.user._id,
      req.user.groupId
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching your RSVPs", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // only members of the event's own club may view it. 404 (not 403) so we
    // don't reveal that an event with this id exists in another group.
    if (
      !req.user.groupId ||
      String(event.groupId) !== String(req.user.groupId)
    ) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { name, type, date, location, requiredTier } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (type !== undefined) update.type = type;
    if (date !== undefined) update.date = new Date(date);
    if (location !== undefined) update.location = location;
    if (requiredTier !== undefined) update.requiredTier = requiredTier;
    const updated = await eventsCollection.updateEvent(req.params.id, update);
    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const deleteCount = await eventsCollection.deleteEvent(req.params.id);
    if (!deleteCount) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event cancelled" });
  } catch (error) {
    console.error("Error deleting event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.post("/:id/rsvp", isAuthenticated, async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // can't RSVP to an event outside your own club.
    if (
      !req.user.groupId ||
      String(event.groupId) !== String(req.user.groupId)
    ) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { eligible, reason } = checkEligibility(req.user, event);
    if (!eligible) {
      // 403 = "we know who you are, you're just not allowed" — with the reason.
      return res.status(403).json({ message: reason });
    }

    const updated = await eventsCollection.addRsvp(req.params.id, req.user._id);
    res.json(updated);
  } catch (error) {
    console.error("Error creating RSVP", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/events/:id/rsvp — remove the current user's RSVP. No eligibility
// check needed to leave, but you can only touch your own club's event.
eventRouter.delete("/:id/rsvp", isAuthenticated, async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (
      !req.user.groupId ||
      String(event.groupId) !== String(req.user.groupId)
    ) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updated = await eventsCollection.removeRsvp(
      req.params.id,
      req.user._id
    );
    res.json(updated);
  } catch (error) {
    console.error("Error removing RSVP", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.get("/:id/rsvps", requireRole("admin"), async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // event.rsvps is an array of user ObjectIds — look them all up in one query.
    const users = await usersCollection.findUsersByIds(event.rsvps);

    // Build a CLEAN list — never leak passwordHash to the client.
    const attendees = users.filter(Boolean).map((u) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      duesTier: u.duesTier,
    }));

    res.json(attendees);
  } catch (error) {
    console.error("Error fetching RSVP list", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default eventRouter;
