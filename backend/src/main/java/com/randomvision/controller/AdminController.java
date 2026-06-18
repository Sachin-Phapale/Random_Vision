package com.randomvision.controller;

import com.randomvision.dto.AdminStatsResponse;
import com.randomvision.dto.MessageResponse;
import com.randomvision.dto.UserResponse;
import com.randomvision.entity.Quote;
import com.randomvision.entity.User;
import com.randomvision.service.AdminService;
import com.randomvision.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private QuoteService quoteService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "username,asc") String sort) {
        
        String[] sortParts = sort.split(",");
        String sortProperty = sortParts[0];
        Sort.Direction sortDirection = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
                
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
        Page<User> users = adminService.getAllUsers(pageable);
        
        Page<UserResponse> response = users.map(user -> UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt().toString())
                .profileImagePath(user.getProfileImagePath())
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build());
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quotes")
    public ResponseEntity<Page<Quote>> getQuotes(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Quote> quotesPage = quoteService.searchQuotes(query, pageable);
        return ResponseEntity.ok(quotesPage);
    }

    @PostMapping("/quotes")
    public ResponseEntity<Quote> createQuote(@Valid @RequestBody Quote quote) {
        Quote created = quoteService.createQuote(quote);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/quotes/{id}")
    public ResponseEntity<Quote> updateQuote(@PathVariable("id") Long id, @Valid @RequestBody Quote quote) {
        Quote updated = quoteService.updateQuote(id, quote);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/quotes/{id}")
    public ResponseEntity<?> deleteQuote(@PathVariable("id") Long id) {
        quoteService.deleteQuote(id);
        return ResponseEntity.ok(new MessageResponse("Quote deleted successfully by Administrator!"));
    }
}
