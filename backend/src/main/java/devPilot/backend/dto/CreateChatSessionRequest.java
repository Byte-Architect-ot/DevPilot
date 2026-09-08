package devPilot.backend.dto;

import java.util.UUID;

public record CreateChatSessionRequest(
    UUID repositoryId
) {}
