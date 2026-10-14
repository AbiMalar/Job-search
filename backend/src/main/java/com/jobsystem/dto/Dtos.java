package com.jobsystem.dto;

import com.jobsystem.model.Role;
import com.jobsystem.model.Status;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class Dtos {
    public record RegisterRequest(
            @NotBlank(message = "Full name is required") String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotNull(message = "Choose a role") Role role,
            String company) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required") String password) {}

    public record AuthResponse(String token, String id, String fullName, String email, Role role) {}

    public record ProfileRequest(
            @NotBlank(message = "Full name is required") String fullName,
            String phone, String headline, String bio, String company, List<String> skills) {}

    public record JobRequest(
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Company is required") String company,
            @NotBlank(message = "Location is required") String location,
            @NotBlank(message = "Category is required") String category,
            @NotBlank(message = "Job type is required") String type,
            @NotBlank(message = "Experience level is required") String experience,
            @NotNull(message = "Minimum salary is required") @PositiveOrZero(message = "Salary cannot be negative") Integer salaryMin,
            @NotNull(message = "Maximum salary is required") @PositiveOrZero(message = "Salary cannot be negative") Integer salaryMax,
            @NotBlank(message = "Description is required") @Size(min = 20, message = "Description must be at least 20 characters") String description,
            @NotEmpty(message = "Add at least one skill") List<String> skills,
            @NotNull(message = "Deadline is required") @FutureOrPresent(message = "Deadline cannot be in the past") LocalDate deadline) {}

    public record ApplyRequest(@Size(max = 3000, message = "Cover letter is too long") String coverLetter, String resumeUrl) {}

    public record StatusRequest(@NotNull(message = "Status is required") Status status) {}

    public record CategoryCount(String name, long count) {}

    public record ApplicationResponse(
            String id, String jobId, String jobTitle, String company, Status status,
            String coverLetter, String resumeUrl, Instant appliedAt,
            String applicantName, String applicantEmail, String applicantPhone,
            String applicantHeadline, List<String> applicantSkills) {}

    public record ApiError(int status, String message, Map<String, String> errors) {}
}
