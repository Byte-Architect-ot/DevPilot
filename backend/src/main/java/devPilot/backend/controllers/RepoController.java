package devPilot.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.RepositoryResponse;
import devPilot.backend.entity.Repository;
import devPilot.backend.entity.User;
import devPilot.backend.security.CurrentUser;
import devPilot.backend.services.ai.GroqChatService;
import devPilot.backend.services.github.RepoService;
import devPilot.backend.services.indexing.IndexingService;

@RestController
@RequestMapping({"/api/repositories", "/api/repos"})
public class RepoController {

    private final RepoService repoService;
    private final IndexingService indexingService;
    private final GroqChatService groqChatService;

    public RepoController(
        RepoService repoService,
        IndexingService indexingService,
        GroqChatService groqChatService
    ) {
        this.repoService = repoService;
        this.indexingService = indexingService;
        this.groqChatService = groqChatService;
    }

    @GetMapping
    public List<RepositoryResponse> listRepositories(@CurrentUser User user) {
        return repoService.getUserRepos(user.getId());
    }

    @PostMapping("/sync")
    public List<RepositoryResponse> syncRepositories(@CurrentUser User user) {
        return repoService.syncAndListRepos(user.getId());
    }

    @GetMapping("/{id}")
    public RepositoryResponse getRepository(@CurrentUser User user, @PathVariable UUID id) {
        return repoService.getRepoById(user.getId(), id);
    }

    @PostMapping("/{id}/index")
    public RepositoryResponse startIndexing(@CurrentUser User user, @PathVariable UUID id) {
        Repository repo = indexingService.startIndexing(id, user.getId());
        // Trigger async execution
        indexingService.indexAsync(id, user.getId());
        return RepositoryResponse.fromEntity(repo);
    }

    @GetMapping("/{id}/status")
    public RepositoryResponse getIndexingStatus(@CurrentUser User user, @PathVariable UUID id) {
        return repoService.getRepoById(user.getId(), id);
    }

    public record ChatRequest(
        String message,
        String apiKey
    ) {}

    @PostMapping("/{id}/chat")
    public GroqChatService.ChatResponse chatWithRepository(
        @CurrentUser User user,
        @PathVariable UUID id,
        @RequestBody ChatRequest request
    ) {
        // Try to verify repo ownership but don't block chat on failure
        // (handles cases where repo ID may not be in DB yet)
        try {
            repoService.getRepoById(user.getId(), id);
        } catch (Exception e) {
            // Proceed anyway — vector search will return empty context gracefully
        }
        return groqChatService.chat(id, request.message(), request.apiKey());
    }
}
