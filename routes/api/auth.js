const router = require("express").Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("./validation");
const { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } = require("http-status-codes");

// api/user/register
// name, email and password should be in the JSON body.
//
router.post("/register", async (req, res) => {
    const error = registerValidation(req.body);
    if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message); // SHORT-CIRCUIT !!!

    try {
        // Note: Connection is established in index.js
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            let code = StatusCodes.BAD_REQUEST;
            return res.status(code).send(`${getReasonPhrase(code)} Email already exists`); // SHORT-CIRCUIT !!!
        }

        // hash the password
        let salt = await bcrypt.genSalt(process.inv.SALT_ROUNDS);
        let pwdHash = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: pwdHash,
        });

        const savedUser = await user.save({ isNew: true });
        res.send(savedUser);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
});

// api/user/login
//
router.post("/login", async (req, res) => {
    const error = loginValidation(req.body);
    if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message); // SHORT-CIRCUIT !!!

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(StatusCodes.BAD_REQUEST).send("Login failed."); // SHORT-CIRCUIT !!!

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(StatusCodes.BAD_REQUEST).send("Login failed."); // SHORT-CIRCUIT !!!

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
        res.header(process.env.JWT_TOKEN_NAME, token).send(token);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
});

module.exports = router;
