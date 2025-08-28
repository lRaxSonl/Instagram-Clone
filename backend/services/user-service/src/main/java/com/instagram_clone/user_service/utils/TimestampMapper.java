package com.instagram_clone.user_service.utils;

import com.google.protobuf.Timestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class TimestampMapper {
    public static Timestamp toTimestamp(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return Timestamp.getDefaultInstance();
        }
        Instant instant = localDateTime.toInstant(ZoneOffset.UTC);
        return Timestamp.newBuilder()
                .setSeconds(localDateTime.toEpochSecond(ZoneOffset.UTC))
                .setNanos(instant.getNano())
                .build();
    }

    public static LocalDateTime toLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return LocalDateTime.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos(), ZoneOffset.UTC);
    }

    public static Timestamp toTimestamp(LocalDate localDate) {
        if (localDate == null) return Timestamp.getDefaultInstance();
        LocalDateTime startOfDay = localDate.atStartOfDay();
        return toTimestamp(startOfDay);
    }

    public static LocalDate toLocalDate(Timestamp timestamp) {
        if (timestamp == null) return null;
        return toLocalDateTime(timestamp).toLocalDate();
    }
}
