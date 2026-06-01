// imports
import express from "express";
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import {check, validationResult} from 'express-validator'; // validation middleware

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());
const port = 3001;

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
import passport from 'passport';                              // authentication middleware
import LocalStrategy from 'passport-local';                   // authentication strategy (username and password)
import { getUserByCredentials, getUserById } from './dao.js';

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method getUserByCredentials() (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await getUserByCredentials(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUserByCredentials(), i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name
    callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + username + name
    getUserById(user.id)
        .then(u => callback(null, u))
        .catch(err => callback(err, null));
});


/** Creating the session */
import session from 'express-session';

app.use(session({
  secret: "This is a very secret information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});