const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const { NULL } = require('mysql/lib/protocol/constants/types');

const app = express();
const port = process.env.PORT || 3000

app.set('view engine', 'ejs');
app.use(express.static("public")); //folder for images, css, js
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/',  function (req, res) {

   res.render("homePage");
});

app.post('/logOut',  function (req, res) {

   res.render("homePage");
});

app.get('/logIn',  function (req, res) {
   let message = " "
   res.render("logInPage", {"message":message});
});

app.get('/signUp', function (req, res) {
   let message = " "
   res.render("signUpPage", {"message":message});
});

app.post('/signUpUser',  async function (req, res) {
   let exists = await getUser(req.body);

   if(exists.length > 0) {
      let message = "That username is already taken"
      res.render("signUpPage", {"message":message})
   } else if(req.body.pass.length == 0 || req.body.name.length == 0) {
      let message = "Missing one or more fields"
      res.render("signUpPage", {"message":message})   
   } else {
      let user = await signUpUser(req.body);
      let message = " "
      res.render("logInPage", {"message":message});
   }


});

app.post('/logInUser',  async function (req, res) {
   let user = await getUser(req.body);
   console.log(user)

   if (user.length == 0) {
      let message = "One or more fields is incorrect"
      res.render("logInPage", {"message":message})

   } else if(user[0].groupName == "none") {
      let message = " "
      res.render("noGroupPage", {"user":user, "message":message})

   } else {
      let posts = await getGroupInfo(user[0]);
      editPosts(posts);
      res.render("groupPage", {"user":user, "posts":posts}) 
   }

});

app.post('/sendGroupPage',  async function (req, res) {
   let user = await getUsername(req.body);
   let posts = await getGroupInfo(user[0]);
   editPosts(posts);

   res.render("groupPage", {"user":user, "posts":posts});
   
});

app.post('/jOrC',  async function (req, res) {
   let user = await getUsername(req.body);
   let group = await groupExists(req.body)
   let choice = req.body.jOrC

   if(typeof choice === 'undefined') {
      let message = "You must choose an option"
      res.render("noGroupPage", {"user":user, "message":message})
   }

   if(choice == "create" && group.length > 0) {
      let message = "That group name already exists"
      res.render("noGroupPage", {"user":user, "message":message})

   } else if(choice == "create") {
      let makeGroup = await createGroup(req.body)
      let updateUser = await addGroupToUser(req.body)
      
   } else if(choice == "join" && group.length < 1) {
      let message = "One or more fields was incorrect"
      res.render("noGroupPage", {"user":user, "message":message})
   
   } else if(choice == "join") {
      let updateUser = await addGroupToUser(req.body)

   }

   let posts = await getGroupInfo(user[0]);
   editPosts(posts);

   res.render("groupPage", {"user":user, "posts":posts} )

});

app.post("/createPost", async function(req,res) {
   let user = await getUsername(req.body);
   res.render("createPostPage", {"user":user}) 

});

app.post("/insertPost", async function(req,res) {
   let user = await getUsername(req.body);

   let stamp = new Date()
   stamp = getDateTime(req.body.pDate, req.body.pTime);
   let rows =  await insertPost(user[0], stamp, req.body);

   let posts = await getGroupInfo(user[0]);
   editPosts(posts);
 
   res.render("groupPage", {"user":user, "posts":posts}) 

});

app.listen(port, () => {
  console.log("connected");
});

// ---------------- NON DATA BASE FUNCTIONS ----------------------------------
function getDateTime(date, time) {
   let check = time.slice(-2)
   time = time.slice(0,-2)

   myArray = time.split(":")

   if(check == "pm") {
      let hour = parseInt(myArray[0])
      hour += 12
      time = hour + ":" + myArray[1] 
   } 

   let dateTime =  new Date(date + " " + time);
   return dateTime
}

function editPosts(posts) {

   for(var i = 0; i < posts.length; i++) {
      posts[i]["pDate"] = posts[i].stamp.toDateString()
   }
}

// ----------------DATA BASE FUNCTIONS-------------------------------------------
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

function groupExists(body){ // This gets a user  
   
   let conn = dbConnection();
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;       
           let sql = `Select * FROM households
                      WHERE gName = ? `;
        
           let params = [body.gName];
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getGroupInfo(user){ // This gets a user  
   
    let conn = dbConnection();
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;       
            let sql = `Select * FROM posts
                       WHERE gName = ?
                       ORDER BY stamp`;
         
            let params = [user.groupName];
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

function insertPost(user, DATETIME, body){ // This function sets a user to a group
   
   let conn = dbConnection();
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;       
           let sql = `INSERT INTO posts
                      (gName, pTitle, pDes, user, stamp, pTime)
                      VALUES (?,?,?,?,?,?)`;
        
           let params = [user.groupName, body.pTitle, body.pDes, user.username, DATETIME, body.pTime];
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

    var createPosts = 'CREATE TABLE IF NOT EXISTS posts (id INT NOT NULL AUTO_INCREMENT, gName VARCHAR(50), pTitle VARCHAR(50), pDes VARCHAR(250), user VARCHAR(50), stamp DATETIME, pTime VARCHAR(25),  PRIMARY KEY (id));'
    connection.query(createPosts, function (err, rows, fields) {
      if (err) {
        throw err
      }
  
    })

    connection.end();
}

dbSetup();


