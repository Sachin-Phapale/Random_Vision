package com.randomvision.scheduler;

import com.randomvision.entity.Quote;
import com.randomvision.entity.User;
import com.randomvision.repository.QuoteRepository;
import com.randomvision.repository.UserRepository;
import com.randomvision.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class EmailScheduler {
    private static final Logger logger = LoggerFactory.getLogger(EmailScheduler.class);

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    // Runs daily at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDailyQuoteToAllUsers() {
        logger.info("Starting scheduled task: Send Daily Quote to all users");
        Quote randomQuote = quoteRepository.findRandomQuote();
        if (randomQuote == null) {
            logger.warn("No quotes found in the database. Scheduled task skipped.");
            return;
        }

        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.isEnabled()) {
                try {
                    mailService.sendDailyQuoteEmail(user.getEmail(), user.getUsername(), randomQuote);
                    logger.info("Sent daily quote to user: {}", user.getUsername());
                } catch (Exception e) {
                    logger.error("Failed to send daily quote to user: {}. Error: {}", user.getUsername(), e.getMessage());
                }
            }
        }
        logger.info("Completed scheduled task: Send Daily Quote");
    }
}
