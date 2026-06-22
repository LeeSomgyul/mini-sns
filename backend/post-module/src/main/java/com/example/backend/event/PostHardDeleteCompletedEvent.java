package com.example.backend.event;

import java.util.List;
import java.util.Map;

public record PostHardDeleteCompletedEvent(
        List<Long> postIds,
        Map<Long, List<String>> deletedTargetUrls
) {
}
