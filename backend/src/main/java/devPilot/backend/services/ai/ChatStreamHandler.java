package devPilot.backend.services.ai;

import org.springframework.stereotype.Component;

@Component
public class ChatStreamHandler {

    public String processStream(String fullResponse) {
        if (fullResponse == null) return "";
        return fullResponse.trim();
    }
}
