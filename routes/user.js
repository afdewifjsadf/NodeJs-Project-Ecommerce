const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport =require('passport');

router.get('/register',(req,res)=>{
    res.render('users/register');
});

router.post('/register',catchAsync(async (req,res)=>{
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username ,role:'User'});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Supermarker!');
            res.redirect('/shop');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
})

router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req,res)=>{
    const redirectUrl = req.session.returnTo || '/shop';
    delete req.session.returnTo;
    req.flash('success',"Welcome back!")
    res.redirect(redirectUrl);
})

router.get('/logout', (req,res)=>{
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/shop');
});

module.exports = router;