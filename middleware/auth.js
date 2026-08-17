// ----------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Rank each role so we can compare "is this given users role high enough?"
const ROLE_RANK = { member: 1, treasurer: 2, admin: 3 };

// requireRole("treasurer") RETURNS a middleware that allows treasurer and above.
// The inner function is what Express actually runs per request; it "remebers"
// minRole via closure

export const requireRole = (minRole) => {
  //Nice middleware factory pattern. I did basically the same thing apart from returning the Authorization middleware as the second element in an array where the first element is the Authentication middleware so I could rest the array reprsenting a middleware stack onto routes for our routers.
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated " });
    }
    const userRank = ROLE_RANK[req.user.role] ?? 0;
    const requiredRank = ROLE_RANK[minRole] ?? 0;
    if (userRank < requiredRank) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
