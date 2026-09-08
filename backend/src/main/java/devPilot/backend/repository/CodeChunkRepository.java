package devPilot.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import devPilot.backend.entity.CodeChunk;

@Repository
public interface CodeChunkRepository extends JpaRepository<CodeChunk, UUID> {
    List<CodeChunk> findByRepoId(UUID repoId);
    void deleteByRepoId(UUID repoId);
    long countByRepoId(UUID repoId);
}
