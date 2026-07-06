package com.example.backend.service;

import com.example.backend.dto.request.UserTagRequest;
import com.example.backend.dto.response.UserTagResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserTagService {

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    @Value("${minio.bucket}")
    private String minioBucket;

    private final UserRepository userRepository;

    public List<UserTagResponse> getUserTags(UserTagRequest request){
        List<Long> userIds = request.userIds();

        if(userIds == null || userIds.isEmpty()){
            return Collections.emptyList();
        }

        List<User> users = userRepository.findByIdIn(userIds);

        String minioBaseUrl = minioEndpoint + "/" + minioBucket + "/";

        return users.stream()
                .map(user -> {
                    String fullImageUrl = (user.getProfileImageUrl() == null || user.getProfileImageUrl().isEmpty())
                            ? null
                            : minioBaseUrl + user.getProfileImageUrl();

                    return UserTagResponse.of(user, fullImageUrl);
                })
                .toList();
    }
}
