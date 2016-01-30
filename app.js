var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var routes = require('./routes/index');
var users  = require('./routes/users');
var auth  = require('./routes/auth');
var admin  = require('./routes/admin');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var models = require('./models');


var app = express();


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({secret: 'ggihj#$#vhjvjhhjghvg56%^R'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    res.locals.req = req;
    next();
});

passport.use(new LocalStrategy(function(username, password, done) {
	process.nextTick(function() {
		models.User.findOne({ where: { email: username,
										password: password } }).then(function(user){
			return done(null, user);
		});
	});
}));

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);
app.use('/admin',admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

module.exports = app;
