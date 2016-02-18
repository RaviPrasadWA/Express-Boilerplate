var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var routes = require('./server/routes/index');
var users  = require('./server/routes/users');
var auth  = require('./server/routes/auth');
var admin  = require('./server/routes/admin');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./server/models');
var client = require('redis').createClient(6379, '127.0.0.1', {no_ready_check: true});
var acl = require('acl');

acl = new acl(new acl.redisBackend(client, "acl_"));

var app = express();

/*
models.User.create({  username: "Ravi Prasad",
                      email: "r58641@gmail.com",
                      password: "ravi@123" }).then(function(user){
                        console.log(user);
                      });

*/
// Format roles, resources, permissions
// Implementing a CRUD interface for the admin interface
// Admin permission model
acl.allow('superuser', 'admin', 'create');
acl.allow('superuser', 'admin', 'retrieve');
acl.allow('superuser', 'admin', 'update');
acl.allow('superuser', 'admin', 'delete');

// Staff permisssion model
// Staff can only update the model
acl.allow('staff', 'admin', 'retrieve');
acl.allow('staff', 'admin', 'update');

acl.addUserRoles(1, 'staff');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
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

app.use(express.static(path.join(__dirname, 'server/public')));

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
