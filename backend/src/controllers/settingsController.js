const { Organization } = require("../models");

async function getSettings(req, res) {
  return res.json({
    defaultLowStockThreshold: req.user.organization.defaultLowStockThreshold,
  });
}

async function updateSettings(req, res) {
  const threshold = Number(req.body.defaultLowStockThreshold);

  if (!Number.isInteger(threshold) || threshold < 0) {
    return res
      .status(400)
      .json({ message: "Default low stock threshold must be a whole number >= 0." });
  }

  const organization = await Organization.findByPk(req.user.organizationId);
  await organization.update({ defaultLowStockThreshold: threshold });

  return res.json({
    defaultLowStockThreshold: organization.defaultLowStockThreshold,
  });
}

module.exports = {
  getSettings,
  updateSettings,
};
