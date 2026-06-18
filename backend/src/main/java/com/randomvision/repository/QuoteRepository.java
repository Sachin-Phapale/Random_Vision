package com.randomvision.repository;

import com.randomvision.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    @Query(value = "SELECT * FROM quotes ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Quote findRandomQuote();

    @Query("SELECT q FROM Quote q WHERE q.category IN :categories ORDER BY RAND()")
    List<Quote> findRandomQuotesByCategories(@Param("categories") List<String> categories, Pageable pageable);

    @Query("SELECT DISTINCT q.category FROM Quote q")
    List<String> findDistinctCategories();

    @Query("SELECT q FROM Quote q WHERE " +
           "(:query IS NULL OR LOWER(q.quoteText) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Quote> searchQuotes(@Param("query") String query, Pageable pageable);
}
