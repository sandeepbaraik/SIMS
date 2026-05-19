const sequelize = require("../config/database");
const Organization = require("./Organization");
const User = require("./User");
const Product = require("./Product");

Organization.hasMany(User, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
User.belongsTo(Organization, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
});

Organization.hasMany(Product, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Product.belongsTo(Organization, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
});

module.exports = {
  sequelize,
  Organization,
  User,
  Product,
};
