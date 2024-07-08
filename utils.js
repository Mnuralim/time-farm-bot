const nodemailer = require('nodemailer')

const sendEmail = async (data) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const info = await transporter.sendMail({
    from: "'no-reply' <timefarm.com>",
    to: `${data.to}`,
    subject: data.subject,
    text: data.text,
    html: data.html,
  })

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}

module.exports = sendEmail
