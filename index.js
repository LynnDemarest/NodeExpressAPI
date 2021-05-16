const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const ejs = require("ejs");

//const bootstrap = require('@bootstrap/js');  // for browsers! 

//const mssql = require("./routes/api/mssql");
const mssql = require("mssql");
//const { DH_NOT_SUITABLE_GENERATOR } = require("constants");

const sqldata = require("./data/advworks");

const app = express();

// https://ejs.co/
app.set("view engine", "ejs"); // looks for views in /views folder

dotenv.config(); // loads .env key-value pairs into process.env.KEY variable. .env should be hidden

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
app.use(express.static(path.join(__dirname, "public")));

// HOME PAGE
// and other views: /help (usage), and /advworks, which reads from SQL Server.
//
app.get("/", (req, res) => res.render("index", { title: "Home" }));

app.get("/help", (req, res) => res.render("usage", { title: "Usage" }));

app.get("/courses", (req, res) => res.render("courses", { title: "Courses" }));
app.get("/fileman", (req, res) => res.render("fileman", { title: "Files" }));


app.get("/misc", (req, res) => res.render("misc", { title: "Miscellaneous Tricks and Tips" }));

// async function not called with await...
// Here, we read customers from the AdventureWorks database and pass them to the advworks .ejs view.
//
if (true) {
let cols = "Title, FirstName + ' ' + MiddleName + ' ' + LastName as Name, EmailAddress, Phone";
sqldata.getCustomers(cols, 20).then((customers) => {
    app.get("/advworks", (req, res) =>
        res.render("advworks", { title: "Adventure Works", customers: customers.recordset })
    );
});
}
//app.get("/advworks", (req, res) => res.render("advworks", { title: "Adventure Works", customers }));

// Inject the courses middleware into the pipeline.
// Note: Relative paths are given in the .js file's route handlers.
//       So /api/user/register is declared as /register in auth.js
//
app.use("/api/user", require("./routes/api/auth.js"));

app.use("/api/courses", require("./routes/api/courses.js"));

app.use("/api/files", require("./routes/api/fileman.js"));

if (true) app.use("/api/mssql", require("./routes/api/mssql.js"));

// This is a dummy controller used to demonstrate the use of verifyToken.js
//
app.use("/api/posts", require("./routes/api/posts.js"));

// Connect to the mongodb database before starting to listen.
// The database is used for authentication in auth.js
mongoose.connect(process.env.MongoCS, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    (result) => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Listening on port ${port}...`);
        });
    },
    (err) => console.log("ERROR: " + err)
);
