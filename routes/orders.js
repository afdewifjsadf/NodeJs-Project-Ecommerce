const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { isLoggedIn, isAdmin } = require('../middleware');

router.get('/', isLoggedIn, async (req,res)=>{
    const orders = await Order.find({"user.userId" : req.user._id});
    if(!orders){
      res.redirect('/shop');
    }
    res.render('orders/orders', {orders});  
})


router.post('/',isLoggedIn, (req,res)=>{
  let totalSum = 0;

  req.user.populate("cart.items.productId")
  .execPopulate()
  .then(user => {
    user.cart.items.forEach(p => {
      totalSum += p.quantity * p.productId.price;
    });
    const products = user.cart.items.map(i => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc }
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products: products,
      contact:{
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        address:req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
      }
    });
    return order.save();
  }).then(()=>{
    req.user.clearCart();
  })
  .then(() => {
    res.redirect("/orders");
  })
  .catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
})


router.get('/order-management', isLoggedIn,isAdmin,async (req,res)=>{
    const orders = await Order.find({});
    if(!orders){
      res.redirect('/shop');
    }
    res.render('orders/orders', {orders});
  
  })


router.put('/:id', isLoggedIn, isAdmin, async (req,res)=>{
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(id,{...req.body.order});
    await order.save();

    req.flash('success', `Successfully Updated Order ${order._id}`);
    res.redirect('/orders/order-management');
})

router.put('/:id/user', isLoggedIn, async (req,res)=>{
  const order = await Order.findByIdAndUpdate(req.params.id,{status:'get'});
  await order.save();

  req.flash('success', `Successfully Updated Order ${order._id}!`);
  res.redirect('/orders');
})

router.get('/:id/edit',isLoggedIn,isAdmin, async (req,res)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
      res.redirect('/');
    }
    const status = ['wait','confirm','delivery','get'];
    res.render('orders/edit', {order, status});
})

  
module.exports = router
  