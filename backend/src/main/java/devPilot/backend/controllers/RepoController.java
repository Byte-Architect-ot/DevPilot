package devPilot.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.RepositoryResponse;
import devPilot.backend.entity.User;
import devPilot.backend.security.CurrentUser;
import devPilot.backend.services.github.RepoService;

@RestController
@RequestMapping({"/api/repositories", "/api/repos"})
public class RepoController {

    private final RepoService repoService;

    public RepoController(RepoService repoService) {
        this.repoService = repoService;
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
}
