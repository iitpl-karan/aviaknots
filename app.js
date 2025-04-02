/*************************************************************************
 * app.js
 * This is the main file of the project
 * This file is responsible for starting the server
 * and connecting to the database
 * It also contains the routes for the project
 * It also contains the session and passport configuration
 * It also contains the flash middleware
 * It also contains the static files configuration
 *************************************************************************/

// Load the environment variables


require('dotenv').config();

// Load the mongoose module
var mongoose = require('mongoose');
const db = require('./config/mongoose');
const MongoStore = require("connect-mongo");

// Load the passport module
const passport = require('passport');
const flash = require("connect-flash");
const flashmiddleware = require('./config/flash');
const livereload = require('connect-livereload');

// Load the express module
const express = require("express");
const app = express();
app.use(express.json());
const http = require('http').Server(app);

// Load the express-session module
const session = require('express-session');

app.use(session({secret:process.env.SESSION_SECREAT,resave: false,saveUninitialized: true,rolling: true, cookie: {maxAge: 24 * 60 * 60 * 1000},
    store: MongoStore.create({
        mongoUrl: process.env.DB_CONNECTION, 
        ttl: 3600,
    }),}));

// Setting the session and passport configuration
app.use(passport.initialize());
app.use(passport.session());
app.use(livereload());

app.use(flash())
app.use(flashmiddleware.setflash);

// Load The Public Directory
const path = require("path");
app.use(express.static(path.join(__dirname, 'public')));

// Setting the Admin routes

const adminRoute = require('./routes/adminRoute');
app.use('/',adminRoute);


app.get('/api/test', (req, res) => res.status(200).json({ message: 'test api' }));

// Setting the API routes

const apiRoute = require("./routes/apiRoute");
app.use('/aviaknots/api', apiRoute);

// Setting the server port
http.listen(process.env.PORT,function(){
    console.log("Server is running on port "+process.env.PORT);
})