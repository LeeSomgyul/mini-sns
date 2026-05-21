package com.example.backend.repository;

import com.example.backend.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    Optional<PostMedia> findByPostIdAndMediaType (Long postId, PostMedia.MediaType mediaType);
    Optional<PostMedia> findByPostIdAndMediaTypeAndUniqueId(Long postId, PostMedia.MediaType mediaType, String uniqueId);
}
