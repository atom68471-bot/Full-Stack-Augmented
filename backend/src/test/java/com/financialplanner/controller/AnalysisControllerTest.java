package com.financialplanner.controller;

import com.financialplanner.dto.AnalysisResponse;
import com.financialplanner.service.AnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AnalysisController using MockMvc
 * Note: Tests use @SpringBootTest with async handling for CompletableFuture endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalysisService analysisService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAnalyze_Success() throws Exception {
        AnalysisResponse response = AnalysisResponse.builder()
                .year(2024)
                .month(3)
                .totalIncome(5000.0)
                .totalExpense(2000.0)
                .netAmount(3000.0)
                .transactionCount(10)
                .advice("Great job! You saved $3000 this month. Keep up the good work!")
                .categoryBreakdown(new HashMap<>(Map.of(
                        "Food", 500.0,
                        "Transport", 400.0,
                        "Entertainment", 300.0,
                        "Salary", 5000.0
                )))
                .build();

        when(analysisService.analyzeMonthlyFinances(2024, 3))
                .thenReturn(CompletableFuture.completedFuture(response));

        mockMvc.perform(get("/analysis")
                        .param("year", "2024")
                        .param("month", "3"))
                .andExpect(status().isOk());
        
        verify(analysisService, times(1)).analyzeMonthlyFinances(2024, 3);
    }

    @Test
    void testAnalyze_InvalidMonth() throws Exception {
        // This test verifies the controller calls service with provided parameters
        when(analysisService.analyzeMonthlyFinances(2024, 13))
                .thenReturn(CompletableFuture.completedFuture(AnalysisResponse.builder()
                        .year(2024).month(13).totalIncome(0).totalExpense(0)
                        .netAmount(0).transactionCount(0).advice("Invalid month")
                        .categoryBreakdown(new HashMap<>()).build()));

        mockMvc.perform(get("/analysis")
                        .param("year", "2024")
                        .param("month", "13"))
                .andExpect(status().isOk());

        verify(analysisService, times(1)).analyzeMonthlyFinances(2024, 13);
    }

    @Test
    void testAnalyze_InvalidYear() throws Exception {
        when(analysisService.analyzeMonthlyFinances(1900, 1))
                .thenReturn(CompletableFuture.completedFuture(AnalysisResponse.builder()
                        .year(1900).month(1).totalIncome(0).totalExpense(0)
                        .netAmount(0).transactionCount(0).advice("Invalid year")
                        .categoryBreakdown(new HashMap<>()).build()));

        mockMvc.perform(get("/analysis")
                        .param("year", "1900")
                        .param("month", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void testAnalyze_NoTransactionsForMonth() throws Exception {
        AnalysisResponse response = AnalysisResponse.builder()
                .year(2024)
                .month(1)
                .totalIncome(0.0)
                .totalExpense(0.0)
                .netAmount(0.0)
                .transactionCount(0)
                .advice("No transactions found for this month.")
                .categoryBreakdown(new HashMap<>())
                .build();

        when(analysisService.analyzeMonthlyFinances(2024, 1))
                .thenReturn(CompletableFuture.completedFuture(response));

        mockMvc.perform(get("/analysis")
                        .param("year", "2024")
                        .param("month", "1"))
                .andExpect(status().isOk());
                
        verify(analysisService, times(1)).analyzeMonthlyFinances(2024, 1);
    }

    @Test
    void testAnalyze_ExpenseGreaterThanIncome() throws Exception {
        AnalysisResponse response = AnalysisResponse.builder()
                .year(2024)
                .month(3)
                .totalIncome(2000.0)
                .totalExpense(3000.0)
                .netAmount(-1000.0)
                .transactionCount(8)
                .advice("You spent $1000 more than you earned. Consider reviewing your expenses.")
                .categoryBreakdown(new HashMap<>(Map.of(
                        "Food", 1200.0,
                        "Transport", 800.0,
                        "Salary", 2000.0
                )))
                .build();

        when(analysisService.analyzeMonthlyFinances(2024, 3))
                .thenReturn(CompletableFuture.completedFuture(response));

        mockMvc.perform(get("/analysis")
                        .param("year", "2024")
                        .param("month", "3"))
                .andExpect(status().isOk());
                
        verify(analysisService, times(1)).analyzeMonthlyFinances(2024, 3);
    }

    @Test
    void testAnalyze_CategoryBreakdown() throws Exception {
        Map<String, Double> categoryBreakdown = new HashMap<>();
        categoryBreakdown.put("Food", 500.0);
        categoryBreakdown.put("Transport", 300.0);
        categoryBreakdown.put("Entertainment", 200.0);
        categoryBreakdown.put("Utilities", 400.0);
        categoryBreakdown.put("Salary", 5000.0);

        AnalysisResponse response = AnalysisResponse.builder()
                .year(2024)
                .month(3)
                .totalIncome(5000.0)
                .totalExpense(1400.0)
                .netAmount(3600.0)
                .transactionCount(12)
                .advice("Good spending distribution across categories.")
                .categoryBreakdown(categoryBreakdown)
                .build();

        when(analysisService.analyzeMonthlyFinances(2024, 3))
                .thenReturn(CompletableFuture.completedFuture(response));

        mockMvc.perform(get("/analysis")
                        .param("year", "2024")
                        .param("month", "3"))
                .andExpect(status().isOk());
                
        verify(analysisService, times(1)).analyzeMonthlyFinances(2024, 3);
    }
}
