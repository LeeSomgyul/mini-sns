package com.example.backend.dto.file.Multipart;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CompleteMultipartRequest (
        String uploadId,
        String objectKey,
        List<CompletedPart> parts
){
    public record CompletedPart(

            @JsonProperty("PartNumber")
            Integer partNumber,

            @JsonProperty("ETag")
            String eTag
    ){}
}