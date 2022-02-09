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



app.listen(port, () => {
    console.log("connected");
});