const User = require("../models/User");
const express = require("express"); // remember to install your npm packages
const jwt = require("jsonwebtoken");
const { mySecret } = require("../utils/dbConfig");

const router = express.Router();

function makeToken(user) {
  const timestamp = new Date().getTime();
  const payload = {
    sub: user._id,
    iat: timestamp,
    username: user.username
  };
  const options = {
    expiresIn: "24h"
  };
  return jwt.sign(payload, mySecret, options);
}

const createUser = (req, res) => {
  const { username, password } = req.body;
  // create user takes in the username and password and saves a user.
  // our pre save hook should kick in here saving this user to the DB with an encrypted password.
  const user = new User({ username, password });

  user
    .save()
    .then(user => {
      const token = makeToken(user);
      res.status(201).json({ user, token });
    })
    .catch(err => {
      res.status(500).json({ Error: err });
    });
};
const login = (req, res) => {
  res.status(200).json({ token: makeToken(req.user), user: req.user });
};
// const login = (req, res) => {
//   const { username, password } = req.body;
//   User.findOne({ username }, (err, user) => {
//     if (err) {
//       res.status(403).json({ error: "Invalid Username/Password" });
//       return;
//     }
//     if (user === null) {
//       res.status(422).json({ error: "No user with that username in our DB" });
//       return;
//     }
//     user.checkPassword(password, (nonMatch, hashMatch) => {
//       // This is an example of using our User.method from our model.
//       if (nonMatch !== null) {
//         res.status(422).json({ error: "passwords dont match" });
//         return;
//       }
//       if (hashMatch) {
//         // what will determine our payload.
//         const token = makeToken(user); // creates our JWT with a secret and a payload and a hash.
//         res.json({ user, token }); // sends the token back to the client
//       }
//     });
//   });
// };

router.post("/", createUser);
router.post("/login", login);

module.exports = router;
