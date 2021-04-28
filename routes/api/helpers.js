const helpers = {

    MakeResponse(success, msg, data)
    {
        let dict = { success, msg, data };
        return dict;
    }

}

class folderNode {
    path = "";
    folderNodes = []; // array of folderNodes
    files = [];
}

module.exports = [helpers, folderNode];