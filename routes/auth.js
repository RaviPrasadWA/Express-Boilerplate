var express = require('express');
var router  = express.Router();
var passport = require('passport');

router.post('/login', passport.authenticate('local', {
										successRedirect: '/auth/loginSuccess',
										failureRedirect: '/auth/loginFailure'
									})
);

router.get('/loginFailure', function(req, res, next) {
	res.send('Failed to authenticate');
});

router.get('/loginSuccess', function(req, res, next) {
	res.send('Successfully authenticated');
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/admin');
});

module.exports = router;