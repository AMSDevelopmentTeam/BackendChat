/****************************************************
 *                   Module
 ***************************************************/
const express = require('express');
const path = require('path');

const cors = require('cors');
const mongoose = require('mongoose');
const process = require('process');
const colors = require('colors');
const http = require('http');


// const session = require('express-session');
// const passport = require('passport');

/****************************************************
 *                  middleware
 ****************************************************/
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/****************************************************
 *                  routes
 ****************************************************/
const routes = require('./routes/users/route');

/****************************************************
 *                  additional
 ****************************************************/
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);


/****************************************************
 *                  Connect to DB
 ****************************************************/
const dbConfig = require('./database/db.json');


mongoose.connect(dbConfig.url, { useMongoClient:
    true });

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbConfig.url}`.green);
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose connection error: ${err}`.red);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected'.red);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose disconnected through app termination'.red);
        process.exit(0);
    });
});
/****************************************************
 *                  Socket Connection Handles
 ****************************************************/
require('./services/socket')(io);


// require('./helpers/passport');

// view engine setup
// app.set('views', path.join(__dirname, '../views'));
// app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'ssssdsd'
    , resave: false
    , saveUninitialized: false
    , store: new MongoStore({mongooseConnection: mongoose.connection})
    , cookie: {maxAge: 60 * 60 * 24 * 7}
}));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(express.static(path.join(__dirname, '../public')));

app.use('/', routes);


/**
 * catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/****************************************************
 *                 error handlers
 ****************************************************/

/**
 * development error handler
 * will print stacktrace
 */
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({'error': {
            message: err.message,
            error: err}});
    });
}

/**
 * production error handler
 * no stacktraces leaked to user
 */
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({'error': {
        message: err.message,
        error: {}}});
});


// app.listen(3000, function(){
//     console.log('Express server listening on port 3000');
// });

module.exports = app;

