package com.financialplanner.controller;

import com.financialplanner.dto.AnalysisResponse;
import com.financialplanner.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * REST controller for AI analysis endpoint
 */
@RestController
@RequestMapping("/analysis")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    /**
     * Trigger analysis for a given month/year
     * GET /analysis?year=2024&month=3
     */
    @GetMapping
    public CompletableFuture<ResponseEntity<AnalysisResponse>> analyze(
            @RequestParam int year,
            @RequestParam int month) {
        return analysisService.analyzeMonthlyFinances(year, month)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> ResponseEntity.badRequest().build());
    }
}
