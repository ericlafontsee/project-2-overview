// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const { v4: uuidv4 } = require("uuid");
module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error

  app.get("/api/users", (req, res) => {
    // A join to include all of each Users's Events
    db.User.findAll({
      include: db.Event
    }).then(dbUser => {
      return res.json(dbUser);
    });
  });

  app.post(
    "/api/login",
    passport.authenticate("local-user", {
      successRedirect: "/members",
      failureRedirect: "/"
    }),
    (req, res) => {
      // Sending back a password, even a hashed password, isn't a good idea
      // console.log(
      //   "this is req.user email and id" +
      //     req.user.dataValues.email +
      //     " " +
      //     req.user.dataValues.id
      // );

      return res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  );

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    console.log(
      "this is req.body name and email: " + req.body.name + " " + req.body.email
    );
    db.User.create({
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        return res.redirect(307, "/api/login");
      })
      .catch(err => {
        return res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      return res.json({});
    }
    // Otherwise send back the user's email and id
    // Sending back a password, even a hashed password, isn't a good idea
    return res.json({
      email: req.user.email,
      id: req.user.id,
      name: req.user.name
    });
  });

  //route to post eventid and userid
  app.post("/api/userevents/:id", (req, res) => {
    db.Event.findOne({
      where: {
        id: req.params.id
      }
    }).then(result => {
      console.log(result);
      result.setUsers(req.user.id);
      return res.send(result);
    });
  });

  //this is user's landing page after login displaying all events saved
  app.get("/api/userevents/:id", (req, res) => {
    // A join to include all of the Organization's Events here
    db.User.findOne({
      where: {
        id: req.user.id
      },
      include: db.Event //automatically gets all Events assoiated with that Organization
    }).then(dbUser => {
      return res.json(dbUser);
    });
  });

  //this is all events by all orgs when user selects browse all
  app.get("/api/events", (req, res) => {
    // A join to include all of each Organization's Events
    db.Event.findAll({
      include: db.Organization
    }).then(dbEvent => {
      return res.json(dbEvent);
    });
  });

  //log user out
  app.get("/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  app.delete("/api/userevents/:id", (req, res) => {
    db.UserEvent.destroy({
      where: {
        EventId: req.params.id
      }
    }).then(dbUserEvent => {
      console.log(dbUserEvent);
      return res.json(dbUserEvent);
    });
  });
};
