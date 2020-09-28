const express = require('express');
let router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const upperFirst = (string) => {
    let firstLetter = string.charAt(0);
    firstLetter = firstLetter.toUpperCase();
    let otherBit = string.slice(1, string.length);
    let reassembly = firstLetter.concat(otherBit);
    return reassembly;
}

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

// Account page
router
    .get('/', (req, res) => {
        if (req.session.loggedin) {
            const username = req.session.username;
            let sql = ("SELECT sex, age, weight, height, experience, goals, frequency, carbs FROM forms JOIN users ON forms.user_id = users.id WHERE username = ?");
            connection.query(sql, username, (error, results, fields) => {
                if (error) throw error;
                if (!results || results.length != 1) {
                    const username = req.session.username;
                    res.render('account', {
                    title: 'Account details', layout: 'index', age: 'TODO', username: username, goals: 'TODO', weight: 'TODO', carbs: 'TODO', whichNav: function () {
                        return 'navbarlogged';
                    }
                });
                } else {
                    const age = results[0].age;
                    const weight = results[0].weight;
                    const carbs = results[0].carbs;
                    const goals = results[0].goals;
                    let nicerGoals = upperFirst(goals);
                    let nicerCarbs = upperFirst(carbs);
                    console.log(nicerCarbs);
                    
                    res.render('account', {
                        title: 'Account details', layout: 'index', age: age, username: username, goals: nicerGoals, weight: weight, carbs: nicerCarbs, whichNav: function () {
                            return 'navbarlogged';
                        }
                    });
                }
            });

        } else {
            console.error("User does not have access to this area.");
            return res.render('errormessage', { title: 'Oops!', layout: 'error', error: '401. Bad request.' });
        }
    })

    // Change password page
    .get('/changepassword', (req, res) => {
        res.render('changepassword', {
            title: 'Change Password', layout: 'index', whichNav: () => {
                return 'navbarlogged';
            }
        });
    })

    // Change their password for them
    .post('/changepassword', (req, res) => {
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
    })
    .get('/deleteacc', (req, res) => {
        let username = req.session.username;
        connection.query("DELETE forms, users FROM forms JOIN users ON forms.user_id = users.id WHERE username = ?", username, (error, results, fields) => {
            if (error) throw error;
            console.log(`User ${username} was successfully deleted from users.`);
            req.session.destroy((err) => {
                console.log("The user has logged out!");
                res.render('success', {
                    title: 'Success', layout: 'index', successmsg: 'deleted your account.', whichNav: function () {
                        return 'navbar';
                    }
                });
            });
        });
    });


module.exports = router;