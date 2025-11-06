package com.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank(message = "Content is required")
    @Size(max = 200, message = "Content must be at most 200 characters")
    private String content;

    private Long parentPostId;
}
