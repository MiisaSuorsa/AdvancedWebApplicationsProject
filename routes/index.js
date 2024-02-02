var express = require('express');
//const session = require('express-session')
const mongoose = require("mongoose");
const Users = require('../models/Users');
const Matches = require('../models/Matches');
const Chats = require('../models/Chats');
const bcrypt = require("bcryptjs");
const {body, validationResult} = require("express-validator");
const jwt = require('jsonwebtoken');
const validateToken = require('../authentication/validateToken.js');


var router = express.Router();



router.get('/', function(req, res, next) {
    res.render('home');
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

//register route, middleware to check required lengths of req.body
router.post('/register',
    body("email").isLength({min: 10}).trim().escape(),
    body("username").isLength({min: 3}).trim().escape(),
    body("name").isLength({min: 3}).trim().escape(),
    body("password").isLength({min: 8}),
    (req, res, next) => {

        //validationResult to check errors from request
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        //try to find request email from user database
        Users.findOne({ email: req.body.email }, (err, user) => {
            if (err) return next(err);

            if(user){
                return res.status(403).send("Email already in use.");
            } else {
                //use bcrypt to hash the password before saving it to database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if(err) throw err;
                        //create new user to the users database
                        Users.create({
                            email: req.body.email,
                            name: req.body.name,
                            username: req.body.username,
                            password: hash,
                            about: req.body.about
                        }, (err, ok) => {
                            if(err) return next(err);
                            return res.send("ok");
                        })

                    })
                })
            }
        })
    }
);


router.get('/login', function(req, res, next) {
    console.log("login page")
    res.render('login');
});



//login route
router.post('/login', function(req, res, next) {
    //find user with login username from the users database
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (err) return next(err);
        console.log(user);
        console.log(req.body.username);

        if (!user){
            return res.status(401).json({message: "Register before login."});
        } else {
            //use bcrypt to compare the request password (plain text) and stored password (hashed)
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                //passwords do match
                console.log(user)
                //use json Web Token to create token for authentication
                const jwtPayload = {
                    id: user._id,
                    username: user.username
                }
                jwt.sign(
                    jwtPayload,
                    process.env.SECRET,
                    {
                        expiresIn: '1d'
                    },
                    (err, token) => {
                        res.json({success: true, token: token});
                    }
                )
              } else {
                res.status(401).json({ message: "Invalid password."});
              }
            })
        }
    })
});


//secret route, which is only available for logged in user --> validateToken middleware to check authentication
router.get('/secret', validateToken, function(req, res, next) {
    console.log(req.user);
    res.json({username: req.user.username})
});

router.get('/user', function(req, res, next) {
  res.render('user')
})

router.get('/profile', function(req, res, next) {
    res.render('profile')
})

//profile route to see own profile information
//middleware to check authenticated user
router.get('/secret/profile', validateToken, function(req, res, next) {
    console.log(req.user);

    //find profile information from users database for authenticated user
    Users.findOne({ username: req.user.username }, (err, user) => {
        if(err) return next(err);
        res.json(user);
    })

})

//profile routo to update authenticated user's profile information
router.post('/secret/profile',
    validateToken,
    body("email").isLength({min: 10}).trim().escape(),
    body("name").isLength({min: 3}).trim().escape(),
    body("password").isLength({min: 8}),
    function(req, res, next) {

        console.log("Updating profile information for " + req.user.username);

        //validationResult to check errors from request
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        //use bcrypt to hash the password before saving it to database
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if(err) return next(err);
                //update
                //update user db
                Users.updateOne({ username: req.user.username }, { $set: { email: req.body.email, name: req.body.name, password: hash, about: req.body.about }}, (err, result) =>{
                    if(err) return next(err);
                    console.log("user data updated");
                    res.json({ msg: "ok"});
                })
            })
        })

})

router.get('/game', function(req, res, next) {
    res.render('game')
})

//secret game route to get all users from database to the game
router.get('/secret/game', validateToken, function(req, res, next) {
    console.log(req.user);

    let likedList = [];
    //get list of already liked users
    Matches.findOne({ user: req.user.username }, (err, user) => {
        if (err) return next(err);

        if(user){
            console.log("user has match db")
            likedList = user.like
            console.log(likedList)
        }
    })

    //find all users
    Users.find({}, (err, users) =>{
        if(err) return next(err);

        if(users){

            //create object list for storing users for the response
            const obj_list = [];
            // iterate through users and store the user in the object list if the user isn't the authenticated user
            for(let i=0; i<users.length; i++){
                console.log(i + ": " + users[i].username);
                console.log(!likedList.includes(users[i].username))

                //add user to list, if it's not same as logged in user and user haven't liked it before
                if(users[i].username != req.user.username && !likedList.includes(users[i].username)){

                    let obj = {};
                    obj.name = users[i].name;
                    obj.username = users[i].username;
                    obj.about = users[i].about;
                    obj_list.push(JSON.stringify(obj));
                } else continue;
            }

            console.log(obj_list);
            res.json({users: obj_list});
        } else{
            res.json({error: "No users"});
        }

    })
})

//matchData route to save in the match database about who liked whom
router.post('/matchData', validateToken, function(req, res, next) {

    console.log("saving match data by " + req.user.username + ", who liked " + req.body.username);

    //check if the liked user have already liked the authenticated user back
    Matches.findOne({ user: req.body.username, like: req.user.username }, (err, user) => {
        if (err) return next(err);

        if(user){
            //if there is user with that information, update match for req.body.user
            console.log("It's a match!!");
            console.log("Users matches now: " + user.match);
            console.log("Current array: " + user.like);
            //use updateOne to update requested user's database by adding new match there
            Matches.updateOne({ user: req.body.username }, { $addToSet: { match: req.user.username}}, (err, result) => {
                if (err) return next(err);
                console.log("Updated liked user's match data");
            })

            //after the liked user database is updated, check if the authenticated user is in the Matches database
            Matches.findOne({ user: req.user.username }, (err, user) => {
                if (err) return next(err);

                if(user){
                    //if user's matches data is created, update it with the new like and match by adding the username
                    console.log("Current likes: " + user.like);
                    console.log("Current matches: " + user.match);
                    Matches.updateOne({ user: req.user.username }, { $addToSet: { like: req.body.username, match: req.body.username}}, (err, result) => {
                        if (err) return next(err);
                        console.log("Updated user");
                        res.send("ok");
                    })
                } else{
                    //create new matches data for the authenticated user
                    Matches.create({
                        user: req.user.username,
                        like: [req.body.username],
                        match: [req.body.username]
                    }, (err, ok) => {
                        if(err) return next(err);
                        console.log("Matches db created");
                        return res.send("ok");
                    })
                }
            })
        } else{
            //the liked user haven't liked the authenticated user
            console.log("No match, but let's create the loggedin user db");
            //check if the authenticated user has Matches data
            Matches.findOne({ user: req.user.username }, (err, user) => {
                if (err) return next(err);

                if(user){
                    //update user's matches database by adding new like
                    console.log("Current array: " + user.like);
                    Matches.updateOne({ user: req.user.username }, { $addToSet: { like: req.body.username}}, (err, result) => {
                        if (err) return next(err);
                        console.log("Updated user");
                        res.send("ok");
                    })
                } else{
                    //create new matches database for the user
                    Matches.create({
                        user: req.user.username,
                        like: [req.body.username],
                        match: []
                    }, (err, ok) => {
                        if(err) return next(err);
                        console.log("Matches db created");
                        return res.send("ok");
                    })
                }
            })
        }
    })
})

router.get('/matches', function(req, res, next) {
    res.render('matches');
});

//matches page for authenticated user to see all the matches (both users have liked each other)
router.get('/secret/matches', validateToken, function(req, res, next) {
    console.log("matches page for user " + req.user.username);

    Matches.findOne({ user: req.user.username }, (err, user) => {
        if (err) return next(err);
        if (user){
            console.log(user.match)
            res.send(user.match);
        } else{
            res.send("No matches");
        }
    })
});

//matches post route to send or create chat data
router.post('/secret/matches', validateToken, function(req, res, next) {
    console.log(req.user.username + " wants to chat with " + req.body.username);

    //find the chat data for two users
    Chats.findOne({users: { $all: [req.user.username, req.body.username]}}, (err, chat) => {
        if (err) return next(err);
        if (chat){
            //send previous messages if they already have chat data
            console.log("chat db on jo olemassa");
            console.log(chat.messages);
            res.json({msg_data: chat.messages});
        } else {
            //create the database if they don't have chat data
            Chats.create({
                users: [req.user.username, req.body.username],
                messages: []
            }, (err, ok) => {
                if(err) return next(err);
                console.log("chat db luotu");
                return res.json({msg: "ok"});
            })
        }
    })
});

//chat route to add sent messages to database
router.post('/secret/chat', validateToken, function(req, res, next) {
    console.log(req.body.input);
    console.log("message send by " + req.user.username);

    //get current time when sending the message
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let currentTime = hours + ":" + minutes

    //create object with the message and username who sent it
    let obj = {};
    obj.user = req.user.username;
    obj.msg = req.body.input;
    obj.time = currentTime;

    //update chats database by adding the object to messages
    Chats.updateOne({ users: { $all: [req.user.username, req.body.match]} }, { $addToSet: { messages: obj}}, (err, result) => {
        if (err) return next(err);
        res.json({user: req.user.username, time: currentTime});
    })
});

module.exports = router;
