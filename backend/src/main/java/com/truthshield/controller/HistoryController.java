package com.truthshield.controller;

import com.truthshield.model.ScanHistory;
import com.truthshield.model.UserAccount;
import com.truthshield.repository.ScanHistoryRepository;
import com.truthshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HistoryController {

    @Autowired
    private ScanHistoryRepository scanHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper to extract mock authenticated User details from header
    private UserAccount getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String[] parts = token.split("_");
        if (parts.length >= 3 && parts[0].equals("token")) {
            try {
                Long userId = Long.parseLong(parts[2]);
                return userRepository.findById(userId).orElse(null);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserAccount user = getAuthenticatedUser(authHeader);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Access token is invalid or missing.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        List<ScanHistory> historyList = scanHistoryRepository.findByUserIdOrderByScannedAtDesc(user.getId());
        return ResponseEntity.ok(historyList);
    }

    @PostMapping("/analyze-news")
    public ResponseEntity<?> recordNewsScan(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> requestBody) {
        
        UserAccount user = getAuthenticatedUser(authHeader);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please verify your auth profile to save scans.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String headline = (String) requestBody.get("headline");
        String content = (String) requestBody.get("content");
        String sourceUrl = (String) requestBody.get("sourceUrl");
        Integer fakeProbabilityScore = (Integer) requestBody.get("fakeProbabilityScore");
        String trustLevel = (String) requestBody.get("trustLevel");
        String explanation = (String) requestBody.get("explanation");

        if (headline == null || content == null || fakeProbabilityScore == null || trustLevel == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Required analysis fields are missing.");
            return ResponseEntity.badRequest().body(error);
        }

        ScanHistory newHistoryItem = new ScanHistory(
                user,
                headline.trim(),
                content.trim(),
                sourceUrl != null ? sourceUrl.trim() : null,
                fakeProbabilityScore,
                trustLevel.trim(),
                explanation != null ? explanation.trim() : ""
        );

        ScanHistory savedItem = scanHistoryRepository.save(newHistoryItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }
}
