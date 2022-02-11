const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const port = process.env.PORT || 3000
const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public")); //folder for images, css, js
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/',  function (req, res) {

    res.render("homePage");
});
app.get('/logIn',  function (req, res) {

    res.render("logInPage");
});

app.get('/signUp', function (req, res) {

    res.render("signUpPage");
});

app.post('/signUpUser',  async function (req, res) {
    console.log(req.body)
    let user = await signUpUser(req.body);

    res.render("logInPage");
});

app.post('/logInUser',  async function (req, res) {
    let user = await getUser(req.body);

    if(user[0].groupName == "none") {
        res.render("noGroupPage")
    } else {
        res.render("logInPage") //change later
    }

});


app.listen(port, () => {
    console.log("connected");
});

// ----------------FUNCTIONS-----------------------------------------------------

function signUpUser(body){ // This function submits the user info to the DB like name, email, linkedIn....etc
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `INSERT INTO users
                         (username, password, groupName)
                          VALUES (?,?,?)`;
         
            let params = [body.name, body.pass, "none"];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }

function getUser(body){ // This function submits the user info to the DB like name, email, linkedIn....etc
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `Select * FROM users
                       WHERE username = ? AND password = ?`;
         
            let params = [body.name, body.pass, "none"];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }



function dbConnection(){
    let connection = mysql.createConnection({
      host: 'database-3.clpc6rpfxc90.us-west-1.rds.amazonaws.com',
      port: '3306',
      user: 'admin',
      password: 'jtA3T25gH6)k',
      database: 'my_db'
    })
  
    return connection
}

function dbSetup() {
    let connection = dbConnection();
  
    connection.connect();
  
    var createUsers = 'CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT, username VARCHAR(50), password VARCHAR(50), groupName VARCHAR(75), PRIMARY KEY (id));'
    connection.query(createUsers, function (err, rows, fields) {
      if (err) {
        throw err
      }
  
    })
}

dbSetup();
