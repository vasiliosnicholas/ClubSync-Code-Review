import { connect } from "./config.js";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

const SUBMISSION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
  ARCHIVED: "archived",
};

function DuesSubmissionsCollection({
  collectionName = "dues_submissions",
} = {}) {
  const me = {};

  const submissions = connect(collectionName);

  // create a new pending submission. groupId is snapshotted from the user so the
  // treasurer can query the queue by group without joining users.
  me.createSubmission = async ({
    userId,
    groupId,
    tier,
    amount,
    paymentReference = null,
  }) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const newSubmissionDoc = {
        userId: new ObjectId(userId),
        groupId: ObjectId.isValid(groupId) ? new ObjectId(groupId) : groupId,
        tier,
        // snapshotted from the club's dues amounts at submission time, so a
        // later price change doesn't retroactively change this submission.
        amount,
        paymentReference,
        status: SUBMISSION_STATUS.PENDING,
        reviewNote: null,
        reviewedBy: null,
        submittedAt: new Date(),
        reviewedAt: null,
      };
      const result = await submissions.insertOne(newSubmissionDoc);
      console.log("Created new dues submission in MongoDB 💵");
      return { id: result.insertedId, ...newSubmissionDoc };
    } catch (error) {
      console.error("Error creating dues submission", error);
      throw error;
    }
  };

  // Fetches pending silver or gold submissions for a group and displays the oldest first.
  // A limit > 0 caps the subset (e.g., 5 for widgets); limit <= 0 returns all.
  me.getPending = async (groupId, limit = 0) => {
    try {
      const groupFilter = ObjectId.isValid(groupId)
        ? new ObjectId(groupId)
        : groupId;

      const query = {
        groupId: groupFilter,
        status: SUBMISSION_STATUS.PENDING,
        tier: { $in: ["gold", "silver"] },
      };

      const total = await submissions.countDocuments(query);

      let cursor = submissions.find(query).sort({ submittedAt: -1 });
      if (limit > 0) cursor = cursor.limit(limit);
      const items = await cursor.toArray();

      return { total, items };
    } catch (error) {
      console.error("Error fetching pending dues submissions", error);
      throw error;
    }
  };

  // fetches a member's most recent submission (newest first) or null if they
  // have never submitted
  me.getLatestForUser = async (userId) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const items = await submissions
        .find({ userId: new ObjectId(userId) })
        .sort({ submittedAt: -1 })
        .limit(1)
        .toArray();
      return items[0] ?? null;
    } catch (error) {
      console.error("Error fetching latest dues submission", error);
      throw error;
    }
  };

  // transitions a pending submission to approved/denied and stamps who
  // reviewed it and when.
  me.reviewSubmission = async (
    submissionId,
    { status, reviewNote = null, reviewedBy }
  ) => {
    try {
      if (!ObjectId.isValid(submissionId)) return null;
      const updated = await submissions.findOneAndUpdate(
        { _id: new ObjectId(submissionId), status: SUBMISSION_STATUS.PENDING },
        {
          $set: {
            status,
            reviewNote,
            reviewedBy: ObjectId.isValid(reviewedBy)
              ? new ObjectId(reviewedBy)
              : reviewedBy,
            reviewedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error reviewing dues submission", error);
      throw error;
    }
  };

  // withdraws a member's own submission and is scoped to the userId so one member can't
  // delete anothers. This action is only available for members who have their dues status as pending
  me.deleteSubmission = async (submissionId, userId) => {
    try {
      if (!ObjectId.isValid(submissionId) || !ObjectId.isValid(userId)) {
        return null;
      }
      const deleted = await submissions.findOneAndDelete({
        _id: new ObjectId(submissionId),
        userId: new ObjectId(userId),
        status: SUBMISSION_STATUS.PENDING,
      });
      return deleted;
    } catch (error) {
      console.error("Error deleting dues submission", error);
      throw error;
    }
  };

  // closes out a group's still pending submissions when a new semester starts.
  // oldterm rows are kept (soft archive) but flipped out of the pending queue.
  me.archivePendingForGroup = async (groupId) => {
    try {
      const groupFilter = ObjectId.isValid(groupId)
        ? new ObjectId(groupId)
        : groupId;
      const result = await submissions.updateMany(
        { groupId: groupFilter, status: SUBMISSION_STATUS.PENDING },
        { $set: { status: SUBMISSION_STATUS.ARCHIVED, reviewedAt: new Date() } }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error("Error archiving pending submissions", error);
      throw error;
    }
  };

  return me;
}

const duesSubmissionsCollection = DuesSubmissionsCollection();
export default duesSubmissionsCollection;
export { SUBMISSION_STATUS };
