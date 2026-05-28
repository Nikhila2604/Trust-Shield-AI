package com.truthshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_history")
public class ScanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false, length = 255)
    private String headline;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_url", length = 2083)
    private String sourceUrl;

    @Column(name = "fake_probability_score", nullable = false)
    private Integer fakeProbabilityScore;

    @Column(name = "trust_level", nullable = false, length = 20)
    private String trustLevel;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    public ScanHistory() {
        this.scannedAt = LocalDateTime.now();
    }

    public ScanHistory(UserAccount user, String headline, String content, String sourceUrl, Integer fakeProbabilityScore, String trustLevel, String explanation) {
        this.user = user;
        this.headline = headline;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.fakeProbabilityScore = fakeProbabilityScore;
        this.trustLevel = trustLevel;
        this.explanation = explanation;
        this.scannedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public Integer getFakeProbabilityScore() {
        return fakeProbabilityScore;
    }

    public void setFakeProbabilityScore(Integer fakeProbabilityScore) {
        this.fakeProbabilityScore = fakeProbabilityScore;
    }

    public String getTrustLevel() {
        return trustLevel;
    }

    public void setTrustLevel(String trustLevel) {
        this.trustLevel = trustLevel;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }
}
