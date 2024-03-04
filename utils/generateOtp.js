const crypto = require('crypto');

const generateOTP = () => new Promise(res =>

    crypto.randomBytes(3, (err, buffer) => {
        res(
            parseInt(buffer.toString("hex"), 16)
                .toString()
                .substr(0, 4)
        );
    })
);

module.exports = { generateOTP };