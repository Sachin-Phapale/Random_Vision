package com.randomvision.service;

import com.randomvision.entity.Quote;
import com.randomvision.repository.QuoteRepository;
import com.randomvision.repository.SavedQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuoteServiceTests {
    @Mock
    private QuoteRepository quoteRepository;

    @Mock
    private SavedQuoteRepository savedQuoteRepository;

    @InjectMocks
    private QuoteService quoteService;

    private Quote quote;

    @BeforeEach
    void setUp() {
        quote = Quote.builder()
                .id(1L)
                .quoteText("Test Quote text")
                .author("Author Name")
                .category("Motivation")
                .build();
    }

    @Test
    void testGetQuoteById_Success() {
        when(quoteRepository.findById(1L)).thenReturn(Optional.of(quote));

        Quote found = quoteService.getQuoteById(1L);

        assertNotNull(found);
        assertEquals(quote.getQuoteText(), found.getQuoteText());
        verify(quoteRepository, times(1)).findById(1L);
    }

    @Test
    void testGetRandomQuote_Success() {
        when(quoteRepository.findRandomQuote()).thenReturn(quote);

        Quote found = quoteService.getRandomQuote();

        assertNotNull(found);
        assertEquals(quote.getQuoteText(), found.getQuoteText());
        verify(quoteRepository, times(1)).findRandomQuote();
    }
}
