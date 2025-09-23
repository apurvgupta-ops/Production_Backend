import path from "path";
import nodemailer from "nodemailer";
import logger from "./logger.js";

/**
 * Sends an email using nodemailer.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @returns {Promise<Object>} - Result of sending mail
 */

// const signatureImagePath = path.resolve(__dirname, '../../email-signature.jpeg');

async function sendMail({ to, subject, text, html, attachments = [] }) {
  try {
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      throw new Error('Missing required email fields: to, subject, and text/html');
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add connection timeout
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${to}`, {
      messageId: info.messageId,
      subject
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    logger.error('Failed to send email:', {
      error: error.message,
      to,
      subject
    });

    throw new Error("Failed to send email: " + error.message);
  }
}

/**
 * Send bulk emails with rate limiting
 */
export const sendBulkEmails = async (emails, delayMs = 1000) => {
  const results = [];

  for (let i = 0; i < emails.length; i++) {
    try {
      const result = await sendMail(emails[i]);
      results.push({ ...result, index: i, success: true });

      // Add delay between emails to avoid rate limiting
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error.message,
        email: emails[i].to
      });
    }
  }

  return results;
};

export default sendMail;