package com.instagram_clone.user_service.services;

import com.instagram_clone.user_service.exceptions.NotFoundException;
import com.instagram_clone.user_service.interfaces.mappers.UserGrpcMapper;
import com.instagram_clone.user_service.interfaces.repositories.UserRepository;
import com.instagram_clone.user_service.models.User;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import user.v1.UserOuterClass;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserGrpcServiceTest {

    @Mock
    private UserGrpcMapper userMapper;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserGrpcService userGrpcService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        if (closeable != null) {
            closeable.close();
        }
    }

    // Test data
    private final Long userId = 1L;
    private final User testUser = User.builder()
            .username("john_doe")
            .password("hashedPassword")
            .email("john@example.com")
            .avatar("avatar.jpg")
            .firstName("john")
            .lastName("doe")
            .dateOfBirth(LocalDate.now().minusYears(20))
            .bio("bio")
            .followers(Collections.emptySet())
            .following(Collections.emptySet())
            .build();
    private final UserOuterClass.User grpcUser = UserOuterClass.User.newBuilder()
            .setId(userId)
            .setUsername("john_doe")
            .setFirstname("john")
            .setLastname("doe")
            .setAvatar("avatar.jpg")
            .setBio("bio")
            .setEmail("john@example.com")
            .build();
    private final UserOuterClass.UserResponse userResponse = UserOuterClass.UserResponse.newBuilder()
            .setUser(grpcUser)
            .build();

    // Mock StreamObserver
    private StreamObserver<UserOuterClass.UserResponse> responseObserver = mock(StreamObserver.class);

    @Test
    void getUserById_SuccessfulRetrieval_ReturnsUserResponse() {
        // Arrange
        UserOuterClass.GetUserByIdRequest request = UserOuterClass.GetUserByIdRequest.newBuilder()
                .setId(userId)
                .build();
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(testUser));
        when(userMapper.toGrpc(testUser)).thenReturn(grpcUser);

        // Act
        userGrpcService.getUserById(request, responseObserver);

        // Assert
        verify(responseObserver).onNext(userResponse);
        verify(responseObserver).onCompleted();
        verify(responseObserver, never()).onError(any());
        verify(userRepository).findById(userId);
        verify(userMapper).toGrpc(testUser);
    }

    @Test
    void getUserById_UserNotFound_ThrowsNotFoundException() {
        // Arrange
        UserOuterClass.GetUserByIdRequest request = UserOuterClass.GetUserByIdRequest.newBuilder()
                .setId(userId)
                .build();
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty());
        String expectedMessage = "User with id " + userId + " not found";

        // Act
        userGrpcService.getUserById(request, responseObserver);

        // Assert
        ArgumentCaptor<StatusRuntimeException> captor = ArgumentCaptor.forClass(StatusRuntimeException.class);
        verify(responseObserver).onError(captor.capture());
        StatusRuntimeException exception = captor.getValue();
        assertEquals(Status.NOT_FOUND.getCode(), exception.getStatus().getCode());
        assertEquals(expectedMessage, exception.getStatus().getDescription());
        verify(responseObserver, never()).onNext(any());
        verify(responseObserver, never()).onCompleted();
    }

    @Test
    void getUserById_UnexpectedError_ThrowsInternalError() {
        // Arrange
        UserOuterClass.GetUserByIdRequest request = UserOuterClass.GetUserByIdRequest.newBuilder()
                .setId(userId)
                .build();
        when(userRepository.findById(userId)).thenThrow(new RuntimeException("Database failure"));

        // Act
        userGrpcService.getUserById(request, responseObserver);

        // Assert
        ArgumentCaptor<StatusRuntimeException> captor = ArgumentCaptor.forClass(StatusRuntimeException.class);
        verify(responseObserver).onError(captor.capture());
        StatusRuntimeException exception = captor.getValue();
        assertEquals(Status.INTERNAL.getCode(), exception.getStatus().getCode());
        assertEquals("Internal server error", exception.getStatus().getDescription());
        verify(responseObserver, never()).onNext(any());
        verify(responseObserver, never()).onCompleted();
    }

    @Test
    void getSecureDetailsUser_SuccessfulRetrieval_ReturnsSecuredUserResponse() {
        // Arrange
        UserOuterClass.GetUserByIdRequest request = UserOuterClass.GetUserByIdRequest.newBuilder()
                .setId(userId)
                .build();
        UserOuterClass.UserWithCredentials securedGrpcUser = UserOuterClass.UserWithCredentials.newBuilder()
                .setId(userId)
                .setUsername("john_doe")
                .setPassword("hashedPassword")
                .setEmail("john@example.com")
                .build();
        UserOuterClass.UserSecuredResponse securedResponse = UserOuterClass.UserSecuredResponse.newBuilder()
                .setSecureUser(securedGrpcUser)
                .build();
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(testUser));
        when(userMapper.toGrpcWithCredentials(testUser)).thenReturn(securedGrpcUser);

        StreamObserver<UserOuterClass.UserSecuredResponse> securedObserver = mock(StreamObserver.class);

        // Act
        userGrpcService.getSecureDetailsUser(request, securedObserver);

        // Assert
        verify(securedObserver).onNext(securedResponse);
        verify(securedObserver).onCompleted();
        verify(securedObserver, never()).onError(any());
        verify(userRepository).findById(userId);
        verify(userMapper).toGrpcWithCredentials(testUser);
    }

    @Test
    void registerUser_SuccessfulRegistration_ReturnsUserResponse() {
        // Arrange
        UserOuterClass.UserSecuredRequest request = UserOuterClass.UserSecuredRequest.newBuilder()
                .setUserWithCredentials(UserOuterClass.UserWithCredentials.newBuilder()
                        .setUsername("new_user")
                        .setPassword("password123")
                        .setEmail("new@example.com")
                        .build())
                .build();
        User userEntity = User.builder()
                .username("new_user")
                .password("password123")
                .email("new@example.com")
                .followers(Collections.emptySet())
                .following(Collections.emptySet())
                .build();
        User savedUser = User.builder()
                .username("new_user")
                .password("password123")
                .email("new@example.com")
                .followers(Collections.emptySet())
                .following(Collections.emptySet())
                .build();
        when(userMapper.toEntity(any(UserOuterClass.UserWithCredentials.class))).thenReturn(userEntity);
        when(userRepository.existsByUsername("new_user")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(userEntity)).thenReturn(savedUser);
        when(userMapper.toGrpc(savedUser)).thenReturn(grpcUser);

        // Act
        userGrpcService.registerUser(request, responseObserver);

        // Assert
        verify(responseObserver).onNext(userResponse);
        verify(responseObserver).onCompleted();
        verify(responseObserver, never()).onError(any());
        verify(userRepository).save(userEntity);
        verify(userMapper).toEntity(any(UserOuterClass.UserWithCredentials.class));
        verify(userMapper).toGrpc(savedUser);
    }

    @Test
    void registerUser_MissingRequiredFields_ThrowsInvalidArgument() {
        // Arrange
        UserOuterClass.UserSecuredRequest request = UserOuterClass.UserSecuredRequest.newBuilder()
                .setUserWithCredentials(UserOuterClass.UserWithCredentials.newBuilder()
                        .setUsername("")
                        .setEmail("")
                        .build())
                .build();

        // Act
        userGrpcService.registerUser(request, responseObserver);

        // Assert
        ArgumentCaptor<StatusRuntimeException> captor = ArgumentCaptor.forClass(StatusRuntimeException.class);
        verify(responseObserver).onError(captor.capture());
        StatusRuntimeException exception = captor.getValue();
        assertEquals(Status.INVALID_ARGUMENT.getCode(), exception.getStatus().getCode());
        assertEquals("Required fields are missing", exception.getStatus().getDescription());
        verify(responseObserver, never()).onNext(any());
        verify(responseObserver, never()).onCompleted();
    }

    @Test
    void registerUser_UsernameAlreadyExists_ThrowsAlreadyExists() {
        // Arrange
        UserOuterClass.UserSecuredRequest request = UserOuterClass.UserSecuredRequest.newBuilder()
                .setUserWithCredentials(UserOuterClass.UserWithCredentials.newBuilder()
                        .setUsername("john_doe")
                        .setPassword("password123")
                        .setEmail("new@example.com")
                        .build())
                .build();
        User userEntity = User.builder()
                .username("john_doe")
                .password("password123")
                .email("new@example.com")
                .followers(Collections.emptySet())
                .following(Collections.emptySet())
                .build();
        when(userMapper.toEntity(any(UserOuterClass.UserWithCredentials.class))).thenReturn(userEntity);
        when(userRepository.existsByUsername("john_doe")).thenReturn(true);

        // Act
        userGrpcService.registerUser(request, responseObserver);

        // Assert
        ArgumentCaptor<StatusRuntimeException> captor = ArgumentCaptor.forClass(StatusRuntimeException.class);
        verify(responseObserver).onError(captor.capture());
        StatusRuntimeException exception = captor.getValue();
        assertEquals(Status.ALREADY_EXISTS.getCode(), exception.getStatus().getCode());
        assertEquals("User with this username already exists", exception.getStatus().getDescription());
        verify(responseObserver, never()).onNext(any());
        verify(responseObserver, never()).onCompleted();
    }
}