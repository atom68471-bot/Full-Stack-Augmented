package com.financialplanner.repository;

import com.financialplanner.model.Transaction;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * In-memory implementation of TransactionRepository using a HashMap
 */
@Repository
public class InMemoryTransactionRepository implements TransactionRepository {

    private final Map<String, Transaction> store = new HashMap<>();

    @Override
    public Transaction save(Transaction transaction) {
        if (transaction.getId() == null) {
            transaction.setId(UUID.randomUUID().toString());
        }
        store.put(transaction.getId(), transaction);
        return transaction;
    }

    @Override
    public Optional<Transaction> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Transaction> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<Transaction> findByCategory(String category) {
        return store.values().stream()
                .filter(t -> t.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    @Override
    public List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate) {
        return store.values().stream()
                .filter(t -> !t.getDate().isBefore(startDate) && !t.getDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    @Override
    public List<Transaction> findByType(Transaction.TransactionType type) {
        return store.values().stream()
                .filter(t -> t.getType() == type)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Transaction> update(String id, Transaction transaction) {
        if (store.containsKey(id)) {
            transaction.setId(id);
            store.put(id, transaction);
            return Optional.of(transaction);
        }
        return Optional.empty();
    }

    @Override
    public boolean delete(String id) {
        return store.remove(id) != null;
    }

    @Override
    public void deleteAll() {
        store.clear();
    }
}
