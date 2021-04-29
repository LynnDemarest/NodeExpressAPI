const Joi = require("joi");  // use Pascal for classes. Joi is for validation.
const ErrorCodes = require("../../http/ErrorCodes");
const [helpers, folderNode] = require("./helpers");

const express = require("express");

// use this for the async/await and promises versions of 'get'
const fs = require("fs").promises;
// use this for the standard callback version of 'get'
//const fs = require("fs");

const Path = require("path");
const router = express.Router();

const root = "C:\\Coding\\node\\ExpressAPI\\FileManData";

//console.log("__filename is " + __filename);

// The "get" method returns a file or a folderNode object, 
// which contains the path, a list of folderNodes, and a list of filenames. 
// Note that no recursion is done. 
//
// There are three versions of "get" here, two are commented out. The
// one just below uses async/await, the next one uses promises, and the finel
// one uses callbacks. Note that if you want to see the callbacks version work you 
// need to comment out the require("fs").promises; line and replace uncomment
// require("fs");


// get with async/await 
//
//
//
router.get("/", async (req, res) => {


    let filename = req.query["path"];
    if (filename == "root") filename = "";

    let fullpath = (Path.join(root, filename));
    console.log("fullpath is " + fullpath);

    let stats;
    try {
        stats = await fs.stat(fullpath);
    }
    catch (ex) {
        console.log(ex);
        res.status(ErrorCodes.BAD_REQUEST).send(`Could not find ${fullpath} -- ${ex}`);
        return;
    }

    // Process FILE 
    //
    //
    let msg = "Not a file or a folder.";
    if (stats.isFile()) {
        // get the file 
        // msg = "get file " + fullpath;
        try {
            let data = await fs.readFile(fullpath, 'utf8');
        }
        catch (ex) {
            console.log(ex);
            res.status(ErrorCodes.NOT_FOUND).send(`Could not read ${fullpath}`);
            return;
        }

        let resp = helpers.MakeResponse(true, "File read", data);
        res.send(resp);
        //res.end();
        //return;
    }
    else {
        //
        // Process FOLDER 
        //
        if (stats.isDirectory()) {
            // get the folder 
            msg = "get folder " + fullpath;
            let node = new folderNode();
            node.path = fullpath;
            try {
                let files = fs.readdir(fullpath, { withFileTypes: true })
            }
            catch (ex) {
                console.log(ex);
                res.status(ErrorCodes.NOT_FOUND).send(`Could not get folder data for ${fullpath}`);
                return;
            }

            node.files = files.filter(d => d.isFile()).map(d => d.name);;
            node.folderNodes = files.filter(d => d.isDirectory()).map(d => d.name);
            let resp = helpers.MakeResponse(true, "File list read.", node);
            res.send(resp);
            //res.end();
            //return;
        }
    }



});


// get with promises 
//
//
//
// router.get("/", (req, res) => {

//     let filename = req.query["path"];
//     //if (filename == "") filename = req.query["path"];
//     if (filename == "root") filename = "";

//     let fullpath = (Path.join(root, filename));
//     console.log("fullpath is " + fullpath);

//     // promises 'then' function takes 2 callbacks, one for success, one for failure 
//     fs.stat(fullpath).then((stats) => {
//         let msg = "Not a file or a folder.";
//         if (stats.isFile()) {
//             // get the file 
//             // msg = "get file " + fullpath;
//             fs.readFile(fullpath, 'utf8').then( (data) => {
//                 let resp = helpers.MakeResponse(true, "File read", data);
//                 res.send(resp);
//                 res.end();
//                 return;
//                 }, (err) => {throw err;} 
//             );
//         }
//         else {
//             if (stats.isDirectory()) {
//                 // get the folder 
//                 msg = "get folder " + fullpath;
//                 let node = new folderNode();
//                 node.path = fullpath;
//                 fs.readdir(fullpath, { withFileTypes: true }).then( (files) => {
//                     node.files = files.filter(d => d.isFile()).map(d => d.name);;
//                     node.folderNodes = files.filter(d => d.isDirectory()).map(d => d.name);
//                     let resp = helpers.MakeResponse(true, "File list read.", node);
//                     res.send(resp);
//                     res.end();
//                     return;
//                 }, (err)  => {
//                     if (err) {
//                         throw err;
//                     }
//                 });

//             }
//         }
//     }, (err) => {
//         console.log(err);
//         throw err;
//     });

// });



// Gets the contents of the file and returns it. 
// If a folder path is given, we return the array of filenames in the folder.
//
// router.get("/", (req, res) => {


//     // {
//     //     "root": "",
//     //     "dir": "..",
//     //     "base": "FileManData",
//     //     "ext": "",
//     //     "name": "FileManData"
//     // }
//     //let folderObject = Path.parse(root);

//     let filename = req.query["path"];
//     //if (filename == "") filename = req.query["path"];
//     if (filename == "root") filename = "";

//     let fullpath = (Path.join(root, filename));
//     console.log("fullpath is " + fullpath);

//     fs.stat(fullpath, (err, stats) => {
//         let msg = "Not a file or a folder.";
//         if (err) {
//             console.log(err);
//             msg = err;
//         }
//         else {
//             if (stats.isFile())
//             {
//                 // get the file 
//                 // msg = "get file " + fullpath;
//                 fs.readFile(fullpath, 'utf8',  (err, data) => {
//                     if (err) throw err;
//                     let resp = helpers.MakeResponse(true, "File read", data);
//                     res.send(resp);   
//                     res.end();
//                     return;
//                 });
//             }
//             else
//             {
//                 if (stats.isDirectory()) {
//                     // get the folder 
//                     msg = "get folder " + fullpath;
//                     let node =  new folderNode();
//                     node.path = fullpath;        
//                      fs.readdir(fullpath, { withFileTypes: true },  (err, files) => {
//                         if (err) {
//                             throw err;
//                             return;
//                         }
//                         node.files = files.filter(d => d.isFile()).map(d => d.name);;

//                         node.folderNodes = files.filter(d => d.isDirectory()).map(d => d.name);

//                         let resp = helpers.MakeResponse(true, "File list read.", node);
//                         res.send(resp);
//                         res.end();
//                         return;
//                     });

//                 }
//             }

//         }
//     });

//     //res.send(fullpath);
// })


router.delete("/", (req, res) => {
    let fullpath = Path.join(root, req.query.path);
    fs.stat(fullpath, (err, stats) => {
        console.log(stats);
        if (stats.isFile) {
            fs.unlink(fullpath, (err) => {
                if (err) throw err;

                let resp = helpers.MakeResponse(true, `File ${req.query.path} deleted.`, stats);

                res.send(resp);
            })
        }
        else {
            if (stats.isDirectory) {
                fs.rmdir(fullpath, (err) => {
                    if (err) throw err;

                    let resp = helpers.MakeResponse(true, `Folder ${req.query.path} deleted.`, stats);

                    res.send(resp);
                });
            }
        }
    });
})


// Make folder
//
//
router.post("/", (req, res) => {
    console.log(req.body);

    //let [foldername]

    res.json(req.body);
})

// post : add a new file 
//
//
router.post("/", (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        content: Joi.binary().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
    }
    else {
        // save the file 
        // 
        fs.wr
        res.send(course);
    }
})


// app.get, post, put, delete
//
// router.get("/api/courses/help", (req, res) => {
//     res.send("Usage: ");
// });
//
// router.get('/api/courses', (req, res) => {
// router.get('/', (req, res) => {
//     res.send(courses);
// })

// router.get('/:id', (req, res) => {

//     var ID = parseInt(req.params.id);
//     if (!isNaN(ID)) {
//         var course = courses.find(x => x.id === parseInt(req.params.id));
//         if (course != undefined) {
//             res.send(course);
//         }
//         else {
//             res.status(ErrorCodes.NOT_FOUND).send(`${ID} was not found`);
//             res.end();
//         }
//     }
//     else {
//         res.status(ErrorCodes.BAD_REQUEST).send("Bad Request. ID must be a number. Request /Usage.html for more.");
//         res.end();
//     }
// })

// // new course
// router.post('/', (req, res) => {
//     const schema = Joi.object({
//         name: Joi.string().min(3).required()
//     });
//     const { error } = schema.validate(req.body);
//     if (error) {
//         res.status(ErrorCodes.BAD_REQUEST).send(error.details[0].message);
//     }
//     else {
//         const course = {
//             id: courses.length + 1,
//             name: req.body.name
//         };
//         console.log(course);
//         courses.push(course);
//         res.send(course);
//     }
// })


module.exports = router;