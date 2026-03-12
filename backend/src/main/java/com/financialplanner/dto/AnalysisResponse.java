package com.financialplanner.dto;

import lombok.*;

import java.util.Map;

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
    private int year;
    private int month;
    private double totalIncome;
    private double totalExpense;
    private double netAmount;
    private int transactionCount;
    private String advice;
    private Map<String, Double> categoryBreakdown;
}
