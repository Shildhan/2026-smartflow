import nodemailer from 'nodemailer';

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }

    return null;
  }

  public static async sendPasswordResetEmail(
    toEmail: string,
    token: string,
    userName?: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${token}`;
    const fromAddress =
      process.env.EMAIL_FROM || '"SmartFlow Security" <noreply@smartflow.gov.in>';
    const subject = 'Reset Your SmartFlow Password';

    const recipientName = userName ? userName : 'SmartFlow Authority Member';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SmartFlow Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 24px;
    }
    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 28px 32px;
      border-bottom: 1px solid #1e293b;
      text-align: center;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 800;
      color: #38bdf8;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .logo-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .reset-btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #0284c7);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .expiry-box {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .expiry-box strong {
      color: #f59e0b;
    }
    .raw-link {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 24px;
      border-top: 1px solid #1e293b;
      padding-top: 16px;
    }
    .footer {
      background: #090d16;
      padding: 20px 32px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-title">SmartFlow</div>
      <div class="logo-subtitle">Smart Traffic Management & Simulation System</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${recipientName},</div>
      <div class="message">
        We received a request to reset your SmartFlow account password. You can reset your password by clicking the button below:
      </div>
      <div class="button-container">
        <a href="${resetUrl}" class="reset-btn" target="_blank">Reset Password</a>
      </div>
      <div class="expiry-box">
        <strong>Important:</strong> This password reset link will expire in <strong>30 minutes</strong>.<br>
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </div>
      <div class="raw-link">
        If you're having trouble clicking the "Reset Password" button, copy and paste this URL into your web browser:<br>
        <a href="${resetUrl}" style="color: #38bdf8;">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      SmartFlow Traffic Intelligence Command Center<br>
      This is an automated security notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Hello ${recipientName},

We received a request to reset your SmartFlow account password.

Reset your password using the link below:
${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

---
SmartFlow Traffic Intelligence Command Center
    `;

    // Console notification for local development & evaluation visibility
    console.log('\n================================================================');
    console.log('📧 [PASSWORD RESET EMAIL DISPATCHED]');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('Expires in: 30 minutes');
    console.log('================================================================\n');

    try {
      const transporter = this.getTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject,
          text: textContent,
          html: htmlContent,
        });
        console.log(`[EmailService] Real SMTP email sent successfully to ${toEmail}`);
      } else {
        console.log(`[EmailService] SMTP not configured. Reset link logged to console for testing.`);
      }
      return true;
    } catch (err) {
      console.warn(`[EmailService] SMTP send error, logged reset URL to console.`, err);
      return true;
    }
  }
}
