package devPilot.backend.services.github;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.dto.RepositoryResponse;
import devPilot.backend.entity.IndexStatus;
import devPilot.backend.entity.Repository;
import devPilot.backend.entity.User;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.UserService;

@Service
public class RepoService {
    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient githubApiClient;

    public RepoService(RepositoryRepository repositoryRepository, UserService userService, GithubApiClient githubApiClient) {
        this.repositoryRepository = repositoryRepository;
        this.userService = userService;
        this.githubApiClient = githubApiClient;
    }

    @Transactional
    public List<RepositoryResponse> syncAndListRepos(UUID userId) {
        User user = userService.requiredById(userId);
        String token = userService.decryptAccessToken(user);

        List<Map<String, Object>> remoteRepos;
        try {
            remoteRepos = githubApiClient.listUserRepos(token);
        } catch (Exception e) {
            remoteRepos = new ArrayList<>();
        }

        List<Repository> savedEntities = new ArrayList<>();

        for (Map<String, Object> repoData : remoteRepos) {
            Long githubRepoId = toLong(repoData.get("id"));
            if (githubRepoId == null) {
                continue;
            }

            String repoName = (String) repoData.get("name");
            String fullName = (String) repoData.get("full_name");
            Boolean isPrivate = (Boolean) repoData.get("private");
            String defaultBranch = (String) repoData.get("default_branch");
            String language = (String) repoData.get("language");
            String htmlUrl = (String) repoData.get("html_url");
            String description = (String) repoData.get("description");

            Long stars = toLong(repoData.get("stargazers_count"));
            Long forks = toLong(repoData.get("forks_count"));

            String owner = "github-user";
            Object ownerObj = repoData.get("owner");
            if (ownerObj instanceof Map<?, ?> ownerMap) {
                Object loginObj = ownerMap.get("login");
                if (loginObj instanceof String ownerLogin) {
                    owner = ownerLogin;
                }
            }

            final String repoOwner = owner;

            Repository entity = repositoryRepository.findByUserIdAndGithubRepoId(userId, githubRepoId)
                .orElseGet(() -> Repository.builder()
                    .userId(userId)
                    .githubRepoId(githubRepoId)
                    .indexStatus(IndexStatus.PENDING)
                    .build());

            entity.setOwner(repoOwner);
            entity.setName(repoName != null ? repoName : "unnamed-repo");
            entity.setFullName(fullName);
            entity.setPrivate(Boolean.TRUE.equals(isPrivate));
            entity.setDefaultBranch(defaultBranch != null ? defaultBranch : "main");
            entity.setLanguage(language != null ? language : "Other");
            entity.setHtmlUrl(htmlUrl);
            entity.setDescription(description);

            if (stars != null) {
                entity.setChunkCount(stars.intValue());
            }
            if (forks != null) {
                entity.setFilesProcessed(forks.intValue());
            }

            savedEntities.add(repositoryRepository.save(entity));
        }

        if (savedEntities.isEmpty()) {
            savedEntities = repositoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        }

        return savedEntities.stream()
            .map(RepositoryResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> getUserRepos(UUID userId) {
        List<Repository> repos = repositoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (repos.isEmpty()) {
            return syncAndListRepos(userId);
        }
        return repos.stream()
            .map(RepositoryResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public RepositoryResponse getRepoById(UUID userId, UUID repoId) {
        Repository repo = repositoryRepository.findByUserIdAndId(userId, repoId)
            .orElseThrow(() -> new RuntimeException("Repository not found with id: " + repoId));
        return RepositoryResponse.fromEntity(repo);
    }

    private static Long toLong(Object value) {
        if (value instanceof Number num) {
            return num.longValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
