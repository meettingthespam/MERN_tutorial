// importing express
const express = require("express");

// importing the databse connection
const connectDB = require("./config/mongo_db.js");

// initializing the app
const app = express();

// connect the database
connectDB();

// initializing middleware

// body parser
app.use(express.json({ extended: false }));

// app.get("/", (req, res) => res.send("API runnig"));

// Defining routes

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/employees", require("./routes/api/employees"));
app.use("/api/inventory", require("./routes/api/inventory"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/recipes", require("./routes/api/recipes"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/generic_posts", require("./routes/api/generic_posts"));

// making the port based on the actual server's
// real PORT or defaulting to port 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
