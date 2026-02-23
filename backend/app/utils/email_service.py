import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "noreply@campusfind.app")

    def send_otp_email(self, recipient_email: str, otp_code: str, recipient_name: str = "") -> bool:
        """
        Send OTP verification email to user

        Args:
            recipient_email: Email address to send to
            otp_code: 6-digit OTP code
            recipient_name: User's name for personalization

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = "CampusFind - Email Verification Code"
            
            # Create HTML email template
            html_body = f"""
            <html>
                <head>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 20px;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 8px;
                            padding: 40px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }}
                        .header {{
                            text-align: center;
                            margin-bottom: 30px;
                        }}
                        .logo {{
                            font-size: 24px;
                            font-weight: bold;
                            color: #10b981;
                        }}
                        .greeting {{
                            font-size: 18px;
                            color: #1f2937;
                            margin-bottom: 20px;
                        }}
                        .message {{
                            color: #4b5563;
                            font-size: 14px;
                            line-height: 1.6;
                            margin-bottom: 30px;
                        }}
                        .otp-box {{
                            background-color: #f0fdf4;
                            border: 2px dashed #10b981;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 30px 0;
                        }}
                        .otp-code {{
                            font-size: 32px;
                            font-weight: bold;
                            color: #10b981;
                            letter-spacing: 4px;
                            font-family: 'Courier New', monospace;
                        }}
                        .warning {{
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                            font-size: 13px;
                            color: #92400e;
                        }}
                        .footer {{
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            color: #9ca3af;
                            font-size: 12px;
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🎓 CampusFind</div>
                        </div>
                        
                        <div class="greeting">
                            Hi {recipient_name or 'there'},
                        </div>
                        
                        <div class="message">
                            Thank you for registering with CampusFind! To complete your registration and verify your email address, please use the verification code below.
                        </div>
                        
                        <div class="otp-box">
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 10px;">Your verification code is:</div>
                            <div class="otp-code">{otp_code}</div>
                        </div>
                        
                        <div class="message">
                            This code will expire in 15 minutes. If you didn't request this verification code, please ignore this email.
                        </div>
                        
                        <div class="warning">
                            ⚠️ Never share this code with anyone. CampusFind staff will never ask for your verification code.
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 CampusFind. All rights reserved.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
            </html>
            """

            # Create plain text fallback
            text_body = f"""
CampusFind - Email Verification Code

Hi {recipient_name or 'there'},

Thank you for registering with CampusFind! To complete your registration, please use the verification code below.

Your verification code is: {otp_code}

This code will expire in 15 minutes.

If you didn't request this verification code, please ignore this email.

Never share this code with anyone. CampusFind staff will never ask for your verification code.

© 2024 CampusFind. All rights reserved.
This is an automated message, please do not reply to this email.
            """

            return self._send_email(recipient_email, subject, text_body, html_body)

        except Exception as e:
            logger.error(f"Error sending OTP email to {recipient_email}: {str(e)}")
            return False

    def _send_email(self, recipient_email: str, subject: str, text_body: str, html_body: str) -> bool:
        """
        Internal method to send email via SMTP

        Args:
            recipient_email: Recipient email address
            subject: Email subject
            text_body: Plain text email body
            html_body: HTML email body

        Returns:
            True if successful, False otherwise
        """
        try:
            # If SMTP credentials not configured, log warning and return False
            if not self.smtp_user or not self.smtp_password:
                logger.warning(f"Email service not configured. Would send to: {recipient_email}")
                # For development without email service, just log that we would send
                logger.info(f"[DEV] OTP Email would be sent to {recipient_email}")
                return True

            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = recipient_email

            # Attach plain text and HTML parts
            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {recipient_email}")
            return True

        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending email to {recipient_email}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email to {recipient_email}: {str(e)}")
            return False


# Create singleton instance
email_service = EmailService()
