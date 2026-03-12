package com.financialplanner.service;

import com.financialplanner.ai.AiClient;
import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
import com.financialplanner.model.Transaction;
import com.financialplanner.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private TransactionService transactionService;

    @Mock
    private AiClient aiClient;

    @InjectMocks
    private AnalysisService analysisService;

    private TransactionSummary summary;

    @BeforeEach
    void setUp() {
        summary = TransactionSummary.builder()
                .year(2024)
                .month(3)
                .totalIncome(1000)
                .totalExpense(500)
                .netAmount(500)
                .transactionCount(5)
                .build();
    }

    @Test
    void testAnalyzeMonthlyFinances_Success() throws Exception {
        when(transactionService.getMonthSummary(2024, 3)).thenReturn(summary);
        when(aiClient.analyze(any(AnalysisRequest.class), anyString()))
                .thenReturn(AnalysisResponse.builder()
                        .year(2024)
                        .month(3)
                        .totalIncome(1000)
                        .totalExpense(500)
                        .netAmount(500)
                        .transactionCount(5)
                        .advice("Test advice")
                        .categoryBreakdown(new java.util.HashMap<>())
                        .build());

        CompletableFuture<AnalysisResponse> future = analysisService.analyzeMonthlyFinances(2024, 3);
        AnalysisResponse response = future.get();

        assertNotNull(response);
        assertEquals("Test advice", response.getAdvice());
        assertEquals(2024, response.getYear());
        assertEquals(3, response.getMonth());
        verify(transactionService, times(1)).getMonthSummary(2024, 3);
        verify(aiClient, times(1)).analyze(any(AnalysisRequest.class), anyString());
    }

    @Test
    void testAnalyzeMonthlyFinances_Exception() throws Exception {
        when(transactionService.getMonthSummary(2024, 3)).thenThrow(new RuntimeException("fail"));

        CompletableFuture<AnalysisResponse> future = analysisService.analyzeMonthlyFinances(2024, 3);

        assertThrows(Exception.class, future::get);
    }
}
