package com.randomvision.service;

import com.randomvision.dto.AdminStatsResponse;
import com.randomvision.entity.User;
import com.randomvision.entity.UserActivityLog;
import com.randomvision.repository.QuoteRepository;
import com.randomvision.repository.SavedQuoteRepository;
import com.randomvision.repository.UserActivityLogRepository;
import com.randomvision.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private SavedQuoteRepository savedQuoteRepository;

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalQuotes = quoteRepository.count();
        long totalSavedQuotes = savedQuoteRepository.count();

        // Get recent 10 activity logs
        Pageable topTen = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<UserActivityLog> logsPage = activityLogRepository.findAll(topTen);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        List<AdminStatsResponse.ActivityLogDTO> activities = logsPage.stream().map(log -> 
            AdminStatsResponse.ActivityLogDTO.builder()
                .username(log.getUser().getUsername())
                .action(log.getAction())
                .timestamp(log.getTimestamp().format(formatter))
                .build()
        ).collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalQuotes(totalQuotes)
                .totalSavedQuotes(totalSavedQuotes)
                .recentActivities(activities)
                .build();
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
}
