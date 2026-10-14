package com.jobsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document("users")
public class User {
    @Id private String id;
    private String fullName;
    @Indexed(unique = true) private String email;
    @JsonIgnore private String password; // BCrypt hash, never serialized
    private Role role;
    private String company;
    private String phone;
    private String headline;
    private String bio;
    private List<String> skills = new ArrayList<>();
    private Instant createdAt = Instant.now();
}
