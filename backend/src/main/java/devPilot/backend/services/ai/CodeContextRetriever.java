package devPilot.backend.services.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import devPilot.backend.dto.CitationDto;

@Service
public class CodeContextRetriever {

    private final VectorStoreService vectorStoreService;

    public CodeContextRetriever(VectorStoreService vectorStoreService) {
        this.vectorStoreService = vectorStoreService;
    }

    public RetrievedContext retrieveContext(UUID repoId, String query, int topK) {
        List<VectorStoreService.ScoredChunk> chunks = vectorStoreService.searchSimilar(repoId, query, topK);
        
        List<CitationDto> citations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        if (chunks == null || chunks.isEmpty()) {
            contextBuilder.append("No specific code context chunks found in repository database.\n");
        } else {
            for (VectorStoreService.ScoredChunk scored : chunks) {
                var chunk = scored.chunk();
                contextBuilder.append("--- File: ").append(chunk.getFilePath())
                    .append(" (Lines ").append(chunk.getStartLine()).append("-").append(chunk.getEndLine()).append(") ---\n")
                    .append(chunk.getContent()).append("\n\n");

                citations.add(new CitationDto(
                    chunk.getFilePath(),
                    chunk.getStartLine(),
                    chunk.getEndLine(),
                    scored.score(),
                    chunk.getContent().length() > 200 ? chunk.getContent().substring(0, 200) + "..." : chunk.getContent()
                ));
            }
        }

        return new RetrievedContext(contextBuilder.toString(), citations);
    }
}
