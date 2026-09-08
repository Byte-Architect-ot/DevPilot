package devPilot.backend.services.indexing;

import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class CodeFileFilter {

    private static final Set<String> SKIP_DIR_PARTS = Set.of(
        "node_modules",
        ".git",
        "dist",
        "build",
        "target",
        ".next",
        "vendor",
        "__pycache__",
        ".idea",
        ".vscode",
        "coverage",
        "out"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".java", ".js", ".ts", ".tsx", ".jsx", ".py", ".go", ".rs", ".cpp", ".c", ".h",
        ".hpp", ".cs", ".php", ".html", ".css", ".kt", ".swift", ".kts", ".vue",
        ".svelte", ".rb", ".ex", ".fs", ".scala", ".sh", ".bash", ".zsh", ".sql",
        ".md", ".toml", ".yaml", ".yml", ".xml", ".json", ".txt", ".properties", ".ini"
    );

    private static final Set<String> SKIP_FILENAMES = Set.of(
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "cargo.lock",
        "pipfile.lock",
        "gemfile.lock",
        "composer.lock",
        "go.sum",
        "poetry.lock",
        "gradle.lockfile",
        "podfile.lock"
    );

    public boolean isEligibleFile(String path, long sizeBytes, long maxFileSizeBytes) {
        if (path == null || path.isBlank()) {
            return false;
        }

        if (maxFileSizeBytes > 0 && sizeBytes > maxFileSizeBytes) {
            return false;
        }

        String normalizedPath = path.replace('\\', '/');
        String[] parts = normalizedPath.split("/");

        for (String part : parts) {
            if (SKIP_DIR_PARTS.contains(part.toLowerCase())) {
                return false;
            }
        }

        String fileName = parts[parts.length - 1].toLowerCase();

        if (SKIP_FILENAMES.contains(fileName)) {
            return false;
        }

        if ("dockerfile".equals(fileName) || "makefile".equals(fileName) || "readme.md".equals(fileName)) {
            return true;
        }

        int lastDot = fileName.lastIndexOf('.');
        if (lastDot == -1) {
            return false;
        }

        String ext = fileName.substring(lastDot);
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    public String detectLanguage(String path) {
        if (path == null) return "text";
        String normalized = path.replace('\\', '/');
        String fileName = normalized.substring(normalized.lastIndexOf('/') + 1).toLowerCase();

        if ("dockerfile".equals(fileName)) return "dockerfile";
        if ("makefile".equals(fileName)) return "makefile";

        int lastDot = fileName.lastIndexOf('.');
        if (lastDot == -1) return "text";
        return fileName.substring(lastDot + 1);
    }
}
