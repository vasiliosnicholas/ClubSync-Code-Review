// ---------------------------------------------------------------------------
// ClubSync seed script — generates 1k+ synthetic records across all four
// collections (users, groups, events, dues_submissions). The app is multi-club:
// each group is an independent club with its own admin, treasurer, members,
// events, and dues. Data stays internally consistent: a member's dues status
// matches a real submission, and event RSVP lists only contain eligible members.
//
// Run with:  node seed.js         (or `npm run seed`)
//
// Idempotent & safe: every generated doc is tagged { seed: true }. The script
// removes only prior seed docs, so it never touches real/test accounts.
// ---------------------------------------------------------------------------
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import { connect, CLIENT } from "./db/config.js";

const { ObjectId } = mongodb;

// ---- knobs you can tweak ----
const MEMBERS_PER_CLUB = 230;
const EVENTS_PER_CLUB = 14;

// fixed club identities so demo join codes stay stable across reseeds
const CLUBS = [
  {
    name: "Chess Club - Fall 2026",
    joinCode: "482913",
    duesAmounts: { gold: 60, silver: 35 },
  },
  {
    name: "Robotics Club - Fall 2026",
    joinCode: "550183",
    duesAmounts: { gold: 75, silver: 45 },
  },
  {
    name: "Hiking Club - Fall 2026",
    joinCode: "738421",
    duesAmounts: { gold: 50, silver: 30 },
  },
];

// named discounts every seeded club offers (treasurer-configurable in the app)
const DISCOUNT_TYPES = [
  { name: "Scholarship", amount: 0 },
  { name: "Officer waiver", amount: 0 },
  { name: "Early bird", amount: 15 },
];

const users = connect("users");
const groups = connect("groups");
const events = connect("events");
const submissions = connect("dues_submissions");

// ---- tiny random helpers ----
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// a Date offset from now by a random number of days within [-range, +range]
const dateWithinDays = (range) =>
  new Date(Date.now() + randInt(-range, range) * 24 * 60 * 60 * 1000);
// college-age birth date ("YYYY-MM-DD", matching the <input type="date"> the register form submits)
const randomBirthDate = () => {
  const year = new Date().getFullYear() - randInt(18, 24);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const randomPhoneNumber = () =>
  `(${randInt(200, 989)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
// somewhere between 6 months and a year ago, matching setRole's officerSince field
const randomOfficerSince = () =>
  new Date(Date.now() - randInt(182, 365) * 24 * 60 * 60 * 1000);

const FIRST_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Jamie",
  "Drew",
  "Quinn",
  "Avery",
  "Parker",
  "Reese",
  "Skyler",
  "Cameron",
  "Hayden",
  "Emerson",
  "Rowan",
  "Sawyer",
  "Finley",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Lee",
  "Nguyen",
  "Patel",
  "Kim",
];
const EVENT_NAMES = [
  "Season Opener",
  "Weekly Practice",
  "General Body Meeting",
  "Track Day",
  "Social Mixer",
  "Skills Clinic",
  "Race Night",
  "Team Dinner",
  "Fundraiser",
  "Alumni Meetup",
];
const LOCATIONS = [
  "Main Campus Plaza",
  "West Field Hub",
  "Student Center RM 402",
  "Clubhouse",
  "North Track",
  "Rec Center",
];
const TYPES = ["practice", "social", "meeting"];
const TIER_RANK = { none: 0, silver: 1, gold: 2 };

// rolls a realistic dues state: 45% approved, 20% pending, 10% denied, 25% none.
// duesAmount mirrors the club's current price for the rolled tier, same as a
// real submission snapshots the price it was submitted under.
const rollDues = (duesAmounts) => {
  const roll = Math.random();
  const tiered = (duesStatus) => {
    const duesTier = pick(["silver", "gold"]);
    return { duesStatus, duesTier, duesAmount: duesAmounts[duesTier] };
  };
  if (roll < 0.45) return tiered("approved");
  if (roll < 0.65) return tiered("pending");
  if (roll < 0.75) return tiered("denied");
  return { duesStatus: "not_submitted", duesTier: "null", duesAmount: null };
};

async function seed() {
  console.log("Clearing previous seed data (seed:true only)…");
  await Promise.all([
    users.deleteMany({ seed: true }),
    groups.deleteMany({ seed: true }),
    events.deleteMany({ seed: true }),
    submissions.deleteMany({ seed: true }),
  ]);

  // one shared password hash for every seeded account (login = "password123")
  const passwordHash = await bcrypt.hash("password123", 10);

  const groupDocs = [];
  const userDocs = [];
  const submissionDocs = [];
  const eventDocs = [];

  const baseUser = (id, role, groupId, extra) => ({
    _id: id,
    email: extra.email,
    passwordHash,
    firstName: extra.firstName,
    lastName: extra.lastName,
    birthDate: extra.birthDate ?? randomBirthDate(),
    phoneNumber: extra.phoneNumber ?? randomPhoneNumber(),
    role,
    groupId,
    duesStatus: extra.duesStatus ?? "not_submitted",
    duesTier: extra.duesTier ?? "null",
    duesAmount: extra.duesAmount ?? null,
    discount: extra.discount ?? null,
    createdAt: new Date(),
    seed: true,
    ...(extra.officerSince ? { officerSince: extra.officerSince } : {}),
  });

  CLUBS.forEach((club, clubIndex) => {
    const groupId = new ObjectId();
    const adminId = new ObjectId();
    const treasurerId = new ObjectId();
    const isDemoClub = clubIndex === 0;

    groupDocs.push({
      _id: groupId,
      name: club.name,
      joinCode: club.joinCode,
      createdBy: adminId,
      active: true,
      duesAmounts: club.duesAmounts,
      discountTypes: DISCOUNT_TYPES,
      createdAt: new Date(),
      seed: true,
    });

    // each club is run by one admin + one treasurer
    userDocs.push(
      baseUser(adminId, "admin", groupId, {
        email: isDemoClub
          ? "seed.admin@clubsync.test"
          : `admin${clubIndex}@clubsync.test`,
        firstName: "Ada",
        lastName: `Admin${clubIndex}`,
        officerSince: randomOfficerSince(),
      })
    );
    userDocs.push(
      baseUser(treasurerId, "treasurer", groupId, {
        email: isDemoClub
          ? "seed.treasurer@clubsync.test"
          : `treasurer${clubIndex}@clubsync.test`,
        firstName: "Tara",
        lastName: `Treasurer${clubIndex}`,
        officerSince: randomOfficerSince(),
      })
    );

    // fill out the e-board to 6 total officers (2 more admins + 2 more
    // treasurers), each promoted 6 months to a year ago.
    ["admin", "admin", "treasurer", "treasurer"].forEach((role, i) => {
      userDocs.push(
        baseUser(new ObjectId(), role, groupId, {
          email: `${role}${clubIndex}-${i + 2}@clubsync.test`,
          firstName: pick(FIRST_NAMES),
          lastName: pick(LAST_NAMES),
          officerSince: randomOfficerSince(),
        })
      );
    });

    // members of this club, tracked locally for building event RSVP pools
    const clubMembers = [];
    const addMember = (extra) => {
      const memberId = new ObjectId();
      const doc = baseUser(memberId, "member", groupId, extra);
      userDocs.push(doc);
      clubMembers.push(doc);

      // anyone who submitted (not "not_submitted") gets a matching submission
      if (doc.duesStatus !== "not_submitted") {
        const reviewed = doc.duesStatus !== "pending";
        submissionDocs.push({
          userId: memberId,
          groupId,
          tier: doc.duesTier,
          amount: doc.duesAmount,
          paymentMethod: "venmo",
          paymentReference: `${randInt(1000000000, 9999999999)}`,
          status: doc.duesStatus,
          reviewNote:
            doc.duesStatus === "denied"
              ? "Payment reference did not match."
              : null,
          reviewedBy: reviewed ? treasurerId : null,
          submittedAt: dateWithinDays(30),
          reviewedAt: reviewed ? new Date() : null,
          seed: true,
        });
      }
    };

    // pinned demo members (demo club only) — referenced in the README so the
    // documented logins keep working after every reseed
    if (isDemoClub) {
      addMember({
        email: "finley.nguyen4@clubsync.test",
        firstName: "Finley",
        lastName: "Nguyen",
        duesStatus: "approved",
        duesTier: "gold",
        duesAmount: club.duesAmounts.gold,
      });
      addMember({
        email: "parker.lee0@clubsync.test",
        firstName: "Parker",
        lastName: "Lee",
        duesStatus: "approved",
        duesTier: "silver",
        duesAmount: club.duesAmounts.silver,
      });
      addMember({
        email: "casey.brown1@clubsync.test",
        firstName: "Casey",
        lastName: "Brown",
        duesStatus: "not_submitted",
        duesTier: "null",
        duesAmount: null,
      });
    }

    for (let i = 0; i < MEMBERS_PER_CLUB; i++) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      // clubIndex + offset so emails never collide across clubs or with demos
      const email =
        `${firstName}.${lastName}${clubIndex}-${i + 100}@clubsync.test`.toLowerCase();
      const dues = rollDues(club.duesAmounts);
      const extra = { email, firstName, lastName, ...dues };
      // ~15% of approved members carry a named discount
      if (dues.duesStatus === "approved" && Math.random() < 0.15) {
        extra.discount = pick(DISCOUNT_TYPES);
      }
      addMember(extra);
    }

    // events for this club, with RSVPs drawn only from eligible members.
    // demo club, events #1 and #2 are pinned to a definite past date and a
    // definite future date (open to all, no dues required) with the three
    // documented demo members RSVP'd — so logging in as any of them reliably
    // shows both the "Upcoming" and "Past" sections on the My RSVPs page.
    const pinnedMembers = isDemoClub ? clubMembers.slice(0, 3) : [];
    for (let i = 0; i < EVENTS_PER_CLUB; i++) {
      const isPinnedPast = isDemoClub && i === 0;
      const isPinnedFuture = isDemoClub && i === 1;

      const requiredTier =
        isPinnedPast || isPinnedFuture ? "none" : pick(["none", "none", "silver", "gold"]); // weight open
      const eligible = clubMembers.filter((m) => {
        if (requiredTier === "none") return true;
        if (m.duesStatus !== "approved") return false;
        return (TIER_RANK[m.duesTier] ?? 0) >= TIER_RANK[requiredTier];
      });
      const shuffled = [...eligible].sort(() => Math.random() - 0.5);
      let rsvps = shuffled
        .slice(0, randInt(0, Math.min(40, eligible.length)))
        .map((m) => m._id);

      let date = dateWithinDays(60);
      if (isPinnedPast) {
        date = dateWithinDays(30);
        date.setTime(date.getTime() - 31 * 24 * 60 * 60 * 1000); // guaranteed in the past
        rsvps = [...new Set([...pinnedMembers.map((m) => m._id), ...rsvps])];
      } else if (isPinnedFuture) {
        date = dateWithinDays(30);
        date.setTime(date.getTime() + 31 * 24 * 60 * 60 * 1000); // guaranteed in the future
        rsvps = [...new Set([...pinnedMembers.map((m) => m._id), ...rsvps])];
      }

      eventDocs.push({
        groupId,
        name: `${pick(EVENT_NAMES)} #${i + 1}`,
        type: pick(TYPES),
        date,
        location: pick(LOCATIONS),
        requiredTier,
        createdBy: adminId,
        rsvps,
        createdAt: new Date(),
        seed: true,
      });
    }
  });

  console.log(`Seeding ${groupDocs.length} clubs…`);
  await groups.insertMany(groupDocs);
  console.log(`Seeding ${userDocs.length} users…`);
  await users.insertMany(userDocs);
  console.log(`Seeding ${submissionDocs.length} dues submissions…`);
  await submissions.insertMany(submissionDocs);
  console.log(`Seeding ${eventDocs.length} events…`);
  await events.insertMany(eventDocs);

  // ---- summary ----
  const total =
    groupDocs.length +
    userDocs.length +
    submissionDocs.length +
    eventDocs.length;
  console.log("\n=== Seed complete ===");
  console.log(`  groups:            ${groupDocs.length}`);
  console.log(`  users:             ${userDocs.length}`);
  console.log(`  dues_submissions:  ${submissionDocs.length}`);
  console.log(`  events:            ${eventDocs.length}`);
  console.log(
    `  TOTAL records:     ${total}  ${total >= 1000 ? "✅ (≥1000)" : "⚠️ under 1000"}`
  );
  console.log("\n  Log in as any seeded account with password: password123");
  console.log(
    "  Demo club: seed.admin@clubsync.test / seed.treasurer@clubsync.test"
  );
  console.log(`  Demo club join code: ${CLUBS[0].joinCode}`);
}

try {
  await seed();
} catch (error) {
  console.error("Seeding failed:", error);
} finally {
  await CLIENT.close();
}
