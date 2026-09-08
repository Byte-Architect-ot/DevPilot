package devPilot.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import devPilot.backend.entity.ChatMessage;
import devPilot.backend.entity.MessageRole;

public record ChatMessageResponse(
    UUID id,
    UUID sessionId,
    MessageRole role,
    String content,
    List<CitationDto> sources,
    LocalDateTime timestamp
) {
    public static ChatMessageResponse fromEntity(ChatMessage msg, List<CitationDto> citations) {
        if (msg == null) return null;
        return new ChatMessageResponse(
            msg.getId(),
            msg.getChatSession() != null ? msg.getChatSession().getId() : null,
            msg.getRole(),
            msg.getContent(),
            citations != null ? citations : List.of(),
            msg.getTimestamp()
        );
    }
}
