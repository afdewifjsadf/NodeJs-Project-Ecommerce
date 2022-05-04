const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  contact:{
    firstName:{
      type:String,
    },
    lastName:{
      type:String,
    },
    address:{
      type:String,
    },
    state:{
      type:String,
    },
    city:{
      type:String,
    },
    zip:{
      type:String,
    }
  },
  status: {
    type: String, 
    enum: ['wait','confirm','delivery','get'],
    default: 'wait'
  },
  trackNumber:{
    type:String,
  }
});

module.exports = mongoose.model("Order", orderSchema);
