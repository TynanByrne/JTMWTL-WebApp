const express = require('express');
let router = express.Router();
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


// Render generator page
router
    .get('/', (req, res) => {
        if (req.session.loggedin) {
            res.render('generator', {
                title: 'Fitness Plan Generator', layout: 'index', loggedin: true, whichNav: function () {
                    return 'navbarlogged';
                }
            });
        } else {
            res.render('generator', {
                title: 'Fitness Plan Generator', layout: 'index', loggedin: false, whichNav: function () {
                    return 'navbar';
                }
            });
        }
    })
    .post('/', (req, res) => {
        // Grab the username and the input from the form
        const username = req.session.username;
        const sex = req.body.sex;
        const age = req.body.age;
        const weight = req.body.weight;
        const height = req.body.height;
        const experience = req.body.experience;
        const goals = req.body.goals;
        const frequency = req.body.frequency;
        const carbs = req.body.carbs;

        let sql = "SELECT * FROM forms JOIN users ON forms.user_id = users.id WHERE username = ?";
        connection.query(sql, username, (error, results, fields) => {
            if (error) {
                console.error("Couldn't fetch the data in the database  (IT'S HERE)");
                return res.render('errormessage', {
                    title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                });

            } else {
                // Store the previous query
                let prevQuery = results;
                console.log(prevQuery);
                // Get the user's id from the "users" table
                connection.query("SELECT id FROM users WHERE username = ?", username, (error, results, fields) => {
                    if (error) {
                        console.error("Couldn't fetch the data in the database");
                        return res.render('errormessage', {
                            title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                        });
                    }
                    // Store user id
                    const user_id = results[0].id;
                    console.log(user_id);
                    // If the database doesn't already have results in "forms" for this user
                    if (!prevQuery || prevQuery.length != 1) {
                        // Now, insert the form into the database under their id
                        let sql = "INSERT INTO forms (user_id, sex, age, weight, height, experience, goals, frequency, carbs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        connection.query(sql, [user_id, sex, age, weight, height, experience, goals, frequency, carbs], (error, results, fields) => {
                            if (error) {
                                console.error("Couldn't insert the data into the database");
                                return res.render('errormessage', {
                                    title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                                });
                            }
                            console.log(results);
                            console.log("TABLE SHOULD HAVE SOMETHING");
                            res.render('success', {
                                title: 'Success', layout: 'index', successmsg: 'sent your form! Now you can see your plan on the home page.', whichNav: function () {
                                    return 'navbar';
                                }
                            });
                        })

                    // If the database does already have results in "forms" for this user
                    } else {
                        let sql = "UPDATE forms SET sex = ?, age = ?, weight = ?, height = ?, experience = ?, goals = ?, frequency = ?, carbs = ? WHERE user_id = ?";
                        connection.query(sql, [sex, age, weight, height, experience, goals, frequency, carbs, user_id], (error, results) => {
                            if (error) {
                                console.error("Couldn't update the data in the database");
                                return res.render('errormessage', {
                                    title: 'Oops!', layout: 'error', error: '500. Internal server error.'
                                });
                            }
                            console.log(results);
                            console.log("THEY WENT DOWN HERE");
                            res.render('success', {
                                title: 'Success', layout: 'index', successmsg: 'updated your stats! You should have a new plan generated for you.', whichNav: function () {
                                    return 'navbar';
                                }
                            });
                        });
                    }
                });
            }


        });
    });

module.exports = router;