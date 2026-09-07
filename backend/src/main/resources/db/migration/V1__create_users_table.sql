CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    github_id BIGINT NOT NULL UNIQUE,
    github_username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url VARCHAR(512),
    access_token TEXT NOT NULL,
    token_scopes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
