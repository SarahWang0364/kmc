const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.office365.com', // Outlook/Hotmail SMTP
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Load and compile email template
const loadTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    return template(data);
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw error;
  }
};

// Send email
const sendEmail = async (to, subject, templateName, data) => {
  try {
    const transporter = createTransporter();
    const html = await loadTemplate(templateName, data);

    const mailOptions = {
      from: `KMC <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Specific email functions
const sendWelcomeEmail = async (user, initialPassword) => {
  await sendEmail(
    user.email,
    'Welcome to Kurt\'s Mathematics Centre',
    'welcome',
    {
      name: user.name,
      email: user.email,
      initialPassword,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`
    }
  );
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    'Password Reset Request - KMC',
    'reset-password',
    {
      name: user.name,
      resetUrl,
      expiryMinutes: 10
    }
  );
};

const sendDetentionAssignedEmail = async (user, detention, classInfo) => {
  await sendEmail(
    user.email,
    'Detention Assigned - KMC',
    'detention-assigned',
    {
      studentName: user.name,
      className: classInfo.name,
      week: detention.week,
      reason: detention.reason,
      bookingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/detentions`
    }
  );
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDetentionAssignedEmail
};
