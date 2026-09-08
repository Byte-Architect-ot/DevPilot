package devPilot.backend.services.ai;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.repository.CodeChunkRepository;

@Service
public class VectorStoreService {

    private final CodeChunkRepository codeChunkRepository;
    private final EmbeddingService embeddingService;

    public VectorStoreService(CodeChunkRepository codeChunkRepository, EmbeddingService embeddingService) {
        this.codeChunkRepository = codeChunkRepository;
        this.embeddingService = embeddingService;
    }

    public record ScoredChunk(
        CodeChunk chunk,
        float score
    ) {}

    public List<ScoredChunk> searchSimilar(UUID repoId, String query, int topK) {
        if (repoId == null || query == null || query.isBlank()) {
            return List.of();
        }

        // Cap how many chunks we load to avoid OOM on large repos
        List<CodeChunk> chunks = codeChunkRepository.findByRepoId(repoId);
        if (chunks.isEmpty()) {
            return List.of();
        }

        float[] queryVector = embeddingService.generateEmbedding(query);
        int k = topK > 0 ? topK : RagSettings.TOP_K_CHUNKS;

        return chunks.stream()
            .map(chunk -> {
                float[] chunkVector = embeddingService.jsonToVector(chunk.getEmbeddingJson());
                float score = EmbeddingService.cosineSimilarity(queryVector, chunkVector);
                return new ScoredChunk(chunk, score);
            })
            // Only return chunks with meaningful similarity (filter noise)
            .filter(sc -> sc.score() > 0.05f)
            .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
            .limit(k)
            .toList();
    }
}
