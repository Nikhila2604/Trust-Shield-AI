package com.truthshield.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> analyzeContent(String headline, String content, String sourceUrl) {
        String effectiveKey = apiKey;
        if (effectiveKey == null || effectiveKey.isEmpty() || effectiveKey.equals("MY_GEMINI_API_KEY")) {
            effectiveKey = System.getenv("GEMINI_API_KEY");
        }

        if (effectiveKey == null || effectiveKey.isEmpty() || effectiveKey.equals("MY_GEMINI_API_KEY")) {
            // Return fallback heuristic map if api key is missing to keep service robust
            return getHeuristicFallback(headline, content, sourceUrl);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + effectiveKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String systemPrompt = "You are Truth Shield AI, an educational tool aiding users to evaluate and inspect clickbait, biases, and misinformation. " +
                    "Evaluate the user's provided Headline, Text, and optionally its Source URL. " +
                    "Return a full detailed analysis strictly formatted as a single JSON object. " +
                    "The explanation field must be returned in bullet outline (using • symbol) containing bold headings and hyperlinked trusted news agencies like Snopes or FactCheck.org. " +
                    "Provide 4 categoryPercentages for clickbait, emotionalManipulation, bias, and exaggeration as integers between 0 and 100. " +
                    "Do NOT put code snippet containers or backticks around the json.";

            String userPrompt = String.format("Headline: %s\nText: %s\nSource URL: %s", headline, content, sourceUrl != null ? sourceUrl : "None");

            // Build request matches the official Google Gemini endpoint schema: { contents: [{ parts: [{ text: "..." }] }], generationConfig: { responseMimeType: "application/json" } }
            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> part = new HashMap<>();
            part.put("text", systemPrompt + "\n\nUser Input to evaluate:\n" + userPrompt);
            
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(part));
            
            requestBody.put("contents", Collections.singletonList(contentMap));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.put("temperature", 0.1);
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map contentObj = (Map) firstCandidate.get("content");
                    if (contentObj != null) {
                        List parts = (List) contentObj.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            String textResponse = (String) firstPart.get("text");
                            if (textResponse != null) {
                                // Parse inner JSON string using standard jackson map conversion
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                return mapper.readValue(textResponse.trim(), Map.class);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini HTTP client evaluation error in Spring Boot context, activating heuristic engine: " + e.getMessage());
        }

        return getHeuristicFallback(headline, content, sourceUrl);
    }

    private Map<String, Object> getHeuristicFallback(String headline, String content, String sourceUrl) {
        int score = 25;
        String combined = (headline + " " + content).toLowerCase();
        
        List<Map<String, String>> suspiciousPhrases = new ArrayList<>();
        if (combined.contains("breaking") || combined.contains("shocking")) {
            score += 30;
            Map<String, String> phrase = new HashMap<>();
            phrase.put("phrase", combined.contains("breaking") ? "BREAKING" : "SHOCKING");
            phrase.put("reason", "Highly sensationalized attention triggers designed to spark immediate panic.");
            suspiciousPhrases.add(phrase);
        }
        
        if (combined.contains("must share") || combined.contains("urgent")) {
            score += 25;
            Map<String, String> phrase = new HashMap<>();
            phrase.put("phrase", combined.contains("urgent") ? "URGENT" : "MUST SHARE");
            phrase.put("reason", "Pressures readers to react immediately, blocking critical evaluation.");
            suspiciousPhrases.add(phrase);
        }

        int finalScore = Math.min(95, Math.max(8, score));
        String trustLevel = finalScore < 35 ? "Trustworthy" : finalScore < 75 ? "Suspicious" : "Dangerous";

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("fakeProbabilityScore", finalScore);
        fallback.put("trustLevel", trustLevel);
        fallback.put("explanation", "• **Heuristic Warnings:** Standard clickbait headers and urgent emotional triggers were recognized in this submission. Open verifying portals to inspect claims.\n" +
                "• **Recommended Check:** Cross-reference this statement on independent fact-check sites: Snopes (https://www.snopes.com) or Google Fact Check Explorer.");
        fallback.put("riskIndicators", Arrays.asList("Clickbait Headline", "Emotional Manipulation"));
        fallback.put("suspiciousPhrases", suspiciousPhrases);
        fallback.put("recommendedAction", "Verify from regional global journals before sharing with household peers.");

        Map<String, Integer> categoryPercentages = new HashMap<>();
        categoryPercentages.put("clickbait", Math.min(100, finalScore + 10));
        categoryPercentages.put("emotionalManipulation", Math.min(100, finalScore));
        categoryPercentages.put("bias", Math.min(100, finalScore - 10));
        categoryPercentages.put("exaggeration", Math.min(100, finalScore + 5));
        fallback.put("categoryPercentages", categoryPercentages);

        return fallback;
    }
}
