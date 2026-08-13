import { connect } from "./config.js";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

function EventsCollection({ collectionName = "events" } = {}) {
  const me = {};

  const events = connect(collectionName);

  me.createEvent = async ({
    groupId,
    name,
    type,
    date,
    location,
    requiredTier,
    createdBy,
  }) => {
    try {
      const newEventDoc = {
        groupId,
        name,
        type,
        date,
        location,
        requiredTier,
        createdBy,
        rsvps: [],
        createdAt: new Date(),
      };

      const result = await events.insertOne(newEventDoc);
      console.log("Created new event in MongoDB");
      return { id: result.insertedId, name, createdBy };
    } catch (error) {
      console.error("Error registering new event", error);
      throw error;
    }
  };

  me.getEventsByGroup = async (groupId) => {
    try {
      return await events.find({ groupId }).toArray();
    } catch (error) {
      console.error("Error finding events from this group", error);
      throw error;
    }
  };

  // Events in a group that the given user has RSVP'd to. Mongo matches an
  // array field ("rsvps") against a single value by checking membership.
  me.getEventsForUser = async (userId, groupId) => {
    try {
      if (!ObjectId.isValid(userId)) return [];
      return await events
        .find({ groupId, rsvps: new ObjectId(userId) })
        .toArray();
    } catch (error) {
      console.error("Error finding events for user", error);
      throw error;
    }
  };

  // soonest events that haven't happened yet, for the upcoming-events widget.
  me.getUpcomingEventsByGroup = async (groupId, limit = 5) => {
    try {
      return await events
        .find({ groupId, date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error finding upcoming events", error);
      throw error;
    }
  };

  // most recent events that have already happened, for participation stats.
  me.getRecentPastEventsByGroup = async (groupId, limit = 5) => {
    try {
      return await events
        .find({ groupId, date: { $lte: new Date() } })
        .sort({ date: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error finding recent past events", error);
      throw error;
    }
  };

  me.findEventById = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      return await events.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error finding event by id", error);
      throw error;
    }
  };

  me.deleteEvent = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      const result = await events.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount; // 1 if deleted, 0 if no match
    } catch (error) {
      console.error("Error deleting event", error);
      throw error;
    }
  };

  me.updateEvent = async (id, update) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      await events.updateOne({ _id: new ObjectId(id) }, { $set: update });
      return await me.findEventById(id);
    } catch (error) {
      console.error("Error updating event", error);
      throw error;
    }
  };

  me.addRsvp = async (eventId, userId) => {
    try {
      if (!ObjectId.isValid(eventId)) return null;
      await events.updateOne(
        { _id: new ObjectId(eventId) },
        { $addToSet: { rsvps: new ObjectId(userId) } }
      );
      return await me.findEventById(eventId); // return updated event so route can respond
    } catch (error) {
      console.error("Error adding RSVP", error);
      throw error;
    }
  };

  // remove a user from an event's rsvps ($pull is the inverse of $addToSet)
  me.removeRsvp = async (eventId, userId) => {
    try {
      if (!ObjectId.isValid(eventId)) return null;
      await events.updateOne(
        { _id: new ObjectId(eventId) },
        { $pull: { rsvps: new ObjectId(userId) } }
      );
      return await me.findEventById(eventId);
    } catch (error) {
      console.error("Error removing RSVP", error);
      throw error;
    }
  };

  return me;
}

const eventsCollection = EventsCollection();
export default eventsCollection;
