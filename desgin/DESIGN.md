# ClubSync — Design Document

**Team:** Sean Behan, Julian Leonhardt
**Course:** CS 5610 / Web Development — Northeastern University

---

## Updates for Project 4

Project 3 (`main`) got us a working app, but a lot of what changed for Project 4 came directly out of running usability studies with real people and watching where they got confused, hesitated, or gave up. Most of the design, accessibility, and feature changes below trace back to something we saw in those sessions.

**Usability studies**

- Sean's usability study report: [link](https://docs.google.com/document/d/14QWqpaafc23y3qHX0gxzOKDKQ_sV9zUU-bsDYvxnGMY/edit?tab=t.0)
- Sean's Project 4 demo video: [link](https://www.youtube.com/watch?v=_Fm5cCOcNQs)
- Julian's usability study report: _[placeholder — add link]_

**Visual identity (color + typography)**

- Project 3 leaned on Bootstrap's defaults. We picked a real palette — warm cream background, burnt-orange and gold accents — defined as CSS variables in `index.css`, each with its contrast ratio noted right next to it so we can't accidentally regress accessibility later.
- Approve/cancel colors are consistent everywhere: approving dues or confirming a role change is always gold, anything destructive (deny, cancel an event, cancel an RSVP, leave a club) is always orange. Every button in the app disables Bootstrap's built-in color (`variant={null}`) and gets colored only through our own classes, so a stray Bootstrap red/green can never sneak in and break the palette.
- Swapped the default system font for Roboto Condensed (headings) and Noto Serif (body), pulled in via Google Fonts — makes the app look like our app instead of a generic Bootstrap template.
- Redid the nav bar to be role-aware with mobile auto-close, and gave the gold/silver dues tiers their own visual treatment plus a tooltip explaining what each tier means — this one came straight out of participants not understanding what "gold" vs "silver" meant.

**Accessibility**

- Dedicated pass on semantic HTML.
- Visible keyboard focus outline on every interactive element (links, buttons, inputs, dropdowns) — came out of testing the app keyboard-only during study prep.
- Confirmation dialogs before anything destructive/hard to undo: role changes, cancelling an event, leaving a club, starting a new semester — participants in the usability study triggered a couple of these by accident with no way to back out.

**Performance & SEO**

- Long lists (roster, events, RSVPs) are now paginated instead of dumping everything on one page.
- Ran Lighthouse, fixed what it flagged, and added per-page metadata for crawlability.

**Features added based on usability feedback**

- Named discounts (e.g. "Scholarship") that a treasurer can define and assign to a member, folded into the dues total automatically.
- Editable gold/silver dues pricing for treasurers instead of hardcoded amounts.
- CSV export of dues, plus an unpaid-dues reminder banner for members.
- Auto-login right after registration instead of bouncing back to the login page.
- Toast notifications on action buttons, so it's clear when something actually happened.
- "Leave club" flow for members, and a clearer warning/acknowledgment step before starting a new semester (moved under the admin role).
- Members can see events they RSVP'd to in the past, not just upcoming ones.
- Phone number and date of birth added to user profiles, surfaced on the admin's RSVP list for logistics.
- Separate, dedicated event pages for admins vs. members, instead of one shared page.
- Registration split into two dedicated flows: a landing page lets you pick Member or Admin, each with its own tailored form (the admin flow also collects a club name), instead of one generic register form for everyone.
- Brand new Admin Dashboard page, with its own widgets: member/engagement stats, an upcoming-events control widget, an E-Board roster widget, and the New Semester widget with its own warning/acknowledgment step.
- Brand new Club Members page for admins to manage the roster and promote members, plus a dedicated admin event-detail view for RSVPs and cancelling an event.
- New treasurer dashboard widgets that didn't exist before: editable gold/silver dues pricing, named discount types with per-member assignment, and dues CSV export.
- Nav bar rebuilt to be role-aware — it only shows the pages relevant to your current role instead of every page at once — auto-closes on mobile after you tap a link, and now shows your name on the logout button so it's clear who's signed in.
- Small hoverable info icons next to the dues tier selectors, explaining what gold/silver actually unlock, since participants kept guessing instead of knowing.
- Read-only summary widgets no longer show a hover/pointer state, so they don't look clickable when they're just for reference.
- Payment method dropdown (Venmo vs. check) on the dues submission form, each with its own placeholder/hint for what reference number to enter.
- Tighter registration validation: a confirm-password field, enforced required fields, and real email format checking before submit, instead of finding out after the fact.

---

## Project Description

From Sean's experience as the treasurer of a club at Northeastern, a lot of monotonous work comes from the Google Forms + spreadsheet workflow used to track dues and manage event access. Every semester means copying names into a fresh spreadsheet and manually cross-referencing who has paid before letting members into events.

**ClubSync** replaces that workflow with one app built around three roles:

- An **admin** creates and runs a club; creates, edits, and cancels events and sets which dues tier is required to attend each one; views an event's RSVP list with each attendee's contact info (name, email, phone, DOB); views club-wide member and event-participation stats, the e-board, and the full club roster; promotes members to treasurer or admin; and starts a new semester.
- A **treasurer** sets the club's gold/silver dues prices, reviews and approves/denies dues submissions, sees dues stats (how many members hold each tier and how much has been collected in approved dues), and defines and assigns member discounts.
- A **member** joins a club, submits dues to unlock tiered events, and can RSVP to (or cancel an RSVP for) events they're eligible for based on their approved tier, seeing how many others are attending.

Authentication is handled with **Passport** (local strategy, session-based). Eligibility is enforced automatically by the server, so no one has to cross-check a spreadsheet.

### Mockups

- Can be found [here](/desgin/ClubSync-Design%20Mockups.pdf)

### Core concepts

- **Multi-club.** The app hosts many independent clubs at once. Each club is its own world — its own members, join code, events, and dues — and users only ever see data for their own club.
- **Roles are hierarchical:** `member < treasurer < admin`. At registration you choose **Member** (join an existing club) or **Admin** (create a club). **Treasurer is never self-selected** — an admin grants it to an existing member.
- **Dues tiers:** `silver` and `gold` (with `none` meaning "open to all" for events). A member "holds" a tier only once their dues are **approved** at it. The treasurer sets the price of each tier; that price is what members see and pay when submitting.
- **Discounts.** A treasurer can define named discount types (e.g. "Scholarship", with a reduced or waived amount) and assign one to any member.
- **Semesters are a reset, not a new club.** Starting a new semester keeps the same club but regenerates its join code and clears the roster, so members re-join and dues reset for the new term.

---

## Features (CRUD)

**Create**

- An admin **registers and creates a club** (which generates a join code).
- A member **joins a club** by entering its join code.
- A member **submits a dues request** (tier + payment reference).
- An admin **creates an event** and sets the required dues tier.
- A member **RSVPs** to an event they're eligible for.
- A treasurer **defines a discount type** (name + amount) that can later be assigned to a member.

**Read**

- A treasurer **views pending dues submissions** (tier + payment reference) and **dues stats** — how many members hold each tier (gold/silver/total) and how much has been collected in approved dues.
- An admin **views their club's events** and each event's **RSVP list**, including each attendee's name, email, phone number, and DOB.
- An admin **views club-wide stats** — total members and how many are actually RSVPing to events — plus the **e-board roster** and the **full club roster**.
- A member sees a **dashboard** with their dues status, their club, and the events they can explore.

**Update**

- A treasurer **sets the club's gold/silver dues prices**, which is what members see and pay when they select a tier.
- A treasurer **approves or denies** a dues submission (a denial **requires a note**); on approval the member's **tier is set**, unlocking eligible events.
- A treasurer **assigns (or clears) a discount** on a member.
- An admin **edits an event's** details.
- An admin **promotes a member** to treasurer or admin.
- An admin **starts a new semester** (regenerates the join code, clears the roster, resets dues) — an update to the existing club, not a new one.

**Delete**

- A member **withdraws** their own still-pending dues submission.
- A member **cancels their RSVP** to an event they previously RSVP'd to.
- An admin **cancels (deletes) an event**.

---

## User Personas

**Treasurer**
_Goal:_ Stop copying names into a spreadsheet every semester and have one place to see who's paid and how much has come in.
_Needs:_ To set the club's gold/silver dues prices, review dues submissions with each member's tier and payment reference, approve or deny them, see dues stats (per-tier and total counts, money collected), and define/assign member discounts.

**Admin**
_Goal:_ Create and manage club events without cross-referencing a separate dues spreadsheet to figure out who's allowed to attend.
_Needs:_ To create a club, create/edit/cancel events with a required dues tier, see who's RSVP'd (with contact info), view club-wide member and participation stats, view the e-board and full club roster, appoint trusted members as treasurers/admins, and reset the club for a new semester.

**Member**
_Goal:_ Join the club, submit dues, and sign up for events without hitting a wall because someone forgot to update a spreadsheet.
_Needs:_ To join a club with a code, submit a dues request with a tier and payment reference, see their approval status, and RSVP to (or cancel an RSVP for) events they're eligible for, seeing how many others are attending.

---

## User Stories

**Register and create a club** — As a new officer, I want to register as an admin and name my club in one step, so I have a club with a shareable join code from the start.

**Join a club** — As a member, I want to enter a join code to join a club so I can start the dues process without emailing the treasurer directly.

**Submit dues** — As a member, I want to submit a dues request by selecting my tier and entering my payment reference, so the treasurer can verify and approve me.

**Withdraw a submission** — As a member, I want to withdraw my dues request while it's still pending, in case I entered the wrong tier or reference.

**Set dues prices** — As a treasurer, I want to set the gold and silver tier prices for my club, so members know exactly what they owe when they submit.

**Review a dues submission** — As a treasurer, I want to see all pending submissions with each member's tier and payment reference, so I can approve or deny them with a short note.

**View a dues summary** — As a treasurer, I want to see dues stats broken down by tier (gold/silver/total) and the total money collected in approved dues this semester, so I don't have to tally a spreadsheet.

**Define a discount type** — As a treasurer, I want to define named discounts (e.g. "Scholarship") with a reduced or waived amount, so I have a consistent set of options to offer.

**Assign a discount** — As a treasurer, I want to assign a discount to a specific member, so I can waive or reduce their dues without a one-off manual adjustment.

**Create an event** — As an admin, I want to create an event and set which dues tier is required to attend, so eligibility is enforced automatically.

**RSVP to an event** — As a member, I want to see upcoming events on my dashboard and RSVP to the ones I'm eligible for, and see how many others are going. If I'm not eligible, I want a clear message telling me why, so I know to submit dues.

**Cancel an RSVP** — As a member, I want to cancel my RSVP to an event I can no longer attend, so the admin's attendee count and list stay accurate.

**View an RSVP list** — As an admin, I want to see who's RSVP'd to each event, with their name, email, phone number, and DOB, so I can plan logistics without checking a separate list.

**View member and participation stats** — As an admin, I want to see how many members are in my club and how many are actually RSVPing to events, so I can gauge engagement at a glance.

**View the e-board and club roster** — As an admin, I want to see the list of club officers and the full member roster in one place, so I don't have to maintain a separate list of who's on the e-board.

**Appoint officers** — As an admin, I want to promote an existing member of my club to treasurer or admin, so I can share the workload.

**Start a new semester** — As an admin, I want to reset my club for a new semester with a fresh join code, so dues statuses reset and members re-join for the new term.

---

## Data Model (MongoDB Collections)

Four collections. The **users** schema is the key shared dependency: event eligibility reads a user's `duesStatus`/`duesTier`.

**users**

```json
{
  "_id": "ObjectId",
  "email": "string",
  "passwordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "birthDate": "Date",
  "phoneNumber": "string",
  "role": "member | treasurer | admin",
  "groupId": "ObjectId (ref: groups) | null",
  "duesStatus": "not_submitted | pending | approved | denied",
  "duesTier": "silver | gold | null",
  "duesAmount": "number | null",
  "discount": "{ name: string, amount: number } | null",
  "officerSince": "Date | null",
  "createdAt": "Date"
}
```

**dues_submissions**

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "groupId": "ObjectId (ref: groups)",
  "tier": "silver | gold",
  "amount": "number",
  "paymentReference": "string | null",
  "paymentMethod": "string | null",
  "status": "pending | approved | denied | archived",
  "reviewNote": "string | null",
  "reviewedBy": "ObjectId (ref: users) | null",
  "submittedAt": "Date",
  "reviewedAt": "Date | null"
}
```

**groups**

```json
{
  "_id": "ObjectId",
  "name": "string (e.g. Chess Club - Fall 2026)",
  "joinCode": "string",
  "createdBy": "ObjectId (ref: users)",
  "active": "boolean",
  "duesAmounts": "{ gold: number, silver: number } | null",
  "discountTypes": "[{ name: string, amount: number }]",
  "createdAt": "Date"
}
```

**events**

```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId (ref: groups)",
  "name": "string",
  "type": "practice | social | meeting",
  "date": "Date",
  "location": "string",
  "requiredTier": "none | silver | gold",
  "createdBy": "ObjectId (ref: users)",
  "rsvps": ["ObjectId (ref: users)"],
  "createdAt": "Date"
}
```

---

## API Routes

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/user`

**Users** — `GET /api/users` (paginated club roster), `GET /api/users/count`, `PATCH /api/users/:id/role` (promote/demote), `PATCH /api/users/:id/discount` (assign/clear a discount)

**Dues** — `POST /api/dues/submit`, `GET /api/dues/mine`, `DELETE /api/dues/:submissionId`, `GET /api/dues/pending/:groupId`, `GET /api/dues/stats/:groupId`, `PATCH /api/dues/review/:submissionId`

**Groups** — `GET /api/groups/:id`, `POST /api/groups/join`, `POST /api/groups/leave`, `POST /api/groups/semester`, `PUT /api/groups/dues-amounts`, `PUT /api/groups/discount-types`, `PUT /api/groups/:id`

**Events** — `GET /api/events`, `POST /api/events`, `GET /api/events/mine`, `GET /api/events/upcoming`, `GET /api/events/participation`, `GET /api/events/:id`, `PUT /api/events/:id`, `DELETE /api/events/:id`, `POST /api/events/:id/rsvp`, `DELETE /api/events/:id/rsvp`, `GET /api/events/:id/rsvps`

All data-bearing reads/writes are **scoped to the requester's `groupId`**, so users can never see or act on another club's data.

---

## Work Division

**Sean Behan — Members + Auth (full stack)**

- Registration, login, logout via Passport
- Member dashboard (dues status, club info, eligible events + RSVP)
- Dues submission form and status/denial feedback
- Treasurer dues review UI (approve/deny with note) and dues summary
- Collections: **users**, **dues_submissions**
- React: `AuthForm` (login/register), `DuesStatus`, `DuesWidget`, `DuesVerificationWidget`, `DuesStatWidget`, `MemberDashboard`, shared `WidgetCard` / `PreviewList`

**Julian Leonhardt — Groups + Events (full stack)**

- Club/join-code logic and semester reset
- Admin event creation with a tier requirement, and event editing
- Event listing and RSVP eligibility logic (reads dues status)
- Admin RSVP list view
- Collections: **groups**, **events**
- React: `EventForm`, `EventList`, `EventDetail`, `EventEditForm`, `RSVPButton`

**Shared**

- MongoDB schema agreement upfront (the `users` schema is the cross-cutting dependency)
- Passport session configuration
- Shared CSS structure and overall app style (per-component CSS + shared `styles/`)
- A seed script generating **1,000+ internally-consistent synthetic records** (users, dues submissions, events, RSVPs) across multiple clubs

---

## Tech Stack

- **Server:** Node.js + Express (ES modules)
- **Database:** MongoDB via the native driver (no Mongoose)
- **Auth:** Passport (local) + bcrypt; sessions in MongoDB via connect-mongo
- **Frontend:** React + Vite, React Router, React-Bootstrap, PropTypes; native `fetch` (no Axios, no CORS — same-origin)
- **Tooling:** ESLint + Prettier
