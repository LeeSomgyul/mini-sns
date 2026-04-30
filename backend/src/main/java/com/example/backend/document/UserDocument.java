package com.example.backend.document;

import com.example.backend.entity.User;
import org.springframework.data.annotation.Id;
import lombok.Builder;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

//[엘라스틱서치] 사용자 검색
@Document(indexName = "users", createIndex = false)
@Builder
public record UserDocument (
        @Id Long id,
        @Field(type = FieldType.Text, analyzer = "ngram_analyzer") String nickname,
        @Field(type = FieldType.Text, analyzer = "ngram_analyzer") String name,
        @Field(type = FieldType.Keyword) String profileImageUrl
){

    //Service에서 return 덩어리 생성
    public static UserDocument from (User user){
        return new UserDocument(
          user.getId(),
          user.getNickname(),
          user.getName(),
          user.getProfileImageUrl()
        );
    }

}


