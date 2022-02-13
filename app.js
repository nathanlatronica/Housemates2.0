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
        res.render("noGroupPage", {"user":user})
    } else {
        res.render("groupPage", {"user":user}) 
    }

});


app.post('/jOrC',  async function (req, res) {
    let user = await getUsername(req.body);


    let choice = req.body.jOrC
    
    if(choice == "create") {
        let makeGroup = await createGroup(req.body)
        let updateUser = await addGroupToUser(req.body)
    } else if(choice == "join") {
        let updateUser = await addGroupToUser(req.body)
    }


    res.render("noGroupPage", {"user":user} )

});


app.listen(port, () => {
    console.log("connected");
});

// ----------------FUNCTIONS-----------------------------------------------------
//careful about needing passord and what not


function signUpUser(body){ // This signs up a user with no group
   
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

function getUsername(body){ // This gets a user  
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `Select * FROM users
                       WHERE username = ? `;
         
            let params = [body.name];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }
  function getUser(body){ // This gets a user  
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `Select * FROM users
                       WHERE username = ? AND password = ?`;
         
            let params = [body.name, body.pass];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }
  function getGroupInfo(body){ // This gets a user  
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `Select * FROM households
                       WHERE gName = ?`;
         
            let params = [body.name];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }

  function addGroupToUser(body){ // This function sets a user to a group
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `UPDATE users
                       SET groupName =? 
                       WHERE username =?`;
         
            let params = [body.gName, body.name];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
  }

  function createGroup(body){ // This function sets a user to a group
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `INSERT INTO households
                       (gName, gPassword)
                       VALUES (?,?)`;
         
            let params = [body.gName, body.gPass];
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

    var createGroups = 'CREATE TABLE IF NOT EXISTS households (id INT NOT NULL AUTO_INCREMENT, gName VARCHAR(50), gPassword VARCHAR(75), PRIMARY KEY (id));'
    connection.query(createGroups, function (err, rows, fields) {
      if (err) {
        throw err
      }
  
    })

    var createPosts = 'CREATE TABLE IF NOT EXISTS posts (id INT NOT NULL AUTO_INCREMENT, gName VARCHAR(50), pTitle VARCHAR(50), pDes VARCHAR(250), user VARCHAR(50), stamp DATETIME  PRIMARY KEY (id));'
    connection.query(createGroups, function (err, rows, fields) {
      if (err) {
        throw err
      }
  
    })

    connection.end();
}

dbSetup();
