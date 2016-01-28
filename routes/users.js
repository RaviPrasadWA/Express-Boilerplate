var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/create', function(req, res) {
  models.User.findOne({ where:{ username: req.body.username , email: req.body.email } }).then(function(obj){
    if( obj ){
      res.status(409);  // Invalid Email redirect user to / home
      res.send("User already exists ...");
    }else{
       if( models.User.validateEmail( req.body.email) ){  // Validate the email of the User
        models.User.create({
          username: req.body.username,
          email: req.body.email
        }).then(function() {
          res.status(200);
          res.send("Succesful...");
        });
      }else{
        res.status(422);  // Invalid Email redirect user to / home
        res.send("Invalid email ...");
      }
    }
  });
});

router.get('/:user_id/destroy', function(req, res) {
  models.User.destroy({
    where: {
      id: req.params.user_id
    }
  }).then(function() {
    res.redirect('/');
  });
});



module.exports = router;
