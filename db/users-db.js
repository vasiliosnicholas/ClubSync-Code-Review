import { connect } from "./config.js";
import bcrypt from "bcrypt";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

const DUES_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
};

function UsersCollection({ collectionName = "users" } = {}) {
  const me = {};

  const users = connect(collectionName);

  // will reject duplicates with the same email, returns a clean
  // object (never the passwordHash) on success, or null if the email is already taken.
  me.registerUser = async ({
    email,
    password,
    firstName,
    lastName,
    birthDate,
    phoneNumber,
    role = "member",
  }) => {
    try {
      const existingUser = await me.findUserByEmail(email);
      if (existingUser) {
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserDoc = {
        email,
        passwordHash,
        firstName,
        lastName,
        birthDate,
        phoneNumber,
        duesStatus: DUES_STATUS.NOT_SUBMITTED,
        groupId: null,
        duesTier: "null",
        role,
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUserDoc);
      console.log("Registered new User in MongoDB 📝");
      return { id: result.insertedId, email, firstName, lastName };
    } catch (error) {
      console.error("Error registering new User", error);
      throw error;
    }
  };

  // atomically sets user duesState to pending for the chosen tier.
  // acts as a guard: returns null if the user is already pending/approved.
  me.submitDues = async (userId, duesTier) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        {
          _id: new ObjectId(userId),
          duesStatus: { $in: [DUES_STATUS.NOT_SUBMITTED, DUES_STATUS.DENIED] },
        },
        {
          $set: {
            duesStatus: DUES_STATUS.PENDING,
            duesTier: duesTier,
          },
        },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error submitting dues User", error);
      throw error;
    }
  };

  // Resets a club's roster for a new semester in place. Members are detached and
  // must re-join with the new code; staff (treasurer/admin) stay on to run the
  // term. Everyone's dues reset to not_submitted.
  me.resetGroupRoster = async (groupId) => {
    try {
      const groupFilter = ObjectId.isValid(groupId)
        ? new ObjectId(groupId)
        : groupId;

      const members = await users.updateMany(
        { groupId: groupFilter, role: "member" },
        {
          $set: {
            groupId: null,
            duesStatus: DUES_STATUS.NOT_SUBMITTED,
            duesTier: "null",
          },
        }
      );

      const staff = await users.updateMany(
        { groupId: groupFilter, role: { $in: ["treasurer", "admin"] } },
        { $set: { duesStatus: DUES_STATUS.NOT_SUBMITTED, duesTier: "null" } }
      );

      return {
        membersDetached: members.modifiedCount,
        staffReset: staff.modifiedCount,
      };
    } catch (error) {
      console.error("Error resetting group roster", error);
      throw error;
    }
  };

  // edit operation on a user document in the users collection that will update the groupId field
  // so that the user is tied to a club/group and is allowed to view a dashboard
  me.joinClub = async (userId, groupId) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { groupId } },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error trying to join the group via code", error);
      throw error;
    }
  };

  // read operation that will get all the memebers within a group that have paid dues, selected a tier,
  // and have had their dues submission for approved.
  me.getDuesStats = async (groupId) => {
    try {
      const groupFilter = groupId
        ? ObjectId.isValid(groupId)
          ? new ObjectId(groupId)
          : groupId
        : { $ne: null };
      const memberCount = await users.countDocuments({ groupId: groupFilter });

      const rows = await users
        .aggregate([
          {
            $match: {
              groupId: groupFilter,
              duesTier: { $in: ["gold", "silver"] },
              duesStatus: "approved",
            },
          },
          { $group: { _id: "$duesTier", count: { $sum: 1 } } },
        ])
        .toArray();

      const gold = rows.find((r) => r._id === "gold")?.count ?? 0;
      const silver = rows.find((r) => r._id === "silver")?.count ?? 0;
      return { gold, silver, total: gold + silver, memberCount };
    } catch (error) {
      console.error("Error fetching dues stats", error);
      throw error;
    }
  };

  // returns the full user document (including passwordHash) or null.
  me.findUserByEmail = async (email) => {
    try {
      return await users.findOne({ email });
    } catch (error) {
      console.error("Error finding user by email", error);
      throw error;
    }
  };

  // find a user in the collection via an id that is stored within the session state
  me.findUserById = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      return await users.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error finding user by id", error);
      throw error;
    }
  };

  // accepts user IDs and returns lean identity documents.
  // allows routes to populate user details on submissions/RSVPs in a single query.
  me.findUsersByIds = async (ids = []) => {
    try {
      const objectIds = ids
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));
      if (objectIds.length === 0) return [];
      return await users
        .find(
          { _id: { $in: objectIds } },
          {
            projection: {
              firstName: 1,
              lastName: 1,
              email: 1,
              duesTier: 1,
              birthDate: 1,
              phoneNumber: 1,
            },
          }
        )
        .toArray();
    } catch (error) {
      console.error("Error finding users by ids", error);
      throw error;
    }
  };

  // mirrors a treasurers dues decision onto the member's own document so the
  // member dashboard reflects approved/denied. A denied member may resubmit and
  // Only moves a member who is still PENDING.
  me.setDuesStatus = async (userId, duesStatus) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        { _id: new ObjectId(userId), duesStatus: DUES_STATUS.PENDING },
        { $set: { duesStatus } },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error setting dues status", error);
      throw error;
    }
  };

  // lists the members of a club so an admin can manage their roles.
  me.findUsersByGroup = async (groupId) => {
    try {
      const groupFilter = ObjectId.isValid(groupId)
        ? new ObjectId(groupId)
        : groupId;
      return await users
        .find(
          { groupId: groupFilter },
          {
            projection: {
              firstName: 1,
              lastName: 1,
              birthDate: 1,
              email: 1,
              phoneNumber: 1,
              role: 1,
            },
          }
        )
        .toArray();
    } catch (error) {
      console.error("Error finding users by group", error);
      throw error;
    }
  };

  // sets a user's role (an admin appointing a treasurer/admin, or demoting).
  me.setRole = async (userId, role) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { role } },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error setting user role", error);
      throw error;
    }
  };

  return me;
}

const usersCollection = UsersCollection();
export default usersCollection;
