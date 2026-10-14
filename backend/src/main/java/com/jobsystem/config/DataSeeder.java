package com.jobsystem.config;

import com.jobsystem.model.Job;
import com.jobsystem.model.Role;
import com.jobsystem.model.User;
import com.jobsystem.repository.JobRepository;
import com.jobsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/** Seeds demo accounts and 10 sample jobs when the database is empty. */
@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final JobRepository jobs;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public DataSeeder(UserRepository users, JobRepository jobs, PasswordEncoder encoder,
                      @Value("${app.seed.enabled}") boolean enabled) {
        this.users = users;
        this.jobs = jobs;
        this.encoder = encoder;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || jobs.count() > 0) return;

        User employer = new User();
        employer.setFullName("Meera Raman");
        employer.setEmail("employer@demo.com");
        employer.setPassword(encoder.encode("Employer@123"));
        employer.setRole(Role.EMPLOYER);
        employer.setCompany("TechNova Solutions");
        users.save(employer);

        User seeker = new User();
        seeker.setFullName("Arun Kumar");
        seeker.setEmail("seeker@demo.com");
        seeker.setPassword(encoder.encode("Seeker@123"));
        seeker.setRole(Role.JOB_SEEKER);
        seeker.setHeadline("Java developer with 2 years of experience");
        seeker.setSkills(List.of("Java", "Spring Boot", "MongoDB"));
        users.save(seeker);

        String id = employer.getId();
        jobs.saveAll(List.of(
            job(id, "Software Developer", "TechNova Solutions", "Bengaluru", "Software Development", "Full-time", "Entry", 6, 10, 20,
                "Build and maintain web services and internal tools with a small product team. You will write clean, tested code and take part in code reviews.",
                "Java", "SQL", "Git", "REST"),
            job(id, "Java Developer", "Cauvery Systems", "Chennai", "Software Development", "Full-time", "Mid", 10, 16, 25,
                "Design Spring Boot microservices for a payments platform. You will own services from design through production support.",
                "Java", "Spring Boot", "MongoDB", "Docker"),
            job(id, "Frontend Developer", "PixelWorks", "Coimbatore", "Software Development", "Full-time", "Mid", 8, 14, 18,
                "Create responsive, accessible interfaces in React and work closely with designers to ship polished features.",
                "React", "JavaScript", "CSS", "Vite"),
            job(id, "Data Analyst", "InsightLoop", "Hyderabad", "Data & Analytics", "Full-time", "Entry", 5, 9, 30,
                "Turn raw business data into dashboards and weekly reports that guide product and marketing decisions.",
                "SQL", "Excel", "Power BI", "Python"),
            job(id, "Python Developer", "DataBridge Labs", "Pune", "Software Development", "Full-time", "Mid", 9, 15, 21,
                "Develop data pipelines and REST APIs in Python. Experience with FastAPI or Django is a plus.",
                "Python", "FastAPI", "PostgreSQL", "AWS"),
            job(id, "DevOps Engineer", "CloudCrest", "Bengaluru", "DevOps & Cloud", "Full-time", "Senior", 18, 28, 28,
                "Own CI/CD pipelines and Kubernetes clusters, improve reliability and cut deployment times across teams.",
                "Kubernetes", "Docker", "Terraform", "AWS"),
            job(id, "QA Automation Engineer", "TestPilot", "Chennai", "Quality Assurance", "Contract", "Mid", 7, 12, 15,
                "Write automated UI and API tests, maintain the regression suite and report quality metrics to the engineering lead.",
                "Selenium", "Java", "Postman", "CI/CD"),
            job(id, "UI/UX Designer", "Studio Indigo", "Remote", "Design", "Full-time", "Mid", 8, 13, 24,
                "Research user needs, design flows and prototypes in Figma, and hand off clear specs to developers.",
                "Figma", "Prototyping", "User Research"),
            job(id, "Full Stack Developer", "Northwind Digital", "Bengaluru", "Software Development", "Full-time", "Senior", 16, 24, 27,
                "Lead feature work across a React frontend and Spring Boot backend, mentor junior engineers and shape the architecture.",
                "React", "Java", "Spring Boot", "MongoDB"),
            job(id, "Digital Marketing Intern", "BrightReach", "Remote", "Marketing", "Internship", "Entry", 1, 2, 14,
                "Support SEO, email and social campaigns, track performance and prepare weekly campaign summaries.",
                "SEO", "Content Writing", "Google Analytics")
        ));
    }

    private Job job(String employerId, String title, String company, String location, String category, String type,
                    String experience, int min, int max, int deadlineDays, String description, String... skills) {
        Job j = new Job();
        j.setEmployerId(employerId);
        j.setTitle(title);
        j.setCompany(company);
        j.setLocation(location);
        j.setCategory(category);
        j.setType(type);
        j.setExperience(experience);
        j.setSalaryMin(min);
        j.setSalaryMax(max);
        j.setDescription(description);
        j.setSkills(List.of(skills));
        j.setDeadline(LocalDate.now().plusDays(deadlineDays));
        return j;
    }
}
