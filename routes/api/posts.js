const router = require("express").Router();
const verify = require('./verifyToken');
const mongoose = require("mongoose");
const User = require("../../models/User");
const ErrorCodes = require("../../http/ErrorCodes");

router.get('/', verify, async (req, res) => {

    try {
        const uri = process.env.MongoCS; 
        await mongoose.connect(uri, { useNewUrlParser: true });
        let user = await User.findOne({ _id: req.user._id })
        console.log(user);

        res.json({
            posts: {
                title: 'post 1',
                description: 'some post'
            }
        })
    }
    catch (err)
    {
        res.status(ErrorCodes.BAD_REQUEST).send(err);
    }
})


module.exports = router;