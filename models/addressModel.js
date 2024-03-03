const mongoose = require('mongoose');
const User=require('../models/userModel')
const ObjectId = mongoose.Schema.ObjectId;
const addressSchema = new Schema({
    customer_id: {
        type: ObjectId,
        ref:User,
        required: true
    },
    address_cust_name: {
        type: String,
        required: true
    },
    address_type: {
        type: String,
        reaquired: true
    },
    phone: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true
    },
    locality: {
        type: String,
        required: true,
    },
    house_name: {
        type: String,
        required: true
    },
    area_street: {
        type: String,
        required: true,
    },
    town: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    alternate_phone: {
        type: String,
        required: true,
    },
    landmark: {
        type: String,
        required: true
    },
    delete: {
        type: Boolean,
        required: true,
        default: false,
    },
},
    {
        timestamp: true
    })
module.exports=mongoose.model('Address',addressSchema);