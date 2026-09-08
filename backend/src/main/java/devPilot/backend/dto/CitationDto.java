package devPilot.backend.dto;

public record CitationDto(
    String filePath,
    int startLine,
    int endLine,
    float score,
    String snippet
) {}
