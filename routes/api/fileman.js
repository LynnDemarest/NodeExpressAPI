const Joi = require("@hapi/joi"); // use Pascal for classes. Joi is for validation.
const { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } = require("http-status-codes");
const [helpers, folderNode] = require("./helpers");
const dotenv = require("dotenv");

const express = require("express");

// Use this for the async/await and promises versions of 'get'
const fs = require("fs").promises;
// Use this for the standard callback version of 'get' if you uncomment that code.
//const fs = require("fs");

const Path = require("path");
const { filePostValidation, fileDeleteValidation } = require("./validation");
const router = express.Router();

// The root of the directory tree maintained by this controller
//
const root = process.env.filemanroot;

// The "get" method returns a file or a folderNode object.
// FolderNode contains the path, an array of folderNodes, and an array of filenames.
// Note that no recursion is done.
// TODO: Add recursion.
//
// As an aside, there are three versions of "get". Two are commented out. The
// one not commented out uses async/await to handle promises. A second uses standard promises syntax,
// and the finel one uses callbacks.
// Note that if you want to see the callbacks version work you
// need to comment out the require("fs").promises; line and replace it with require("fs");

// GET using async/await to handle promises.
//
// Gets a single file or folderNode, depending on the incoming path on the query string.
// 'root' will be converted to '/'
//
// Ex: http://localhost:3000/api/files?path=root
//
router.get("/", async (req, res) => {
    let filename = req.query.path || root;
    if (filename == "root") filename = "";

    let fullpath = Path.join(root, filename);
    let stats;
    try {
        stats = await fs.stat(fullpath);
    } catch (ex) {
        return res.status(StatusCodes.BAD_REQUEST).send(`Could not find ${filename} -- ${ex}`);
    }

    let msg;
    if (stats.isFile()) {
        //
        // FILE
        //
        let data;
        try {
            data = await fs.readFile(fullpath, "utf8");
        } catch (ex) {
            return res.status(StatusCodes.NOT_FOUND).send(`Could not read ${filename}`);
        }

        let resp = helpers.MakeResponse(true, "File read", data);
        res.send(resp);
    } else {
        //
        // FOLDER
        //
        if (stats.isDirectory()) {
            // get the folder
            msg = "get folder " + fullpath;
            let node = new folderNode();
            node.path = fullpath;
            let files;
            try {
                files = await fs.readdir(fullpath, { withFileTypes: true });
            } catch (ex) {
                console.log(ex);
                res.status(StatusCodes.NOT_FOUND).send(`Could not get folder data for ${fullpath}`);
                return;
            }

            node.files = files.filter((d) => d.isFile()).map((d) => d.name);
            node.folderNodes = files.filter((d) => d.isDirectory()).map((d) => d.name);
            let resp = helpers.MakeResponse(true, "File list read.", node);
            res.send(resp);
        }
    }
});

// DELETE a folder or path
//
// Given query path, deletes the file or folder.
//
router.delete("/", async (req, res) => {
    let err = fileDeleteValidation(req.body);
    if (err) {
        return res.status(StatusCodes.BAD_REQUEST).send(err);
    } else {
        let fullpath = Path.join(root, req.body.path);
        let force = req.body.force || false;

        try {
            var stats = await fs.stat(fullpath);
            if (stats.isFile()) {
                err = await fs.unlink(fullpath);
                if (err) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);

                let resp = helpers.MakeResponse(true, `File ${req.query.path} deleted.`, stats);
                res.send(resp);
            } else {
                if (stats.isDirectory()) {
                    if (!force) {
                        err = await fs.rmdir(fullpath); // could throw error if non-empty folder
                    } else {
                        err = await fs.rm(fullpath, {
                            recursive: true,
                            force: true,
                        });
                    }
                    if (err) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);

                    let resp = helpers.MakeResponse(true, `Folder ${req.body.path} deleted.`, stats);
                    res.send(resp);
                }
            }
        } catch (err) {
            res.status(StatusCodes.BAD_REQUEST).send(`Could not delete file or folder: ${err}`);
        }
    }
});

// ADD a new FILE OR FOLDER
//
// The incoming body data is name, content, and isfile.
// Validated by Joi.
// Also, the file will not be overwritten if it exists.
// TODO: Add an option to overwrite or append or neither.
//
router.post("/", async (req, res) => {
    let error = filePostValidation(req.body);
    if (error) {
        res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
    } else {
        //
        // save the file or create a folder
        //
        let path = Path.join(root, req.body.name);

        let resp;
        if (req.body.isfile) {
            // create file
            //
            // wx = return an error if the file exists
            try {
                await fs.writeFile(path, req.body.content, { flag: "wx" });
                resp = helpers.MakeResponse(true, `File added: ${req.body.name}`, "");
            } catch (err) {
                resp = helpers.MakeResponse(false, `File was not added: ${err}`, "");
            }
        } else {
            // create folder
            try {
                await fs.mkdir(path, { flags: "wx" });
                resp = helpers.MakeResponse(true, `Folder added: ${req.body.name}`, "");
            } catch (err) {
                resp = helpers.MakeResponse(false, `Folder was not added: ${err}`, "");
            }
        }
        res.send(resp);
    }
});

module.exports = router;

// get with standard PROMISES
//
//
//
// router.get("/", (req, res) => {
//     let filename = req.query.path;
//     if (filename.trim() == "root") filename = "";

//     let fullpath = Path.join(root, filename);
//     console.log("fullpath is " + fullpath);

//     // promises 'then' function takes 2 callbacks, one for success, one for failure
//     //
//     fs.stat(fullpath).then(
//         (stats) => {
//             let msg;
//             if (stats.isFile()) {
//                 //
//                 // get the file contents
//                 //
//                 let resp;
//                 fs.readFile(fullpath, "utf8").then(
//                     (data) => {
//                         resp = helpers.MakeResponse(true, "File read", data);
//                         return res.send(resp);
//                     },
//                     (err) => {
//                         resp = helpers.MakeResponse(false, `File was not read: ${err}`, "");
//                         return resp.send(resp);
//                     }
//                 );
//             } else {
//                 if (stats.isDirectory()) {
//                     //
//                     // get the folder
//                     //
//                     msg = "get folder " + fullpath;
//                     let node = new folderNode();
//                     node.path = fullpath;
//                     fs.readdir(fullpath, { withFileTypes: true }).then(
//                         (files) => {
//                             node.files = files.filter((d) => d.isFile()).map((d) => d.name);
//                             node.folderNodes = files.filter((d) => d.isDirectory()).map((d) => d.name);
//                             let resp = helpers.MakeResponse(true, "File list read.", node);
//                             return res.send(resp);
//                         },
//                         (err) => {
//                             if (err) {
//                                 let resp = helpers.MakeResponse(false, `${filename} was not read: ${err}`, "");
//                                 return res.send(resp);
//                             }
//                         }
//                     );
//                 }
//             }
//         },
//         (err) => {
//             console.log(err);
//             let resp = helpers.MakeResponse(false, `${filename} was not read: ${err}`, "");
//             return res.send(resp);
//         }
//     );
// });

// get with callbacks
// Gets the contents of the file and returns it.
// If a folder path is given, we return the array of filenames in the folder.
//
// router.get("/", (req, res) => {
//     let filename = req.query.path.trim();
//     if (filename == "root") filename = "";

//     let fullpath = Path.join(root, filename);
//     console.log("fullpath is " + fullpath);

//     fs.stat(fullpath, (err, stats) => {
//         let msg;
//         if (err) {
//             // problem getting stat object
//             console.log(err);
//             let resp = helpers.MakeResponse("false", `Get failed for ${filename} : ${err}`);
//             return res.send(resp);
//         } else {
//             if (stats.isFile()) {
//                 fs.readFile(fullpath, "utf8", (err, data) => {
//                     let resp;
//                     if (err) {
//                         resp = helpers.MakeResponse("false", `Get failed for ${filename} : ${err}`);
//                     } else {
//                         resp = helpers.MakeResponse(true, "File read", data);
//                     }
//                     return res.send(resp);
//                 });
//             } else {
//                 if (stats.isDirectory()) {
//                     let node = new folderNode();
//                     node.path = fullpath;
//                     fs.readdir(fullpath, { withFileTypes: true }, (err, files) => {
//                         if (err) {
//                             return res.send(helpers.MakeResponse("false", `Get failed for ${filename} : ${err}`));
//                         } else {
//                             node.files = files.filter((d) => d.isFile()).map((d) => d.name);
//                             node.folderNodes = files.filter((d) => d.isDirectory()).map((d) => d.name);
//                             let resp = helpers.MakeResponse(true, "File list read.", node);
//                             return res.send(resp);
//                         }
//                     });
//                 }
//             }
//         }
//     });
// });
