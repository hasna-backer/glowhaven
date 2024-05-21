const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productShema = new Schema({
    product_name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    category_id: {
        type: ObjectId,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    img1: {
        type: String,
        required: true,
    },
    img2: {
        type: String,
        required: true,
    },
    img3: {
        type: String,
        required: true,
    },
    actual_price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },

    delete: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('Products', productShema)