package com.financialplanner.ai;

import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
import org.springframework.stereotype.Component;

/**
 * Stub implementation of AiClient for initial testing
 * Returns hardcoded advice instead of calling real AI API
 */
@Component
public class StubAiClient implements AiClient {

    @Override
    public AnalysisResponse analyze(AnalysisRequest request, String financialData) {
        // Simple analysis based on financial data
        String advice = generateBasicAdvice(financialData);

        return AnalysisResponse.builder()
                .advice(advice)
                .analysisType("BASIC_ANALYSIS")
                .year(request.getYear())
                .month(request.getMonth())
                .build();
    }

    private String generateBasicAdvice(String financialData) {
        // Parse basic metrics from financial data
        // This is a simple implementation - in real scenario would use AI

        if (financialData.contains("netAmount\":-")) {
            return "Your expenses exceeded your income this month. Consider reviewing your spending patterns and creating a budget to improve your financial health.";
        } else if (financialData.contains("totalExpense\":0")) {
            return "No expenses recorded for this month. Great job on saving! Consider setting up automatic savings transfers.";
        } else {
            return "Your finances are in good shape this month. Keep up the good work! Consider investing any surplus for long-term growth.";
        }
    }
}
