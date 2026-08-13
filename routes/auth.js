import { Router } from "express";
import passport from "passport";
import usersCollection from "../db/users-db.js";
import groupsCollection from "../db/groups-db.js";
import { isAuthenticated } from "../middleware/auth.js";

const authRouter = Router();

// ----------------------------
// USER REGISTRATION
// ----------------------------
authRouter.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      role,
      clubName,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !birthDate || !phoneNumber) {
      return res
        .status(400)
        .json({ message: "All fields are required to register" });
    }

    // only member/admin are self-selectable; treasurer is granted by an admin.
    const chosenRole = role === "admin" ? "admin" : "member";
    if (chosenRole === "admin" && !clubName) {
      return res
        .status(400)
        .json({ message: "A club name is required to register as an admin" });
    }

    const user = await usersCollection.registerUser({
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      role: chosenRole,
    });
    if (!user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // an admin registration also creates their club and attaches them to it.
    if (chosenRole === "admin") {
      const group = await groupsCollection.createGroup({
        name: clubName,
        createdBy: user.id,
      });
      await usersCollection.joinClub(user.id, group.id);
    }

    // log the new user in immediately (no separate login step). Re-fetch so the
    // session user is complete — for an admin this now includes their groupId.
    const fullUser = await usersCollection.findUserById(user.id);
    req.login(fullUser, (err) => {
      if (err) {
        console.error("Auto-login after registration failed", err);
        // account was created — let them log in manually as a fallback.
        return res.status(201).json({ message: "User created", user });
      }
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: fullUser._id,
          email: fullUser.email,
          firstName: fullUser.firstName,
          lastName: fullUser.lastName,
          role: fullUser.role,
          groupId: fullUser.groupId,
          duesStatus: fullUser.duesStatus,
          duesTier: fullUser.duesTier,
          duesAmount: fullUser.duesAmount,
        },
      });
    });
  } catch (error) {
    console.error("Error registering user", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// ----------------------------
// POST USER LOGIN
// ----------------------------
authRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          groupId: user.groupId,
          duesStatus: user.duesStatus,
          duesTier: user.duesTier,
          duesAmount: user.duesAmount,
        },
      });
    });
  })(req, res, next);
});

// ----------------------------
// GET CURRENT USER PROFILE
// ----------------------------
authRouter.get("/user", isAuthenticated, (req, res) => {
  const noPasswordUser = {
    id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
    groupId: req.user.groupId,
    duesStatus: req.user.duesStatus,
    duesTier: req.user.duesTier,
    duesAmount: req.user.duesAmount,
  };
  res.json({ user: noPasswordUser });
});

// ----------------------------
// POST USER LOGOUT
// ----------------------------
authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: err.message });
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Logout failed", error: err.message });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
});

export default authRouter;
