const helpers = {

    // Function to create an API response. 
    // 
    // success: true or false, depending on whether the request was resolved.
    // msg: a text message explaining the action.
    // data: the payload response 
    //
    // Note that uncaught errors will be returned to the client 
    // with a message and a standard http error code. 
    //
    MakeResponse(success, msg, data)
    {
        return { success, msg, data };
    }

}


// folderNode
//
// For recursively navigating a directory tree.
// 
class folderNode {
    path = "";         // name of folder 
    folderNodes = [];  // array of folderNodes
    files = [];        // array of file names in the folder 
}

//module.exports = [helpers, folderNode];
module.exports = { helpers, folderNode };
