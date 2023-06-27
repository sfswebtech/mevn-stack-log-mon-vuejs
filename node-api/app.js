const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    config = require('./core/db');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const usersRoutes = require('./expressRoutes/usersRoutes');
const logsRoutes = require('./expressRoutes/logsRoutes');
const GLOBALSERVICE = require("./core/global.service.js");


mongoose.Promise = global.Promise;
mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    () => {
        console.log('Database is connected')
        GLOBALSERVICE.autoAnalyzerCronJob(() => {
            console.log('cron started ...')
        })
    },
    err => {
        console.log('Can not connect to the database' + err)
    }
);

const app = express();
app.use(session({
    secret: '',
    // name: cookie_name,
    // store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:8080'],
    credentials: true,

}));
app.use(fileUpload());
app.use('/users', usersRoutes);
app.use('/logs', logsRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/* app.listen(3000, function(){
  console.log('Listening on 3000 Port');
}); */

module.exports = app;