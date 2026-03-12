package com.financialplanner.service;

import com.financialplanner.model.Transaction;
import com.financialplanner.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for Transaction CRUD operations with business logic and validation
 */
@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Create a new transaction with validation
     */
    public Transaction createTransaction(Transaction transaction) {
        validateTransaction(transaction);
        return transactionRepository.save(transaction);
    }

    /**
     * Retrieve a transaction by ID
     */
    public Optional<Transaction> getTransaction(String id) {
        return transactionRepository.findById(id);
    }

    /**
     * Retrieve all transactions
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    /**
     * Retrieve transactions by category
     */
    public List<Transaction> getTransactionsByCategory(String category) {
        return transactionRepository.findByCategory(category);
    }

    /**
     * Retrieve transactions within a date range
     */
    public List<Transaction> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByDateBetween(startDate, endDate);
    }

    /**
     * Retrieve transactions by type (INCOME or EXPENSE)
     */
    public List<Transaction> getTransactionsByType(Transaction.TransactionType type) {
        return transactionRepository.findByType(type);
    }

    /**
     * Update an existing transaction
     */
    public Optional<Transaction> updateTransaction(String id, Transaction transaction) {
        validateTransaction(transaction);
        return transactionRepository.update(id, transaction);
    }

    /**
     * Delete a transaction
     */
    public boolean deleteTransaction(String id) {
        return transactionRepository.delete(id);
    }

    /**
     * Get summary of transactions for a specific month and year
     */
    public TransactionSummary getMonthSummary(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Transaction> transactions = getTransactionsByDateRange(startDate, endDate);

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        return TransactionSummary.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(totalIncome - totalExpense)
                .transactionCount(transactions.size())
                .build();
    }

    /**
     * Validate transaction data
     */
    private void validateTransaction(Transaction transaction) {
        if (transaction.getDate() == null) {
            throw new IllegalArgumentException("Transaction date cannot be null");
        }
        if (transaction.getAmount() == null || transaction.getAmount() <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than 0");
        }
        if (transaction.getCategory() == null || transaction.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction category cannot be empty");
        }
        if (transaction.getType() == null) {
            throw new IllegalArgumentException("Transaction type must be INCOME or EXPENSE");
        }
        if (transaction.getDescription() == null || transaction.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction description cannot be empty");
        }
    }
}
