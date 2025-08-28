package com.instagram_clone.user_service.interfaces.mappers;

import com.instagram_clone.user_service.models.User;
import com.instagram_clone.user_service.utils.TimestampMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import user.v1.UserOuterClass;

@Mapper(componentModel = "spring", uses = TimestampMapper.class, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface UserGrpcMapper {
    // gRPC -> Entity

    User toEntity(UserOuterClass.UserWithCredentials grpcUser);

    User toEntity(UserOuterClass.User grpcUser);


    UserOuterClass.User toGrpc(User user);


    UserOuterClass.UserWithCredentials toGrpcWithCredentials(User user);
}
