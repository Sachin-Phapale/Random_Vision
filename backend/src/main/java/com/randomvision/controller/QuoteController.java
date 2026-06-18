package com.randomvision.controller;

import com.randomvision.dto.MessageResponse;
import com.randomvision.dto.QuoteResponse;
import com.randomvision.entity.Quote;
import com.randomvision.entity.SavedQuote;
import com.randomvision.entity.User;
import com.randomvision.repository.UserRepository;
import com.randomvision.security.UserDetailsImpl;
import com.randomvision.service.QuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {
    @Autowired
    private QuoteService quoteService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @GetMapping("/random")
    public ResponseEntity<QuoteResponse> getRandomQuote(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Quote quote = quoteService.getRandomQuote();
        boolean saved = false;
        if (userDetails != null) {
            User user = getAuthenticatedUser(userDetails);
            saved = quoteService.isQuoteSaved(user, quote);
        }
        QuoteResponse response = QuoteResponse.builder()
                .id(quote.getId())
                .quoteText(quote.getQuoteText())
                .author(quote.getAuthor())
                .category(quote.getCategory())
                .saved(saved)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save/{id}")
    public ResponseEntity<?> saveQuote(@PathVariable("id") Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        quoteService.saveQuote(user, id);
        return ResponseEntity.ok(new MessageResponse("Quote saved successfully to your favorites!"));
    }

    @DeleteMapping("/unsave/{id}")
    public ResponseEntity<?> unsaveQuote(@PathVariable("id") Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        quoteService.unsaveQuote(user, id);
        return ResponseEntity.ok(new MessageResponse("Quote removed from your favorites successfully!"));
    }

    @GetMapping("/saved")
    public ResponseEntity<Page<QuoteResponse>> getSavedQuotes(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "savedAt,desc") String sort,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        
        // Parse sort parameters
        String[] sortParts = sort.split(",");
        String sortProperty = sortParts[0];
        Sort.Direction sortDirection = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) 
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
        Page<SavedQuote> savedQuotes = quoteService.searchSavedQuotes(user, query, pageable);
        
        Page<QuoteResponse> response = savedQuotes.map(sq -> QuoteResponse.builder()
                .id(sq.getQuote().getId())
                .quoteText(sq.getQuote().getQuoteText())
                .author(sq.getQuote().getAuthor())
                .category(sq.getQuote().getCategory())
                .saved(true)
                .build());
                
        return ResponseEntity.ok(response);
    }

    @PostMapping("/email")
    public ResponseEntity<?> emailSavedQuotes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        quoteService.emailSavedQuotes(user);
        return ResponseEntity.ok(new MessageResponse("Favorited quotes list emailed successfully!"));
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<QuoteResponse>> recommendQuotes(
            @RequestParam(name = "limit", defaultValue = "5") int limit,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<Quote> recommended = quoteService.recommendQuotes(user, limit);
        
        List<QuoteResponse> response = recommended.stream().map(q -> QuoteResponse.builder()
                .id(q.getId())
                .quoteText(q.getQuoteText())
                .author(q.getAuthor())
                .category(q.getCategory())
                .saved(quoteService.isQuoteSaved(user, q))
                .build()
        ).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}
