const { Op } = require("sequelize");
const { Product } = require("../models");

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? NaN : parsedValue;
}

function validateProductPayload(payload) {
  const errors = [];

  if (!payload.name || !payload.name.trim()) {
    errors.push("Product name is required.");
  }

  if (!payload.sku || !payload.sku.trim()) {
    errors.push("SKU is required.");
  }

  const quantityOnHand = Number(payload.quantityOnHand);
  if (!Number.isInteger(quantityOnHand) || quantityOnHand < 0) {
    errors.push("Quantity on hand must be a whole number greater than or equal to 0.");
  }

  const costPrice = normalizeOptionalNumber(payload.costPrice);
  if (Number.isNaN(costPrice) || costPrice < 0) {
    errors.push("Cost price must be a valid non-negative number.");
  }

  const sellingPrice = normalizeOptionalNumber(payload.sellingPrice);
  if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
    errors.push("Selling price must be a valid non-negative number.");
  }

  const lowStockThreshold = normalizeOptionalNumber(payload.lowStockThreshold);
  if (
    Number.isNaN(lowStockThreshold) ||
    (lowStockThreshold !== null && (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0))
  ) {
    errors.push("Low stock threshold must be a whole number greater than or equal to 0.");
  }

  return { errors, quantityOnHand, costPrice, sellingPrice, lowStockThreshold };
}

async function listProducts(req, res) {
  const search = req.query.search?.trim();
  const where = { organizationId: req.user.organizationId };

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
    ];
  }

  const products = await Product.findAll({
    where,
    order: [["updatedAt", "DESC"]],
  });

  const items = products.map((product) => {
    const productJson = product.toJSON();
    const threshold =
      productJson.lowStockThreshold ?? req.user.organization.defaultLowStockThreshold;

    return {
      ...productJson,
      isLowStock: productJson.quantityOnHand <= threshold,
      effectiveLowStockThreshold: threshold,
    };
  });

  return res.json({ items });
}

async function getProduct(req, res) {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const productJson = product.toJSON();
  const threshold =
    productJson.lowStockThreshold ?? req.user.organization.defaultLowStockThreshold;

  return res.json({
    ...productJson,
    isLowStock: productJson.quantityOnHand <= threshold,
    effectiveLowStockThreshold: threshold,
  });
}

async function createProduct(req, res) {
  const { errors, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
    validateProductPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    const product = await Product.create({
      organizationId: req.user.organizationId,
      name: req.body.name.trim(),
      sku: req.body.sku.trim(),
      description: req.body.description?.trim() || null,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    });

    return res.status(201).json(product);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "SKU must be unique within your organization." });
    }

    throw error;
  }
}

async function updateProduct(req, res) {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const { errors, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
    validateProductPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    await product.update({
      name: req.body.name.trim(),
      sku: req.body.sku.trim(),
      description: req.body.description?.trim() || null,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    });

    return res.json(product);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "SKU must be unique within your organization." });
    }

    throw error;
  }
}

async function deleteProduct(req, res) {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  await product.destroy();
  return res.status(204).send();
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
