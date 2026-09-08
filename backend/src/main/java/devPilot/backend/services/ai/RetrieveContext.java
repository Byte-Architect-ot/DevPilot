package devPilot.backend.services.ai;

import java.util.UUID;

public record RetrieveContext(
    UUID repositoryId,
    String query,
    int topK
) {}
