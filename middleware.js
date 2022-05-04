const Product = require('./models/product');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must login!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = (req,res,next)=>{
    if(req.user.role !== 'Admin'){
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/shop`);
    }
    console.log('hello world', req.user.role)
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/shop/${id}`);
    }
    next();
}

