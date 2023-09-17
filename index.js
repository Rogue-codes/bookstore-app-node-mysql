import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
});

// ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY process.env.DB_PASSWORD;

app.get("/", (req, res) => {
  res.status(200).send("welcomme to book store app with mysql and node.");
});

app.get("/books", (req, res) => {
  const q = `SELECT * FROM Books`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

app.post("/books/add", (req, res) => {
  // Specify the correct table name and column names in your SQL query.
  const q = `INSERT INTO Books (title, description, cover_img) VALUES (?, ?, ?)`;
  const { title, description, cover_img } = req.body;

  // Check if any of the required fields are missing
  if (!title || !description || !cover_img) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const values = [title, description, cover_img];

  db.query(q, values, (err, data) => {
    if (err) {
      // Handle the error appropriately, e.g., sending an error response.
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Assuming the query was successful, you can send a success response.
    return res.status(200).json({ message: "Book added successfully", data });
  });
});

app.delete("/books/delete/:id", (req, res) => {
  const bookID = req.params.id;
  const q = "DELETE FROM books WHERE id = ?";
  db.query(q, [bookID], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "an error occured" });
    }
    return res.status(200).json({
      message: "book deleted successfully",
      data,
    });
  });
});


app.put("/books/update/:id", (req, res) => {
    const bookID = req.params.id;
    const q =
      "UPDATE books SET title=?, description=?, cover_img=? WHERE id = ?";
    const { title, description, cover_img } = req.body;
  
    // Check if any of the required fields are missing
    if (!title || !description || !cover_img) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const values = [title, description, cover_img, bookID];
  
    db.query(q, values, (err, data) => {
      if (err) {
        // Check if the book with the specified id doesn't exist
        if (err.code === "ER_ROW_NOT_FOUND") {
          return res.status(404).json({ error: "Book not found" });
        }
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
      }
      // Check if any rows were affected by the update
      if (data.affectedRows === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.status(200).json({
        message: "Book updated successfully",
        data,
      });
    });
  });

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
