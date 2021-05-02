*Nodejs API using Express*

This little project creates an node.js API that illustrates several node.js/Express features. 


1. app.use("/api/courses", require("./routes/api/courses.js"));

Endpoint to illustrate parameters. 

2. app.use("/api/files", require("./routes/api/fileman.js"));

Endpoint to exercise the node.js fs class. Illustrates the use of async/await, promises, and callbacks versions of fs.

3. app.use("/api/mssql", require("./routes/api/mssql.js"));

Endpoint hits SQL Server using mssql. 

4. 

Features include: 

* @hapi/joi for form validation
* bcryptjs to encode passwords
* dotenv to facilitate secret .env settings
* jsonwebtoken to encode and decode JWT tokens
* mongoose to help with mongodb
* mssql to read MS Sql Server database 
* middleware authentication to protect a given endpoint 







Thank you to Dev Ed, whose video helped me a great deal: https://www.youtube.com/watch?v=2jqok-WgelI&t=1502s

