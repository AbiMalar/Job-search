package com.jobsystem.service;

import com.jobsystem.dto.Dtos.CategoryCount;
import com.jobsystem.dto.Dtos.JobRequest;
import com.jobsystem.model.Job;
import com.jobsystem.model.User;
import com.jobsystem.repository.ApplicationRepository;
import com.jobsystem.repository.JobRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JobService {
    private final JobRepository jobs;
    private final ApplicationRepository applications;
    private final MongoTemplate mongo;

    public JobService(JobRepository jobs, ApplicationRepository applications, MongoTemplate mongo) {
        this.jobs = jobs;
        this.applications = applications;
        this.mongo = mongo;
    }

    public List<Job> search(String q, String skills, String location, String category, String type,
                            String experience, Integer minSalary, Integer limit) {
        List<Criteria> all = new ArrayList<>();
        if (has(q)) {
            String rx = Pattern.quote(q.trim());
            all.add(new Criteria().orOperator(Criteria.where("title").regex(rx, "i"), Criteria.where("company").regex(rx, "i")));
        }
        if (has(skills)) {
            List<Criteria> any = Arrays.stream(skills.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .map(s -> Criteria.where("skills").regex(Pattern.quote(s), "i")).toList();
            if (!any.isEmpty()) all.add(new Criteria().orOperator(any));
        }
        if (has(location)) all.add(Criteria.where("location").regex(Pattern.quote(location.trim()), "i"));
        if (has(category)) all.add(Criteria.where("category").is(category));
        if (has(type)) all.add(Criteria.where("type").is(type));
        if (has(experience)) all.add(Criteria.where("experience").is(experience));
        if (minSalary != null) all.add(Criteria.where("salaryMax").gte(minSalary));

        Query query = new Query();
        if (!all.isEmpty()) query.addCriteria(new Criteria().andOperator(all));
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        if (limit != null && limit > 0) query.limit(limit);
        return mongo.find(query, Job.class);
    }

    public Job get(String id) {
        return jobs.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    public List<Job> mine(User employer) {
        return jobs.findByEmployerIdOrderByCreatedAtDesc(employer.getId());
    }

    public List<CategoryCount> categories() {
        return jobs.findAll().stream()
                .collect(Collectors.groupingBy(Job::getCategory, TreeMap::new, Collectors.counting()))
                .entrySet().stream().map(e -> new CategoryCount(e.getKey(), e.getValue())).toList();
    }

    public Job create(User employer, JobRequest r) {
        Job j = new Job();
        j.setEmployerId(employer.getId());
        return save(j, r);
    }

    public Job update(String id, User employer, JobRequest r) {
        Job j = owned(id, employer);
        return save(j, r);
    }

    public void delete(String id, User employer) {
        owned(id, employer);
        applications.deleteByJobId(id);
        jobs.deleteById(id);
    }

    private Job owned(String id, User employer) {
        Job j = get(id);
        if (!j.getEmployerId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own jobs");
        }
        return j;
    }

    private Job save(Job j, JobRequest r) {
        if (r.salaryMin() > r.salaryMax()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum salary cannot exceed maximum salary");
        }
        j.setTitle(r.title().trim());
        j.setCompany(r.company().trim());
        j.setLocation(r.location().trim());
        j.setCategory(r.category());
        j.setType(r.type());
        j.setExperience(r.experience());
        j.setSalaryMin(r.salaryMin());
        j.setSalaryMax(r.salaryMax());
        j.setDescription(r.description().trim());
        j.setSkills(r.skills().stream().map(String::trim).filter(s -> !s.isEmpty()).toList());
        j.setDeadline(r.deadline());
        j.setUpdatedAt(Instant.now());
        return jobs.save(j);
    }

    private boolean has(String s) {
        return s != null && !s.isBlank();
    }
}
