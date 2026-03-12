package com.financialplanner.dto;

import lombok.*;

/**
 * DTO for analysis request containing year and month
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AnalysisRequest {
    private int year;
    private int month;
}
