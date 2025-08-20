package com.instagram_clone.user_service.interfaces.repositories;

import com.instagram_clone.user_service.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
