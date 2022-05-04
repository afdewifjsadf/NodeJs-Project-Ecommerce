const express = require('express'); 
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo')(session)
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
const flash = require('connect-flash');

// Routes
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// mongoDB connect
const dbUrl = `mongodb://admin:password@mongodb`;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const app = express();

// log requirests
app.use(morgan('dev'));
app.use(mongoSanitize());
app.use(flash());

// set view engine
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const secret = process.env.SECRET || 'secretnaja';

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.get('/', (req, res) => {
    res.render('home')
});



app.use('/',userRoutes);
app.use('/shop',shopRoutes);
app.use('/cart',cartRoutes);
app.use('/orders',ordersRoutes);


app.use('*',(req,res, next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err, req, res, next)=>{
    const {statusCode =500 } =err;
    if(!err.message) err.message ='Oh No, Something Went Wrong!';
    res.status(statusCode).render('error',{err})
})


const PORT = 5000;
app.listen(PORT,()=>{
    console.log(`Sever open on port ${PORT}`);
})