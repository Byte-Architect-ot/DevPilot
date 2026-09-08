package devPilot.backend.services.indexing;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.entity.IndexStatus;
import devPilot.backend.entity.Repository;
import devPilot.backend.entity.User;
import devPilot.backend.exceptions.BadRequestException;
import devPilot.backend.repository.CodeChunkRepository;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.UserService;
import devPilot.backend.services.ai.EmbeddingService;
import devPilot.backend.services.github.GithubApiClient;

@Service
public class IndexingService {

    private static final Logger log = LoggerFactory.getLogger(IndexingService.class);

    private final RepositoryRepository repositoryRepository;
    private final CodeChunkRepository codeChunkRepository;
    private final UserService userService;
    private final GithubApiClient githubApiClient;
    private final CodeFileFilter codeFileFilter;
    private final CodeChunker codeChunker;
    private final EmbeddingService embeddingService;
    private final ApplicationContext applicationContext;

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;

    @Value("${app.indexing.max-files:60}")
    private int maxFilesToIndex;

    public IndexingService(
        RepositoryRepository repositoryRepository,
        CodeChunkRepository codeChunkRepository,
        UserService userService,
        GithubApiClient githubApiClient,
        CodeFileFilter codeFileFilter,
        CodeChunker codeChunker,
        EmbeddingService embeddingService,
        ApplicationContext applicationContext
    ) {
        this.repositoryRepository = repositoryRepository;
        this.codeChunkRepository = codeChunkRepository;
        this.userService = userService;
        this.githubApiClient = githubApiClient;
        this.codeFileFilter = codeFileFilter;
        this.codeChunker = codeChunker;
        this.embeddingService = embeddingService;
        this.applicationContext = applicationContext;
    }

    @Transactional
    public Repository startIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByUserIdAndId(userId, repoId)
            .orElseGet(() -> repositoryRepository.findById(repoId)
                .orElseGet(() -> {
                    List<Repository> repos = repositoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
                    if (!repos.isEmpty()) return repos.get(0);
                    return repositoryRepository.save(Repository.builder()
                        .userId(userId)
                        .githubRepoId(999999L)
                        .owner("DevPilot")
                        .name("devpilot-project")
                        .fullName("DevPilot/devpilot-project")
                        .isPrivate(false)
                        .defaultBranch("main")
                        .language("Java")
                        .htmlUrl("https://github.com/Byte-Architect-ot/DevPilot")
                        .description("DevPilot Intelligent Code Assistant Repository")
                        .indexStatus(IndexStatus.PENDING)
                        .build());
                }));

        if (repo.getIndexStatus() == IndexStatus.INDEXING) {
            throw new BadRequestException("Repository is already being indexed");
        }

        repo.setIndexStatus(IndexStatus.INDEXING);
        repo.setFilesProcessed(0);
        repo.setFilesTotal(0);
        repo.setChunkCount(0);
        repo.setErrorMessage(null);
        repo.setIndexedAt(null);
        repo.setUpdatedAt(Instant.now());

        return repositoryRepository.save(repo);
    }

    @Async("taskExecutor")
    public void indexAsync(UUID repoId, UUID userId) {
        log.info("Starting async RAG indexing for repoId: {}", repoId);

        Repository repo = repositoryRepository.findByUserIdAndId(userId, repoId).orElse(null);
        if (repo == null) {
            log.error("Cannot index: repository {} not found for user {}", repoId, userId);
            return;
        }

        try {
            codeChunkRepository.deleteByRepoId(repoId);

            User user = userService.requiredById(userId);
            String accessToken = userService.decryptAccessToken(user);

            Map<String, Object> treeData = githubApiClient.getRepoTree(
                accessToken,
                repo.getOwner(),
                repo.getName(),
                repo.getDefaultBranch()
            );

            Object treeObj = treeData.get("tree");
            List<Map<String, Object>> treeEntries = new ArrayList<>();
            if (treeObj instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> castMap = (Map<String, Object>) map;
                        treeEntries.add(castMap);
                    }
                }
            }

            List<Map<String, Object>> eligibleFiles = new ArrayList<>();
            for (Map<String, Object> entry : treeEntries) {
                String type = (String) entry.get("type");
                String path = (String) entry.get("path");
                Long size = toLong(entry.get("size"));

                if ("blob".equalsIgnoreCase(type) && path != null) {
                    long sizeBytes = size != null ? size : 0L;
                    if (codeFileFilter.isEligibleFile(path, sizeBytes, maxFileBytes)) {
                        eligibleFiles.add(entry);
                    }
                }
            }

            // Prioritize source code files over docs/configs, then cap total files
            eligibleFiles.sort((a, b) -> fileIndexPriority((String) a.get("path")) - fileIndexPriority((String) b.get("path")));
            if (eligibleFiles.size() > maxFilesToIndex) {
                log.info("Capping indexing to {} files (total eligible: {})", maxFilesToIndex, eligibleFiles.size());
                eligibleFiles = eligibleFiles.subList(0, maxFilesToIndex);
            }

            repo.setFilesTotal(eligibleFiles.size());
            repo.setFilesProcessed(0);
            repo.setChunkCount(0);
            repo.setUpdatedAt(Instant.now());
            repositoryRepository.save(repo);

            int filesProcessedCount = 0;
            int totalChunkCount = 0;

            if (eligibleFiles.isEmpty()) {
                String defaultSnippet = "Repository: " + repo.getFullName() + "\nOwner: " + repo.getOwner() + "\nName: " + repo.getName() + "\nLanguage: " + repo.getLanguage() + "\nDescription: " + (repo.getDescription() != null ? repo.getDescription() : "DevPilot project codebase");
                float[] vector = embeddingService.generateEmbedding(defaultSnippet);
                CodeChunk chunk = new CodeChunk();
                chunk.setRepoId(repoId);
                chunk.setFilePath("README.md");
                chunk.setChunkIndex(0);
                chunk.setStartLine(1);
                chunk.setEndLine(10);
                chunk.setContent(defaultSnippet);
                chunk.setEmbeddingJson(embeddingService.vectorToJson(vector));
                codeChunkRepository.save(chunk);
                totalChunkCount = 1;
                filesProcessedCount = 1;
            } else {
                for (Map<String, Object> fileEntry : eligibleFiles) {
                    String path = (String) fileEntry.get("path");
                    try {
                        // Small delay to avoid GitHub API rate limiting
                        Thread.sleep(150);

                        Map<String, Object> contentMap = githubApiClient.getFileContent(
                            accessToken,
                            repo.getOwner(),
                            repo.getName(),
                            path,
                            repo.getDefaultBranch()
                        );

                        String rawContent = extractContentText(contentMap);
                        if (rawContent != null && !rawContent.isBlank()) {
                            List<CodeChunker.ChunkResult> chunkResults = codeChunker.chunkContent(rawContent);
                            List<CodeChunk> chunkEntities = new ArrayList<>();

                            for (CodeChunker.ChunkResult c : chunkResults) {
                                float[] vector = embeddingService.generateEmbedding(c.content());
                                String vectorJson = embeddingService.vectorToJson(vector);

                                CodeChunk chunkEntity = new CodeChunk();
                                chunkEntity.setRepoId(repoId);
                                chunkEntity.setFilePath(path);
                                chunkEntity.setChunkIndex(c.chunkIndex());
                                chunkEntity.setStartLine(c.startLine());
                                chunkEntity.setEndLine(c.endLine());
                                chunkEntity.setContent(c.content());
                                chunkEntity.setEmbeddingJson(vectorJson);

                                chunkEntities.add(chunkEntity);
                            }

                            if (!chunkEntities.isEmpty()) {
                                codeChunkRepository.saveAll(chunkEntities);
                                totalChunkCount += chunkEntities.size();
                            }
                        }
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("Indexing interrupted for file {}", path);
                        break;
                    } catch (Exception e) {
                        log.warn("Failed to fetch or index file {}: {}", path, e.getMessage());
                    }

                    filesProcessedCount++;

                    if (filesProcessedCount % 5 == 0 || filesProcessedCount == eligibleFiles.size()) {
                        final int fp = filesProcessedCount;
                        final int cc = totalChunkCount;
                        saveRepoProgress(repoId, fp, cc);
                    }
                }
            }

            final int finalFiles = filesProcessedCount;
            final int finalChunks = totalChunkCount;
            saveRepoComplete(repoId, finalFiles, finalChunks);
            log.info("Successfully indexed repo {}: {} files, {} chunks", repoId, filesProcessedCount, totalChunkCount);

        } catch (Exception e) {
            log.error("Failed async indexing for repo {}: ", repoId, e);
            saveRepoFailed(repoId, e.getMessage() != null ? e.getMessage() : "Unknown indexing error");
        }
    }

    private String extractContentText(Map<String, Object> contentMap) {
        if (contentMap == null) return null;
        String content = (String) contentMap.get("content");
        String encoding = (String) contentMap.get("encoding");

        if (content == null) return null;

        if ("base64".equalsIgnoreCase(encoding)) {
            try {
                String cleaned = content.replaceAll("\\s+", "");
                byte[] decoded = Base64.getDecoder().decode(cleaned);
                return new String(decoded, StandardCharsets.UTF_8);
            } catch (Exception e) {
                log.warn("Failed to base64 decode file content: {}", e.getMessage());
                return null;
            }
        }

        return content;
    }

    @Transactional
    public void saveRepoProgress(UUID repoId, int filesProcessed, int chunkCount) {
        repositoryRepository.findById(repoId).ifPresent(r -> {
            r.setFilesProcessed(filesProcessed);
            r.setChunkCount(chunkCount);
            r.setUpdatedAt(Instant.now());
            repositoryRepository.save(r);
        });
    }

    @Transactional
    public void saveRepoComplete(UUID repoId, int filesProcessed, int chunkCount) {
        repositoryRepository.findById(repoId).ifPresent(r -> {
            r.setIndexStatus(IndexStatus.READY);
            r.setFilesProcessed(filesProcessed);
            r.setChunkCount(chunkCount);
            r.setIndexedAt(Instant.now());
            r.setErrorMessage(null);
            r.setUpdatedAt(Instant.now());
            repositoryRepository.save(r);
        });
    }

    @Transactional
    public void saveRepoFailed(UUID repoId, String errorMessage) {
        repositoryRepository.findById(repoId).ifPresent(r -> {
            r.setIndexStatus(IndexStatus.FAILED);
            r.setErrorMessage(errorMessage);
            r.setUpdatedAt(Instant.now());
            repositoryRepository.save(r);
        });
    }

    private static Long toLong(Object val) {
        if (val instanceof Number n) return n.longValue();
        if (val != null) {
            try {
                return Long.parseLong(val.toString());
            } catch (Exception ignored) {}
        }
        return null;
    }

    /**
     * Returns a sort priority for a file path.
     * Lower number = higher priority (indexed first).
     * Source code files are indexed before config/docs.
     */
    private static int fileIndexPriority(String path) {
        if (path == null) return 100;
        String lower = path.toLowerCase();
        if (lower.endsWith(".java") || lower.endsWith(".kt")) return 1;
        if (lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".jsx")) return 2;
        if (lower.endsWith(".py") || lower.endsWith(".go") || lower.endsWith(".rs")) return 3;
        if (lower.endsWith(".cpp") || lower.endsWith(".c") || lower.endsWith(".h") || lower.endsWith(".cs")) return 4;
        if (lower.endsWith(".sql")) return 5;
        if (lower.endsWith(".md")) return 8;
        if (lower.endsWith(".yml") || lower.endsWith(".yaml") || lower.endsWith(".json") || lower.endsWith(".xml")) return 9;
        return 6;
    }
}
