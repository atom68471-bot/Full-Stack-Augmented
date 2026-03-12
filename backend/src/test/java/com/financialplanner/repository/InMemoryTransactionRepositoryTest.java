package com.financialplanner.repository;

import com.financialplanner.model.Transaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class InMemoryTransactionRepositoryTest {

    private InMemoryTransactionRepository repository;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        repository = new InMemoryTransactionRepository();
        transaction = Transaction.builder()
                .date(LocalDate.now())
                .amount(100.0)
                .category("Food")
                .type(Transaction.TransactionType.EXPENSE)
                .description("Lunch")
                .build();
    }

    @Test
    void testSave_GeneratesId() {
        Transaction saved = repository.save(transaction);

        assertNotNull(saved.getId());
    }

    @Test
    void testSave_UpdatesExisting() {
        Transaction saved1 = repository.save(transaction);
        String id = saved1.getId();

        transaction.setId(id);
        transaction.setAmount(200.0);
        Transaction saved2 = repository.save(transaction);

        assertEquals(id, saved2.getId());
        assertEquals(200.0, saved2.getAmount());
    }

    @Test
    void testFindById_Success() {
        Transaction saved = repository.save(transaction);

        Optional<Transaction> found = repository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals(saved.getId(), found.get().getId());
    }

    @Test
    void testFindById_NotFound() {
        Optional<Transaction> found = repository.findById("non-existent-id");

        assertFalse(found.isPresent());
    }

    @Test
    void testFindAll() {
        repository.save(transaction);

        Transaction transaction2 = Transaction.builder()
                .date(LocalDate.now())
                .amount(50.0)
                .category("Transport")
                .type(Transaction.TransactionType.EXPENSE)
                .description("Uber")
                .build();
        repository.save(transaction2);

        List<Transaction> transactions = repository.findAll();

        assertEquals(2, transactions.size());
    }

    @Test
    void testFindByCategory() {
        repository.save(transaction);

        Transaction transaction2 = Transaction.builder()
                .date(LocalDate.now())
                .amount(50.0)
                .category("Transport")
                .type(Transaction.TransactionType.EXPENSE)
                .description("Uber")
                .build();
        repository.save(transaction2);

        List<Transaction> foodTransactions = repository.findByCategory("Food");

        assertEquals(1, foodTransactions.size());
        assertEquals("Food", foodTransactions.get(0).getCategory());
    }

    @Test
    void testDelete() {
        Transaction saved = repository.save(transaction);

        boolean deleted = repository.delete(saved.getId());

        assertTrue(deleted);
        assertFalse(repository.findById(saved.getId()).isPresent());
    }

    @Test
    void testDeleteAll() {
        repository.save(transaction);
        repository.save(Transaction.builder()
                .date(LocalDate.now())
                .amount(50.0)
                .category("Transport")
                .type(Transaction.TransactionType.EXPENSE)
                .description("Uber")
                .build());

        repository.deleteAll();

        assertEquals(0, repository.findAll().size());
    }
}
