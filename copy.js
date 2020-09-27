const express = require('express');
const app = express();
const port = 3000;
const handlebars = require('express-handlebars');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const createError = require('http-errors');
const path = require('path');
const bcrypt = require('bcryptjs');


// Import the routes
const indexRouter = require('./routes/index');
const generatorRouter = require('./routes/generator');
const faqsRouter = require('./routes/faqs');
const aboutRouter = require('./routes/about');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const accountRouter = require('./routes/account');

app.set('view engine', 'handlebars');

// Set the handlebars configurations
app.engine('handlebars', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {if_eq}
}));

let hbs = handlebars.create({
    // Specify helper
    helpers: {
        if_eq: function (a, b, opts) {
            if (a === b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        }
    }    
})

require('./helpers/handlebars')(hbs);

// Use the express sessions package
app.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

const isEqual = (a, b, opts) => {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
}



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
connection.query("SELECT username, password FROM users", function (err, result, fields) {
    if (err) throw err;
});

app.use('/', indexRouter);
app.use('/generator', generatorRouter);
app.use('/faqs', faqsRouter);
app.use('/about', aboutRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/register', registerRouter);
app.use('/account', accountRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });

app.listen(port, () => {
    console.log(`The app is working, and listening at http://localhost:${port}`)
});

module.exports = app;