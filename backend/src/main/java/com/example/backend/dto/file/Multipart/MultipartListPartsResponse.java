package com.example.backend.dto.file.Multipart;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import java.util.List;

@Builder
public record MultipartListPartsResponse (
        List<PartInfo> parts
){
    @Builder
    public record PartInfo(
            //각 파일(uploadId)의 몇번째 조각인지
            @JsonProperty("PartNumber")
            Integer partNumber,

            //조각의 용량
            @JsonProperty("Size")
            Long size,

            //조각이 잘 들어왔다는 증표(식별값)
            @JsonProperty("ETag")
            String eTag
    ){}
}