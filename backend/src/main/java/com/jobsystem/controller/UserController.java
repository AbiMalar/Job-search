package com.jobsystem.controller;

import com.jobsystem.dto.Dtos.ProfileRequest;
import com.jobsystem.model.User;
import com.jobsystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @GetMapping("/me")
    public User me(@AuthenticationPrincipal User user) {
        return user;
    }

    @PutMapping("/me")
    public User update(@AuthenticationPrincipal User user, @Valid @RequestBody ProfileRequest r) {
        return users.update(user, r);
    }
}
