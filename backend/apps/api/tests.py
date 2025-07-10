from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from apps.users.models import User, Subscription
from apps.posts.models import Post, Comment, Like


class APITests(APITestCase):
    def setUp(self):
        """Инициализация тестовых данных."""
        # Создаем пользователей
        self.user1 = User.objects.create_user(
            username='user1', email='user1@example.com', password='password123'
        )
        self.user2 = User.objects.create_user(
            username='user2', email='user2@example.com', password='password123'
        )

        # Создаем пост
        self.post = Post.objects.create(user=self.user1, text='Test post')

        # Создаем комментарий
        self.comment = Comment.objects.create(user=self.user1, post=self.post, text='Test comment')

        # Создаем подписку
        self.subscription = Subscription.objects.create(subscriber=self.user1, user=self.user2)

        # Очищаем кэш перед каждым тестом
        cache.clear()

    def get_tokens_for_user(self, user):
        """Получение JWT-токенов для пользователя."""
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'email': user.email, 'password': 'password123'}
        )
        return response.data['access'], response.data['refresh']

    # Тесты для аутентификации
    def test_token_obtain(self):
        """Тест получения JWT-токена."""
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'email': 'user1@example.com', 'password': 'password123'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_obtain_invalid_credentials(self):
        """Тест получения токена с неверными учетными данными."""
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'email': 'user1@example.com', 'password': 'wrongpassword'}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Тест обновления токена."""
        _, refresh = self.get_tokens_for_user(self.user1)
        response = self.client.post(
            reverse('token_refresh'),
            {'refresh': refresh}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_logout(self):
        """Тест логаута (добавление refresh-токена в черный список)."""
        _, refresh = self.get_tokens_for_user(self.user1)
        response = self.client.post(
            reverse('logout'),
            {'refresh_token': refresh}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['details'], 'Refresh token was successfully added to blacklist')

        # Проверяем, что токен в черном списке
        response = self.client.post(
            reverse('token_refresh'),
            {'refresh': refresh}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['details'][0], 'Token is blacklisted')

    # Тесты для пользователей
    def test_user_register(self):
        """Тест регистрации пользователя."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        response = self.client.post(reverse('user_register'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_register_duplicate_email(self):
        """Тест регистрации с уже существующим email."""
        data = {
            'username': 'newuser',
            'email': 'user1@example.com',
            'password': 'password123'
        }
        response = self.client.post(reverse('user_register'), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_view(self):
        """Тест просмотра профиля пользователя."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('user_detail', kwargs={'pk': self.user1.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'user1')

    def test_user_view_me_authenticated(self):
        """Тест просмотра собственного профиля."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('user_me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'user1')

    def test_user_view_me_unauthenticated(self):
        """Тест просмотра собственного профиля без аутентификации."""
        response = self.client.get(reverse('user_me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_update(self):
        """Тест обновления профиля."""
        self.client.force_authenticate(user=self.user1)
        data = {'username': 'updateduser',
                'email': 'updateduser@example.com',}
        response = self.client.put(reverse('user_update'), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.username, 'updateduser')
        self.assertEqual(self.user1.email, 'updateduser@example.com')

    def test_user_delete(self):
        """Тест удаления профиля."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(reverse('user_delete'))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.user1.id).exists())

    # Тесты для постов
    def test_post_list(self):
        """Тест получения списка постов."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('post_list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['text'], 'Test post')

    def test_post_create(self):
        """Тест создания поста."""
        self.client.force_authenticate(user=self.user1)
        data = {'text': 'New post'}
        response = self.client.post(reverse('post_create'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['text'], 'New post')
        self.assertTrue(Post.objects.filter(text='New post').exists())

    def test_post_update(self):
        """Тест обновления поста."""
        self.client.force_authenticate(user=self.user1)
        data = {'text': 'Updated post'}
        response = self.client.put(reverse('post_update', kwargs={'pk': self.post.id}), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.text, 'Updated post')

    def test_post_update_unauthorized(self):
        """Тест обновления поста другим пользователем."""
        self.client.force_authenticate(user=self.user2)
        data = {'text': 'Updated post'}
        response = self.client.put(reverse('post_update', kwargs={'pk': self.post.id}), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_delete(self):
        """Тест удаления поста."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(reverse('post_delete', kwargs={'post_id': self.post.id}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())

    # Тесты для комментариев
    def test_post_comments_view(self):
        """Тест получения комментариев к посту."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('post_comments', kwargs={'post_id': self.post.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['text'], 'Test comment')

    def test_post_comments_create(self):
        """Тест создания комментария."""
        self.client.force_authenticate(user=self.user1)
        data = {'text': 'New comment'}
        response = self.client.post(
            reverse('post_comments_create', kwargs={'post_id': self.post.id}), data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Comment.objects.filter(text='New comment').exists())

    def test_comment_update(self):
        """Тест обновления комментария."""
        self.client.force_authenticate(user=self.user1)
        data = {'text': 'Updated comment'}
        response = self.client.put(
            reverse('comments_update', kwargs={'pk': self.comment.id}), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.text, 'Updated comment')

    def test_comment_delete(self):
        """Тест удаления комментария."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(
            reverse('comments_delete', kwargs={'comment_id': self.comment.id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())

    # Тесты для лайков
    def test_like_create_post(self):
        """Тест добавления лайка к посту."""
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(
            reverse('like_create', kwargs={'post_id': self.post.id})
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Like.objects.filter(user=self.user2, post=self.post).exists())

    def test_like_create_duplicate(self):
        """Тест повторного лайка поста."""
        Like.objects.create(user=self.user2, post=self.post)
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(
            reverse('like_create', kwargs={'post_id': self.post.id})
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_like_delete(self):
        """Тест удаления лайка."""
        like = Like.objects.create(user=self.user1, post=self.post)
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(
            reverse('like_delete', kwargs={'like_id': like.id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Like.objects.filter(id=like.id).exists())

    # Тесты для подписок
    def test_user_subscriptions_view(self):
        """Тест просмотра подписок пользователя."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(
            reverse('user_subscriptions', kwargs={'user_id': self.user1.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.user2.id)

    def test_subscription_create(self):
        """Тест создания подписки."""
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(
            reverse('subscription_create', kwargs={'user_id': self.user1.id})
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Subscription.objects.filter(subscriber=self.user2, user=self.user1).exists())

    def test_subscription_create_self(self):
        """Тест попытки подписки на самого себя."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse('subscription_create', kwargs={'user_id': self.user1.id})
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_subscription_delete(self):
        """Тест удаления подписки."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(
            reverse('subscription_delete', kwargs={'user_id': self.user2.id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Subscription.objects.filter(subscriber=self.user1, user=self.user2).exists())

    def test_post_by_user(self):
        """Тест получения постов конкретного пользователя."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('post_by_user', kwargs={'id': self.user1.id}))
        print(f"test_post_by_user response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['text'], 'Test post')

    def test_comment_replies_create(self):
        """Тест создания ответа на комментарий."""
        self.client.force_authenticate(user=self.user2)
        data = {'text': 'Reply to comment'}
        response = self.client.post(
            reverse('comment_replies_create', kwargs={'parent_id': self.comment.id}),
            data
        )
        print(f"test_comment_replies_create response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Comment.objects.filter(text='Reply to comment', parent=self.comment).exists())