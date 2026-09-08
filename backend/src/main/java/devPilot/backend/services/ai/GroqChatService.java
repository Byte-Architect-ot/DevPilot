package devPilot.backend.services.ai;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GroqChatService {

    private static final Logger log = LoggerFactory.getLogger(GroqChatService.class);

    private final String defaultGroqApiKey;
    private final String defaultGroqModel;
    private final VectorStoreService vectorStoreService;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GroqChatService(
        @Value("${app.groq.api-key:}") String defaultGroqApiKey,
        @Value("${app.groq.model:llama-3.1-8b-instant}") String defaultGroqModel,
        VectorStoreService vectorStoreService,
        ObjectMapper objectMapper
    ) {
        this.defaultGroqApiKey = defaultGroqApiKey != null ? defaultGroqApiKey.trim() : "";
        this.defaultGroqModel = defaultGroqModel != null && !defaultGroqModel.isBlank() ? defaultGroqModel.trim() : "qwen/qwen3.8-27b";
        this.vectorStoreService = vectorStoreService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public record SourceCitation(
        String filePath,
        int startLine,
        int endLine,
        float score,
        String snippet
    ) {}

    public record ChatResponse(
        String answer,
        List<SourceCitation> sources,
        String model
    ) {}

    public ChatResponse chat(UUID repoId, String userMessage, String apiKeyOverride) {
        String apiKey = (apiKeyOverride != null && !apiKeyOverride.isBlank())
            ? apiKeyOverride.trim()
            : defaultGroqApiKey;

        List<VectorStoreService.ScoredChunk> retrievedChunks = vectorStoreService.searchSimilar(repoId, userMessage, RagSettings.TOP_K_CHUNKS);

        List<SourceCitation> citations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        if (retrievedChunks.isEmpty()) {
            contextBuilder.append("No specific code context chunks found in repository database.\n");
        } else {
            for (VectorStoreService.ScoredChunk scored : retrievedChunks) {
                var chunk = scored.chunk();
                contextBuilder.append("--- File: ").append(chunk.getFilePath())
                    .append(" (Lines ").append(chunk.getStartLine()).append("-").append(chunk.getEndLine()).append(") ---\n")
                    .append(chunk.getContent()).append("\n\n");

                citations.add(new SourceCitation(
                    chunk.getFilePath(),
                    chunk.getStartLine(),
                    chunk.getEndLine(),
                    scored.score(),
                    chunk.getContent().length() > 200 ? chunk.getContent().substring(0, 200) + "..." : chunk.getContent()
                ));
            }
        }

        String systemPrompt = """
            You are DevPilot, an expert AI code assistant helping software engineers understand and navigate their GitHub repositories.
            Use the provided code context snippets to answer the user's question accurately, concisely, and with technical depth.
            If the code context contains relevant code, quote relevant lines or explain their functionality clearly.
            
            Repository Code Context:
            %s
            """.formatted(contextBuilder.toString());

        if (apiKey == null || apiKey.isBlank()) {
            String mockAnswer = """
                ### DevPilot Code Analysis Context
                Retrieved **%d context snippets** from your repository for query: "%s".
                
                **Retrieved Context Files:**
                %s
                """.formatted(
                    citations.size(),
                    userMessage,
                    citations.stream().map(c -> "- `" + c.filePath() + "` (lines " + c.startLine() + "-" + c.endLine() + ")").reduce((a, b) -> a + "\n" + b).orElse("None")
                );

            return new ChatResponse(mockAnswer, citations, "DevPilot RAG Context Engine");
        }

        // Only add models that are confirmed available on this API key
        List<String> candidateModels = new ArrayList<>();
        candidateModels.add(defaultGroqModel);
        for (String m : List.of("qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "groq/compound-mini", "groq/compound")) {
            if (!candidateModels.contains(m)) {
                candidateModels.add(m);
            }
        }

        Exception lastException = null;

        for (String modelName : candidateModels) {
            try {
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);
                requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userMessage)
                ));
                requestBody.put("temperature", 0.3);
                requestBody.put("max_tokens", 1024);
                requestBody.put("top_p", 0.9);

                String rawResponse = restClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

                Map<String, Object> responseMap = objectMapper.readValue(rawResponse, new TypeReference<>() {});
                List<?> choices = (List<?>) responseMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> messageObj = (Map<?, ?>) firstChoice.get("message");
                    String content = (String) messageObj.get("content");

                    return new ChatResponse(content, citations, modelName);
                }
            } catch (Exception e) {
                lastException = e;
                log.warn("Model '{}' failed on Groq API ({}), trying next model...", modelName, e.getMessage());
            }
        }

        log.error("All Groq candidate models failed.", lastException);
        // Return a friendly error message rather than raw API JSON error
        String friendlyError = "I'm having trouble connecting to the AI service right now. ";
        if (lastException != null && lastException.getMessage() != null) {
            String msg = lastException.getMessage();
            if (msg.contains("model_not_found") || msg.contains("404")) {
                friendlyError += "The configured AI model is unavailable. Please try again later.";
            } else if (msg.contains("401") || msg.contains("invalid_api_key")) {
                friendlyError += "API key issue detected. Please check your configuration.";
            } else if (msg.contains("429") || msg.contains("rate_limit")) {
                friendlyError += "Rate limit reached. Please wait a moment and try again.";
            } else {
                friendlyError += "Please try again in a few seconds.";
            }
        }
        return new ChatResponse(friendlyError, citations, defaultGroqModel);
    }
}
