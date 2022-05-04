const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { isLoggedIn, isAdmin } = require('../middleware');



router.get('/', isLoggedIn,(req,res)=>{
  req.user
  .populate("cart.items.productId")
  .execPopulate()
  .then(user => {
    const products = user.cart.items;
    let total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    });
    const totalVac = total*1.07;
    res.render("cart/index", {products: products,totalSum: total, totalVac: totalVac});
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

})


router.post('/',isLoggedIn , async (req, res) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1;
    console.log('Hello world!', quantity)
    Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product, quantity);
    })
    .then(async result => {
      const product = await Product.findById(productId);
      req.flash('success', `Successfully add ${product.title} in your cart!`);
      return res.redirect('/shop');
    });
})


router.post('/set', isLoggedIn,async (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId)
  .then(product => {
    return req.user.setCart(product, req.body.quantity);
  })
  .then(async result => {
    const product = await Product.findById(productId);
    req.flash('success', `Successfully add ${product.title} in your cart!`);
    return res.redirect('/shop');
  });
})


router.post('/delete-item' ,async (req,res)=>{
   const productId = req.body.productId;
   req.user
   .removeFromCart(productId)
   .then(async result =>  {
    const product = await Product.findById(productId);
    req.flash('success', `Successfully deleted ${product.title} in your cart!`);
    res.redirect("/cart");
   })
   .catch(err => {
     const error = new Error(err);
     error.httpStatusCode = 500;
     return next(error);
   });
})





module.exports = router;



