package com.financialplanner.controller;

import com.financialplanner.model.Transaction;
import com.financialplanner.service.TransactionService;
import com.financialplanner.service.TransactionSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Transaction endpoints
 * Base path: /transactions
 */
@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    /**
     * Create a new transaction
     * POST /transactions
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        try {
            Transaction createdTransaction = transactionService.createTransaction(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all transactions
     * GET /transactions
     */
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get a specific transaction by ID
     * GET /transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransaction(@PathVariable String id) {
        Optional<Transaction> transaction = transactionService.getTransaction(id);
        return transaction.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get transactions filtered by category
     * GET /transactions/filter/category?category=Food
     */
    @GetMapping("/filter/category")
    public ResponseEntity<List<Transaction>> getTransactionsByCategory(
            @RequestParam String category) {
        List<Transaction> transactions = transactionService.getTransactionsByCategory(category);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions filtered by date range
     * GET /transactions/filter/date?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/filter/date")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions filtered by type (INCOME or EXPENSE)
     * GET /transactions/filter/type?type=INCOME
     */
    @GetMapping("/filter/type")
    public ResponseEntity<List<Transaction>> getTransactionsByType(
            @RequestParam Transaction.TransactionType type) {
        List<Transaction> transactions = transactionService.getTransactionsByType(type);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Update an existing transaction
     * PUT /transactions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable String id,
            @RequestBody Transaction transaction) {
        try {
            Optional<Transaction> updatedTransaction = transactionService.updateTransaction(id, transaction);
            return updatedTransaction.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a transaction
     * DELETE /transactions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        if (transactionService.deleteTransaction(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get summary for a specific month
     * GET /transactions/summary?year=2024&month=3
     */
    @GetMapping("/summary")
    public ResponseEntity<TransactionSummary> getMonthSummary(
            @RequestParam int year,
            @RequestParam int month) {
        try {
            TransactionSummary summary = transactionService.getMonthSummary(year, month);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
