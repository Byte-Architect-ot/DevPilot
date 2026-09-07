package devPilot.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryRepository extends JpaRepository<devPilot.backend.entity.Repository, UUID> {
    List<devPilot.backend.entity.Repository> findByUserIdOrderByUpdatedAtDesc(UUID userId);
    Optional<devPilot.backend.entity.Repository> findByUserIdAndGithubRepoId(UUID userId, Long githubRepoId);
    Optional<devPilot.backend.entity.Repository> findByUserIdAndId(UUID userId, UUID id);
    boolean existsByUserIdAndGithubRepoId(UUID userId, Long githubRepoId);
}
