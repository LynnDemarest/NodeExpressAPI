const jwt = require("jsonwebtoken");
const { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } = require("http-status-codes");
const dotenv = require("dotenv");

// This "verify" function serves as middleware to make sure the header has a valid JWT token.
//
// It can be placed in sequence like this to protect any endpoint:
//
//    const verify = require("./verifyToken")
//    ...
//    router.get('/', verify, async (req, res) => {
//    ...
//
// The user is added to req.user so it can be used later in the pipeline.
//
// Note that the token should be passed in on header.auth-token ...

module.exports = function (req, res, next) {
    const tokenkey = process.env.JWT_TOKEN_NAME;
    const token = req.header(tokenkey);
    if (!token) return res.status(401).send("Access denied."); // SHORT-CIRCUIT !!!
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified; // NOTE: drop the user record (_id and iat) into the request so we'll have it later on if needed
        next(); // call next element in middleware pipeline
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).send(`${getReasonPhrase(StatusCodes.UNAUTHORIZED)} Invalid Token `);
    }
};
