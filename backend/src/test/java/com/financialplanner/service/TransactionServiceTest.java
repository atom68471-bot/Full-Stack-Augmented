package com.financialplanner.service;

import com.financialplanner.model.Transaction;
import com.financialplanner.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction transaction;

    @BeforeEach
    void setUp() {
        transaction = Transaction.builder()
                .id("1")
                .date(LocalDate.now())
                .amount(100.0)
                .category("Food")
                .type(Transaction.TransactionType.EXPENSE)
                .description("Lunch")
                .build();
    }

    @Test
    void testCreateTransaction_Success() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        Transaction result = transactionService.createTransaction(transaction);

        assertNotNull(result);
        assertEquals(transaction.getId(), result.getId());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testCreateTransaction_InvalidAmount() {
        transaction.setAmount(-10.0);

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.createTransaction(transaction);
        });
    }

    @Test
    void testCreateTransaction_NullCategory() {
        transaction.setCategory(null);

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.createTransaction(transaction);
        });
    }

    @Test
    void testGetTransaction_Success() {
        when(transactionRepository.findById("1")).thenReturn(Optional.of(transaction));

        Optional<Transaction> result = transactionService.getTransaction("1");

        assertTrue(result.isPresent());
        assertEquals(transaction.getId(), result.get().getId());
        verify(transactionRepository, times(1)).findById("1");
    }

    @Test
    void testGetAllTransactions() {
        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);
        when(transactionRepository.findAll()).thenReturn(transactions);

        List<Transaction> result = transactionService.getAllTransactions();

        assertEquals(1, result.size());
        verify(transactionRepository, times(1)).findAll();
    }

    @Test
    void testDeleteTransaction_Success() {
        when(transactionRepository.delete("1")).thenReturn(true);

        boolean result = transactionService.deleteTransaction("1");

        assertTrue(result);
        verify(transactionRepository, times(1)).delete("1");
    }

    @Test
    void testGetMonthSummary() {
        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);
        when(transactionRepository.findByDateBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(transactions);

        TransactionSummary summary = transactionService.getMonthSummary(2024, 3);

        assertNotNull(summary);
        assertEquals(2024, summary.getYear());
        assertEquals(3, summary.getMonth());
        assertEquals(0, summary.getTotalIncome());
        assertEquals(100.0, summary.getTotalExpense());
        verify(transactionRepository, times(1)).findByDateBetween(any(LocalDate.class), any(LocalDate.class));
    }
}
