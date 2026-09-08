package devPilot.backend.dto;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import devPilot.backend.entity.IndexStatus;
import devPilot.backend.entity.Repository;

public record RepositoryResponse(
    UUID id,
    Long githubRepoId,
    String owner,
    String name,
    String fullName,
    @JsonProperty("isPrivate") boolean isPrivate,
    String defaultBranch,
    String language,
    String htmlUrl,
    String description,
    IndexStatus indexStatus,
    Instant indexedAt,
    int chunkCount,
    int filesProcessed,
    int filesTotal,
    String errorMessage,
    Instant createdAt,
    Instant updatedAt
) {
    public static RepositoryResponse fromEntity(Repository repo) {
        if (repo == null) return null;
        return new RepositoryResponse(
            repo.getId(),
            repo.getGithubRepoId(),
            repo.getOwner(),
            repo.getName(),
            repo.getFullName(),
            repo.isPrivate(),
            repo.getDefaultBranch(),
            repo.getLanguage(),
            repo.getHtmlUrl(),
            repo.getDescription(),
            repo.getIndexStatus(),
            repo.getIndexedAt(),
            repo.getChunkCount(),
            repo.getFilesProcessed(),
            repo.getFilesTotal(),
            repo.getErrorMessage(),
            repo.getCreatedAt(),
            repo.getUpdatedAt()
        );
    }
}