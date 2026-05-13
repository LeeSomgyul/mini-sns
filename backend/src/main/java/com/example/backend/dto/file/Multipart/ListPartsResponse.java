package com.example.backend.dto.file.Multipart;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import java.util.List;

@Builder
public record ListPartsResponse (
        List<PartInfo> parts
){
    @Builder
    public record PartInfo(
            @JsonProperty("PartNumber")
            Integer partNumber,

            @JsonProperty("Size")
            Long size,

            @JsonProperty("ETag")
            String eTag
    ){}
}