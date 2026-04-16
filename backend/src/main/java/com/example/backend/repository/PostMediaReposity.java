package com.example.backend.repository;

import com.example.backend.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaReposity extends JpaRepository<PostMedia, Long> {
}
