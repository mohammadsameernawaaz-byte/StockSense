import express from "express";
import cors from "cors";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

const PORT = 5000;
const JWT_SECRET =
  process.env.JWT_SECRET || "stocksense_dev_secret";

app.use(cors());
app.use(express.json());

// =====================================================
// DATABASE
// =====================================================

const db = new DatabaseSync("stocksense.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    uom TEXT NOT NULL,
    stock REAL NOT NULL DEFAULT 0,
    min_stock REAL NOT NULL DEFAULT 0,
    reorder_qty REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    quantity REAL NOT NULL,
    from_location TEXT,
    to_location TEXT,
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// =====================================================
// DATABASE MIGRATION
// =====================================================
// Your database already exists, so this makes sure the
// reorder_qty column is added to older databases too.

try {
  db.prepare(`
    ALTER TABLE products
    ADD COLUMN reorder_qty REAL NOT NULL DEFAULT 0
  `).run();
} catch (error) {
  const message = String(error.message || "");

  if (!message.includes("duplicate column name")) {
    console.error(
      "Unable to add reorder_qty column:",
      error
    );
  }
}

// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StockSense API is running",
  });
});

// =====================================================
// AUTH - SIGNUP
// =====================================================

app.post("/api/auth/signup", (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Name, email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters",
    });
  }

  try {
    const passwordHash =
      bcrypt.hashSync(password, 10);

    const result = db
      .prepare(`
        INSERT INTO users
        (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
      `)
      .run(
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash
      );

    const user = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    const token = jwt.sign(
      user,
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        "An account with this email already exists",
    });
  }
});

// =====================================================
// AUTH - LOGIN
// =====================================================

app.post("/api/auth/login", (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Email and password are required",
    });
  }

  const record = db
    .prepare(
      "SELECT * FROM users WHERE email = ?"
    )
    .get(email.trim().toLowerCase());

  if (
    !record ||
    !bcrypt.compareSync(
      password,
      record.password_hash
    )
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password",
    });
  }

  const user = {
    id: record.id,
    name: record.name,
    email: record.email,
  };

  const token = jwt.sign(
    user,
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.json({
    success: true,
    token,
    user,
  });
});

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

function authenticate(req, res, next) {
  const authHeader =
    req.headers.authorization || "";

  const token = authHeader.startsWith(
    "Bearer "
  )
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// CURRENT USER
// =====================================================

app.get(
  "/api/me",
  authenticate,
  (req, res) => {
    const user = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          created_at
        FROM users
        WHERE id = ?
      `)
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json(user);
  }
);

// =====================================================
// PRODUCTS - GET ALL
// =====================================================

app.get(
  "/api/products",
  authenticate,
  (req, res) => {
    const products = db
      .prepare(`
        SELECT
          id,
          name,
          sku,
          category,
          uom,
          stock,
          min_stock,
          reorder_qty,
          created_at
        FROM products
        ORDER BY id DESC
      `)
      .all();

    res.json(products);
  }
);

// =====================================================
// PRODUCTS - CREATE
// =====================================================

app.post(
  "/api/products",
  authenticate,
  (req, res) => {
    const {
      name,
      sku,
      category,
      uom,
      stock = 0,
      min_stock = 0,
      reorder_qty = 0,
    } = req.body;

    // -----------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------

    if (
      !name ||
      !sku ||
      !category ||
      !uom
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, SKU, category and UoM are required",
      });
    }

    // -----------------------------------------------
    // NORMALIZE NUMBERS
    // -----------------------------------------------

    const initialStock =
      Number(stock);

    const minimumStock =
      Number(min_stock);

    const reorderQuantity =
      Number(reorder_qty);

    // -----------------------------------------------
    // VALIDATE NUMBERS
    // -----------------------------------------------

    if (
      Number.isNaN(initialStock) ||
      Number.isNaN(minimumStock) ||
      Number.isNaN(reorderQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock values must be valid numbers",
      });
    }

    if (
      initialStock < 0 ||
      minimumStock < 0 ||
      reorderQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock values cannot be negative",
      });
    }

    if (
      reorderQuantity > 0 &&
      minimumStock <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum stock must be greater than zero when a reorder quantity is set",
      });
    }

    // -----------------------------------------------
    // CREATE PRODUCT
    // -----------------------------------------------

    try {
      const result = db
        .prepare(`
          INSERT INTO products
          (
            name,
            sku,
            category,
            uom,
            stock,
            min_stock,
            reorder_qty
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          name.trim(),
          sku.trim().toUpperCase(),
          category.trim(),
          uom.trim(),
          initialStock,
          minimumStock,
          reorderQuantity
        );

      const product = db
        .prepare(`
          SELECT *
          FROM products
          WHERE id = ?
        `)
        .get(
          result.lastInsertRowid
        );

      res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
      });
    } catch (error) {
      const message =
        String(error.message || "");

      if (
        message.includes(
          "UNIQUE constraint failed"
        )
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A product with this SKU already exists",
        });
      }

      console.error(
        "Product creation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create product",
      });
    }
  }
);

// =====================================================
// DASHBOARD
// =====================================================

app.get(
  "/api/dashboard",
  authenticate,
  (req, res) => {
    const totalProducts = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM products
      `)
      .get().count;

    const totalStock = db
      .prepare(`
        SELECT
          COALESCE(
            SUM(stock),
            0
          ) AS total
        FROM products
      `)
      .get().total;

    const lowStock = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE
          stock > 0
          AND stock <= min_stock
      `)
      .get().count;

    const outOfStock = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE stock <= 0
      `)
      .get().count;

    const reorderRequired = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE
          stock <= min_stock
          AND reorder_qty > 0
      `)
      .get().count;

    const recentMovements = db
      .prepare(`
        SELECT
          movements.*,
          products.name AS product_name,
          products.sku,
          products.uom
        FROM movements
        JOIN products
          ON products.id = movements.product_id
        ORDER BY movements.id DESC
        LIMIT 10
      `)
      .all();

    res.json({
      totalProducts,
      totalStock,
      lowStock,
      outOfStock,
      reorderRequired,
      recentMovements,
    });
  }
);

// =====================================================
// STOCK MOVEMENTS
// =====================================================

app.post(
  "/api/movements",
  authenticate,
  (req, res) => {
    const {
      productId,
      type,
      quantity,
      fromLocation = null,
      toLocation = null,
      reference = null,
    } = req.body;

    // -----------------------------------------------
    // PRODUCT
    // -----------------------------------------------

    const product = db
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    // -----------------------------------------------
    // QUANTITY
    // -----------------------------------------------

    const qty = Number(quantity);

    if (
      Number.isNaN(qty) ||
      qty < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be zero or greater",
      });
    }

    if (
      qty === 0 &&
      type !== "ADJUSTMENT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0",
      });
    }

    // -----------------------------------------------
    // CALCULATE NEW STOCK
    // -----------------------------------------------

    let newStock =
      Number(product.stock);

    if (type === "RECEIPT") {
      newStock += qty;
    }

    else if (type === "DELIVERY") {
      newStock -= qty;
    }

    else if (type === "ADJUSTMENT") {
      newStock = qty;
    }

    else if (type === "TRANSFER") {
      // Total stock does not change.
      newStock = Number(
        product.stock
      );
    }

    else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid movement type",
      });
    }

    // -----------------------------------------------
    // PREVENT NEGATIVE STOCK
    // -----------------------------------------------

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient stock",
      });
    }

    // -----------------------------------------------
    // PREPARE SQL
    // -----------------------------------------------

    const updateProduct =
      db.prepare(`
        UPDATE products
        SET stock = ?
        WHERE id = ?
      `);

    const insertMovement =
      db.prepare(`
        INSERT INTO movements
        (
          product_id,
          type,
          quantity,
          from_location,
          to_location,
          reference
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

    // -----------------------------------------------
    // TRANSACTION
    // -----------------------------------------------

    try {
      db.exec("BEGIN");

      updateProduct.run(
        newStock,
        productId
      );

      insertMovement.run(
        productId,
        type,
        qty,
        fromLocation,
        toLocation,
        reference
      );

      db.exec("COMMIT");
    } catch (error) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // Ignore rollback error.
      }

      console.error(
        "Movement error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to record this movement",
      });
    }

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    res.json({
      success: true,
      message:
        `${type} completed`,
      stock: newStock,
    });
  }
);

// =====================================================
// MOVEMENT HISTORY
// =====================================================

app.get(
  "/api/movements",
  authenticate,
  (req, res) => {
    const movements = db
      .prepare(`
        SELECT
          movements.*,
          products.name AS product_name,
          products.sku,
          products.uom
        FROM movements
        JOIN products
          ON products.id =
             movements.product_id
        ORDER BY movements.id DESC
      `)
      .all();

    res.json(movements);
  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {
    console.log(
      `StockSense backend running on http://localhost:${PORT}`
    );
  }
);