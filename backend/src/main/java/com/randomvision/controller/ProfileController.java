package com.randomvision.controller;

import com.randomvision.dto.ChangePasswordRequest;
import com.randomvision.dto.MessageResponse;
import com.randomvision.dto.UpdateProfileRequest;
import com.randomvision.dto.UserResponse;
import com.randomvision.entity.User;
import com.randomvision.repository.UserRepository;
import com.randomvision.security.UserDetailsImpl;
import com.randomvision.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        User updated = userService.updateUsername(user, request.getUsername());
        
        return ResponseEntity.ok(UserResponse.builder()
                .id(updated.getId())
                .username(updated.getUsername())
                .email(updated.getEmail())
                .enabled(updated.isEnabled())
                .createdAt(updated.getCreatedAt().toString())
                .profileImagePath(updated.getProfileImagePath())
                .roles(updated.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        userService.changePassword(user, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        User updated = userService.uploadProfileImage(user, file);
        return ResponseEntity.ok(new MessageResponse(updated.getProfileImagePath()));
    }
}
