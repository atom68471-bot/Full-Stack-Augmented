package com.financialplanner.controller;

import com.financialplanner.model.Transaction;
import com.financialplanner.service.TransactionService;
import com.financialplanner.service.TransactionSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for TransactionController using MockMvc
 */
@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    private Transaction transaction;
    private List<Transaction> transactionList;

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

        transactionList = new ArrayList<>();
        transactionList.add(transaction);
    }

    @Test
    void testCreateTransaction_Success() throws Exception {
        when(transactionService.createTransaction(any())).thenReturn(transaction);

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.amount", is(100.0)))
                .andExpect(jsonPath("$.category", is("Food")));

        verify(transactionService, times(1)).createTransaction(any());
    }

    @Test
    void testCreateTransaction_InvalidAmount() throws Exception {
        when(transactionService.createTransaction(any()))
                .thenThrow(new IllegalArgumentException("Amount must be positive"));

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAllTransactions_Success() throws Exception {
        when(transactionService.getAllTransactions()).thenReturn(transactionList);

        mockMvc.perform(get("/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("1")))
                .andExpect(jsonPath("$[0].category", is("Food")));

        verify(transactionService, times(1)).getAllTransactions();
    }

    @Test
    void testGetAllTransactions_Empty() throws Exception {
        when(transactionService.getAllTransactions()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetTransaction_Success() throws Exception {
        when(transactionService.getTransaction("1")).thenReturn(Optional.of(transaction));

        mockMvc.perform(get("/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.amount", is(100.0)));

        verify(transactionService, times(1)).getTransaction("1");
    }

    @Test
    void testGetTransaction_NotFound() throws Exception {
        when(transactionService.getTransaction("999")).thenReturn(Optional.empty());

        mockMvc.perform(get("/transactions/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetTransactionsByCategory_Success() throws Exception {
        when(transactionService.getTransactionsByCategory("Food")).thenReturn(transactionList);

        mockMvc.perform(get("/transactions/filter/category")
                        .param("category", "Food"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].category", is("Food")));

        verify(transactionService, times(1)).getTransactionsByCategory("Food");
    }

    @Test
    void testGetTransactionsByCategory_Empty() throws Exception {
        when(transactionService.getTransactionsByCategory("NonExistent"))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/transactions/filter/category")
                        .param("category", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetTransactionsByDateRange_Success() throws Exception {
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        when(transactionService.getTransactionsByDateRange(startDate, endDate))
                .thenReturn(transactionList);

        mockMvc.perform(get("/transactions/filter/date")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(transactionService, times(1))
                .getTransactionsByDateRange(startDate, endDate);
    }

    @Test
    void testGetTransactionsByType_Income() throws Exception {
        Transaction incomeTransaction = Transaction.builder()
                .id("2")
                .date(LocalDate.now())
                .amount(5000.0)
                .category("Salary")
                .type(Transaction.TransactionType.INCOME)
                .description("Monthly salary")
                .build();

        List<Transaction> incomeList = new ArrayList<>();
        incomeList.add(incomeTransaction);

        when(transactionService.getTransactionsByType(Transaction.TransactionType.INCOME))
                .thenReturn(incomeList);

        mockMvc.perform(get("/transactions/filter/type")
                        .param("type", "INCOME"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].type", is("INCOME")));

        verify(transactionService, times(1))
                .getTransactionsByType(Transaction.TransactionType.INCOME);
    }

    @Test
    void testUpdateTransaction_Success() throws Exception {
        transaction.setAmount(150.0);
        when(transactionService.updateTransaction("1", transaction))
                .thenReturn(Optional.of(transaction));

        mockMvc.perform(put("/transactions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.amount", is(150.0)));

        verify(transactionService, times(1)).updateTransaction("1", transaction);
    }

    @Test
    void testUpdateTransaction_NotFound() throws Exception {
        when(transactionService.updateTransaction("999", transaction))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/transactions/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateTransaction_InvalidData() throws Exception {
        when(transactionService.updateTransaction("1", transaction))
                .thenThrow(new IllegalArgumentException("Invalid transaction data"));

        mockMvc.perform(put("/transactions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteTransaction_Success() throws Exception {
        when(transactionService.deleteTransaction("1")).thenReturn(true);

        mockMvc.perform(delete("/transactions/1"))
                .andExpect(status().isNoContent());

        verify(transactionService, times(1)).deleteTransaction("1");
    }

    @Test
    void testDeleteTransaction_NotFound() throws Exception {
        when(transactionService.deleteTransaction("999")).thenReturn(false);

        mockMvc.perform(delete("/transactions/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetMonthSummary_Success() throws Exception {
        TransactionSummary summary = TransactionSummary.builder()
                .year(2024)
                .month(3)
                .totalIncome(5000.0)
                .totalExpense(2000.0)
                .netAmount(3000.0)
                .transactionCount(10)
                .build();

        when(transactionService.getMonthSummary(2024, 3)).thenReturn(summary);

        mockMvc.perform(get("/transactions/summary")
                        .param("year", "2024")
                        .param("month", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.year", is(2024)))
                .andExpect(jsonPath("$.month", is(3)))
                .andExpect(jsonPath("$.totalIncome", is(5000.0)))
                .andExpect(jsonPath("$.totalExpense", is(2000.0)))
                .andExpect(jsonPath("$.netAmount", is(3000.0)));

        verify(transactionService, times(1)).getMonthSummary(2024, 3);
    }

    @Test
    void testGetMonthSummary_InvalidMonth() throws Exception {
        when(transactionService.getMonthSummary(2024, 13))
                .thenThrow(new IllegalArgumentException("Invalid month"));

        mockMvc.perform(get("/transactions/summary")
                        .param("year", "2024")
                        .param("month", "13"))
                .andExpect(status().isBadRequest());
    }
}
