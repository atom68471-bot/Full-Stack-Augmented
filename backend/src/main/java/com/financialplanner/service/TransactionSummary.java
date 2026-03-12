package com.financialplanner.service;

import lombok.*;

/**
 * DTO for transaction summary data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TransactionSummary {
    private int year;
    private int month;
    private double totalIncome;
    private double totalExpense;
    private double netAmount;
    private int transactionCount;
}
