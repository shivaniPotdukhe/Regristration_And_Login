const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

var mysqlConnection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    multipleStatements: true
});

mysqlConnection.connect((err)=>{
    if(!err){
        console.log('Connected Successfully!');
    }
    else{
        console.log('Connection Failed!');
    }
});

module.exports = mysqlConnection;