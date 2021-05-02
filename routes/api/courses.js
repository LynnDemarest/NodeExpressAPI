const Joi = require("@hapi/joi");  // Pascal for classes
const ErrorCodes = require("../../http/ErrorCodes");
const express = require("express");
const router = express.Router();

let courses = [
    { id: 1, name: "Course1" },
    { id: 2, name: "Course2" },
    { id: 3, name: "Course3" }
];

// app.get, post, put, delete

// router.get("/api/courses/help", (req, res) => {
//     res.send("Usage: ");
// });

//router.get('/api/courses', (req, res) => {
router.get('/', (req, res) => {
    // either one works 
    //res.json(courses);
    res.send(courses);
})

router.get('/:id', (req, res) => {

    var ID = parseInt(req.params.id);
    if (!isNaN(ID)) {
        var course = courses.find(x => x.id === parseInt(req.params.id));
        if (course != undefined) {
            res.send(course);
        }
        else {
            res.status(ErrorCodes.NOT_FOUND).send(`${ID} was not found`);
            res.end();
        }
    }
    else {
        res.status(ErrorCodes.BAD_REQUEST).send("Bad Request. ID must be a number. Request /Usage.html for more.");
        res.end();
    }
})

// new course
router.post('/', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
    }
    else {
        const course = {
            id: courses.length + 1,
            name: req.body.name
        };
        console.log(course);
        courses.push(course);
        res.send(course);
    }
})


module.exports = router;