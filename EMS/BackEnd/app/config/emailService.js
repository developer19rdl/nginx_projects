const nodemailer = require('nodemailer');
require('dotenv').config();
const { connection } = require('./dbSql2');

// Builds the nodemailer transport + from-address from the latest
// alert_settings row (configurable from the Alert Configurations screen);
// falls back to the .env Gmail account when no row is saved yet.
async function getMailAccount() {
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM alert_settings ORDER BY id DESC LIMIT 1'
        );
        const settings = rows[0];
        if (settings && settings.smtpServer && settings.alertEmailFrom && settings.password) {
            const isSSL = (settings.securityType || '').toUpperCase() === 'SSL';
            return {
                from: settings.alertEmailFrom,
                transporter: nodemailer.createTransport({
                    host: settings.smtpServer,
                    port: isSSL ? 465 : 587,
                    secure: isSSL,
                    requireTLS: !isSSL,
                    auth: {
                        user: settings.alertEmailFrom,
                        pass: settings.password,
                    },
                }),
            };
        }
    } catch (error) {
        console.error('Failed to load alert_settings, falling back to .env mail account:', error);
    }

    return {
        from: process.env.EMAIL,
        transporter: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        }),
    };
}

exports.sendEmail = async (to, subject, htmlContent, text, attachments = []) => {
    const { from, transporter } = await getMailAccount();

    // Setup email data
    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: htmlContent,
        text: text,
        attachments: attachments,
    };

    try {
        let info = await transporter.sendMail(mailOptions); //Send email
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/*
exports.sendMail = async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        try {
            const htmlContent = `
            <h2 style="font-weight: bold;">${subject}</h2>
            <p>${text}</p>
        `
            const attachmentBuffer = await template();
            const attachment = [{
                filename: 'Order Input.xlsx',
                content: attachmentBuffer // Attach the buffer content
            }];

            await sendEmail(to, subject, htmlContent, text, attachment);
            return res.status(200).send('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
    } catch (err) {
        return handleErrorResponse(res, err);
    }
}

*/