const express = require('express');
let router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

// Connects to an existing mysql server
const connection = mysql.createConnection({
    host: process.env.NODE_ENV === "production" ? process.env.DB_HOSTNAME : 'localhost',
    user: process.env.NODE_ENV === "production" ? process.env.DB_USER : 'root',
    password: process.env.NODE_ENV === "production" ? process.env.DB_PASSWORD : 'password',
    database: process.env.NODE_ENV === "production" ? process.env.DATABASE : 'fitnessapp',
    port: '3306'
});
// Check the connection to the db is working
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected! Nice!");
});

router
    .post('/', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        // Check that they provided a username and password
        if (!username || !password) {
            console.error("User tried to login with bad request");
            return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
        }
        // Pull the password from the user with that username (if there is one)
        connection.query("SELECT password FROM users WHERE username = ?", username, (error, results, fields) => {
            console.log(results); 
            if (error) {
                console.error("Couldn't fetch the user in the database when logging in");
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '500. Internal server error.' });
            }
            // Check to see if the username exists in the database (and thus a password is returned)
            if (!results || results.length != 1) {
                console.error("Something went wrong... Incorrect data given from database when logging in")
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
            }
            // Compare the password given to the password pulled from the database
            console.log(`The password pulled from the database is ${JSON.stringify(results[0].password)}.`)
            if (!bcrypt.compareSync(password, results[0].password)) {
                console.error("The passwords did not match up");
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
            } else {
                req.session.loggedin = true;
                req.session.username = username;
            }
            return res.redirect('/');
        });
    })

    // Render login page
    .get('/', (req, res) => {
        res.render('login', {
            title: 'Log In', layout: 'index', whichNav: function () {
                return 'navbar';
            }
        });
    });

module.exports = router;