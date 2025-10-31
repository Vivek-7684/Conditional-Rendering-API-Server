const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

let connection;

app.use(cors());

async function DatabaseSet() {
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Redhat@123',
            database: 'sample'
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

        const [rows] = await connection.execute(query);

        res.status(200).send(rows);

    }
    catch (err) {
        console.log(err.message);
    }

});



app.listen("3000", () => {
    console.log("Server Started at port:3000");
})