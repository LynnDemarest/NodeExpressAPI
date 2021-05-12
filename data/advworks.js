const sql = require("mssql");

async function getCustomers(cols, maxToGet) {
    let max = maxToGet;
    const bDEBUG = true;
    const iMaxCustomers = 100;
    const iMaxMax = 500;

    let PORT = parseInt(process.env.mssql_port);
    let options_encrypt = true;
    let enableArithAbort = true;
    if (process.env.mssql_options_encrypt == "false") options_encrypt = false;
    if (process.env.mssql_enableArithAbort == "false") enableArithAbort = false;
    const config = {
        user: process.env.mssql_user,
        password: process.env.mssql_password,
        server: process.env.mssql_server,
        port: PORT,
        database: process.env.mssql_database,
        options: {
            encrypt: options_encrypt,
            enableArithAbort: enableArithAbort,
        },
    };

    const myPool = new sql.ConnectionPool(config);
    const myPoolConnect = myPool.connect();

    myPool.on("error", (err) => console.log(err));

    await myPoolConnect;
    //let cols = "Title, FirstName + ' ' + MiddleName + ' ' + LastName as Name, EmailAddress, Phone";
    const result = await myPool.request().query(`select top ${max} ${cols} from SalesLT.Customer`);
    return result;
}

module.exports = { getCustomers };
