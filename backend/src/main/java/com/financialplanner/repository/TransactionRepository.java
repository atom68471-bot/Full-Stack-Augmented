package com.financialplanner.repository;

import com.financialplanner.model.Transaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Transaction persistence operations
 */
public interface TransactionRepository {
    /**
     * Save a transaction
     */
    Transaction save(Transaction transaction);

    /**
     * Find transaction by ID
     */
    Optional<Transaction> findById(String id);

    /**
     * Find all transactions
     */
    List<Transaction> findAll();

    /**
     * Find transactions by category
     */
    List<Transaction> findByCategory(String category);

    /**
     * Find transactions by date range
     */
    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find transactions by type (INCOME/EXPENSE)
     */
    List<Transaction> findByType(Transaction.TransactionType type);

    /**
     * Update a transaction
     */
    Optional<Transaction> update(String id, Transaction transaction);

    /**
     * Delete a transaction by ID
     */
    boolean delete(String id);

    /**
     * Delete all transactions
     */
    void deleteAll();
}
