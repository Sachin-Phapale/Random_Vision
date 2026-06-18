package com.randomvision.service;

import com.randomvision.entity.Quote;
import com.randomvision.entity.SavedQuote;
import com.randomvision.entity.User;
import com.randomvision.exception.BadRequestException;
import com.randomvision.exception.ResourceNotFoundException;
import com.randomvision.repository.QuoteRepository;
import com.randomvision.repository.SavedQuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuoteService {
    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private SavedQuoteRepository savedQuoteRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;

    public Quote getRandomQuote() {
        Quote quote = quoteRepository.findRandomQuote();
        if (quote == null) {
            throw new ResourceNotFoundException("No quotes available in the database.");
        }
        return quote;
    }

    public Quote getQuoteById(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found with id: " + id));
    }

    public boolean isQuoteSaved(User user, Quote quote) {
        return savedQuoteRepository.existsByUserAndQuote(user, quote);
    }

    @Transactional
    public void saveQuote(User user, Long quoteId) {
        Quote quote = getQuoteById(quoteId);
        if (savedQuoteRepository.existsByUserAndQuote(user, quote)) {
            throw new BadRequestException("Quote is already saved as a favorite!");
        }

        SavedQuote savedQuote = SavedQuote.builder()
                .user(user)
                .quote(quote)
                .build();
        savedQuoteRepository.save(savedQuote);
        userService.logActivity(user, "SAVE_QUOTE_" + quoteId);
    }

    @Transactional
    public void unsaveQuote(User user, Long quoteId) {
        Quote quote = getQuoteById(quoteId);
        SavedQuote savedQuote = savedQuoteRepository.findByUserAndQuote(user, quote)
                .orElseThrow(() -> new BadRequestException("Quote was not saved as a favorite!"));
        savedQuoteRepository.delete(savedQuote);
        userService.logActivity(user, "UNSAVE_QUOTE_" + quoteId);
    }

    public Page<SavedQuote> searchSavedQuotes(User user, String query, Pageable pageable) {
        return savedQuoteRepository.searchSavedQuotes(user.getId(), query, pageable);
    }

    @Transactional
    public void emailSavedQuotes(User user) {
        List<SavedQuote> savedList = savedQuoteRepository.findByUser(user);
        if (savedList.isEmpty()) {
            throw new BadRequestException("You don't have any saved quotes to email!");
        }

        List<Quote> quotes = savedList.stream().map(SavedQuote::getQuote).collect(Collectors.toList());
        mailService.sendSavedQuotesEmail(user.getEmail(), user.getUsername(), quotes);
        userService.logActivity(user, "EMAIL_SAVED_QUOTES");
    }

    public List<Quote> recommendQuotes(User user, int limit) {
        List<String> favCategories = savedQuoteRepository.findSavedCategoriesByUserId(user.getId());
        if (favCategories.isEmpty()) {
            List<String> distinctCategories = quoteRepository.findDistinctCategories();
            if (distinctCategories.isEmpty()) {
                return List.of();
            }
            return quoteRepository.findRandomQuotesByCategories(distinctCategories, PageRequest.of(0, limit));
        }
        return quoteRepository.findRandomQuotesByCategories(favCategories, PageRequest.of(0, limit));
    }

    public Page<Quote> searchQuotes(String query, Pageable pageable) {
        return quoteRepository.searchQuotes(query, pageable);
    }

    // Admin CRUD Operations
    @Transactional
    public Quote createQuote(Quote quote) {
        return quoteRepository.save(quote);
    }

    @Transactional
    public Quote updateQuote(Long id, Quote updatedQuote) {
        Quote quote = getQuoteById(id);
        quote.setQuoteText(updatedQuote.getQuoteText());
        quote.setAuthor(updatedQuote.getAuthor());
        quote.setCategory(updatedQuote.getCategory());
        return quoteRepository.save(quote);
    }

    @Transactional
    public void deleteQuote(Long id) {
        Quote quote = getQuoteById(id);
        quoteRepository.delete(quote);
    }
}
