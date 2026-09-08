package devPilot.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.dto.ChatMessageRequest;
import devPilot.backend.dto.ChatMessageResponse;
import devPilot.backend.dto.ChatSessionResponse;
import devPilot.backend.dto.CitationDto;

import devPilot.backend.entity.ChatMessage;
import devPilot.backend.entity.ChatSession;
import devPilot.backend.entity.MessageRole;
import devPilot.backend.entity.Repository;
import devPilot.backend.entity.User;

import devPilot.backend.exceptions.NotFoundException;

import devPilot.backend.repository.ChatMessageRepository;
import devPilot.backend.repository.ChatSessionRepository;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.ai.CitationMapper;

import devPilot.backend.services.ai.GroqChatService;

@Service
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GroqChatService groqChatService;
    private final CitationMapper citationMapper;

    public ChatService(
        ChatSessionRepository chatSessionRepository,
        ChatMessageRepository chatMessageRepository,
        RepositoryRepository repositoryRepository,
        UserService userService,
        GroqChatService groqChatService,
        CitationMapper citationMapper
    ) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.repositoryRepository = repositoryRepository;
        this.userService = userService;
        this.groqChatService = groqChatService;
        this.citationMapper = citationMapper;
    }

    @Transactional
    public ChatSessionResponse createSession(UUID userId, UUID repositoryId) {
        User user = userService.requiredById(userId);
        Repository repo = repositoryRepository.findByUserIdAndId(userId, repositoryId)
            .orElseGet(() -> repositoryRepository.findById(repositoryId)
                .orElseGet(() -> {
                    List<Repository> repos = repositoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
                    if (!repos.isEmpty()) return repos.get(0);
                    return repositoryRepository.save(Repository.builder()
                        .userId(userId)
                        .githubRepoId(999999L)
                        .owner("DevPilot")
                        .name("devpilot-project")
                        .fullName("DevPilot/devpilot-project")
                        .isPrivate(false)
                        .defaultBranch("main")
                        .language("Java")
                        .htmlUrl("https://github.com/Byte-Architect-ot/DevPilot")
                        .description("DevPilot Intelligent Code Assistant Repository")
                        .indexStatus(devPilot.backend.entity.IndexStatus.READY)
                        .build());
                }));

        ChatSession session = new ChatSession(user, repo);
        ChatSession saved = chatSessionRepository.save(session);
        return ChatSessionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getUserSessions(UUID userId, UUID repositoryId) {
        List<ChatSession> sessions;
        if (repositoryId != null) {
            sessions = chatSessionRepository.findByUserIdAndRepositoryIdOrderByLastInteractionAtDesc(userId, repositoryId);
        } else {
            sessions = chatSessionRepository.findByUserIdOrderByLastInteractionAtDesc(userId);
        }
        return sessions.stream().map(ChatSessionResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ChatSessionResponse getSession(UUID userId, UUID sessionId) {
        ChatSession session = chatSessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new NotFoundException("Chat session not found with id: " + sessionId));
        return ChatSessionResponse.fromEntity(session);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(UUID userId, UUID sessionId) {
        ChatSession session = chatSessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new NotFoundException("Chat session not found with id: " + sessionId));

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(session.getId());
        return messages.stream().map(m -> {
            List<CitationDto> citations = citationMapper.fromJson(m.getCitationsJson());
            return ChatMessageResponse.fromEntity(m, citations);
        }).toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID userId, ChatMessageRequest request) {
        User user = userService.requiredById(userId);
        ChatSession session;

        if (request.sessionId() != null) {
            session = chatSessionRepository.findByIdAndUserId(request.sessionId(), userId)
                .orElseThrow(() -> new NotFoundException("Chat session not found with id: " + request.sessionId()));
        } else {
            // Find repo — fall back to first user repo if repositoryId is missing/invalid
            Repository repo = null;
            if (request.repositoryId() != null) {
                repo = repositoryRepository.findByUserIdAndId(userId, request.repositoryId())
                    .or(() -> repositoryRepository.findById(request.repositoryId()))
                    .orElse(null);
            }
            if (repo == null) {
                List<Repository> userRepos = repositoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
                if (!userRepos.isEmpty()) {
                    repo = userRepos.get(0);
                } else {
                    repo = repositoryRepository.save(Repository.builder()
                        .userId(userId)
                        .githubRepoId(999999L)
                        .owner("DevPilot")
                        .name("devpilot-project")
                        .fullName("DevPilot/devpilot-project")
                        .isPrivate(false)
                        .defaultBranch("main")
                        .language("Java")
                        .htmlUrl("https://github.com/Byte-Architect-ot/DevPilot")
                        .description("DevPilot Intelligent Code Assistant Repository")
                        .indexStatus(devPilot.backend.entity.IndexStatus.READY)
                        .build());
                }
            }
            session = chatSessionRepository.save(new ChatSession(user, repo));
        }

        // Save user message
        ChatMessage userMsg = new ChatMessage(session, MessageRole.USER, request.message(), "[]");
        chatMessageRepository.save(userMsg);

        // Perform RAG vector search + Groq LLM inference
        GroqChatService.ChatResponse chatResponse = groqChatService.chat(
            session.getRepository().getId(),
            request.message(),
            request.apiKey()
        );

        List<CitationDto> dtos = chatResponse.sources() != null ? chatResponse.sources().stream().map(s ->
            new CitationDto(s.filePath(), s.startLine(), s.endLine(), s.score(), s.snippet())
        ).toList() : List.of();

        String citationsJson = citationMapper.toJson(dtos);

        // Save assistant response
        ChatMessage assistantMsg = new ChatMessage(session, MessageRole.ASSISTANT, chatResponse.answer(), citationsJson);
        ChatMessage savedAssistantMsg = chatMessageRepository.save(assistantMsg);

        session.setLastInteractionAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        return ChatMessageResponse.fromEntity(savedAssistantMsg, dtos);
    }
}
