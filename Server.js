require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const DatabaseSet = require("./db");
const { fromZodError } = require("zod-validation-error");
const { productSchema } = require("./validation");
const sanitizeHtml = require("sanitize-html");
const app = express();

app.use(cors());

app.use(express.json());

let connection;

(async () => {
  connection = await DatabaseSet();
})();

app.get("/Product", async (req, res) => {
  try {
    const { name, maxPrice, minPrice, category } = req.query;

    const result = productSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).send(fromZodError(result.error).toString());
    }

    let query = "Select * from sample_product Where 1=1";
    let fields = [];

    if (name) {
      query += ` AND name LIKE '%${name}%'`;
    }

    if (maxPrice) {
      query += ` AND maxPrice <= ${maxPrice}`;
    }

    if (minPrice) query += ` AND minPrice >= ${minPrice}`;

    if (category) query += ` AND category = '${category}'`;

    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      return res.status(404).send("No Products Found");
    } else {
      res.status(200).send(rows);
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.post("/AddProduct", async (req, res) => {
  try {
    const { name, maxPrice, minPrice, category } = req.body;

    if (!name || !maxPrice || !minPrice || !category) {
      return res.status(400).send("All Fields are Required");
    }

    const result = productSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).send(fromZodError(result.error).toString());
    }

    const checkExistQuery = `SELECT * FROM sample_product WHERE name = ?`;

    const [existingProducts] = await connection.execute(checkExistQuery, [
      name,
    ]);

    if (existingProducts.length > 0) {
      return res.status(409).send("Product with the same name already exists");
    }

    const query = `INSERT INTO sample_product (name, maxPrice, minPrice, category) VALUES (?, ?, ?, ?)`;

    const values = [name, maxPrice, minPrice, category];

    const ProductList = await connection.execute(query, values);

    res.status(201).send("Product Added Successfully");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.delete("/DeleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Product Id is required");
    }

    const result = productSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).send(fromZodError(result.error).toString());
    }

    const checkExistQuery = `SELECT * FROM sample_product WHERE id = ?`;

    const [existingProducts] = await connection.execute(checkExistQuery, [id]);

    if (existingProducts.length === 0) {
      return res.status(404).send("Product not found");
    }

    await connection.execute(`DELETE FROM sample_product WHERE id = ?`, [id]);

    res.status(200).send("Product Deleted Successfully");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server Started at Port:${process.env.PORT || 3000}`);
});
