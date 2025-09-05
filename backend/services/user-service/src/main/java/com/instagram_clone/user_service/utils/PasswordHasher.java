package com.instagram_clone.user_service.utils;

import org.springframework.stereotype.Component;
import at.favre.lib.crypto.bcrypt.BCrypt;


public class PasswordHasher {
    public static String hashPassword(String password) {
        return BCrypt.withDefaults().hashToString(12, password.toCharArray());
    }
}
