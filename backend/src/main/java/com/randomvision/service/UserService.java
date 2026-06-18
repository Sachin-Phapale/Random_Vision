package com.randomvision.service;

import com.randomvision.dto.RegisterRequest;
import com.randomvision.entity.*;
import com.randomvision.exception.BadRequestException;
import com.randomvision.exception.ResourceNotFoundException;
import com.randomvision.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Value("${app.uploadDir}")
    private String uploadDir;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found. Make sure DB is seeded."));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .roles(Collections.singleton(userRole))
                .build();

        user = userRepository.save(user);

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        tokenRepository.save(verificationToken);

        mailService.sendVerificationEmail(user.getEmail(), token);
        logActivity(user, "REGISTERED");

        return user;
    }

    @Transactional
    public void verifyEmailToken(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token is expired");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        logActivity(user, "ACTIVATED_EMAIL");
    }

    @Transactional
    public User updateUsername(User user, String newUsername) {
        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new BadRequestException("Username is already taken!");
        }
        user.setUsername(newUsername);
        user = userRepository.save(user);
        logActivity(user, "UPDATE_USERNAME");
        return user;
    }

    @Transactional
    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match!");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logActivity(user, "CHANGE_PASSWORD");
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Delete any existing verification tokens for this user first
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        VerificationToken resetToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1)) // 1 hour for password reset
                .build();
        tokenRepository.save(resetToken);

        mailService.sendPasswordResetEmail(user.getEmail(), token);
        logActivity(user, "REQUEST_PASSWORD_RESET");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        VerificationToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token is expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);

        logActivity(user, "PASSWORD_RESET_SUCCESS");
    }

    @Transactional
    public User uploadProfileImage(User user, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        try {
            Path directory = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            // Delete old profile image if exists
            if (user.getProfileImagePath() != null) {
                Path oldFile = directory.resolve(user.getProfileImagePath());
                Files.deleteIfExists(oldFile);
            }

            String extension = "";
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path targetPath = directory.resolve(filename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImagePath(filename);
            user = userRepository.save(user);

            logActivity(user, "UPLOAD_PROFILE_IMAGE");
            return user;
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void logActivity(User user, String action) {
        UserActivityLog log = UserActivityLog.builder()
                .user(user)
                .action(action)
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }
}
