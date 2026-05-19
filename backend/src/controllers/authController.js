const bcrypt = require("bcryptjs");
const { sequelize, Organization, User } = require("../models");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/token");

function buildAuthPayload(user, organization) {
  return {
    user: {
      id: user.id,
      email: user.email,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      defaultLowStockThreshold: organization.defaultLowStockThreshold,
    },
  };
}

async function signup(req, res) {
  const { email, password, confirmPassword, organizationName } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedOrganizationName = organizationName?.trim();

  if (!normalizedEmail || !password || !confirmPassword || !normalizedOrganizationName) {
    return res.status(400).json({ message: "All signup fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });

  if (existingUser) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await sequelize.transaction(async (transaction) => {
    const organization = await Organization.create(
      { name: normalizedOrganizationName },
      { transaction }
    );

    const user = await User.create(
      {
        email: normalizedEmail,
        passwordHash,
        organizationId: organization.id,
      },
      { transaction }
    );

    return { organization, user };
  });

  const token = signToken({
    userId: result.user.id,
    organizationId: result.organization.id,
  });

  setAuthCookie(res, token);

  return res.status(201).json(buildAuthPayload(result.user, result.organization));
}

async function login(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const user = await User.findOne({
    where: { email: normalizedEmail },
    include: [{ model: Organization, attributes: ["id", "name", "defaultLowStockThreshold"] }],
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken({
    userId: user.id,
    organizationId: user.organizationId,
  });

  setAuthCookie(res, token);

  return res.json(buildAuthPayload(user, user.Organization));
}

async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(204).send();
}

async function me(req, res) {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    organization: req.user.organization,
  });
}

module.exports = {
  signup,
  login,
  logout,
  me,
};
