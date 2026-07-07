package com.example.backend.dto.request;

import java.util.List;

public record UserTagRequest(
        List<Long> userIds
) {
}
