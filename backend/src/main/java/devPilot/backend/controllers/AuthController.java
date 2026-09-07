package devPilot.backend.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.UserResponse;
import devPilot.backend.entity.User;
import devPilot.backend.security.CurrentUser;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public UserResponse getMe(@CurrentUser User user) {
        return UserResponse.fromEntity(user);
    }

    @GetMapping("/login-url")
    public Map<String, String> loginUrl() {
        return Map.of("url", "/oauth2/authorization/github");
    }
}
