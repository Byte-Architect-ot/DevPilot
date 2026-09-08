package devPilot.backend.services.github;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GithubApiClient {
    private static final String API_BASE = "https://api.github.com";

    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST_MAP = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {};

    public GithubApiClient() {
    }

    private RestClient createClient(String accessToken) {
        return RestClient.builder()
            .baseUrl(API_BASE)
            .defaultHeader("Authorization", "Bearer " + accessToken)
            .defaultHeader("Accept", "application/vnd.github+json")
            .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
            .defaultHeader(HttpHeaders.USER_AGENT, "DevPilot")
            .build();
    }

    public List<Map<String, Object>> listUserRepos(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return new ArrayList<>();
        }
        List<Map<String, Object>> allRepos = new ArrayList<>();
        int page = 1;
        while (page <= 10) {
            final int currentPage = page;
            try {
                List<Map<String, Object>> pageRepos = createClient(accessToken)
                    .get()
                    .uri(uriBuilder -> uriBuilder
                        .path("/user/repos")
                        .queryParam("affiliation", "owner,collaborator,organization_member")
                        .queryParam("sort", "updated")
                        .queryParam("per_page", 100)
                        .queryParam("page", currentPage)
                        .build())
                    .retrieve()
                    .body(LIST_MAP);

                if (pageRepos == null || pageRepos.isEmpty()) {
                    break;
                }
                allRepos.addAll(pageRepos);
                if (pageRepos.size() < 100) {
                    break;
                }
                page++;
            } catch (Exception e) {
                break;
            }
        }
        return allRepos;
    }

    public Map<String, Object> getFileContent(String accessToken, String owner, String repo, String path, String ref) {
        if (accessToken == null || accessToken.isBlank()) {
            return Map.of();
        }
        try {
            return createClient(accessToken)
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/repos/{owner}/{repo}/contents/{path}")
                    .queryParam("ref", ref != null ? ref : "main")
                    .build(owner, repo, path))
                .retrieve()
                .body(MAP);
        } catch (Exception e) {
            return Map.of();
        }
    }

    public Map<String, Object> getRepoTree(String accessToken, String owner, String repo, String ref) {
        if (accessToken == null || accessToken.isBlank()) {
            return Map.of();
        }
        try {
            return createClient(accessToken)
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/repos/{owner}/{repo}/git/trees/{ref}")
                    .queryParam("recursive", "1")
                    .build(owner, repo, ref != null ? ref : "main"))
                .retrieve()
                .body(MAP);
        } catch (Exception e) {
            return Map.of();
        }
    }
}
