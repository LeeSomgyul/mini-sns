package com.example.backend.controller;

import com.example.backend.dto.PostInternalDto;
import com.example.backend.service.PostInternalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/internal/posts")
public class PostInternalController {

    public final PostInternalService postInternalService;

    @PostMapping("/bulk")
    public List<PostInternalDto> getPostsBulk(
            @RequestBody List<Long> postIds,
            @RequestParam("currentUserId") Long currentUserId
    ){
        return postInternalService.getPostsBulk(postIds, currentUserId);
    }
}
