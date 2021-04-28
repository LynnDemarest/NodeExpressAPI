const express = require("express");
const path = require("path");

const app = express();

// Add middleware
//
//
app.use(express.json());

// All HTML files in 'public' folder should be served 
// Note: You must include the .html, i.e., About.html 
//
app.use(express.static(path.join(__dirname, 'public')));

// Inject the courses middleware into the pipeline.
//
app.use("/api/courses", require("./routes/api/courses.js"));

app.use("/api/files", require("./routes/api/fileman.js"));


// let courses = [
// { id: 1, name: "Course1"},
// { id: 2, name: "Course2"},
// { id: 3, name: "Course3"}
// ];

// // app.get, post, put, delete

// app.get("/", (req, res) => {
//     res.send("Hello World!!!");
// });

// app.get('/api/courses', (req, res) => {
//     // either one works 
//     //res.json(courses);
//     res.send(courses);
// })

// app.get('/api/courses/:id', (req, res) =>
// {
//     res.send(req.params.id);
//     // req.query has querystring args
// })

// // new course
// app.post('/api/courses', (req, res) =>
// {
//     const schema = Joi.object({
//         name: Joi.string().min(3).required()
//     });
//     const { error }  = schema.validate(req.body);
//     if (error){
//         res.status(400).send(error.details[0].message);
//         return;
//     }

//     const course = { id: courses.length+1, 
//                      name: req.body.name };
//     console.log(course);
//     courses.push(course);
//     res.send(course);
// })


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});