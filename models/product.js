const mongoose = require('mongoose')
const {Schema} = mongoose

const productSchema = new Schema({

    owner: {
     type: mongoose.Schema.Types.ObjectId,
     ref:'SellerUser'

    },
    photoPath:{
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    decs: {
        type: String,
        required: true
    }
    
 }, { timestamps: true });
 
 
 
 module.exports = mongoose.model('Product',productSchema,'products')