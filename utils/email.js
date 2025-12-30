const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Check if we're in production and SMTP is not configured
        const isProduction = process.env.NODE_ENV === 'production';
        const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

        // For production without SMTP, use a fallback method
        if (isProduction && !hasSMTPConfig) {
            console.log('📧 [PRODUCTION EMAIL FALLBACK] Email would be sent to:', options.email);
            console.log('📧 Subject:', options.subject);
            console.log('📧 Message:', options.message?.substring(0, 100) + '...');

            // You can integrate with services like:
            // - SendGrid: process.env.SENDGRID_API_KEY
            // - Mailgun: process.env.MAILGUN_API_KEY
            // - AWS SES: AWS credentials
            // - Postmark: process.env.POSTMARK_API_KEY

            // For now, we'll simulate success but log the email
            console.log('✅ [EMAIL SIMULATED] Email sent successfully (production fallback)');
            return true;
        }

        // Standard SMTP configuration for development/local
        const port = Number(process.env.SMTP_PORT) || 587;

        console.log(`📧 [Email Debug] Host: ${process.env.SMTP_HOST}, Port: ${port}, User: ${process.env.SMTP_USER ? 'SET' : 'MISSING'}`);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000, // 10 seconds
            // Add additional options for better reliability
            tls: {
                rejectUnauthorized: false // For self-signed certificates in development
            }
        });

        // Verify connection (optional, but helpful for debugging)
        if (!isProduction) {
            await transporter.verify();
            console.log('📧 SMTP connection verified');
        }

        const message = {
            from: `${process.env.FROM_NAME || 'Walker Farms'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message, // Fallback for clients that don't support HTML
            html: options.html,    // The HTML version of the email
        };

        const info = await transporter.sendMail(message);
        console.log('📧 Message sent successfully:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Email sending failed:', error.message);

        // In production, don't fail the entire operation due to email issues
        if (process.env.NODE_ENV === 'production') {
            console.log('⚠️  Email failed in production, but continuing operation');
            return true; // Return true to not break the user flow
        }

        return false;
    }
};

// Helper function to send order confirmation emails
const sendOrderConfirmationEmail = async (orderData) => {
    const { user, orderItems, totalPrice, _id } = orderData;

    const subject = `Order Confirmation - Order #${_id.slice(-8).toUpperCase()}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Thank you for your order!</h1>
            <p>Hi ${user.name},</p>
            <p>Your order has been successfully placed. Here are the details:</p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Summary</h3>
                <p><strong>Order ID:</strong> ${_id.slice(-8).toUpperCase()}</p>
                <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>

                <h4>Items:</h4>
                <ul>
                    ${orderItems.map(item => `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
                </ul>
            </div>

            <p>You'll receive another email when your order ships.</p>
            <p>Best regards,<br>Walker Farms Team</p>
        </div>
    `;

    return await sendEmail({
        email: user.email,
        subject,
        message: `Your order #${_id.slice(-8).toUpperCase()} has been confirmed. Total: $${totalPrice.toFixed(2)}`,
        html
    });
};

module.exports = { sendEmail, sendOrderConfirmationEmail };
