package com.instagram_clone.user_service.services;

import com.instagram_clone.user_service.interfaces.mappers.UserGrpcMapper;
import com.instagram_clone.user_service.interfaces.repositories.UserRepository;
import com.instagram_clone.user_service.models.User;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.grpc.server.service.GrpcService;
import user.v1.UserOuterClass;
import user.v1.UserServiceGrpc;


@GrpcService
@RequiredArgsConstructor
@Slf4j
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    private final UserGrpcMapper userMapper;
    private final UserRepository userRepository;

    @Override
    public void getUserById(UserOuterClass.GetUserByIdRequest request,
                            StreamObserver<UserOuterClass.UserResponse> responseObserver) {

        User user = userRepository.findById(request.getId()).orElseThrow(() ->
                new RuntimeException("User not found"));

        UserOuterClass.User userMapperGrpc = userMapper.toGrpc(user);
        UserOuterClass.UserResponse userResponse = UserOuterClass.UserResponse.
                newBuilder()
                .setUser(userMapperGrpc)
                .build();

        responseObserver.onNext(userResponse);
        responseObserver.onCompleted();
    }

    @Override
    public void registerUser(UserOuterClass.UserSecuredRequest request,
                             StreamObserver<UserOuterClass.UserResponse> responseObserver) {
        //https://www.youtube.com/watch?v=SMy4CaxizbA
        //https://www.youtube.com/watch?v=Bj7g8voWJNU


        UserOuterClass.UserWithCredentials grpcUser = request.getUserWithCredentials();

        if (grpcUser.getUsername().isEmpty() || grpcUser.getEmail().isEmpty()) {
            StatusRuntimeException exception = Status.INVALID_ARGUMENT
                    .withDescription("Required fields are missing")
                    .asRuntimeException();
            responseObserver.onError(exception);
            return;
        }

        User user = userMapper.toEntity(grpcUser);
        System.out.println(user.toString());

        if (userRepository.existsByUsername(user.getUsername())) {
            StatusRuntimeException exception =
                    Status.ALREADY_EXISTS
                            .withDescription("User with this username already exists")
                            .asRuntimeException();
            responseObserver.onError(exception);
            return;
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            StatusRuntimeException exception =
                    Status.ALREADY_EXISTS
                            .withDescription("User with this email alredy exists")
                            .asRuntimeException();
            responseObserver.onError(exception);
            return;
        }

        //user = userRepository.save(user);


        UserOuterClass.User responseUser = userMapper.toGrpc(user);

        UserOuterClass.UserResponse response = UserOuterClass.UserResponse.newBuilder()
                .setUser(responseUser)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
