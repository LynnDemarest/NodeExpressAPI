const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { DH_NOT_SUITABLE_GENERATOR } = require("constants");
const app = express();
//const posts = require("mongoose");
dotenv.config();

// Add middleware
//
// .json parses incoming json data 
// If you remove .json() the controller endpoint is not found! 
// 
app.use(express.json());


// All HTML files in 'public' folder should be served 
// Note: You must include the .html, i.e., About.html 
//
app.use(express.static(path.join(__dirname, 'public')));

// Inject the courses middleware into the pipeline.
//
app.use("/api/user", require("./routes/api/auth.js"));

app.use("/api/courses", require("./routes/api/courses.js"));

app.use("/api/files", require("./routes/api/fileman.js"));

app.use("/api/mssql", require("./routes/api/mssql.js"));

app.use("/api/posts", require("./routes/api/posts.js"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});