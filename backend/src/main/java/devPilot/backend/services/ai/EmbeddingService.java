package devPilot.backend.services.ai;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final String hfApiKey;
    private final String hfModel;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public EmbeddingService(
        @Value("${app.hf.api-key:}") String hfApiKey,
        @Value("${app.hf.model:sentence-transformers/all-MiniLM-L6-v2}") String hfModel,
        ObjectMapper objectMapper
    ) {
        this.hfApiKey = hfApiKey != null ? hfApiKey.trim() : "";
        this.hfModel = hfModel != null ? hfModel.trim() : "sentence-transformers/all-MiniLM-L6-v2";
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return generateFallbackEmbedding(text);
        }
        if (hfApiKey != null && !hfApiKey.isBlank()) {
            try {
                float[] hfEmbedding = fetchHuggingFaceEmbedding(text);
                if (hfEmbedding != null && hfEmbedding.length > 0) {
                    return hfEmbedding;
                }
            } catch (Exception e) {
                log.warn("HuggingFace embedding failed, using local fallback: {}", e.getMessage());
            }
        }
        return generateFallbackEmbedding(text);
    }

    private float[] fetchHuggingFaceEmbedding(String text) {
        String url = "https://api-inference.huggingface.co/pipeline/feature-extraction/" + hfModel;
        
        List<Object> requestBody = List.of(text);

        RestClient.RequestBodySpec spec = restClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON);

        if (!hfApiKey.isEmpty()) {
            spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + hfApiKey);
        }

        String rawResponse = spec.body(requestBody)
            .retrieve()
            .body(String.class);

        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        try {
            List<List<Double>> list = objectMapper.readValue(rawResponse, new TypeReference<List<List<Double>>>() {});
            if (list != null && !list.isEmpty()) {
                List<Double> inner = list.get(0);
                float[] result = new float[inner.size()];
                for (int i = 0; i < inner.size(); i++) {
                    result[i] = inner.get(i).floatValue();
                }
                return result;
            }
        } catch (Exception e) {
            try {
                List<Double> inner = objectMapper.readValue(rawResponse, new TypeReference<List<Double>>() {});
                if (inner != null && !inner.isEmpty()) {
                    float[] result = new float[inner.size()];
                    for (int i = 0; i < inner.size(); i++) {
                        result[i] = inner.get(i).floatValue();
                    }
                    return result;
                }
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    public float[] generateFallbackEmbedding(String text) {
        int dimensions = 128;
        float[] vector = new float[dimensions];
        if (text == null || text.isBlank()) {
            return vector;
        }

        String normalized = text.toLowerCase();
        String[] tokens = normalized.split("[^a-zA-Z0-9_]+");

        for (String token : tokens) {
            if (token.isBlank()) continue;
            int hash = Math.abs(token.hashCode()) % dimensions;
            vector[hash] += 1.0f;

            for (int i = 0; i <= token.length() - 3; i++) {
                String sub = token.substring(i, i + 3);
                int subHash = Math.abs(sub.hashCode()) % dimensions;
                vector[subHash] += 0.5f;
            }
        }

        float norm = 0.0f;
        for (float v : vector) {
            norm += v * v;
        }

        if (norm > 0) {
            float sqrtNorm = (float) Math.sqrt(norm);
            for (int i = 0; i < dimensions; i++) {
                vector[i] /= sqrtNorm;
            }
        }

        return vector;
    }

    public String vectorToJson(float[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    public float[] jsonToVector(String json) {
        if (json == null || json.isBlank()) {
            return new float[0];
        }
        try {
            return objectMapper.readValue(json, float[].class);
        } catch (JsonProcessingException e) {
            return new float[0];
        }
    }

    public static float cosineSimilarity(float[] vecA, float[] vecB) {
        if (vecA == null || vecB == null || vecA.length == 0 || vecB.length == 0) {
            return 0.0f;
        }

        int minLen = Math.min(vecA.length, vecB.length);
        float dotProduct = 0.0f;
        float normA = 0.0f;
        float normB = 0.0f;

        for (int i = 0; i < minLen; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0f || normB == 0.0f) {
            return 0.0f;
        }

        return (float) (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
    }
}
