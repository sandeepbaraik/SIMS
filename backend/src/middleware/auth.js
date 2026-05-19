const jwt = require("jsonwebtoken");
const { User, Organization } = require("../models");
const { COOKIE_NAME } = require("../utils/token");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Organization, attributes: ["id", "name", "defaultLowStockThreshold"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "User account not found." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      organization: user.Organization,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = {
  requireAuth,
};
