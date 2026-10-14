package com.jobsystem.repository;

import com.jobsystem.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    boolean existsByJobIdAndSeekerId(String jobId, String seekerId);
    List<Application> findBySeekerIdOrderByAppliedAtDesc(String seekerId);
    List<Application> findByEmployerIdOrderByAppliedAtDesc(String employerId);
    List<Application> findByJobIdOrderByAppliedAtDesc(String jobId);
    void deleteByJobId(String jobId);
}
