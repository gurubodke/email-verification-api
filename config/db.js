const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "email_verification"
});

db.connect(err => {
  if (err) throw err;
  console.log("Database connected");
});

module.exports = db;