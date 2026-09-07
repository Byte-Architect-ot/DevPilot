package devPilot.backend.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "repositories",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "github_repo_id"}
    )
)
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "VARCHAR(36)")
    private UUID userId;

    @Column(name = "github_repo_id", nullable = false)
    private Long githubRepoId;

    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "is_private")
    private boolean isPrivate;

    @Column(name = "default_branch")
    private String defaultBranch;

    @Column(name = "language")
    private String language;

    @Column(name = "html_url", columnDefinition = "TEXT")
    private String htmlUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "index_status", nullable = false)
    private IndexStatus indexStatus = IndexStatus.PENDING;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount = 0;

    @Column(name = "files_processed", nullable = false)
    private int filesProcessed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP")
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMP")
    private Instant updatedAt;

    public Repository() {
    }

    public Repository(UUID id, UUID userId, Long githubRepoId, String owner, String name, String fullName, boolean isPrivate, String defaultBranch, String language, String htmlUrl, String description, IndexStatus indexStatus, Instant indexedAt, int chunkCount, int filesProcessed, String errorMessage, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.githubRepoId = githubRepoId;
        this.owner = owner;
        this.name = name;
        this.fullName = fullName;
        this.isPrivate = isPrivate;
        this.defaultBranch = defaultBranch;
        this.language = language;
        this.htmlUrl = htmlUrl;
        this.description = description;
        this.indexStatus = indexStatus != null ? indexStatus : IndexStatus.PENDING;
        this.indexedAt = indexedAt;
        this.chunkCount = chunkCount;
        this.filesProcessed = filesProcessed;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RepositoryBuilder builder() {
        return new RepositoryBuilder();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Long getGithubRepoId() {
        return githubRepoId;
    }

    public void setGithubRepoId(Long githubRepoId) {
        this.githubRepoId = githubRepoId;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IndexStatus getIndexStatus() {
        return indexStatus;
    }

    public void setIndexStatus(IndexStatus indexStatus) {
        this.indexStatus = indexStatus;
    }

    public Instant getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }

    public int getFilesProcessed() {
        return filesProcessed;
    }

    public void setFilesProcessed(int filesProcessed) {
        this.filesProcessed = filesProcessed;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (indexStatus == null) {
            indexStatus = IndexStatus.PENDING;
        }
    }

    public static class RepositoryBuilder {
        private UUID id;
        private UUID userId;
        private Long githubRepoId;
        private String owner;
        private String name;
        private String fullName;
        private boolean isPrivate;
        private String defaultBranch;
        private String language;
        private String htmlUrl;
        private String description;
        private IndexStatus indexStatus = IndexStatus.PENDING;
        private Instant indexedAt;
        private int chunkCount = 0;
        private int filesProcessed = 0;
        private String errorMessage;
        private Instant createdAt;
        private Instant updatedAt;

        RepositoryBuilder() {
        }

        public RepositoryBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public RepositoryBuilder userId(UUID userId) {
            this.userId = userId;
            return this;
        }

        public RepositoryBuilder githubRepoId(Long githubRepoId) {
            this.githubRepoId = githubRepoId;
            return this;
        }

        public RepositoryBuilder owner(String owner) {
            this.owner = owner;
            return this;
        }

        public RepositoryBuilder name(String name) {
            this.name = name;
            return this;
        }

        public RepositoryBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public RepositoryBuilder isPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
            return this;
        }

        public RepositoryBuilder defaultBranch(String defaultBranch) {
            this.defaultBranch = defaultBranch;
            return this;
        }

        public RepositoryBuilder language(String language) {
            this.language = language;
            return this;
        }

        public RepositoryBuilder htmlUrl(String htmlUrl) {
            this.htmlUrl = htmlUrl;
            return this;
        }

        public RepositoryBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RepositoryBuilder indexStatus(IndexStatus indexStatus) {
            this.indexStatus = indexStatus;
            return this;
        }

        public RepositoryBuilder indexedAt(Instant indexedAt) {
            this.indexedAt = indexedAt;
            return this;
        }

        public RepositoryBuilder chunkCount(int chunkCount) {
            this.chunkCount = chunkCount;
            return this;
        }

        public RepositoryBuilder filesProcessed(int filesProcessed) {
            this.filesProcessed = filesProcessed;
            return this;
        }

        public RepositoryBuilder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }

        public RepositoryBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RepositoryBuilder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Repository build() {
            return new Repository(id, userId, githubRepoId, owner, name, fullName, isPrivate, defaultBranch, language, htmlUrl, description, indexStatus, indexedAt, chunkCount, filesProcessed, errorMessage, createdAt, updatedAt);
        }
    }
}
