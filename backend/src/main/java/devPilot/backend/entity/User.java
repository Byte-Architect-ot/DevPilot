package devPilot.backend.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @Column(nullable = false, unique = true, name = "github_id")
    private Long githubId;

    @Column(nullable = false, name = "github_username")
    private String githubUsername;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false, name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "token_scopes", columnDefinition = "TEXT")
    private String tokenScopes;

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP")
    private Instant createdAt;

    public User() {
    }

    public User(UUID id, Long githubId, String githubUsername, String displayName, String avatarUrl, String accessToken, String tokenScopes, Instant createdAt) {
        this.id = id;
        this.githubId = githubId;
        this.githubUsername = githubUsername;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.accessToken = accessToken;
        this.tokenScopes = tokenScopes;
        this.createdAt = createdAt;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Long getGithubId() {
        return githubId;
    }

    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenScopes() {
        return tokenScopes;
    }

    public void setTokenScopes(String tokenScopes) {
        this.tokenScopes = tokenScopes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public static class UserBuilder {
        private UUID id;
        private Long githubId;
        private String githubUsername;
        private String displayName;
        private String avatarUrl;
        private String accessToken;
        private String tokenScopes;
        private Instant createdAt;

        UserBuilder() {
        }

        public UserBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public UserBuilder githubId(Long githubId) {
            this.githubId = githubId;
            return this;
        }

        public UserBuilder githubUsername(String githubUsername) {
            this.githubUsername = githubUsername;
            return this;
        }

        public UserBuilder displayName(String displayName) {
            this.displayName = displayName;
            return this;
        }

        public UserBuilder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public UserBuilder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public UserBuilder tokenScopes(String tokenScopes) {
            this.tokenScopes = tokenScopes;
            return this;
        }

        public UserBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public User build() {
            return new User(id, githubId, githubUsername, displayName, avatarUrl, accessToken, tokenScopes, createdAt);
        }
    }
}
