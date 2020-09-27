 const express = require('express');
const app = express();
const port = 3000;
const handlebars = require('express-handlebars');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const createError = require('http-errors');
const path = require('path');
const { request, response } = require('express');

app.set('view engine', 'handlebars');

// Set the handlebars configurations
app.engine('handlebars', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + 'views/partials',
}));

// Use the express sessions package
app.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

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

// Check the query works fine
connection.query("SELECT username, passwrd FROM users", function (err, result, fields) {
    if (err) throw err;
    console.log(fields);
});

// Render home page
app.get('/', (req, res) => {
    // Check if they've logged in
    if (req.session.loggedin) {
        res.render('main', { title: 'Train more!', layout: 'index', })
        console.log("They logged in!");
    } else {
        console.log("They haven't logged in!");
        res.render('main', { title: 'Train more!', layout: 'index' })
    }
});

// Render generator page
app.get('/generator', (req, res) => {
    res.render('generator', { title: 'Fitness Plan Generator', layout: 'index' })
});

// Render FAQS page
app.get('/FAQs', (req, res) => {
    res.render('faqs', { title: 'Frequently Asked Questions', layout: 'index' })
});

// Render about page
app.get('/about', (req, res) => {
    res.render('about', { title: 'About', layout: 'index' })
});

/**
 * Your login implementation
 */
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username);
    console.log(password);
    if (username && password) {
        connection.query("SELECT * FROM users WHERE username = ? AND passwrd = ?", [username, password], (error, results, fields) => {
            console.log(`Results is ${results}`)
            console.log(JSON.stringify(results[0], null, 4));
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/');
            } else {
                res.sendStatus(401);
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.sendStatus(401);

    }
});

/**
 * v1
 * You can comment like this
 * Always comment the same way!
 * F.e. look at https://jsdoc.app/about-getting-started.html (JSDoc)
 */
app.post('/login', function (req, res) {
    //here you used var, since ES6 you can use "let" and "const"
    //const cannot be reassigned and increase readability, f.e. I almost exclusively use let or const
    //also keep in mind that you do not need to store req.body properties here, you can also just use them directly since you do not change them, but thats just preference
    //also always think of the values that you receive and what they could be, this is really important for security
    //lets say you iterate over a received object and save every property into your database, one could simply pollute the object with infinite properties and you would have no space left
    //and your database will be full, which results in a DDOS attack. A good rule of thumb is to NEVER trust the client and validate always and everything
    //also its best practice to validate on the client side first(but of course still on the server too!), so you do not do unnecessary requests to the server that could decrease performance
    const username = req.body.username;
    const password = req.body.password;

    //here you do validation, there are neat and scalable middlewares for this that makes it easier for you: https://express-validator.github.io/docs/
    //see v2 function below for this
    //instead of checking if username and password are valid and do something depending on this, 
    //its actually more readable and less nested when you check if it is not okay:
    if (!username || !password) {
        //here I do not return anything else than just 401: Unauthorized
        //We do not want to give insight what is required or missing to login! (Security)
        //Also keep in mind that I use return here to actually abort further code execution, this increases speed and readability
        //I like to explicitly state a return so its visible that code execution in this function stops. (Preference)
        console.error("User tried to login with bad request");
        return res.sendStatus(401);
    }

    //"passwrd" should be "password" no?
    //also keep in mind here that the callback is asynchronously run, so whatever you write after this query function will be executed immediately
    //also you opened a connection to the db, you need to check if you need to close it or what is the correct way of handling the connection
    connection.query("SELECT * FROM users WHERE username = ? AND passwrd = ?", [username, password], (error, results, fields) => {
        //check for the error object if you have it available
        if (error) {
            //be specific with messages, just by the message you need to know where it was logged from
            console.error("could not fetch user in database while logging in");
            return res.sendStatus(401);
        }

        //results is always an array, if you check now for the length and results is undefined you will have an unhandled error
        //therefore check first if results is not undefined, also you might want to check that you only have one user instead of more than 1, 
        //else you cannot determine which one it is and your data is inconsistent, normally you would not allow users to register if the username is already in use
        if (!results || !results.length === 1) {
            console.error("Something went wrong, inconsistent data returned from the database while logging in");
            return res.sendStatus(401);
        }

        req.session.loggedin = true;
        req.session.username = username;

        //keep in mind that mysql has an open connection you might want to close it depending on how u use it
        //connection.end();

        return res.redirect('/');

        //keep JSON.stringify in mind you will need it in the future: JSON.stringify(obj, null, 4);
    });
});

/**
 * v2
 * this is how I do it most of the time
 * I added the express validator module here
 * the try catch gives me full control over whats happening and declaring the function async allows me to use functions that returns resolved promises synchronous
 * but in this case mysql.query has no such capabilities, but once you use such functions you will understand what the advantages are of doing it this way
 * also we need to wrap it in try catch because we use an async function which is not handled by express if an error occurs(it only does that in a normal function (UnhandledPromiseRejectionError))
 */
//here I would add express validator:
//you can also put this in another file f.e.!
const loginValidators = [
    body('username').isString().isLength({ min: 5, max: 100 }),
    body('password').isString().isLength({ min: 5, max: 100 }),
];

/**
 * handles validation with given result from validator middleware
 * @param req
 * @param res
 * @param next
 * @returns {object}
 */
const validate = (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
        return res.sendStatus(401);
        //here we could return the missing/wrong values but we do not do that with a security route
        //return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        return next();
    }
};

app.post('/login', [loginValidators, validate], async (req, res) => {
    try {
        //you see I use return here to show that the next statement will be the last one, theres nothing following after return, I personally like this
        return connection.query("SELECT * FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.password], (err, results) => {
            if (err || !results || !results.length === 1) {
                console.error("Something went wrong, inconsistent data returned from the database while getting user for login");
                return res.sendStatus(401);
            }

            req.session.loggedin = true;
            req.session.username = username;
            return res.redirect('/');
        });
    } catch (err) {
        console.error("500: general error");
        console.error(err);
        return res.sendStatus(500);
    }
});
// Render login page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Log In', layout: 'index' })
});

// Render register page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', layout: 'index' })
});

app.listen(port, () => {
    console.log(`The app is working, and listening at http://localhost:${port}`)
});