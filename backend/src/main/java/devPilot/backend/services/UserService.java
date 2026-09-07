package devPilot.backend.services;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.User;
import devPilot.backend.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TextEncryptor textEncryptor;

    public UserService(UserRepository userRepository, TextEncryptor textEncryptor) {
        this.userRepository = userRepository;
        this.textEncryptor = textEncryptor;
    }

    @Transactional(readOnly = true)
    public User requiredById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User requiredByGithubId(Long githubId) {
        return userRepository.findByGithubId(githubId).orElseThrow(() -> new RuntimeException("User not found with github id: " + githubId));
    }

    public boolean existsByGithubId(Long githubId) {
        return userRepository.existsByGithubId(githubId);
    }

    public String decryptAccessToken(User user) {
        return textEncryptor.decrypt(user.getAccessToken());
    }

    @Transactional
    public User upsertFromGithub(Map<String, Object> attributes, String accessToken, String scopes) {
        Long githubId = toLong(attributes.get("id"));
        String username = (String) attributes.get("login");
        String displayName = (String) attributes.get("name");
        if (displayName == null) {
            displayName = username;
        }
        String avatarUrl = (String) attributes.get("avatar_url");
        String encryptedToken = textEncryptor.encrypt(accessToken);

        User user = userRepository.findByGithubId(githubId)
            .orElseGet(() -> User.builder()
                .githubId(githubId)
                .build());

        user.setGithubUsername(username);
        user.setDisplayName(displayName);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(encryptedToken);
        user.setTokenScopes(scopes);

        return userRepository.save(user);
    }

    private static Long toLong(Object value) {
        if (value instanceof Number num) {
            return num.longValue();
        }
        if (value == null) {
            return null;
        }
        throw new IllegalArgumentException("Invalid githubId type: " + (value != null ? value.getClass().getName() : "null"));
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
