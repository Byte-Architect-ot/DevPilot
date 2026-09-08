package devPilot.backend.services.ai;

import java.util.List;

import devPilot.backend.dto.CitationDto;

public record RetrievedContext(
    String formattedContext,
    List<CitationDto> citations
) {}
