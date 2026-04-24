package com.unisphere.entity;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.unisphere.entity.enums.RegistrationStatus;
import com.unisphere.entity.enums.UserRole;

/**
 * User Entity
 * Represents a system user (regular user, admin, technician, or lecturer)
*/
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;

    private String lastName;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String phone;

    private String gender; // specific for student

    private String title; // specific for lecturer

    private UserRole role = UserRole.STUDENT;

    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING_DETAILS;

    private Boolean isActive = true;

    // Student specific details
    private String studentId;
    private String faculty;
    private String degreeProgram;
    private String year;
    private String semester;

    // Lecturer/Technician specific details
    private String staffId;
    private String department;
    private String designation; // Lecturer specific
    private String specialization; // Technician specific
    private String assignedLab;  // Technician specific

    private Boolean emailVerified = false;

    private String oauthProvider;

    private String oauthId;

    private String profilePictureUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastLogin;

    private Set<String> notificationIds = new HashSet<>();

    private Map<String, Boolean> notificationPreferences = new HashMap<>();

    public User() {
    }

    public User(
            String id,
            String fullName,
            String email,
            String password,
            String phone,
            UserRole role,
            Boolean isActive,
            Boolean emailVerified,
            String oauthProvider,
            String oauthId,
            String profilePictureUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime lastLogin,
            Set<String> notificationIds,
            Map<String, Boolean> notificationPreferences
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role != null ? role : UserRole.STUDENT;
        this.isActive = isActive != null ? isActive : true;
        this.emailVerified = emailVerified != null ? emailVerified : false;
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.profilePictureUrl = profilePictureUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLogin = lastLogin;
        this.notificationIds = notificationIds != null ? notificationIds : new HashSet<>();
        this.notificationPreferences = notificationPreferences != null ? notificationPreferences : new HashMap<>();
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public RegistrationStatus getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(RegistrationStatus registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getDegreeProgram() {
        return degreeProgram;
    }

    public void setDegreeProgram(String degreeProgram) {
        this.degreeProgram = degreeProgram;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getAssignedLab() {
        return assignedLab;
    }

    public void setAssignedLab(String assignedLab) {
        this.assignedLab = assignedLab;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getOauthProvider() {
        return oauthProvider;
    }

    public void setOauthProvider(String oauthProvider) {
        this.oauthProvider = oauthProvider;
    }

    public String getOauthId() {
        return oauthId;
    }

    public void setOauthId(String oauthId) {
        this.oauthId = oauthId;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Set<String> getNotificationIds() {
        return notificationIds;
    }

    public void setNotificationIds(Set<String> notificationIds) {
        this.notificationIds = notificationIds;
    }

    public Map<String, Boolean> getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(Map<String, Boolean> notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
