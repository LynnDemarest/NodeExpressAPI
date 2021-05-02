const sql = require("mssql")
//const { config } = require('./config.js');
const Joi = require("@hapi/joi");  // use Pascal for classes. Joi is for validation.
const ErrorCodes = require("../../http/ErrorCodes");
const [helpers] = require("./helpers");

const express = require("express");
const Path = require("path");
const { DH_NOT_SUITABLE_GENERATOR } = require("constants");
const router = express.Router();

//
// see: https://www.npmjs.com/package/mssql
//
// This code uses AdventureWorksLT2019. I have added a simple stored procedure to use: 
// 
// CREATE PROCEDURE upsertCustomer 
// 	-- Add the parameters for the stored procedure here
// 	@CustomerID int,
// 	@FirstName Name,
// 	@LastName Name
// AS
// BEGIN
// 	-- SET NOCOUNT ON added to prevent extra result sets from
// 	-- interfering with SELECT statements.
// 	SET NOCOUNT ON;

//     -- Insert statements for procedure here
// 	-- insert 
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
const bDEBUG = true;
const iMaxCustomers = 100;
const iMaxMax = 500;

let PORT = parseInt(process.env.mssql_port);
let options_encrypt = "true";
let enableArithAbort = true;
if (process.env.mssql_options_encrypt == "false") options_encrypt = "false";
if (process.env.mssql_enableArithAbort == "false") enableArithAbort = false;
const config = {
    user: process.env.mssql_user,
    password: process.env.mssql_password,
    server: process.env.mssql_server,
    port: PORT,
    database: process.env.mssql_database,
    option: {
        encrypt: options_encrypt,
        enableArithAbort: enableArithAbort
    }
};

const myPool = new sql.ConnectionPool(config);
const myPoolConnect = myPool.connect();

myPool.on('error', (err) => console.log(err));

//
// customer
// Gets all customers using the singelton connection pool myPool. 
//
router.get("/customer", async (req, res) => {
    try {
        await myPoolConnect;

        // limit number of records returned.
        // default is iMaxCustomers. Maximum is iMaxMax.
        let max = req.query.max;
        if (max === undefined) {
            max = iMaxCustomers;
        } else {
            if (max > iMaxMax) max = iMaxMax;
        }

        const result = await myPool.request().query(`select top ${max} * from SalesLT.Customer`);
        console.dir(result);

        let resp = helpers.MakeResponse(true, `${result.recordset.length} customers read.`, result.recordset);

        //
        // recordsets[] has an array of recordsets, in case the query returned more than one. 
        // recordset is just the first one. 
        // rowsAffected is an array of the number of rows returned in each recordset.
        //
        res.send(resp);

    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customers: ${err}`);
    }
});


// customer
// Gets all customers using local pool.
//
// router.get("/customer", async (req, res) => {
//     try {

//         //
//         // make sure that any items are correctly URL encoded in the connection string
//         //
//         let pool = await sql.connect(config);
//         const result = await pool.request().query('select * from SalesLT.Customer');
//         console.dir(result);

//         let resp = helpers.MakeResponse(true, `${result.recordset.length} customers read.`, result.recordset);

//         //
//         // recordsets[] has an array of recordsets, in case the query returned more than one, as in this example. 
//         // recordset is just the first one. 
//         // rowsAffected is an array of the number of rows returned in each recordset.
//         //
//         res.send(resp);

//     } catch (err) {
//         // ... error checks
//         console.log(err);
//         res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customers: ${err}`);
//     }
// });

// customer
// Gets one player using query parameters and global pool. 
//
router.get("/customer/:id", async (req, res) => {
    try {
        await myPoolConnect;

        var ID = parseInt(req.params.id);
        const result = await myPool.request()
            .input('CustomerID', sql.Int, ID)
            .query('select * from SalesLT.Customer where CustomerID=@CustomerID');

        console.dir(result);
        //
        // recordsets[] has an array of recordsets, in case the query returned more than one, as in this example. 
        // recordset is just the first one. 
        // rowsAffected is an array of the number of rows returned in each recordset.
        //
        let resp = helpers.MakeResponse(true, `Customer ${ID} read.`, result.recordset);
        res.send(resp);

    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customer ${ID}: ${err}`);
    }
});


// // customer
// // Gets one player using query parameters and local pool. 
// //
// router.get("/customer/:id", async (req, res) => {
//     try {
//         var ID = parseInt(req.params.id);

//         let pool = await sql.connect(config);   // global connection pool used 
//         const result = await pool.request()
//                                  .input('CustomerID', sql.Int, ID)
//                                  .query('select * from SalesLT.Customer where CustomerID=@CustomerID');

//                                  // Note: pool is not closed here! 

//         console.dir(result);
//         //
//         // recordsets[] has an array of recordsets, in case the query returned more than one, as in this example. 
//         // recordset is just the first one. 
//         // rowsAffected is an array of the number of rows returned in each recordset.
//         //
//         let resp = helpers.MakeResponse(true, `Customer ${ID} read.`, result.recordset);
//         res.send(resp);

//     } catch (err) {
//         // ... error checks
//         console.log(err);
//         res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customer ${ID}: ${err}`);
//     }
// });


// post Customer -- insert or update using global connection pool 
//
//
//
router.post("/customer", async (req, res) => {
    try {
        const schema = Joi.object({
            customerid: Joi.number().integer(),                  // zero for new record 
            firstname: Joi.string().max(50).required(),
            lastname: Joi.string().max(50).required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
        }
        else {

            // example of using a stored procedure with mssql
            //
            // let pool = await sql.connect(config);
            await myPoolConnect;
            let id = req.body.customerid;
            if (id == undefined) id = 0;

            const result = await myPool.request()
                .input('CustomerID', sql.Int, id)
                .input('FirstName', sql.NVarChar(50), req.body.firstname)
                .input('LastName', sql.NVarChar(50), req.body.lastname)
                .execute('upsertCustomer');

            console.dir(result);

            let resp = helpers.MakeResponse(true, `Customer written.`, result.recordset);
            res.send(resp);
        }
    }
    catch (err) {
        console.log(err);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not save customer : ${err}`);
    }

});



// // post Customer -- insert or update 
// //
// //
// //
// router.post("/customer", async (req, res) => {
//     try {
//         const schema = Joi.object({
//             customerid: Joi.number().integer(),                  // zero for new record 
//             firstname: Joi.string().max(50).required(),
//             lastname: Joi.string().max(50).required()
//         });
//         const { error } = schema.validate(req.body);
//         if (error) {
//             res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
//         }
//         else {

//             // example of using a stored procedure with mssql
//             //
//             let pool = await sql.connect(config);
//             const result = await pool.request()
//                 .input('CustomerID', sql.Int, req.body.customerid)
//                 .input('FirstName', sql.NVarChar(50), req.body.firstname)
//                 .input('LastName', sql.NVarChar(50), req.body.lastname)
//                 .execute('upsertCustomer');

//             console.dir(result);

//             let resp = helpers.MakeResponse(true, `Customer written.`, result.recordset);
//             res.send(resp);
//         }
//     }
//     catch (err) {
//         console.log(err);
//         res.status(ErrorCodes.BAD_REQUEST).send(`Could not save customer : ${err}`);
//     }

// });


// delete
// Delete a single customer using parameterized query and global connection pool.
//
//
router.delete("/customer/:id", async (req, res) => {
    try {
        await myPoolConnect;

        var ID = parseInt(req.params.id);
        //
        // make sure that any items are correctly URL encoded in the connection string
        //
        //let pool = await sql.connect(config);
        const result = await myPool.request()
            .input('CustomerID', sql.Int, ID)
            .query('delete from SalesLT.Customer where CustomerID=@CustomerID');

        console.dir(result);

        let resp = helpers.MakeResponse(true, `Customer ${ID} deleted.`, result.rowsAffected);

        res.send(resp);

    } catch (err) {
        // ... error checks
        console.log(err);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customer ${ID}: ${err}`);
    }
});


// // delete
// // Delete a single customer
// //
// //
// router.delete("/customer/:id", async (req, res) => {
//     try {

//         var ID = parseInt(req.params.id);
//         //
//         // make sure that any items are correctly URL encoded in the connection string
//         //
//         let pool = await sql.connect(config);
//         const result = await pool.request()
//             .input('CustomerID', sql.Int, ID)
//             .query('select * from SalesLT.Customer where CustomerID=@CustomerID');

//         console.dir(result);



//         let resp = helpers.MakeResponse(true, `Customer ${ID} deleted.`, result.recordset);

//         res.send(resp);

//     } catch (err) {
//         // ... error checks
//         console.log(err);
//         res.status(ErrorCodes.BAD_REQUEST).send(`Could not get customer ${ID}: ${err}`);
//     }
// });



// sql.on('error', err => {
//     console.log(err); 
// });

// doread();
module.exports = router;
