const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3333;
const db = require("./data/db.js");
const helmet = require("helmet");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("./models/User");
const { mySecret } = require("./utils/dbConfig");
const secret = mySecret;

const server = express();

server.use(express.json());
server.use(cors());
server.use(helmet());
passportOptions = { session: false };

const localStrategy = new LocalStrategy(function(username, password, done) {
  User.findOne({ username })
    .then(user => {
      if (!user) {
        done(null, false);
      } else {
        user
          .validatePassword(password)
          .then(isValid => {
            const { _id, username } = user;
            return done(null, { _id, username });
          })
          .catch(err => {
            return done(err);
          });
      }
    })
    .catch(err => done(err));
});

const jwtOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken
};

const jwtStrategy = new JwtStrategy(jwtOptions, function(payload, done) {
  User.findById(payload.sub)
    .then(user => {
      if (user) {
        done(null, { _id, username });
      }
    })
    .catch(err => done(err));
});

passport.use(localStrategy);
passport.use(jwtStrategy);

const notesRouter = require("./controllers/NoteController");
const userRouter = require("./controllers/UserController");

db
  .connect()
  .then(() => console.log("\n... API Connected to Database ...\n"))
  .catch(err => console.log("\n*** ERROR Connecting to Database ***\n", err));

server.get("/", (req, res) => {
  res.json({ message: "all good homie" });
});

const authenticate = passport.authenticate("local", passportOptions);
const protected = passport.authenticate("jwt", passportOptions);

server.use("/api/notes", protected, notesRouter);
server.use("/api/user", userRouter);

server.listen(port, err => {
  if (err) console.log(err);
  console.log(`server running on port ${port}`);
});
