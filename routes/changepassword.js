const express = require('express');
let router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

// Connects to an existing mysql server
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'fitnessapp',
    port: '3306'
})
// Check the connection to the db is working
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected! Nice!");
});

// Change password page
router
    .get('/', (req, res) => {
        res.render('changepassword', {
            title: 'Change Password', layout: 'index', whichNav: () => {
                return 'navbarlogged';
            }
        });
    })

    // Change their password for them
    .post('/', (req, res) => {
        const oldpass = req.body.oldpass;
        const newpass = req.body.newpass;
        const confirmation = req.body.confirmation;
        const username = req.session.username;
        // Check they gave the correct (old) password
        connection.query("SELECT password FROM users WHERE username = ?", username, (error, results, fields) => {
            if (error) {
                console.error("Couldn't fetch the user in the database when logging in");
                return res.render('errormessage', {
                    title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                });
            }
            // Compare old passwork given to password currently in the database
            if (!bcrypt.compareSync(oldpass, results[0].password)) {
                console.error("The passwords did not match up");
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
            }
            // Check the new password and confirmation match up
            if (newpass != confirmation) {
                console.error("Passwords did not match. Bad request.");
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
            }
            if (!results.length || results.length != 1) {
                console.error("Something went wrong... Incorrect data given from the database. Password not found.")
                return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
            } else {
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(newpass, salt);
                connection.query("UPDATE users SET password = ? WHERE username = ?", [hash, username], (error, results, fields) => {
                    if (error) {
                        console.error("Something went wrong with the database upon insertion.");
                        return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '500. Internal server error.' });
                    }
                    res.render('success', {
                        title: 'Success', layout: 'index', successmsg: 'changed your password!', whichNav: function () {
                            return 'navbar';
                        }
                    });
                });
            }
        });
    });

module.exports = router;