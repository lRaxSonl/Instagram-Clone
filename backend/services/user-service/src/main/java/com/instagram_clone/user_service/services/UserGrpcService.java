package com.instagram_clone.user_service.services;

import com.instagram_clone.user_service.exceptions.NotFoundException;
import com.instagram_clone.user_service.interfaces.mappers.UserGrpcMapper;
import com.instagram_clone.user_service.interfaces.repositories.UserRepository;
import com.instagram_clone.user_service.models.User;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import user.v1.UserOuterClass;
import user.v1.UserServiceGrpc;
import com.instagram_clone.user_service.utils.PasswordHasher;


@GrpcService
@RequiredArgsConstructor
@Slf4j
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    private final UserGrpcMapper userMapper;
    private final UserRepository userRepository;

    //Standard user request from frontend
    @Override
    public void getUserById(UserOuterClass.GetUserByIdRequest request,
                            StreamObserver<UserOuterClass.UserResponse> responseObserver) {

        try {
            User user = userRepository.findById(request.getId())
                    .orElseThrow(() -> new NotFoundException("User with id " + request.getId() + " not found"));


            UserOuterClass.User userMapperGrpc = userMapper.toGrpc(user);
            UserOuterClass.UserResponse userResponse = UserOuterClass.UserResponse
                    .newBuilder()
                    .setUser(userMapperGrpc)
                    .build();

            responseObserver.onNext(userResponse);
            responseObserver.onCompleted();

        } catch (NotFoundException e) {
            log.error("User not found: {}", e.getMessage());
            responseObserver.onError(
                    Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        } catch (Exception e) {
            log.error("Unexpected error while fetching user: {}", e.getMessage(), e);

            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Internal server error")
                            .asRuntimeException()
            );
        }
    }

    //Internal request service to service
    @Override
    public void getSecureDetailsUser(UserOuterClass.GetUserByIdRequest request,
                                     StreamObserver<UserOuterClass.UserSecuredResponse> responseObserver) {

        try {
            User user = userRepository.findById(request.getId())
                    .orElseThrow(() -> new NotFoundException("User with id " + request.getId() + " not found"));


            UserOuterClass.UserWithCredentials userMapperGrpc = userMapper.toGrpcWithCredentials(user);
            UserOuterClass.UserSecuredResponse userSecuredResponse = UserOuterClass.UserSecuredResponse
                    .newBuilder()
                    .setSecureUser(userMapperGrpc)
                    .build();

            responseObserver.onNext(userSecuredResponse);
            responseObserver.onCompleted();

        } catch (NotFoundException e) {
            responseObserver.onError(
                    Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        } catch (Exception e) {
            log.error("Unexpected error while fetching user: {}", e.getMessage(), e);

            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Internal server error")
                            .asRuntimeException()
            );
        }
    }

    //User registration
    @Override
    public void registerUser(UserOuterClass.UserSecuredRequest request,
                             StreamObserver<UserOuterClass.UserResponse> responseObserver) {

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

        try {
            String hashedPassword = PasswordHasher.hashPassword(user.getPassword());
            user.setPassword(hashedPassword);

            user = userRepository.save(user);


            UserOuterClass.User responseUser = userMapper.toGrpc(user);

            UserOuterClass.UserResponse response = UserOuterClass.UserResponse.newBuilder()
                    .setUser(responseUser)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}
