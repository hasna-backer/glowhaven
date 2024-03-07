const Joi = require('joi');



const userSignupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
        .length(10)
        .pattern(/[6-9]{1}[0-9]{9}/)
        .required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@]{3,30}$")),
    confirmPassword: Joi.ref("password"),
});

module.exports = { userSignupSchema }


// app.post("/user", (req, res, next) => {
//     const { error, value } = userSignupSchema.validate(req.body, {
//         abortEarly: false,
//     });
//     if (error) {
//         return res.send("Invalid Request: " + JSON.stringify(error));
//     } else {
//         return res.send("Successfuly inside user: " + JSON.stringify(value));
//     }
// });