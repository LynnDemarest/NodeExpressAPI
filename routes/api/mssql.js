const sql = require("mssql")
const config = require('./config.js');
const Joi = require("joi");  // use Pascal for classes. Joi is for validation.
const ErrorCodes = require("../../http/ErrorCodes");
const [helpers] = require("./helpers");

const express = require("express");
const Path = require("path");
const router = express.Router();



// players
// Gets all players. 
//
router.get("/players", async (req, res) => {
    //     doread();
    // });


    // const doread = async function () {
    try {

        //
        // Configuration for mssql. 
        // TODO: Should be in env. 
        //
        // const config = {
        //     user: 'lynn',
        //     password: '7878bri',
        //     server: 'LYNNDELLNOTEBOO', // You can use 'localhost\\instance' to connect to named instance
        //     port: 49170,
        //     database: 'ngChess',
        // };

        // make sure that any items are correctly URL encoded in the connection string
        //
        let pool = await sql.connect(config);
        const result = await pool.request().query('select * from Players; select * from Games;');
        console.dir(result);

        let resp = helpers.MakeResponse(true, "Players read.", result.recordsets[0]);

        //
        // recordsets[] has an array of recordsets, in case the query returned more than one. 
        // recordset is just the first one. 
        // rowsAffected is an array of the number of rows returned in each recordset.
        //
        res.send(resp);

    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not get players: ${err}`);
    }
});

// sql.on('error', err => {
//     console.log(err); 
// });

// doread();
module.exports = router;
