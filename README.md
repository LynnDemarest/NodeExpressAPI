*Nodejs API using Express*

This little project creates an node.js API that illustrates several node.js/Express features. 


1. /api/courses

Endpoint to illustrate simple parameter functionality.

2. /api/files

Endpoint to exercise the node.js file system (fs) class. 
Illustrates the use of async/await, promises, and callbacks versions of fs.

3. /api/mssql

Endpoint hits SQL Server using the mssql package hitting a standard AdventureWorksLT2019 database. 

4.  /api/auth

JWT authentication using jwtwebtoken package and mongodb no-sql database. 

Features include: 

* @hapi/joi for form validation. Compares a schema definition with the incoming data. 
* bcryptjs to encode passwords to and from the database.
* dotenv to facilitate the loading of secret .env settings into the process.env collection.
* jsonwebtoken to encode and decode JWT tokens built with secret key.
* mongoose to help with mongodb hosted for free at https://www.mongodb.com/cloud/atlas
* mssql to read MS Sql Server database. CRUD methods. 
* middleware authentication to protect a given endpoint using this syntax: router.get('/', verify, async (req, res) => {


Thank you to Dev Ed, whose video helped me a great deal: https://www.youtube.com/watch?v=2jqok-WgelI&t=1502s

