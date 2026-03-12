package com.financialplanner.ai;

import com.financialplanner.dto.AnalysisRequest;
import com.financialplanner.dto.AnalysisResponse;

/**
 * Interface for AI client to provide financial analysis
 */
public interface AiClient {
    /**
     * Analyze financial data and provide advice
     */
    AnalysisResponse analyze(AnalysisRequest request, String financialData);
}
