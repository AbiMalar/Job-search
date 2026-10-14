package com.jobsystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@Document("applications")
@CompoundIndex(name = "one_application_per_job", def = "{'jobId': 1, 'seekerId': 1}", unique = true)
public class Application {
    @Id private String id;
    private String jobId;                 // reference -> jobs._id
    private String seekerId;              // reference -> users._id
    @Indexed private String employerId;   // reference -> users._id (job owner)
    private Status status = Status.PENDING;
    private String coverLetter;
    private String resumeUrl;
    private Instant appliedAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
