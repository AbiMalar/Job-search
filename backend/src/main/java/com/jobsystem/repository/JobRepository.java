package com.jobsystem.repository;

import com.jobsystem.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByEmployerIdOrderByCreatedAtDesc(String employerId);
}
