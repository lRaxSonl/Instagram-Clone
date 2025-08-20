package com.instagram_clone.user_service.interfaces.repositories;

import com.instagram_clone.user_service.models.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingRepository extends JpaRepository<UserSettings, Long> {

}
