const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const { fromZodError } = require("zod-validation-error");
const { productSchema } = require("./validation");
const app = express();

let connection;

app.use(cors());

app.use(express.json());

async function DatabaseSet() {
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Redhat@123",
      database: "sample",
    });

    return connection;
  } catch (err) {
    console.log("Error:", err.message);
  }
}

DatabaseSet();

app.get("/Product", async (req, res) => {
  try {
    const { name, maxPrice, minPrice, category } = req.query;

    let query = "Select * from sample_product Where 1=1";

    if (name) query += ` AND name LIKE '%${name}%'`;

    if (maxPrice) query += ` AND maxPrice <= ${maxPrice}`;

    if (minPrice) query += ` AND minPrice >= ${minPrice}`;

    if (category) query += ` AND category = '${category}'`;

    const result = productSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).send(result.error.format());
    }

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

app.listen("3000", () => {
  console.log("Server Started at port:3000");
});
