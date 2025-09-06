package com.instagram_clone.user_service.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User extends AbstractModel {
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "avatar", nullable = true, length = 300)
    private String avatar;

    @Column(name = "firstname", nullable = true, length = 100)
    private String firstName;

    @Column(name = "lastname", nullable = true, length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = true, length = 100)
    private LocalDate dateOfBirth;

    @Column(name = "bio", nullable = true, length = 300)
    private String bio;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserFollower> followers;  // кто подписан на этого пользователя

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL)
    private Set<UserFollower> following;  // на кого подписан этот пользователь
}
