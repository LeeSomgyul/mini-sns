package com.example.backend.service;

import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
class UserProfileServiceTest {

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocalAccountRepository localAccountRepository;

    @MockitoSpyBean
    private FollowRepository followRepository;

    // [변수]
    // 1. 테스트 기간 동안 생성할 유저
    private User savedTargetUser;
    private LocalAccount savedLocalAccount;

    private Long targerUserId;
    private final Long CURRENT_USER_ID = 1L; // 로그인한 유저 (DB 실제 존재하는 id 사용)

    private String followerCountKey;
    private String followerSetKey;

    @BeforeEach
    void setUp(){
        // [given]
        // 1. 팔로워가 0명인 테스트용 사용자 생성
        User testUser = User.builder()
                .name("테스트유저")
                .nickname("친구없는테스터")
                .phoneNumber("01012345678")
                .build();
        savedTargetUser = userRepository.save(testUser);
        targerUserId = savedTargetUser.getId();

        LocalAccount localAccount = LocalAccount.builder()
                .user(savedTargetUser)
                .email("test@test.com")
                .passwordHash("hashed_password_xyz_123")
                .build();
        savedLocalAccount = localAccountRepository.save(localAccount);

        // 2. 레디스 키 생성
        followerCountKey = "user:" + targerUserId + ":follower_count";
        followerSetKey = "user:" + targerUserId + ":follower_set";

        stringRedisTemplate.delete(followerCountKey);
        stringRedisTemplate.delete(followerSetKey);

        // followRepository를 사용하는 테스트가 2개라서 중간에 한번 청소
        clearInvocations(followRepository);
    }

    @AfterEach
    void tearDown(){
        // 테스트 종료 후 DB의 테스트 데이터 삭제
        if(savedLocalAccount != null){
            localAccountRepository.delete(savedLocalAccount);
        }
        if(savedTargetUser != null){
            userRepository.delete(savedTargetUser);
        }

        // 테스트 종료 후 레디스 테스트 데이터 삭제
        stringRedisTemplate.delete(followerCountKey);
        stringRedisTemplate.delete(followerSetKey);
    }

    @Test
    @DisplayName("첫번째 조회시 레디스에 저장된 캐시(데이터)가 없을 때, DB에서 값을 가져와서 채워지고, 두번째 조회 부터는 DB를 조회하지 않는다.")
    void getProfile_getCountWithLock_Test(){
        // [when] 첫 번째 조회
        userProfileService.getProfile(targerUserId, CURRENT_USER_ID);

        // [then]
        // 1. DB를 조회해서 값을 찾는지 확인
        verify(followRepository, times(1)).countByFolloweeId(targerUserId);

        // 2. 레디스에 데이터가 잘 저장되었는지 확인
        String cachedCount = stringRedisTemplate.opsForValue().get(followerCountKey);
        assertThat(cachedCount).isNotNull();

        // [when] 두 번째 조회
        clearInvocations(followRepository);
        userProfileService.getProfile(targerUserId, CURRENT_USER_ID);

        // [then]
        verify(followRepository, times(0)).countByFolloweeId(targerUserId);
    }

    @Test
    @DisplayName("팔로워가 0명인 유저 조회 시, 레디스 Set에 더미 데이터(-1)가 저장된다.")
    void getProfile_warmUpSetWithLock_Test(){
        // [given] TARGET_USER_ID는 실제 DB에도 팔로워가 0명인 상태여야 함

        // [when] 프로필 조회 실행
        userProfileService.getProfile(targerUserId,CURRENT_USER_ID);

        // [then] DB 조회가 정상적으로 됐는지 확인
        verify(followRepository, times(1)).countByFolloweeId(targerUserId);

        // DB 결과가 비어있기 때문에, 레디스 Set에 더미값 -1이 들어가 있어야 함
        Set<String> cachedSet = stringRedisTemplate.opsForSet().members(followerSetKey);

        assertThat(cachedSet).isNotNull();
        assertThat(cachedSet).contains("-1");
        assertThat(cachedSet).hasSize(1);
    }
}
