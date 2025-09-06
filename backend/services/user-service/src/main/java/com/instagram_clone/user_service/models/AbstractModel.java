package com.instagram_clone.user_service.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;



@MappedSuperclass
@Data
abstract class AbstractModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
