package devPilot.backend.services.github;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

@Component
public class GithubRateLimiter {

    private final AtomicInteger remainingRequests = new AtomicInteger(5000);
    private final AtomicLong resetTimeEpochSeconds = new AtomicLong(0);

    public boolean hasQuota() {
        if (remainingRequests.get() <= 0) {
            long now = Instant.now().getEpochSecond();
            return now >= resetTimeEpochSeconds.get();
        }
        return true;
    }

    public void updateLimit(int remaining, long resetEpochSeconds) {
        this.remainingRequests.set(remaining);
        this.resetTimeEpochSeconds.set(resetEpochSeconds);
    }

    public void decrement() {
        this.remainingRequests.decrementAndGet();
    }

    public int getRemainingRequests() {
        return remainingRequests.get();
    }

    public long getResetTimeEpochSeconds() {
        return resetTimeEpochSeconds.get();
    }
}
