package com.jobsystem.controller;

import com.jobsystem.dto.Dtos.ApplicationResponse;
import com.jobsystem.dto.Dtos.ApplyRequest;
import com.jobsystem.dto.Dtos.StatusRequest;
import com.jobsystem.model.User;
import com.jobsystem.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {
    private final ApplicationService apps;

    public ApplicationController(ApplicationService apps) {
        this.apps = apps;
    }

    @PostMapping("/jobs/{jobId}/apply")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ApplicationResponse apply(@PathVariable String jobId, @AuthenticationPrincipal User user,
                                     @Valid @RequestBody ApplyRequest r) {
        return apps.apply(jobId, user, r);
    }

    @GetMapping("/applications/mine")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public List<ApplicationResponse> mine(@AuthenticationPrincipal User user) {
        return apps.mine(user);
    }

    @GetMapping("/applications/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<ApplicationResponse> forEmployer(@AuthenticationPrincipal User user) {
        return apps.forEmployer(user);
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<ApplicationResponse> forJob(@PathVariable String jobId, @AuthenticationPrincipal User user) {
        return apps.forJob(jobId, user);
    }

    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ApplicationResponse status(@PathVariable String id, @AuthenticationPrincipal User user,
                                      @Valid @RequestBody StatusRequest r) {
        return apps.updateStatus(id, user, r.status());
    }
}
