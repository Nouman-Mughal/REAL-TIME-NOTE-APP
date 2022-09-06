import fs from 'fs-extra';
import path from 'path';
import util from 'util';
import {keys} from '../config/keys.mjs'
import { default as express } from 'express';
import { default as passport } from 'passport'; 
import { default as passportLocal } from 'passport-local';
const LocalStrategy = passportLocal.Strategy; 
import passportGoogle from 'passport-google-oauth20';
const GoogleStrategy = passportGoogle.Strategy;
import * as usersModel from '../models/users-superagent.mjs';
import { sessionCookieName } from '../app.mjs';

export const router = express.Router();

import DBG from 'debug';
// import { profile } from 'console';
const debug = DBG('notes:router-users');
const error = DBG('notes:error-users');

export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session()); 
}
router.get('/auth/google', passport.authenticate('google',{
  scope:['profile']})); 

router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/', 
                       failureRedirect: '/users/login' }));

export function ensureAuthenticated(req, res, next) {
    try {
      // req.user is set by Passport in the deserialize function
      if (req.user) next();
      else res.redirect('/users/login');
    } catch (e) { next(e); }
}

router.get('/login', function(req, res, next) {
    try {
      res.render('login', { title: "Login to Notes", user: req.user, });
    } catch (e) { next(e); }
});

router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/', // SUCCESS: Go to home page
      failureRedirect: 'login', // FAIL: Go to /user/login
    })
);

router.get('/logout', function(req, res, next) {
    try {
      req.session.destroy();
      req.logout();
      res.clearCookie(sessionCookieName);
      res.redirect('/');
    } catch (e) { next(e); }
});
passport.use(new LocalStrategy(
  async (username, password, done) => {
      try {
        var check = await usersModel.userPasswordCheck(username,
        password);
        if (check.check) {
          done(null, { id: check.username, username: check.username });
        } else {
          done(null, false, check.message);
        }
      } catch (e) { done(e); }
    }
));

// passport.serializeUser((user, done)=> {
//     try {
//       done(null, user.username);
//     } catch (e) { done(e); }
// });

// passport.deserializeUser((username, done) => {
//     try {
//       let user = usersModel.find(username);
//       done(null, user);
//     } catch(e) { done(e); }
// });
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// const Googlecallback = process.env.GOOGLE_CALLBACK_HOST
//     ? process.env.GOOGLE_CALLBACK_HOST
//     : "http://localhost:3000";
export var googleLogin = false;
let consumer_key;
let consumer_secret;
if (typeof keys.GOOGLE_CONSUMER_KEY !== 'undefined'
  && keys.GOOGLE_CONSUMER_KEY !== ''
  && typeof keys.GOOGLE_CONSUMER_SECRET !== 'undefined'
  && keys.GOOGLE_CONSUMER_SECRET !== '') {
  consumer_key = keys.GOOGLE_CONSUMER_KEY;
  consumer_secret = keys.GOOGLE_CONSUMER_SECRET;
  googleLogin = true;

  } else if (typeof process.env.GOOGLE_CONSUMER_KEY_FILE !=='undefined'
  && process.env.GOOGLE_CONSUMER_KEY_FILE !== ''
  && typeof process.env.GOOGLE_CONSUMER_SECRET_FILE !== 'undefined'
  && process.env.GOOGLE_CONSUMER_SECRET_FILE !== '') {
    consumer_key =fs.readFileSync(process.env.GOOGLE_CONSUMER_KEY_FILE, 'utf8');
    consumer_secret =fs.readFileSync(process.env.GOOGLE_CONSUMER_SECRET_FILE, 'utf8');
    googleLogin = true;
  }

if (googleLogin) {
passport.use(new GoogleStrategy({
consumerKey: consumer_key,
consumerSecret: consumer_secret,
callbackURL: 'http://localhost:3000/users/auth/google/callback'},
async function(token, tokenSecret, profile, done) {
try {
      done(null, await usersModel.findOrCreate({
    id: profile.username, username: profile.username, password:"",
    provider: profile.provider, familyName: profile.displayName,
    givenName: "", middleName: "",
    photos: profile.photos, emails: profile.emails
    }));
}   catch(err) { done(err); }
})  );
}
  
