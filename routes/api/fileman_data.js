const fs = require("fs").promises;

// filedata.js 
//
// Abstract data layer for fileman.js 
//

const root = process.env.filemanroot;


const getFileOrFolder = async (path) => {

    let stats;
    try {
        stats = await fs.stat(fullpath);
    } catch (ex) {
        //return res.status(StatusCodes.BAD_REQUEST).send(`Could not find ${filename} -- ${ex}`);
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
            //return res.status(StatusCodes.NOT_FOUND).send(`Could not read ${filename}`);
            throw ex;
        }

        let resp = helpers.MakeResponse(true, "File read", data);
        
        //res.send(resp);
        return resp;

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
                //res.status(StatusCodes.NOT_FOUND).send(`Could not get folder data for ${fullpath}`);
                //return;
                throw ex;
            }

            node.files = files.filter((d) => d.isFile()).map((d) => d.name);
            node.folderNodes = files.filter((d) => d.isDirectory()).map((d) => d.name);
            let resp = helpers.MakeResponse(true, "File list read.", node);
            // res.send(resp);
            return resp;
        }
    }

}
