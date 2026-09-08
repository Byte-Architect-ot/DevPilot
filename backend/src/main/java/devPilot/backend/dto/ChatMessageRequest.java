package devPilot.backend.dto;

import java.util.UUID;

public record ChatMessageRequest(
    UUID sessionId,
    UUID repositoryId,
    String message,
    String apiKey
) {}
