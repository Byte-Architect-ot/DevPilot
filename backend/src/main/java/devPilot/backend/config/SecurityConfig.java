package devPilot.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import devPilot.backend.security.GithubOAuth2UserService;
import devPilot.backend.security.OAuth2AuthenticationFailureHandler;
import devPilot.backend.security.OAuth2AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final GithubOAuth2UserService githubOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oauth2FailureHandler;

    public SecurityConfig(
        GithubOAuth2UserService githubOAuth2UserService,
        OAuth2AuthenticationSuccessHandler oauth2SuccessHandler,
        OAuth2AuthenticationFailureHandler oauth2FailureHandler
    ) {
        this.githubOAuth2UserService = githubOAuth2UserService;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.oauth2FailureHandler = oauth2FailureHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/login-url",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/error"
                ).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                .accessDeniedHandler(new CustomAccessDeniedHandler())
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(githubOAuth2UserService))
                .successHandler(oauth2SuccessHandler)
                .failureHandler(oauth2FailureHandler)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpStatus.OK.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Logout successful\"}");
                })
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("SESSION", "DEVPILOT_SESSION")
            );

        return http.build();
    }
}
