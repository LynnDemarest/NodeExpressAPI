const Joi = require("@hapi/joi"); // use Pascal case for classes
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const express = require("express");
const router = express.Router();
const { coursesPutValidation, coursesPostValidation } = require("./validation.js");


let courses = [
  { id: 1, name: "Course1" },
  { id: 2, name: "Course2" },
  { id: 3, name: "Course3" },
];

// Basic Express app to illustrate routing, and data validation.
// get, post, put, and delete are implemented.

// TODO
// router.get("/api/courses/help", (req, res) => {
//     res.send("Usage: ");
// });

// http://localhost:3000/api/courses
router.get("/", (req, res) => {
  // either one works
  // res.json(courses);
  res.send(courses);
});

// http://localhost:3000/api/courses/1
// regular expresssion accepts URIs with integer id only.
router.get("/:id(\\d+)", (req, res) => {
  var ID = parseInt(req.params.id);
  if (!isNaN(ID)) {
    var course = courses.find((x) => x.id === parseInt(req.params.id));
    if (course != undefined) {
      res.send(course);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`${ID} was not found`);
      res.end();
    }
  } else {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Bad Request. ID must be a number. Request /Usage.html for more.");
    res.end();
  }
});

router.delete("/:id(\\d+)", (req, res) => {
  var ID = parseInt(req.params.id);
  if (!isNaN(ID)) {
    var idx = courses.findIndex((course) => course.id == ID);
    if (idx >= 0) {
      courses.splice(idx, 1);
      res.status(StatusCodes.OK).send(`Course ${ID} deleted.`);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`${ID} was not found`);
      res.end();
    }
  } else {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Bad Request. ID must be a number. Request /Usage.html for more.");
    res.end();
  }
});

// Add new course to in-memory array.
// http://localhost:3000/api/courses
//
router.post("/", (req, res) => {
  const error = coursesPostValidation(req.body);
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
  } else {
    const course = {
      id: courses.length + 1,
      name: req.body.name,
    };
    console.log(course);
    courses.push(course);
    res.send(course);
  }
});

//
// Update
//
router.put("/", (req, res) => {
  const error = coursesPutValidation(req.body);
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
  } else {
    // update the value in the array
    //
    var idx = courses.findIndex((course) => course.id == req.body.id);
    if (idx >= 0) {
      //courses.splice(idx, 1);
      let newcourse = { id: req.body.id, name: req.body.name };
      courses.splice(idx, 1, newcourse);
      res.status(StatusCodes.OK).send(`Course ${req.body.id} updated.`);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`${req.body.id} was not found`);
      res.end();
    }
  }
});

module.exports = router;
