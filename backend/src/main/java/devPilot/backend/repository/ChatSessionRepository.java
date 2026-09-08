package devPilot.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import devPilot.backend.entity.ChatSession;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserIdOrderByLastInteractionAtDesc(UUID userId);
    List<ChatSession> findByUserIdAndRepositoryIdOrderByLastInteractionAtDesc(UUID userId, UUID repositoryId);
    Optional<ChatSession> findByIdAndUserId(UUID id, UUID userId);
}
