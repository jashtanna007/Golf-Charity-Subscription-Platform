const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { success: false, error: error.message };
  }
};

const sendSubscriptionConfirmation = async (email, name, planType) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
      <h1 style="color: #059669; font-family: 'Manrope', sans-serif;">Welcome to The Philanthropic Green</h1>
      <p>Hi ${name},</p>
      <p>Your <strong>${planType}</strong> subscription is now active. You're now part of an elite community where precision meets philanthropy.</p>
      <p>Start entering your scores and participate in monthly prize draws!</p>
      <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px;">
        <p style="margin: 0; color: #065f46;">At least 10% of your subscription goes directly to your chosen charity.</p>
      </div>
    </div>
  `;
  return sendEmail(email, "Welcome to The Philanthropic Green!", html);
};

const sendDrawResults = async (email, name, drawDate, isWinner, matchCount, prizeAmount) => {
  const winnerHtml = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
      <h1 style="color: #059669;">🏆 Congratulations, ${name}!</h1>
      <p>You matched <strong>${matchCount} numbers</strong> in the ${drawDate} draw!</p>
      <p>Your prize: <strong>£${prizeAmount.toFixed(2)}</strong></p>
      <p>Please upload your score verification screenshot to claim your prize.</p>
    </div>
  `;
  const nonWinnerHtml = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
      <h1 style="color: #059669;">Draw Results — ${drawDate}</h1>
      <p>Hi ${name},</p>
      <p>Unfortunately you didn't win this month, but keep playing! Your contributions are still making a difference.</p>
    </div>
  `;
  return sendEmail(
    email,
    isWinner ? "🏆 You're a Winner!" : `Draw Results — ${drawDate}`,
    isWinner ? winnerHtml : nonWinnerHtml
  );
};

const sendWinnerVerificationUpdate = async (email, name, status, amount) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px;">
      <h1 style="color: ${status === 'approved' ? '#059669' : '#dc2626'};">Verification ${status === 'approved' ? 'Approved' : 'Rejected'}</h1>
      <p>Hi ${name},</p>
      <p>${status === 'approved'
        ? `Your score verification has been approved! Your prize of <strong>£${amount.toFixed(2)}</strong> will be processed shortly.`
        : 'Unfortunately, your score verification was rejected. Please contact support if you believe this is an error.'
      }</p>
    </div>
  `;
  return sendEmail(email, `Verification ${status === 'approved' ? 'Approved ✓' : 'Update'}`, html);
};

module.exports = {
  sendEmail,
  sendSubscriptionConfirmation,
  sendDrawResults,
  sendWinnerVerificationUpdate,
};
