# Nodejs API using Express

This little test project creates a node.js app that illustrates several node.js/Express features.

1. **/api/courses**

A "Hello World" level endpoint to illustrate a simple _Express_ API.
Also uses the _http-status-codes_ package for error messages and _@hapi/joi_ for schema validation.
To reduce the complexity of this test API, the data is stored in an in-memory array.
Shows how to use a regular expression to filter legal parameters. For example,

`router.get('/:id(\\d+)', (req, res) => {}`

allows only integers.

- GET http://localhost:3000/api/courses gets a list of all courses.
- GET http://localhost:3000/api/courses/1 gets course with id = 1.
- POST http://localhost:3000/api/courses adds a new course.
- DELETE http://localhost:3000/api/courses/1 deletes course with id = 1.

2. **/api/files**

Endpoints to exercise the node.js file system (fs) class.
Illustrates the use of async/await, promises, and callbacks versions of fs.
Implements:

- POST http://localhost:3000/api/files
  The request body takes { isfile:boolean, name:string, content:string}. If isfile is true (the default) a file is created
  with the given content. Otherwise, a folder is made.
- GET http://localhost:3000/api/files?path=aaa\bbb gets the folderNode object for the given path.
- GET http://localhost:3000/api/files?path=aaa\bbb\bbb.txt gets the contents of bbb.txt
- POST http://localhost:3000/api/files creates a folder or a file. Body contains { isfile: boolean, name: string, conrent:string }
- DELETE http://localhost:3000/api/files

3. **/api/mssql**

Endpoint hits SQL Server using the mssql package. Uses a standard AdventureWorksLT2019 database.

4.  /api/auth

JWT authentication using jwtwebtoken package and mongodb no-sql database.

Features include:

- @hapi/joi for form validation. Compares a schema definition with the incoming data.
- bcryptjs to encode passwords to and from the database.
- dotenv to facilitate the loading of secret .env settings into the process.env collection.
- jsonwebtoken to encode and decode JWT tokens built with secret key.
- mongoose to help with mongodb hosted for free at https://www.mongodb.com/cloud/atlas
- mssql to read MS Sql Server database. CRUD methods.
- middleware authentication to protect a given endpoint using this syntax: router.get('/', verify, async (req, res) => {

Thank you to Dev Ed, whose video helped me a great deal: https://www.youtube.com/watch?v=2jqok-WgelI&t=1502s
