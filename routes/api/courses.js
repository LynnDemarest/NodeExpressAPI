const express = require("express");
const router = express.Router();

let courses = [
    { id: 1, name: "Course1"},
    { id: 2, name: "Course2"},
    { id: 3, name: "Course3"}
    ];
    
    // app.get, post, put, delete
    
    router.get("/api/courses/help", (req, res) => {
        res.send("Usage: ");
    });
    
    router.get('/api/courses', (req, res) => {
        // either one works 
        //res.json(courses);
        res.send(courses);
    })
    
    router.get('/api/courses/:id', (req, res) =>
    {
        res.send(courses.find(x => x.id === parseInt(req.params.id)));
        // req.query has querystring args
    })
    
    // new course
    router.post('/api/courses', (req, res) =>
    {
        const schema = Joi.object({
            name: Joi.string().min(3).required()
        });
        const { error }  = schema.validate(req.body);
        if (error){
            res.status(400).send(error.details[0].message);
            return;
        }
    
        const course = { id: courses.length+1, 
                         name: req.body.name };
        console.log(course);
        courses.push(course);
        res.send(course);
    })

    
    module.exports = router;