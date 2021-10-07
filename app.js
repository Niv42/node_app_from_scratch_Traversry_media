const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db');

// Load Config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

// Connect to DB fro the config file
connectDB();

const app = express();

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body == 'object' && '_method' in req.body) {
        // look in urlencided POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}));

// Logging to the console the http stuff
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

// Handelbars helpers
const { formatDate, truncate, stripTags, editIcon, select } = require('./helpers/hbs');


// Handlebars middlewere
app.engine('.hbs', exphbs({ helpers: { formatDate, truncate, stripTags, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');


// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connecton, url: process.env.MONGO_URI })
}))


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set express glocal varialbe  
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next();
});

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));


const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server is running on ${PORT}`));