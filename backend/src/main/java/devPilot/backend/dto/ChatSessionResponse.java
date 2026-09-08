package devPilot.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import devPilot.backend.entity.ChatSession;

public record ChatSessionResponse(
    UUID id,
    UUID repositoryId,
    String repositoryName,
    LocalDateTime startedAt,
    LocalDateTime lastInteractionAt,
    int messageCount
) {
    public static ChatSessionResponse fromEntity(ChatSession session) {
        if (session == null) return null;
        return new ChatSessionResponse(
            session.getId(),
            session.getRepository() != null ? session.getRepository().getId() : null,
            session.getRepository() != null ? session.getRepository().getName() : null,
            session.getStartedAt(),
            session.getLastInteractionAt(),
            session.getMessages() != null ? session.getMessages().size() : 0
        );
    }
}
