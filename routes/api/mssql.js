const sql = require("mssql");
const Joi = require("@hapi/joi"); // use Pascal for classes. Joi is for validation.
const { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } = require("http-status-codes");
const [helpers] = require("./helpers");
const express = require("express");
const Path = require("path");
const router = express.Router();
const dotdev = require("dotenv");
const { mssqlCustomerValidation } = require("./validation.js");

// mssql.js
// https://www.npmjs.com/package/mssql
//
// This code uses AdventureWorksLT2019, so you'll have to set that up yourself.
//
// I have added this simple stored procedure to handle update and insert:
//
// CREATE PROCEDURE upsertCustomer
// 	@CustomerID int,
// 	@FirstName Name,
// 	@LastName Name
// AS
// BEGIN
// 	SET NOCOUNT ON;
// 	IF (@CustomerID = 0)
// 	BEGIN
// 		INSERT into [SalesLT].[Customer] (FirstName, LastName, PasswordHash, PasswordSalt) values (@FirstName, @LastName, 'asdfasdf', '4rg67uy')
// 		SELECT * FROM SalesLT.Customer where CustomerID = @@IDENTITY
// 	END
// 	ELSE
// 	BEGIN
// 		UPDATE [SalesLT].[Customer] set FirstName = @FirstName, [LastName] = @LastName WHERE CustomerID = @CustomerID
// 		SELECT * FROM SalesLT.Customer where CustomerID = @CustomerID
// 	END
// END
// GO
//
//
const bDEBUG = true;
const iMaxCustomers = process.env.mssql_defaultLimit;
const iMaxMax = process.env.mssql_maxLimit;

let PORT = parseInt(process.env.mssql_port);

let options_encrypt = true;
let enableArithAbort = true;
if (process.env.mssql_options_encrypt == "false") options_encrypt = false;
if (process.env.mssql_enableArithAbort == "false") enableArithAbort = false;

const sqlConfig = {
    user: process.env.mssql_user,
    password: process.env.mssql_password,
    server: process.env.mssql_server,
    port: PORT,
    database: process.env.mssql_database,
    options: {
        encrypt: options_encrypt,
        enableArithAbort: enableArithAbort,
    },
};
const myPool = new sql.ConnectionPool(sqlConfig);
const myPoolConnect = myPool.connect();

myPool.on("error", (err) => console.log(err));

//
// ROUTES
//

// Get all customers (limited)
//
// customer
// Gets all customers using the singelton connection pool 'myPool'.
//
router.get("/customer", async (req, res) => {
    try {
        await myPoolConnect;

        // limit number of records returned.
        // default is iMaxCustomers. Maximum is iMaxMax.
        let max = req.query.max;
        if (max === undefined || isNaN(max)) {
            max = iMaxCustomers;
        } else {
            if (max > iMaxMax) max = iMaxMax;
        }

        const result = await myPool.request().query(`select top ${max} * from SalesLT.Customer`);
        // Note:
        // recordsets[] has an array of recordsets, in case the query returned more than one.
        // recordset is just the first one.
        // rowsAffected is an array of the number of rows returned in each recordset.
        //
        let resp = helpers.MakeResponse(true, `${result.recordset.length} customers read.`, result.recordset);
        res.send(resp);
    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(StatusCodes.BAD_REQUEST).send(`Could not get customers: ${err}`);
    }
});

// Get ONE Customer
// Gets one player using query parameters and global pool.
//
router.get("/customer/:id", async (req, res) => {
    try {
        await myPoolConnect;
        let resp;
        var ID = parseInt(req.params.id);
        if (!isNaN(ID)) {
            const result = await myPool
                .request()
                .input("CustomerID", sql.Int, ID)
                .query("select * from SalesLT.Customer where CustomerID=@CustomerID");

            console.dir(result);
            //
            // recordsets[] has an array of recordsets, in case the query returned more than one, as in this example.
            // recordset is just the first one.
            // rowsAffected is an array of the number of rows returned in each recordset.
            //
            if (result.recordset.length > 0) {
                resp = helpers.MakeResponse(true, `Customer ${ID} read.`, result.recordset);
            } else {
                resp = helpers.MakeResponse(false, `Customer ${ID} not found.`, result.recordset);
            }
        } else {
            resp = helpers.MakeResponse(false, `Customer ID (${req.params.id}) must be a number.`);
        }

        res.send(resp);
    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(StatusCodes.BAD_REQUEST).send(`Could not get customer ${req.params.id}: ${err}`);
    }
});

// Save Customer
// insert or update using global connection pool
//
//
//
router.post("/customer", async (req, res) => {
    try {
        const error = mssqlCustomerValidation(req.body);
        if (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
        } else {
            // example of using a stored procedure with mssql
            //
            //
            await myPoolConnect;
            let id = req.body.customerid;
            if (id == undefined) id = 0;

            const result = await myPool
                .request()
                .input("CustomerID", sql.Int, id)
                .input("FirstName", sql.NVarChar(50), req.body.firstname)
                .input("LastName", sql.NVarChar(50), req.body.lastname)
                .execute("upsertCustomer");

            console.dir(result);

            let resp = helpers.MakeResponse(true, `Customer written.`, result.recordset);
            res.send(resp);
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.BAD_REQUEST).send(`Could not save customer : ${err}`);
    }
});

// DELETE a customer
// Delete a single customer using parameterized query and global connection pool.
//
//
router.delete("/customer/:id", async (req, res) => {
    try {
        await myPoolConnect;
        let resp;
        var ID = parseInt(req.params.id); // Note: parseInt will accept the first number it finds before hitting a non-digit
        if (isNaN(ID)) {
            resp = helpers.MakeResponse(false, `Customer ID (${req.params.id}) must be an integer.`, "");
        } else {
            //
            // make sure that any items are correctly URL encoded in the connection string
            //
            //let pool = await sql.connect(config);
            const result = await myPool
                .request()
                .input("CustomerID", sql.Int, ID)
                .query("delete from SalesLT.Customer where CustomerID=@CustomerID");

            console.dir(result);

            resp = helpers.MakeResponse(true, `Customer ${ID} deleted.`, "");
        }
        res.send(resp);
    } catch (err) {
        //console.log(err);
        res.status(StatusCodes.BAD_REQUEST).send(`Could not delete customer ${ID}: ${err}`);
    }
});

module.exports = router;
