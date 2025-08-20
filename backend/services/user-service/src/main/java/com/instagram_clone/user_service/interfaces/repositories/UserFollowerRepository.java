package com.instagram_clone.user_service.interfaces.repositories;

import com.instagram_clone.user_service.models.UserFollower;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFollowerRepository extends JpaRepository<UserFollower, Long> {

}
