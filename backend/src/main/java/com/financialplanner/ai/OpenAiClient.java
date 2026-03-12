package com.financialplanner.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
import com.financialplanner.service.TransactionSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * OpenAI implementation of AiClient for financial analysis
 */
@Component
@Primary
@Slf4j
public class OpenAiClient implements AiClient {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1}")
    private String apiUrl;

    private RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // default constructor used by Spring
    public OpenAiClient() {
        this.restTemplate = new RestTemplate();
    }

    // visible for testing
    OpenAiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public AnalysisResponse analyze(AnalysisRequest request, String financialData) {
        // if we don't have an API key configured or an error occurs we generate a
        // simple, hard‑coded response rather than relying on a separate stub class.
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("OpenAI API key not configured, using internal fallback analysis");
            return fallbackAnalysis(request, financialData);
        }

        try {
            TransactionSummary summary = objectMapper.readValue(financialData, TransactionSummary.class);
            log.info("Calling OpenAI API for analysis of {}/{}", summary.getYear(), summary.getMonth());

            String prompt = buildAnalysisPrompt(summary, financialData);
            String response = callOpenAiApi(prompt);

            return AnalysisResponse.builder()
                    .year(summary.getYear())
                    .month(summary.getMonth())
                    .totalIncome(summary.getTotalIncome())
                    .totalExpense(summary.getTotalExpense())
                    .netAmount(summary.getNetAmount())
                    .transactionCount(summary.getTransactionCount())
                    .advice(extractAdviceFromResponse(response))
                    .categoryBreakdown(new java.util.HashMap<>())
                    .build();

        } catch (Exception e) {
            log.error("Error calling OpenAI API, using internal fallback", e);
            return fallbackAnalysis(request, financialData);
        }
    }

    private String buildAnalysisPrompt(TransactionSummary summary, String financialData) {
        return String.format(
            "You are a financial advisor. Analyze this monthly financial data for %d/%d and provide personalized saving advice:\n\n" +
            "Financial Data: %s\n\n" +
            "Please provide concise, actionable advice in 2-3 sentences focusing on:\n" +
            "1. Current financial health assessment\n" +
            "2. Specific recommendations for improvement\n" +
            "3. One positive encouragement\n\n" +
            "Keep the response under 150 words.",
            summary.getYear(), summary.getMonth(), financialData);
    }

    /**
     * Builds a JSON request body appropriate for the OpenAI chat/completions endpoint.
     * Extracted so that we can unit test quoting/escaping logic without hitting network.
     */
    String buildRequestBody(String prompt) {
        try {
            // use a map structure so ObjectMapper handles all necessary escaping
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("model", "gpt-3.5-turbo");
            java.util.Map<String, String> message = new java.util.HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            body.put("messages", java.util.Collections.singletonList(message));
            body.put("max_tokens", 200);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            // this should never happen; wrap in runtime if it does
            throw new RuntimeException("Unable to build JSON request body", e);
        }
    }

    /* package */ String callOpenAiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String requestBody = buildRequestBody(prompt);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            apiUrl + "/chat/completions",
            HttpMethod.POST,
            entity,
            String.class
        );

        return response.getBody();
    }

    private String extractAdviceFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("Error parsing OpenAI response", e);
            return "Unable to generate personalized advice at this time. Please review your transaction patterns manually.";
        }
    }

    // simple fallback used in lieu of the former StubAiClient
    private AnalysisResponse fallbackAnalysis(AnalysisRequest request, String financialData) {
        try {
            TransactionSummary summary = objectMapper.readValue(financialData, TransactionSummary.class);
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
