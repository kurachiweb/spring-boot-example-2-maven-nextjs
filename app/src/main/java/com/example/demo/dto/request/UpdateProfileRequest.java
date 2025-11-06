package com.example.demo.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 50, message = "Username must be at most 50 characters")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9_]*$", message = "Username must start with a letter and contain only letters, numbers, and underscores")
    private String username;

    @Size(max = 1000, message = "Bio must be at most 1000 characters")
    private String bio;

    private String profileImageUrl;
}
