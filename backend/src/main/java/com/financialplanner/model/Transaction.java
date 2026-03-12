package com.financialplanner.model;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Transaction {
    private String id;
    private LocalDate date;
    private Double amount;
    private String category;
    private TransactionType type;
    private String description;

    /**
     * Enum to represent transaction type as INCOME or EXPENSE
     */
    public enum TransactionType {
        INCOME, EXPENSE
    }
}
