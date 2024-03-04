const nodemailer = require('nodemailer');
require('dotenv').config();


var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
})

const sendMail = (email, content, type) => {
  const mailOption = {
    from: process.env.GMAIL,
    to: email,
    subject: type === "OTP" ? "RESET PASSWORD" : "Account Verification",
    html: getTemplate(content, type)
  }
  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      console.log(err)
    }
    console.log("email send");
  })
}




const getTemplate = (content, type) => {


  const OTP = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="https://GlowHaven.com" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">GlowHaven</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Your Brand. Use the following OTP to complete your reset password. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${content}</h2>
      <p style="font-size:0.9em;">Regards,<br />GlowHaven</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>GlowHaven</p>
        <p>payyoli, Kozhikode</p>
        <p>Kerala</p>
      </div>
    </div>
  </div>
  </body>
</html>`

  const VISAUPDATION = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="https://GlowHaven.com" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">GlowHaven</a>
  </div>
  <p style="font-size:1.1em">Hi,</p>
  <p>Your ${content}  have been successfully updated. If you have any questions or concerns, please feel free to reach out.</p>
  <p style="font-size:0.9em;">Regards,<br />GlowHaven</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>GlowHaven</p>
    <p>Payyoli, Kozhikode</p>
    <p>Kerala</p>
  </div>
</div>
</div>
</body>
</html>
`

  if (type === "OTP") {
    return OTP
  } else if (type === "VISAUPDATION") {
    return VISAUPDATION
  }
}


module.exports = { sendMail };