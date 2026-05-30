package com.truthshield.controller;

import com.truthshield.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/analyze-live")
    public ResponseEntity<?> analyzeLiveNews(@RequestBody Map<String, String> requestBody) {
        String headline = requestBody.get("headline");
        String content = requestBody.get("content");
        String sourceUrl = requestBody.get("sourceUrl");

        if (content == null || content.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Article body content is required for evaluation.");
            return ResponseEntity.badRequest().body(error);
        }

        if (headline == null || headline.trim().isEmpty()) {
            headline = content.substring(0, Math.min(80, content.length())) + "...";
        }

        Map<String, Object> analysisResult = geminiService.analyzeContent(
                headline.trim(),
                content.trim(),
                sourceUrl != null ? sourceUrl.trim() : null
        );

        return ResponseEntity.ok(analysisResult);
    }
}
