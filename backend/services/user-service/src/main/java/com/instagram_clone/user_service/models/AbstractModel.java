package com.instagram_clone.user_service.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@MappedSuperclass
abstract class AbstractModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
