package devPilot.backend.services;

import org.springframework.stereotype.Service;

@Service("legacyRepoService")
public class RepoService {

    private final devPilot.backend.services.github.RepoService githubRepoService;

    public RepoService(devPilot.backend.services.github.RepoService githubRepoService) {
        this.githubRepoService = githubRepoService;
    }

    public devPilot.backend.services.github.RepoService getGithubRepoService() {
        return githubRepoService;
    }
}
