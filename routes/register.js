const express = require('express');
let router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

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


// Render register page
router
    .get('/', (req, res) => {
        res.render('register', {
            title: 'Register', layout: 'index', whichNav: function () {
                return 'navbar';
            }
        });
    })

    // Register a new user
    .post('/', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const confirmation = req.body.confirmation;
        console.log(`Username: ${username}, password: ${password}, confirmation: ${confirmation}.`);
        if (!username || !password || !confirmation) {
            console.error("User tried to log in with bad request. Fields not filled out.");
            return res.render('errormessage', {
                title: 'Oops!', layout: 'error', whichNav: () => {
                    return 'navbar';
                }, error: '401. Bad request.'
            });
        }
        // Make sure passwords are consistent
        if (password != confirmation) {
            console.error("User tried to register with bad request");
            return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
        }
        // Query the db to see if that username is taken
        connection.query("SELECT * FROM users WHERE username = ?", username, (error, results, fields) => {
            if (error) {
                console.error("Couldn't fetch the user in the database when logging in");
                return res.render('errormessage', {
                    title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                });
            }
            // Check to see if the username is already taken
            console.log(JSON.stringify(results[0], null, 4));
            if (results.length != 0) {
                console.error("Username has already been taken.");
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request. (That username was already taken!)' });
            } else {
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(password, salt);
                connection.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (error, results, fields) => {
                    if (error) {
                        console.error("Something went wrong with the database upon insertion.");
                        return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '500. Internal server error.' });
                    }
                    res.render('success', {
                        title: 'Success', layout: 'index', successmsg: 'registered as a new user! You can now log in.', whichNav: function () {
                            return 'navbar';
                        }
                    });
                });
            }
        });
    });

module.exports = router;