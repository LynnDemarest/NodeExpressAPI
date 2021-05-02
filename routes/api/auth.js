const router = require("express").Router();
const ErrorCodes = require("../../http/ErrorCodes");
const User = require("../../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("./validation");
// const schema = {
//     name: Joi.string().min(3).required(),
//     email: Joi.string().min(6).required().email(),
//     password: Joi.string().min(6).required()
// }




router.post('/register', async (req, res) => {

    const { error } = registerValidation(req.body);
    if (error) return res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);

    try {
        //const MongoClient = require('mongodb').MongoClient;
        const uri = process.env.MongoCS; // "mongodb+srv://lynn:VRYUzni4vfnUBMP3@cluster0.cln9j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        //const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoose.connect(uri, { useNewUrlParser: true });

        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(ErrorCodes.BAD_REQUEST).send('Email already exists');
        }

        // hash the password 
        let salt = await bcrypt.genSalt(10);
        let pwdHash = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: pwdHash
        });

        // Won't get here if email exists. 
        const savedUser = await user.save();
        res.send(savedUser);
    }
    catch (err) {
        res.status(ErrorCodes.BAD_REQUEST).send(err);
    }
});

// api/user/login
//
router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
    try {
        //const MongoClient = require('mongodb').MongoClient;
        const uri = process.env.MongoCS; // "mongodb+srv://lynn:VRYUzni4vfnUBMP3@cluster0.cln9j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        //const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(ErrorCodes.BAD_REQUEST).send('Login failed.');

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(ErrorCodes.BAD_REQUEST).send("Login failed.")

        const token = jwt.sign({_id: user._id}, process.env.tokensecret);
        res.header('auth-token', token).send(token);
    }
    catch (err) {
        res.status(ErrorCodes.BAD_REQUEST).send(err);
    }
});

module.exports = router;