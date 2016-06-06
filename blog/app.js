var express = require('express');
var path = require('path');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var url = require('url');

var routes = require('./routes/index');
var users = require('./routes/users');
var learning = require('./routes/learning');
var collecting =require('./routes/collecting');
var settings = require('./settings');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger('combined',{stream:accessLog}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(flash());
//app.use(express.cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        // db: settings.db
        url: 'mongodb://localhost/'+settings.db,
        //ttl: 14 * 24 * 60 * 60 // = 14 days. Default
        touchAfter: 24 * 3600 // time period in seconds
    })
}));
app.use(multer({
  dist:'./public/images',
  rename:function(fieldname,filename){
    return filename;
  }
}));

app.use('/collecting',collecting);
app.use('/learning',learning);
app.use('/', routes);

//app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
