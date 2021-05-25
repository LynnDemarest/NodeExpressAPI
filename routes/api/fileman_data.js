const fs = require("fs").promises;
const dotenv = require("dotenv");
const { helpers, folderNode } = require("./helpers");
const Path = require("path");

// filedata.js
//
// Uses CommonJS module syntax, i.e., require() at the top and module.exports at the bottom.
// Abstract data layer for fileman.js
//
const root = process.env.filemanroot;

// Returns either a file or a folder node object
//
//
const getFileOrFolder = async (fullpath) => {
  let stats;
  try {
    stats = await fs.stat(fullpath);
  } catch (ex) {
    throw ex;
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
      throw ex;
    }

    let resp = helpers.MakeResponse(true, "File read", data);

    return resp;
  } else {
    //
    // FOLDER
    //
    if (stats.isDirectory()) {
      msg = "get folder " + fullpath;
      let node = new folderNode();
      node.path = fullpath;
      let files;
      try {
        files = await fs.readdir(fullpath, { withFileTypes: true });
      } catch (ex) {
        console.log(ex);
        throw ex;
      }

      node.files = files.filter((d) => d.isFile()).map((d) => d.name);
      node.folderNodes = files
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      let resp = helpers.MakeResponse(true, "File list read.", node);
      return resp;
    }
  }
};

const deleteFileOrFolder = async (fullpath, force) => {
  try {
    var stats = await fs.stat(fullpath);
    if (stats.isFile()) {
      err = await fs.unlink(fullpath);

      if (err)
        throw err;

      var filename = Path.basename(fullpath);

      let resp = helpers.MakeResponse(true, `File ${filename} deleted.`, stats);
      return resp;
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
        if (err) {
          throw err;
        }

        var foldername = Path.basename(fullpath);
        let resp = helpers.MakeResponse(
          true,
          `Folder ${foldername} deleted.`,
          stats
        );
        return resp;
      }
    }
  } catch (err) {
    throw err;
  }
};

const addFile = async (path, content) => {
  try {
    var name = Path.basename(path);
    await fs.writeFile(path, content, { flag: "wx" });
    resp = helpers.MakeResponse(true, `File added: ${name}`, "");
  } catch (err) {
    resp = helpers.MakeResponse(false, `File was not added: ${err}`, "");
  }

  return resp;
};

const addFolder = async (path) => {
  try {
    var name = Path.basename(path);
    await fs.mkdir(path, { flags: "wx" });
    resp = helpers.MakeResponse(true, `Folder added: ${name}`, "");
  } catch (err) {
    resp = helpers.MakeResponse(false, `Folder was not added: ${err}`, "");
  }
  return resp;
};


module.exports = { getFileOrFolder, deleteFileOrFolder, addFile, addFolder };





//
// Example code: standard promises and callbacks. 
// 
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

// get with CALLBACKS
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

