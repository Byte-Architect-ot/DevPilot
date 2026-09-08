package devPilot.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.ChatMessageRequest;
import devPilot.backend.dto.ChatMessageResponse;
import devPilot.backend.dto.ChatSessionResponse;
import devPilot.backend.dto.CreateChatSessionRequest;
import devPilot.backend.entity.User;
import devPilot.backend.security.CurrentUser;
import devPilot.backend.services.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/sessions")
    public ChatSessionResponse createSession(
        @CurrentUser User user,
        @RequestBody CreateChatSessionRequest request
    ) {
        return chatService.createSession(user.getId(), request.repositoryId());
    }

    @GetMapping("/sessions")
    public List<ChatSessionResponse> getSessions(
        @CurrentUser User user,
        @RequestParam(required = false) UUID repositoryId
    ) {
        return chatService.getUserSessions(user.getId(), repositoryId);
    }

    @GetMapping("/sessions/{sessionId}")
    public ChatSessionResponse getSession(
        @CurrentUser User user,
        @PathVariable UUID sessionId
    ) {
        return chatService.getSession(user.getId(), sessionId);
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public List<ChatMessageResponse> getSessionMessages(
        @CurrentUser User user,
        @PathVariable UUID sessionId
    ) {
        return chatService.getSessionMessages(user.getId(), sessionId);
    }

    @PostMapping("/messages")
    public ChatMessageResponse sendMessage(
        @CurrentUser User user,
        @RequestBody ChatMessageRequest request
    ) {
        return chatService.sendMessage(user.getId(), request);
    }
}
