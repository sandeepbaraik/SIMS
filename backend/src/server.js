require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const { requireAuth } = require("./middleware/auth");
const { sequelize } = require("./models");

const app = express();
const port = Number(process.env.PORT || 5000);
let initializationPromise;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await sequelize.authenticate();
      await sequelize.sync();
    })().catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
}

app.use(async (_req, _res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});


app.use("/api/auth", authRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/settings", requireAuth, settingsRoutes);
app.use("/api/products", requireAuth, productRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: err.errors?.[0]?.message || "Validation failed.",
      errors: err.errors?.map((entry) => entry.message),
    });
  }

  return res.status(500).json({ message: "Something went wrong on the server." });
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`StockFlow backend listening on port ${port}`);
  });
}
