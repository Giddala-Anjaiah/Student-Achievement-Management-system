const nodemailer = require('nodemailer');

// Create transporter (using Gmail for development)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  achievementApproved: (userName, achievementTitle) => ({
    subject: '🎉 Achievement Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Congratulations, ${userName}!</h2>
        <p>Your achievement <strong>"${achievementTitle}"</strong> has been approved!</p>
        <p>This achievement is now visible in your portfolio and contributes to your overall ranking.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>View your updated portfolio</li>
            <li>Check your new ranking on the leaderboard</li>
            <li>Continue adding more achievements</li>
          </ul>
        </div>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>Student Achievements Team</p>
      </div>
    `
  }),
  
  achievementRejected: (userName, achievementTitle, reason) => ({
    subject: 'Achievement Update - Review Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Achievement Review Required</h2>
        <p>Hello ${userName},</p>
        <p>Your achievement <strong>"${achievementTitle}"</strong> requires some updates before it can be approved.</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>Feedback:</h3>
          <p>${reason}</p>
        </div>
        <p>Please review the feedback and submit an updated version of your achievement.</p>
        <p>If you have any questions, please contact your faculty advisor.</p>
        <p>Best regards,<br>Student Achievements Team</p>
      </div>
    `
  }),
  
  newAchievementSubmitted: (facultyName, studentName, achievementTitle) => ({
    subject: 'New Achievement Pending Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">New Achievement for Review</h2>
        <p>Hello ${facultyName},</p>
        <p>A new achievement has been submitted and requires your review:</p>
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Achievement:</strong> ${achievementTitle}</p>
        </div>
        <p>Please log in to the system to review and approve/reject this achievement.</p>
        <p>Best regards,<br>Student Achievements Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](...data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Specific email functions
const sendAchievementApprovedEmail = (userEmail, userName, achievementTitle) => {
  return sendEmail(userEmail, 'achievementApproved', [userName, achievementTitle]);
};

const sendAchievementRejectedEmail = (userEmail, userName, achievementTitle, reason) => {
  return sendEmail(userEmail, 'achievementRejected', [userName, achievementTitle, reason]);
};

const sendNewAchievementNotification = (facultyEmail, facultyName, studentName, achievementTitle) => {
  return sendEmail(facultyEmail, 'newAchievementSubmitted', [facultyName, studentName, achievementTitle]);
};

module.exports = {
  sendEmail,
  sendAchievementApprovedEmail,
  sendAchievementRejectedEmail,
  sendNewAchievementNotification
}; 