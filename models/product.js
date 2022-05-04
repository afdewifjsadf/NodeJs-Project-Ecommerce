const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url:String,
  filename: String,
})

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };


const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  images: [ImageSchema],
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, opts);



module.exports = mongoose.model("Product", productSchema);
