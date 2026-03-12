package com.financialplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialplanner.ai.AiClient;
import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Service for AI-powered financial analysis
 */
@Service
@Slf4j
public class AnalysisService {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AiClient aiClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Perform monthly financial analysis asynchronously
     */
    @Async
    public CompletableFuture<AnalysisResponse> analyzeMonthlyFinances(int year, int month) {
        try {
            log.info("Starting monthly analysis for {}/{}", year, month);

            // Get monthly summary
            TransactionSummary summary = transactionService.getMonthSummary(year, month);

            // Convert to JSON for AI processing
            String financialData = objectMapper.writeValueAsString(summary);

            // Create analysis request
            AnalysisRequest request = AnalysisRequest.builder()
                    .year(year)
                    .month(month)
                    .build();

            // Get AI analysis
            AnalysisResponse response = aiClient.analyze(request, financialData);

            log.info("Completed monthly analysis for {}/{}", year, month);
            return CompletableFuture.completedFuture(response);

        } catch (Exception e) {
            log.error("Error during monthly analysis for {}/{}", year, month, e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
