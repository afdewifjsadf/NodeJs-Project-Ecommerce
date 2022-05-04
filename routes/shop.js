const express = require('express');
const { isLoggedIn, isAdmin } = require('../middleware');
const router = express.Router();
const Product = require('../models/product');
const {cloudinary, storage} = require('../cloudinary');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer')
const upload = multer({storage})


router.get('/',catchAsync (async (req,res)=>{
    const products = await Product.find({});
    res.render('shop/index',{products});
}));


router.post('/', upload.array('image'),catchAsync( async (req,res)=>{
    const product = new Product(req.body.product);
    console.log("Read somethin ::",req.files)
    product.images = req.files.map(f =>({url:f.path, filename:f.filename}))
    product.author = req.user._id;
    await product.save();
    req.flash('success', 'Successfully make new product!');
    res.redirect(`/shop/${product._id}`);
}))


router.get('/new',isLoggedIn,isAdmin,(req,res)=>{
    res.render('shop/new');
});


router.get('/:id', catchAsync(async (req,res)=>{
    const product =  await Product.findById(req.params.id).populate('author');
    if(!product){
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/shop');
    }
    res.render('shop/show',{product});
}));


router.put('/:id',isLoggedIn ,isAdmin,upload.array('image'),async (req, res)=>{
    const product = await Product.findByIdAndUpdate(req.params.id,{...req.body.product});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    await product.save();

    // delete images in cloudinary!
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', `Successfully updated product: ${product.title}!`);
    res.redirect(`/shop/${product._id}`);
});

// isLoggedIn,isAuthor,catchAsync( campground.deleteCampgrounds)
router.delete('/:id',isLoggedIn,isAdmin,catchAsync( async (req,res)=>{
    const product = await Product.findByIdAndDelete(req.params.id);
    console.log(product);
    req.flash('success', 'Successfully deleted product!');
    res.redirect('/shop');
}));

router.get('/:id/edit',isLoggedIn, isAdmin,async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findById(req.params.id);
    if(!product){
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/shop');
    }
    res.render('shop/edit',{ product });
});




module.exports = router;