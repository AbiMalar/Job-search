package com.jobsystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document("jobs")
public class Job {
    @Id private String id;
    private String title;
    private String company;
    private String location;
    @Indexed private String category;
    private String type;        // Full-time, Part-time, Contract, Internship
    private String experience;  // Entry, Mid, Senior
    private Integer salaryMin;  // annual, in lakhs (LPA)
    private Integer salaryMax;
    private String description;
    private List<String> skills = new ArrayList<>();
    private LocalDate deadline;
    @Indexed private String employerId; // reference -> users._id
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
