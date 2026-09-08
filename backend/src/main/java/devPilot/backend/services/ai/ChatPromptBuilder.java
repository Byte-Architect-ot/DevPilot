package devPilot.backend.services.ai;

import org.springframework.stereotype.Component;

@Component
public class ChatPromptBuilder {

    public String buildSystemPrompt(String codeContext) {
        return """
            You are DevPilot, an expert AI code assistant helping software engineers understand and navigate their GitHub repositories.
            Use the provided code context snippets to answer the user's question accurately, concisely, and with technical depth.
            If the code context contains relevant code, quote relevant lines or explain their functionality clearly.
            
            Repository Code Context:
            %s
            """.formatted(codeContext != null ? codeContext : "");
    }
}
