const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const handlebars = require('express-handlebars');
const mysql = require('mysql');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bodyParser = require('body-parser');
const createError = require('http-errors');


// Import the routes
const indexRouter = require('./routes/index');
const generatorRouter = require('./routes/generator');
const faqsRouter = require('./routes/faqs');
const aboutRouter = require('./routes/about');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const accountRouter = require('./routes/account');

const hbs = handlebars.create({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',

    // Create custom helpers
    helpers: {
        ifEqual: function (a, b, opts) {
            if (a == b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        }
    }
});

app.set('view engine', 'handlebars');

// Set the handlebars configurations
app.engine('handlebars', hbs.engine);

// New memorystore sessions
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'supersecret'
}))
/* // Use the express sessions package
app.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true
})); */

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

// Create tables if they don't exist yet
let forms = "CREATE TABLE IF NOT EXISTS forms (user_id int NOT NULL, sex text NOT NULL, age int NOT NULL, weight float NOT NULL, height float NOT NULL, experience text NOT NULL, goals text NOT NULL, frequency int NOT NULL, carbs text NOT NULL, PRIMARY KEY (user_id))";
connection.query(forms, (err, results) => {
    if (err) throw err;
    console.log("Table created!");
});

let users = "CREATE TABLE IF NOT EXISTS users (id int NOT NULL AUTO_INCREMENT, username text NOT NULL, password text NOT NULL, PRIMARY KEY (id))";
connection.query(users, (err, results) => {
    if (err) throw err;
    console.log("Second table created!");
});

// Check the query works fine
connection.query("SELECT username, password FROM users", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
});

// Handle disconnects from the server in production
let handleDisconnect = () => {
    con = mysql.createConnection(connection);
     
  
    con.connect(function(err) {
      if(err) { 
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); 
      }                                     
    });                                     
    con.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect();  
      } else {   
        throw err;                                
      }
    });
  }
  
  handleDisconnect();

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