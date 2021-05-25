const Joi = require("@hapi/joi"); 
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const {helpers, folderNode} = require("./helpers");
const dotenv = require("dotenv");
const Path = require("path");
const express = require("express");

const { getFileOrFolder, deleteFileOrFolder, addFile, addFolder } = require("./fileman_data");

// Use this for the async/await and promises versions of 'get'
const fs = require("fs").promises;
// Use this for the standard callback version of 'get' if you uncomment that code.
//const fs = require("fs");

const { filePostValidation, fileDeleteValidation } = require("./validation");
const router = express.Router();

// The root of the directory tree maintained by this controller
//
const root = process.env.filemanroot;

// The "get" method returns a file or a folderNode object.
// FolderNode contains the path, an array of folderNodes, and an array of filenames.
// Note that no recursion is done here. 
//
//
// As an aside, there are three versions of "get" below. Two are commented out. The
// one not commented out uses async/await to handle promises. A second uses standard promises syntax,
// and the finel one uses old-timey callbacks.
//
// Note that if you want to see the callbacks version you
// need to comment out the require("fs").promises; line and replace it with require("fs");
// Both of these lines exist above, so you should only have to exchange the comments.

// GET using async/await to handle promises.
//
// Gets a single file or folderNode, depending on the incoming path on the query string.
// 'root' will be converted to '/'
//
// Ex: http://localhost:3000/api/files?path=root
//
//
router.get("/", async (req, res) => {
  let filename = req.query.path || "";
  if (filename == "root") filename = "";

  let fullpath = Path.join(root, filename);

  try {
    let data = await getFileOrFolder(fullpath);  // ./fileman_data.js
    res.send(data);
  } catch (err) {
    console.log(err);
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
        let data = await deleteFileOrFolder(fullpath, force);
        res.send(data);
    }
    catch (err) 
    {
        res.status(StatusCodes.BAD_REQUEST)
           .send(`Could not delete file or folder: ${err}`);
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
  var resp;

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
  } else {
    //
    // save the file or create a folder
    //
    let path = Path.join(root, req.body.name);
    if (req.body.isfile)
    {
        try {
           resp = await addFile(path, req.body.content);
        } catch (err)
        {
           resp = helpers.MakeResponse(false, `File was not added: ${err}`, "");
        }
    }
    else 
    {
        try {
           resp = await addFolder(path);
         } catch (err)
         {
            resp = helpers.MakeResponse(false, `Folder was not added: ${err}`, "");
         }
 
    }

    res.send(resp);
    
  }
});

module.exports = router;

