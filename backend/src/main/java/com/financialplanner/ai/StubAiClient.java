package com.financialplanner.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
import com.financialplanner.service.TransactionSummary;
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
        try {
            ObjectMapper mapper = new ObjectMapper();
            TransactionSummary summary = mapper.readValue(financialData, TransactionSummary.class);
            String advice = generateBasicAdvice(summary);

            return AnalysisResponse.builder()
                    .year(summary.getYear())
                    .month(summary.getMonth())
                    .totalIncome(summary.getTotalIncome())
                    .totalExpense(summary.getTotalExpense())
                    .netAmount(summary.getNetAmount())
                    .transactionCount(summary.getTransactionCount())
                    .advice(advice)
                    .categoryBreakdown(new java.util.HashMap<>())
                    .build();
        } catch (Exception e) {
            return AnalysisResponse.builder()
                    .year(request.getYear())
                    .month(request.getMonth())
                    .advice("Unable to analyze financial data")
                    .build();
        }
    }

    private String generateBasicAdvice(TransactionSummary summary) {
        // Generate advice based on financial summary

        if (summary.getNetAmount() < 0) {
            return "Your expenses exceeded your income this month. Consider reviewing your spending patterns and creating a budget to improve your financial health.";
        } else if (summary.getTotalExpense() == 0) {
            return "No expenses recorded for this month. Great job on saving! Consider setting up automatic savings transfers.";
        } else {
            double savingsRate = (summary.getNetAmount() / summary.getTotalIncome()) * 100;
            return String.format("Your finances are in good shape this month with a savings rate of %.1f%%. Keep up the good work! Consider investing any surplus for long-term growth.", savingsRate);
        }
    }
}
