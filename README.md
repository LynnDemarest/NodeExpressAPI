# Nodejs Web Pages and APIs using Express and EJS

This little test project creates a node.js app that illustrates several node.js (v14.16.0) features.

See: https://nodejs.org/docs/latest-v14.x/api

1. **/api/courses**

A "Hello World" level endpoint to illustrate a simple _Express_ (^4.17.1) API.

Also uses the _http-status-codes_ (^2.1.4) package for error messages and _@hapi/joi_ (^17.1.1) for data validation.

To reduce the complexity of this test API, the data is stored in an in-memory array.

Shows how to use a regular expression to filter legal parameters. For example,

`router.get('/:id(\\d+)', (req, res) => {}`

allows only integers.

-   GET /api/courses gets a list of all courses.
-   GET /api/courses/1 gets course with id = 1.
-   POST /api/courses adds a new course.
-   DELETE /courses/1 deletes course with id = 1.

2. **/api/files**

Endpoints to exercise the node.js file system (fs) package.

As an aside, illustrates the use of async/await, promises, and callbacks versions of fs.

Implements:

-   POST /api/files
    The request body takes { isfile:boolean, name:string, content:string}. If isfile is true (the default) a file is created
    with the given content. Otherwise, a folder is made.
-   GET /api/files?path=aaa\bbb gets the 'folderNode' object for the given path.
-   GET /api/files?path=aaa\bbb\bbb.txt gets the contents of bbb.txt
-   POST /api/files creates a folder or a file. Body contains { isfile: boolean, name: string, content:string }
    Content is ignored if isfile = false;
-   DELETE /api/files

3. **/api/mssql**

Endpoint hits SQL Server using the mssql package. Uses a standard AdventureWorksLT2019 database.
Illustrates the use of a singleton connection pool.

4.  **/api/auth**

JWT authentication using _jwtwebtoken_ package and _mongodb_ no-sql database with _mongoose_.

-   POST /api/auth/login
    Data is { "email": "name@domain.com", "password": "myPassword" }
-   POST /api/auth/register
    Data is { "name": "MyUserName", "email": "name@domain.com", "password": "MyPassword" }

Features include:

-   _@hapi/joi_ for form validation. Compares a schema definition with the incoming data.
-   _bcryptjs_ to encode passwords to and from the database.
-   _dotenv_ to facilitate the loading of secret .env settings into the process.env collection.
-   _jsonwebtoken_ to encode and decode JWT tokens built with secret key.
-   _mongoose_ to help with _mongodb_, hosted free at https://www.mongodb.com/cloud/atlas
-   _mssql_ to read MS Sql Server database. CRUD methods.
-   middleware authentication to protect a given endpoint, using this syntax: router.get('/', _verify_, async (req, res) => {

5. **/api/posts**

This is a simple controller just used to demonstrate the use of _verifyToken.js_, which uses jsonwebtoken to validate incoming tokens stored in the request header.

The token itself is returned by the _login_ endpoint in auth.js when you pass in a valid email and password.

The signature of the _get_ method in _posts.js_ looks like this:

`router.get('/', verifyJWTToken, async (req, res) => { ...`

_verifyJWTToken_ is included like this:

`const verifyJWTToken = require('./verifyToken'); // only exports a single anonymous function`

-- 30 --

Thank you to Dev Ed for this fine video: https://www.youtube.com/watch?v=2jqok-WgelI&t=1502s
