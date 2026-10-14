package com.jobsystem.controller;

import com.jobsystem.dto.Dtos.CategoryCount;
import com.jobsystem.dto.Dtos.JobRequest;
import com.jobsystem.model.Job;
import com.jobsystem.model.User;
import com.jobsystem.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobs;

    public JobController(JobService jobs) {
        this.jobs = jobs;
    }

    @GetMapping
    public List<Job> search(@RequestParam(required = false) String q,
                            @RequestParam(required = false) String skills,
                            @RequestParam(required = false) String location,
                            @RequestParam(required = false) String category,
                            @RequestParam(required = false) String type,
                            @RequestParam(required = false) String experience,
                            @RequestParam(required = false) Integer minSalary,
                            @RequestParam(required = false) Integer limit) {
        return jobs.search(q, skills, location, category, type, experience, minSalary, limit);
    }

    @GetMapping("/categories")
    public List<CategoryCount> categories() {
        return jobs.categories();
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<Job> mine(@AuthenticationPrincipal User user) {
        return jobs.mine(user);
    }

    @GetMapping("/{id}")
    public Job get(@PathVariable String id) {
        return jobs.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('EMPLOYER')")
    public Job create(@AuthenticationPrincipal User user, @Valid @RequestBody JobRequest r) {
        return jobs.create(user, r);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public Job update(@PathVariable String id, @AuthenticationPrincipal User user, @Valid @RequestBody JobRequest r) {
        return jobs.update(id, user, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('EMPLOYER')")
    public void delete(@PathVariable String id, @AuthenticationPrincipal User user) {
        jobs.delete(id, user);
    }
}
