package com.jobsystem.service;

import com.jobsystem.dto.Dtos.ProfileRequest;
import com.jobsystem.model.User;
import com.jobsystem.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserService {
    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public User update(User current, ProfileRequest r) {
        current.setFullName(r.fullName().trim());
        current.setPhone(r.phone());
        current.setHeadline(r.headline());
        current.setBio(r.bio());
        current.setCompany(r.company());
        current.setSkills(r.skills() == null ? new ArrayList<>() : r.skills());
        return users.save(current);
    }
}
