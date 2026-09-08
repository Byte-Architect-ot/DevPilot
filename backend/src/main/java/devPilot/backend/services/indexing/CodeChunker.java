package devPilot.backend.services.indexing;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CodeChunker {

    private final int chunkSize;
    private final int chunkOverlap;

    public CodeChunker(
        @Value("${app.indexing.chunk-size:800}") int chunkSize,
        @Value("${app.indexing.chunk-overlap:150}") int chunkOverlap
    ) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    public record ChunkResult(
        int chunkIndex,
        int startLine,
        int endLine,
        String content
    ) {}

    public List<ChunkResult> chunkContent(String content) {
        List<ChunkResult> chunks = new ArrayList<>();
        if (content == null || content.isBlank()) {
            return chunks;
        }

        String[] lines = content.split("\r?\n");
        if (lines.length == 0) {
            return chunks;
        }

        int currentStartLine = 1;
        StringBuilder currentChunk = new StringBuilder();
        int chunkIndex = 0;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            int currentLineNumber = i + 1;

            if (currentChunk.length() == 0) {
                currentStartLine = currentLineNumber;
            }

            currentChunk.append(line).append("\n");

            if (currentChunk.length() >= chunkSize || i == lines.length - 1) {
                String chunkText = currentChunk.toString().trim();
                if (!chunkText.isBlank()) {
                    chunks.add(new ChunkResult(chunkIndex++, currentStartLine, currentLineNumber, chunkText));
                }

                // Overlap calculation: keep last few lines if not at the end
                if (i < lines.length - 1 && chunkOverlap > 0) {
                    StringBuilder overlapSb = new StringBuilder();
                    int overlapChars = 0;
                    int overlapStartLine = currentLineNumber;

                    for (int j = i; j >= 0 && overlapChars < chunkOverlap; j--) {
                        overlapSb.insert(0, lines[j] + "\n");
                        overlapChars += lines[j].length() + 1;
                        overlapStartLine = j + 1;
                    }

                    currentChunk = overlapSb;
                    currentStartLine = overlapStartLine;
                } else {
                    currentChunk = new StringBuilder();
                }
            }
        }

        return chunks;
    }
}
