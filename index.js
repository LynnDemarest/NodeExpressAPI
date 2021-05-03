const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require('cors');
const ejs = require("ejs");
//const mssql = require("./routes/api/mssql");
const mssql = require("mssql");
//const { DH_NOT_SUITABLE_GENERATOR } = require("constants");

const sqldata = require("./data/advworks");

const app = express();

// https://ejs.co/
app.set('view engine', 'ejs');   // looks for views in /views folder 

dotenv.config();  // loads .env key-value pairs into process.env.KEY variable. .env should be hidden

// MIDDLEWARE
//

// CORS with default configuration, allows all origins. 
// https://expressjs.com/en/resources/middleware/cors.html
//
app.use(cors());

// express.json parses incoming json data. 
// Without it, the controller endpoint is not found.
// 
app.use(express.json());

// This allows all HTML, CSS and other files in 'public' folder to be served. 
// Note: You must include the .html, i.e., About.html 
//
app.use(express.static(path.join(__dirname, 'public')));

// HOME PAGE 
//
//
app.get("/", (req, res) => res.render("index", { title: "Home"}));
app.get("/help", (req, res) => res.render("usage", { title: "Usage"}));

// async function not called with await...
//let customers = [{ name: "cust1" }, { name: "cust2"} ];
sqldata.getCustomers().then( (customers) => {
    app.get("/advworks", (req, res) => res.render("advworks", { title: "Adventure Works", customers: customers.recordset }));    
})
//app.get("/advworks", (req, res) => res.render("advworks", { title: "Adventure Works", customers }));

// Inject the courses middleware into the pipeline.
//
app.use("/api/user", require("./routes/api/auth.js"));

app.use("/api/courses", require("./routes/api/courses.js"));

app.use("/api/files", require("./routes/api/fileman.js"));

app.use("/api/mssql", require("./routes/api/mssql.js"));

app.use("/api/posts", require("./routes/api/posts.js"));

// Connect to the mongodb database before starting to listen.  
// The database is used for authentication in auth.js 
mongoose.connect(process.env.MongoCS, { useNewUrlParser: true, useUnifiedTopology: true }).then((result) => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
}, (err) => console.log("ERROR: " + err));