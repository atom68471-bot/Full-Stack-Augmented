package com.financialplanner.dto;

import lombok.*;

/**
 * DTO for analysis response containing AI-generated advice
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AnalysisResponse {
    private String advice;
    private String analysisType;
    private int year;
    private int month;
}
