const router = require("express").Router();
const verifyJWTToken = require('./verifyToken');           // anonymous function given name "verify"
const mongoose = require("mongoose");
const User = require("../../models/User");
const { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } = require('http-status-codes');


// posts.js
// 
// This is a simple route whose only purpose is to illustrate 
// how to use the "verify" middleware to make sure the user is logged in. 
// 
//

router.get('/', verifyJWTToken, async (req, res) => {

    try {

        // Just as a test, let's read the user with the _id fetched in verifyJWTToken method  
        //
        let user = await User.findOne({ _id: req.user._id })
        console.log(user.name + " " + user.email + " " + user.id);

        // Fake returned data.
        res.json({
            posts: [{
                title: 'post 1',
                description: 'some post'
            },
            {
                title: 'post 2',
                description: 'post 2 description'
            }]
        })
    }
    catch (err)
    {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
})


module.exports = router;