import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'AgroAI'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

export const sendSellerApprovalEmail = async (
  email: string, name: string, businessName: string,
  status: 'approved' | 'rejected', reason: string
): Promise<void> => {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `🎉 Your Seller Account is Approved — AgroAI`
    : `Your AgroAI Seller Application Update`;

  const html = isApproved ? `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#16a34a;color:white;padding:20px;border-radius:8px;text-align:center">
        <h1 style="margin:0">🌾 AgroAI Platform</h1>
        <p style="margin:5px 0;opacity:0.9">Seller Account Approved</p>
      </div>
      <div style="padding:24px;background:#f9fafb;border-radius:8px;margin-top:16px">
        <h2 style="color:#16a34a">Congratulations, ${name}! ✅</h2>
        <p>Your seller account for <strong>${businessName}</strong> has been approved by our team.</p>
        <div style="background:#ecfdf5;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
          <h3 style="margin:0 0 8px;color:#15803d">What you can do now:</h3>
          <ul style="margin:0;padding-left:20px;color:#166534">
            <li>Upload and manage your products</li>
            <li>Receive and manage customer orders</li>
            <li>Track your revenue and analytics</li>
            <li>Manage stock levels</li>
          </ul>
        </div>
        <p>Log in to your account and start selling to thousands of farmers!</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Go to Seller Dashboard →</a>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">AgroAI Platform | support@agroai.in</p>
    </div>
  ` : `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#374151;color:white;padding:20px;border-radius:8px;text-align:center">
        <h1 style="margin:0">🌾 AgroAI Platform</h1>
        <p style="margin:5px 0;opacity:0.9">Seller Application Update</p>
      </div>
      <div style="padding:24px;background:#f9fafb;border-radius:8px;margin-top:16px">
        <h2 style="color:#374151">Hello ${name},</h2>
        <p>We have reviewed your seller application for <strong>${businessName}</strong>.</p>
        <p>Unfortunately, your application could not be approved at this time.</p>
        ${reason ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin:16px 0">
          <h3 style="margin:0 0 8px;color:#dc2626">Reason:</h3>
          <p style="margin:0;color:#7f1d1d">${reason}</p>
        </div>` : ''}
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
          <h3 style="margin:0 0 8px;color:#15803d">Next Steps:</h3>
          <ul style="margin:0;padding-left:20px;color:#166534">
            <li>Review the reason mentioned above</li>
            <li>Correct the issues with your application</li>
            <li>Re-apply with updated business documents</li>
            <li>Contact support if you have questions</li>
          </ul>
        </div>
        <p>For support, reply to this email or contact: <a href="mailto:support@agroai.in">support@agroai.in</a></p>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">AgroAI Platform | support@agroai.in</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendEmail(email, 'Welcome to AgroAI! 🌾', `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2>Welcome to AgroAI, ${name}!</h2>
      <p>Your account has been created successfully. Start using AI-powered farming tools today.</p>
    </div>
  `);
};
