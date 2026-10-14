package com.jobsystem.service;

import com.jobsystem.dto.Dtos.ApplicationResponse;
import com.jobsystem.dto.Dtos.ApplyRequest;
import com.jobsystem.model.*;
import com.jobsystem.repository.ApplicationRepository;
import com.jobsystem.repository.JobRepository;
import com.jobsystem.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    private final ApplicationRepository apps;
    private final JobRepository jobs;
    private final UserRepository users;

    public ApplicationService(ApplicationRepository apps, JobRepository jobs, UserRepository users) {
        this.apps = apps;
        this.jobs = jobs;
        this.users = users;
    }

    public ApplicationResponse apply(String jobId, User seeker, ApplyRequest r) {
        Job job = jobs.findById(jobId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The application deadline for this job has passed");
        }
        if (apps.existsByJobIdAndSeekerId(jobId, seeker.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied for this job");
        }
        Application a = new Application();
        a.setJobId(jobId);
        a.setSeekerId(seeker.getId());
        a.setEmployerId(job.getEmployerId());
        a.setCoverLetter(r.coverLetter());
        a.setResumeUrl(r.resumeUrl());
        try {
            apps.save(a); // unique index (jobId, seekerId) also guards against race conditions
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied for this job");
        }
        return toViews(List.of(a)).get(0);
    }

    public List<ApplicationResponse> mine(User seeker) {
        return toViews(apps.findBySeekerIdOrderByAppliedAtDesc(seeker.getId()));
    }

    public List<ApplicationResponse> forEmployer(User employer) {
        return toViews(apps.findByEmployerIdOrderByAppliedAtDesc(employer.getId()));
    }

    public List<ApplicationResponse> forJob(String jobId, User employer) {
        Job job = jobs.findById(jobId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!job.getEmployerId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view applications for your own jobs");
        }
        return toViews(apps.findByJobIdOrderByAppliedAtDesc(jobId));
    }

    public ApplicationResponse updateStatus(String id, User employer, Status status) {
        Application a = apps.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (!a.getEmployerId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update applications for your own jobs");
        }
        a.setStatus(status);
        a.setUpdatedAt(Instant.now());
        apps.save(a);
        return toViews(List.of(a)).get(0);
    }

    private List<ApplicationResponse> toViews(List<Application> list) {
        Map<String, Job> jobMap = jobs.findAllById(list.stream().map(Application::getJobId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Job::getId, j -> j));
        Map<String, User> userMap = users.findAllById(list.stream().map(Application::getSeekerId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(User::getId, u -> u));
        return list.stream().map(a -> {
            Job j = jobMap.get(a.getJobId());
            User u = userMap.get(a.getSeekerId());
            return new ApplicationResponse(a.getId(), a.getJobId(),
                    j != null ? j.getTitle() : "(removed job)", j != null ? j.getCompany() : "",
                    a.getStatus(), a.getCoverLetter(), a.getResumeUrl(), a.getAppliedAt(),
                    u != null ? u.getFullName() : "", u != null ? u.getEmail() : "",
                    u != null ? u.getPhone() : "", u != null ? u.getHeadline() : "",
                    u != null ? u.getSkills() : List.of());
        }).toList();
    }
}
