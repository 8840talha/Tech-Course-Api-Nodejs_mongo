var nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    var transporter = nodemailer.createTransport({

        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    var mailOptions = {
        from: 'Talha<talhaparvez285@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    transporter.sendMail(mailOptions, (e, info) => {
        if (e) {
            console.log('errorxcscdscs')
            console.log(e);
        } else {
            console.log(`Message Sent: ${info.response}`);
        }
    })
}
module.exports = sendEmail;