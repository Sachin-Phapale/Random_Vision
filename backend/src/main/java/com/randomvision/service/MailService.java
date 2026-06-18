package com.randomvision.service;

import com.randomvision.entity.Quote;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = "http://localhost/verify-email?token=" + token;
        String subject = "Verify your Random Vision Account";
        String content = "<h3>Welcome to Random Vision!</h3>"
                + "<p>Please click the link below to verify your email address:</p>"
                + "<p><a href=\"" + verificationUrl + "\">Verify Account</a></p>"
                + "<p>If you did not request this, please ignore this email.</p>";
        sendHtmlEmail(email, subject, content);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String resetUrl = "http://localhost/reset-password?token=" + token;
        String subject = "Reset your Random Vision Password";
        String content = "<h3>Password Reset Request</h3>"
                + "<p>Please click the link below to reset your password:</p>"
                + "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>"
                + "<p>This link will expire soon. If you did not make this request, you can safely ignore this email.</p>";
        sendHtmlEmail(email, subject, content);
    }

    public void sendSavedQuotesEmail(String email, String username, List<Quote> quotes) {
        String subject = "Your Saved Quotes - Random Vision";
        StringBuilder content = new StringBuilder();
        content.append("<h3>Hello ").append(username).append(",</h3>");
        content.append("<p>Here is your curated list of saved inspirational quotes:</p>");
        content.append("<hr style='border: 0; border-top: 1px solid #eee;'/>");
        for (Quote quote : quotes) {
            content.append("<blockquote style='font-style: italic; font-size: 16px; margin: 15px 0; color: #555;'>")
                    .append("\"").append(quote.getQuoteText()).append("\"")
                    .append("<footer style='font-style: normal; font-weight: bold; margin-top: 5px;'>— ")
                    .append(quote.getAuthor()).append(" (Category: ").append(quote.getCategory()).append(")</footer>")
                    .append("</blockquote>")
                    .append("<hr style='border: 0; border-top: 1px solid #eee;'/>");
        }
        content.append("<p style='font-size: 12px; color: #888;'>Random Vision Quote Platform</p>");
        sendHtmlEmail(email, subject, content.toString());
    }

    public void sendDailyQuoteEmail(String email, String username, Quote quote) {
        String subject = "Your Daily Vision - " + quote.getCategory();
        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; max-width: 600px; margin: 0 auto;'>"
                + "<h2>Good morning, " + username + "!</h2>"
                + "<p>Here is your daily quote to inspire your journey:</p>"
                + "<div style='background-color: #f9f9f9; padding: 25px; border-left: 5px solid #000; font-size: 20px; font-style: italic; line-height: 1.5;'>"
                + "\"" + quote.getQuoteText() + "\""
                + "<div style='font-style: normal; font-size: 15px; font-weight: bold; margin-top: 15px; text-align: right;'>— " + quote.getAuthor() + "</div>"
                + "</div>"
                + "<p style='margin-top: 25px; text-align: center;'>"
                + "<a href='http://localhost' style='background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Visit Random Vision</a>"
                + "</p>"
                + "</div>";
        sendHtmlEmail(email, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
