// imports
import express from "express";
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import {check, validationResult} from 'express-validator'; // validation middleware
import { getNetwork, startGame, completeGame, getRanking } from './dao.js';

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

/*** Utility Functions ***/

// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({validationErrors: errors.mapped()});
};

// Only keep the error message in the response
const errorFormatter = ({msg}) => {
    return msg;
};

/*** Users APIs ***/

// POST /api/sessions
// For login: expects {username, password} in the body, and returns {id, username, name} if successful
app.post('/api/sessions', function(req, res, next){
    passport.authenticate('local', (err, user, info) => {
        if(err) return next(err);
        if(!user){
            //display wrong login message
            return res.status(401).json({error: info});
        }
        // success, perform login
        req.login(user, (err) => {
            if(err) return next(err);
            return res.json({id: user.id, username: user.username, name: user.name});
        });
    })(req, res, next);
});

// GET /api/sessions/current
// For checking if the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
        res.status(200).json(req.user); // req.user is set by passport and contains id, username, name
    } else {
        res.status(401).json({error: 'Not authenticated'});
    }
});

// DELETE /api/session/current
// For logout
app.delete('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()){
        req.logout(() => {
            res.status(204).end();
      });
    } else{
        res.status(401).json({error: 'Not authenticated'});
    }
});

/*** Network APIs ***/
// GET /api/network
// Returns the metro network (lines and stations) to be stored in the server memory at startup and used for validating routes and calculating scores.
app.get('/api/network', isLoggedIn, async (req, res) => {
    try {
        const network = await getNetwork();
        if (network.length === 0)
            res.status(404).json({error: 'Network not found'});
        else
            res.json(network);
    } catch (err) {
        res.status(500).end();
    }
});

/*** Game APIs ***/
// POST /api/games
// Starts a new game and assigns random start and destination stations.
app.post('/api/games', isLoggedIn, async (req, res) => {
    try {
        const network = await getNetwork();
        const { id, startStation, destinationStation } = await startGame(req.user.id, network);
        res.json({ id, startStation, destinationStation });
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

// POST /api/games/:gameId/route
// Submits finished route for a game and calculates the score, returning the result of the game (final score, whether the route is valid or not).
app.post('/api/games/:gameId/route', isLoggedIn, async (req, res) => {
    try {
        const { gameId } = req.params;
        const { segments } = req.body; // route is an array of { from, to } objects representing the route segments
        const { valid, steps: scoredSteps, finalScore } = await completeGame(gameId, req.user.id, segments);
        res.json({ valid, steps: scoredSteps, finalScore });
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

// GET /api/ranking
// Returns best score per user across all games, sorted descending
app.get('/api/ranking', isLoggedIn, async (req, res) => {
    try {
        const ranking = await getRanking();
        res.json(ranking);
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});