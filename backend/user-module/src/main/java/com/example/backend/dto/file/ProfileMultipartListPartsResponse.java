package com.example.backend.dto.file;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ProfileMultipartListPartsResponse(
        List<PartInfo> parts
) {
    public static ProfileMultipartListPartsResponse of(List<PartInfo> parts){
        return new ProfileMultipartListPartsResponse(parts);
    }

    public record PartInfo(
            @JsonProperty("PartNumber")
            Integer partNumber,

            @JsonProperty("Size")
            Long size,

            @JsonProperty("ETag")
            String eTag
    ){
        public static PartInfo of(Integer partNumber, Long size, String eTag){
            return new PartInfo(partNumber, size, eTag);
        }
    }
}
