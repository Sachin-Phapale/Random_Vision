package com.randomvision.repository;

import com.randomvision.entity.Quote;
import com.randomvision.entity.SavedQuote;
import com.randomvision.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedQuoteRepository extends JpaRepository<SavedQuote, Long> {
    boolean existsByUserAndQuote(User user, Quote quote);
    Optional<SavedQuote> findByUserAndQuote(User user, Quote quote);
    List<SavedQuote> findByUser(User user);

    @Query("SELECT sq FROM SavedQuote sq JOIN sq.quote q WHERE sq.user.id = :userId AND " +
           "(:query IS NULL OR LOWER(q.quoteText) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<SavedQuote> searchSavedQuotes(@Param("userId") Long userId, @Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT q.category FROM SavedQuote sq JOIN sq.quote q WHERE sq.user.id = :userId")
    List<String> findSavedCategoriesByUserId(@Param("userId") Long userId);
}
