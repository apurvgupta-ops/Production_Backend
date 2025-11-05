import express from "express";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Get the server running and connect to the database
app.get("/users", async (req, res) => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  res.json(users);
});

app.listen(port, "0.0.0.0", () => {
  console.log("Server started");
  connectDB();

  console.log(`Server listening at http://localhost:${port}`);
});
