import { connect } from "./config.js";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

function GroupsCollection({ collectionName = "groups" } = {}) {
  const me = {};

  const groups = connect(collectionName);

  // This is a private helper that is not attatched to me
  const generateJoinCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await groups.findOne({ joinCode: code });
    return existing ? generateJoinCode() : code;
  };

  // Creates a group. Each club is independent, so creating one does not touch
  // any other club.
  me.createGroup = async ({ name, createdBy }) => {
    try {
      const generatedJoinClubId = await generateJoinCode();
      const newClubDoc = {
        name,
        joinCode: generatedJoinClubId,
        createdBy,
        active: true,
        duesAmounts: null,
        discountTypes: [],
        createdAt: new Date(),
      };

      const result = await groups.insertOne(newClubDoc);
      console.log("Registered new Club in MongoDB");
      return { id: result.insertedId, name, joinCode: generatedJoinClubId };
    } catch (error) {
      console.error("Error registering new club", error);
      throw error;
    }
  };

  // Gets all of the groups that are stored in the groups collection
  me.getAllGroups = async () => {
    try {
      return await groups.find({}).toArray();
    } catch (error) {
      console.error("Error fetching all groups", error);
      throw error;
    }
  };

  // Issues a fresh join code for a club (used when starting a new semester).
  // Returns the new code.
  me.regenerateJoinCode = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      const joinCode = await generateJoinCode();
      await groups.updateOne({ _id: new ObjectId(id) }, { $set: { joinCode } });
      return joinCode;
    } catch (error) {
      console.error("Error regenerating join code", error);
      throw error;
    }
  };

  me.findGroupById = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      return await groups.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error finding group by id", error);
      throw error;
    }
  };

  me.findGroupByJoinCode = async (joinCode) => {
    try {
      return await groups.findOne({ joinCode });
    } catch (error) {
      console.error("Error find group by join code", error);
      throw error;
    }
  };
  // sets the gold/silver dues prices for a club. Must be called by the
  // treasurer before members can submit dues or anything else renders on
  // their dashboard; gets reset back to null each time a new semester starts.
  me.setDuesAmounts = async (id, { gold, silver }) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      await groups.updateOne(
        { _id: new ObjectId(id) },
        { $set: { duesAmounts: { gold, silver } } }
      );
      return await me.findGroupById(id);
    } catch (error) {
      console.error("Error setting dues amounts", error);
      throw error;
    }
  };

  // sets the club's list of named discounts (e.g. Scholarship, Officer waiver).
  // Each entry is a { name, amount } the treasurer can then assign to members.
  me.setDiscountTypes = async (id, discountTypes) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      await groups.updateOne(
        { _id: new ObjectId(id) },
        { $set: { discountTypes } }
      );
      return await me.findGroupById(id);
    } catch (error) {
      console.error("Error setting discount types", error);
      throw error;
    }
  };

  me.updateGroup = async (id, updates) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      // $set merges only the given fields; unspecified fields are untouched
      await groups.updateOne({ _id: new ObjectId(id) }, { $set: updates });
      return await me.findGroupById(id); // return the fresh doc so the route can send it back
    } catch (error) {
      console.error("Error updating group", error);
      throw error;
    }
  };

  return me;
}

const groupsCollection = GroupsCollection();
export default groupsCollection;
