package devPilot.backend.dto;

import java.util.UUID;

import devPilot.backend.entity.User;

public class UserResponse {
    private UUID id;
    private Long githubId;
    private String githubUsername;
    private String displayName;
    private String avatarUrl;

    public UserResponse() {
    }

    public UserResponse(UUID id, Long githubId, String githubUsername, String displayName, String avatarUrl) {
        this.id = id;
        this.githubId = githubId;
        this.githubUsername = githubUsername;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .githubId(user.getGithubId())
                .githubUsername(user.getGithubUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
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

    public static class UserResponseBuilder {
        private UUID id;
        private Long githubId;
        private String githubUsername;
        private String displayName;
        private String avatarUrl;

        UserResponseBuilder() {
        }

        public UserResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public UserResponseBuilder githubId(Long githubId) {
            this.githubId = githubId;
            return this;
        }

        public UserResponseBuilder githubUsername(String githubUsername) {
            this.githubUsername = githubUsername;
            return this;
        }

        public UserResponseBuilder displayName(String displayName) {
            this.displayName = displayName;
            return this;
        }

        public UserResponseBuilder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(id, githubId, githubUsername, displayName, avatarUrl);
        }
    }
}
