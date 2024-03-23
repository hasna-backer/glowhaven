const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
        required: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    cart: [{
        product_id: {
            type: ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    wish_list: [{
        product_id: {
            type: ObjectId,
            required: true
        }
    }],
    wallet_history: [
        {
            amount: {
                type: Number
            },
            status: {
                type: String,
                enum: ["Debit", "Credit"]
            },
            time: {
                type: Date
            }
        }
    ],
    is_verified: {
        type: Boolean,
        required: true,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 