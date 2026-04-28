package com.example.backend.repository.user;

import com.example.backend.dto.UserSearchResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.example.backend.entity.QUser.user;

@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<UserSearchResponse.UserInfo> searchUsersByKeyword(String keyword, Pageable pageable){

        //검색 결과 출력 우선순위 점수표
        NumberExpression<Integer> exactMatchPriority = new CaseBuilder()
                .when(user.nickname.eq(keyword)).then(1)//1순위: 닉네임이 검색어와 정확히 일치한 경우 -> 1점
                .when(user.name.eq(keyword)).then(2)//2순위: 닉네임은 다르지만, 실명이 검색어와 정확히 일치한 경우 -> 2점
                .otherwise(3);//그 외: 검색어가 포함만 되어 있는 경우 -> 3점

        //DB 쿼리문 작성 (UserSearchResponse의 content 데이터 가져오기)
        List<UserSearchResponse.UserInfo> content = queryFactory
                .select(Projections.constructor(UserSearchResponse.UserInfo.class,
                        user.id,
                        user.nickname,
                        user.name,
                        user.profileImageUrl
                ))
                .from(user)
                .where(user.nickname.contains(keyword)
                        .or(user.name.contains(keyword))
                )
                .orderBy(exactMatchPriority.asc(), user.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        //DB 쿼리문 작성 (전체 검색 결과가 총 몇 명인지 알아내기)
        JPAQuery<Long> countQuery = queryFactory
                .select(user.count())
                .from(user)
                .where(user.nickname.contains(keyword)
                        .or(user.name.contains(keyword))
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }
}
