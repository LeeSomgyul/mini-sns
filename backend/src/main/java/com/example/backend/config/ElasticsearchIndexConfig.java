package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;

//[일레스틱서치 인덱스 자동 생성]
//@Document 클래스를 자동으로 찾아서 인텍스(테이블)가 없는 경우 json 파일 보고 자동 생성하는 역할
@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchIndexConfig {

    private final ElasticsearchOperations elasticsearchOperations;

    //BackendApplication이 완전히 준비되었을 때 자동 실행
    @EventListener(ApplicationReadyEvent.class)
    public void initializeIndex(){

        //@Document를 찾은 다음 -> 엔티티(예: UserDocument)를 찾는다.
        //entityInfo: 각 클래스의 전체 정보(클래스 타입, 인덱스 이름, 필드 구성 등)
        elasticsearchOperations.getElasticsearchConverter().getMappingContext().getPersistentEntities().forEach(entityInfo -> {
            //각 document의 class 전체 정보
            //(예: UserDocumnet의 클래스 이름, 필드 구성, 데이터 타입, 어노테이션)
            Class<?> documentClassInfo = entityInfo.getType();

            //@Document 어노테이션 붙은 클래스만 필터링
            if(documentClassInfo.isAnnotationPresent(Document.class)){
                //각 클래스의 필드에 붙은 어노테이션
                //(예: UserDocument의 @Id, @Field)
                Document document = documentClassInfo.getAnnotation(Document.class);

                //인덱스(테이블) 이름 찾기
                //(예: @Document(indexName = "users") 이거 찾기)
                String indexName = document.indexName();

                //인덱스를 다룰 수 있는 도구 꺼내오기(생성, 삭제, 존재 유무 확인 등)
                IndexOperations indexOperations = elasticsearchOperations.indexOps(documentClassInfo);

                //해당 인덱스가 존재하지 않다면 생성
                if(!indexOperations.exists()){
                    log.info("{} 인덱스가 존재하지 않아 생성을 시작합니다.", indexName);

                    try{
                        //Document의 @Setting을 보고 인덱스 생성
                        indexOperations.createWithMapping();

                        log.info("{} 인덱스 생성되 완료되었습니다.", indexName);
                    }catch (Exception e){
                        log.error("{} 인덱스 생성 중 오류 발생: {}", indexName, e.getMessage());
                    }
                }else{
                    log.info("{} 인덱스가 이미 존재합니다.", indexName);
                }
            }
        });
    }
}
