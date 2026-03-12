package com.financialplanner.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;
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

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AnalysisResponse analyze(AnalysisRequest request, String financialData) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("OpenAI API key not configured, falling back to stub analysis");
            return new StubAiClient().analyze(request, financialData);
        }

        try {
            log.info("Calling OpenAI API for analysis of {}/{}", request.getYear(), request.getMonth());

            String prompt = buildAnalysisPrompt(request, financialData);
            String response = callOpenAiApi(prompt);

            return AnalysisResponse.builder()
                    .advice(extractAdviceFromResponse(response))
                    .analysisType("OPENAI_ANALYSIS")
                    .year(request.getYear())
                    .month(request.getMonth())
                    .build();

        } catch (Exception e) {
            log.error("Error calling OpenAI API, falling back to stub", e);
            return new StubAiClient().analyze(request, financialData);
        }
    }

    private String buildAnalysisPrompt(AnalysisRequest request, String financialData) {
        return String.format(
            "You are a financial advisor. Analyze this monthly financial data for %d/%d and provide personalized saving advice:\n\n" +
            "Financial Data: %s\n\n" +
            "Please provide concise, actionable advice in 2-3 sentences focusing on:\n" +
            "1. Current financial health assessment\n" +
            "2. Specific recommendations for improvement\n" +
            "3. One positive encouragement\n\n" +
            "Keep the response under 150 words.",
            request.getMonth(), request.getYear(), financialData
        );
    }

    private String callOpenAiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String requestBody = String.format(
            "{\"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}], \"max_tokens\": 200}",
            prompt.replace("\"", "\\\"")
        );

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
}
