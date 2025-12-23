const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const port = Number(process.env.SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
    });

    const message = {
        from: `${process.env.FROM_NAME || 'E-commerce Store'} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Fallback for clients that don't support HTML
        html: options.html,    // The HTML version of the email
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = sendEmail;
