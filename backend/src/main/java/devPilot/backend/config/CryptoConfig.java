package devPilot.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

@Configuration
public class CryptoConfig {

    @Value("${app.crypto.password:devpilot-secret-password-123}")
    private String password;

    @Value("${app.crypto.salt:12345678}")
    private String salt;

    @Bean
    public TextEncryptor textEncryptor() {
        return Encryptors.text(password, salt);
    }
}
