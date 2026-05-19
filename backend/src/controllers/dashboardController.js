const { sequelize, Product } = require("../models");

async function getDashboard(req, res) {
  const organizationId = req.user.organizationId;
  const orgThreshold = req.user.organization.defaultLowStockThreshold;

  const [totalProducts, quantityResult, products] = await Promise.all([
    Product.count({ where: { organizationId } }),
    Product.findOne({
      where: { organizationId },
      attributes: [[sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("quantityOnHand")), 0), "total"]],
      raw: true,
    }),
    Product.findAll({
      where: { organizationId },
      order: [
        ["quantityOnHand", "ASC"],
        ["updatedAt", "DESC"],
      ],
    }),
  ]);

  const lowStockItems = products
    .map((product) => {
      const item = product.toJSON();
      const threshold = item.lowStockThreshold ?? orgThreshold;

      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantityOnHand: item.quantityOnHand,
        lowStockThreshold: threshold,
        isLowStock: item.quantityOnHand <= threshold,
      };
    })
    .filter((item) => item.isLowStock);

  return res.json({
    totalProducts,
    totalQuantityOnHand: Number(quantityResult?.total || 0),
    lowStockItems,
  });
}

module.exports = {
  getDashboard,
};
