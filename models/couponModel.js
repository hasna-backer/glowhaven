const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

//coupen schema
const couponSchema = new Schema(
    {
        coupon_code: {
            type: String,
            required: true,
            unique: true,
        },
        discount: {
            type: Number,
            required: true,
            min: 0, // Ensures the value is non-negative
        },
        start_date: {
            type: Date,
            required: true,
        },
        exp_date: {
            type: Date,
            required: true,
        },
        minPurchaseAmount: {
            type: Number,
            required: true,
            default: 1000,
            min: 0, // Ensures the value is non-negative
        },
        maximumDiscount: {
            type: Number,
            required: true,
            min: 0, // Ensures the value is non-negative
        },
        // max_count: {
        //     type: Number,
        //     required: true,
        // },
        used_count: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        is_delete: {
            type: Boolean,
            required: true,
            default: false,
        },
        is_Active: {
            type: Boolean,
            default: true
        },
        user_list: [
            {
                type: ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Coupen', couponSchema);