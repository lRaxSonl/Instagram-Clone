# Instagram-Clone

## Quick start

### With Docker (Recommended)
```
cd Instagram-Clone

docker-compose up --build
```

### Run Without Docker

#### Backend
```
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
➡️ Available at http://localhost:8000

#### Frontend
```
cd frontend
npm install
npm start
```
➡️ Available at http://localhost:3000

#### Redis (For Linux)

**Official documentation - https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-linux**


#### Redis with Docker

```
docker run --name my-redis -d -p 6379:6379 redis
```

# 📌 Backend API Documentation

This document describes the available API endpoints for the backend service. All endpoints follow **RESTful** principles and use **JWT authentication** for securing protected routes.

---

## 🔑 Authentication

### POST `api/v1/token/`

Obtain access and refresh tokens.

**Request body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access": "jwt_token",
  "refresh": "jwt_refresh_token"
}
```

---

### POST `api/v1/token/refresh/`

Refresh the access token using the refresh token.

**Request body:**

```json
{
  "refresh": "jwt_refresh_token"
}
```

---

### POST `api/v1/token/logout/`

Invalidate a refresh token (logout).

**Request body:**

```json
{
  "refresh": "jwt_refresh_token"
}
```

---

## 👤 Users

### POST `api/v1/user/register/`

Register a new user.

**Request body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

---

### GET `api/v1/user/{id}/`

Get public profile of a user by ID.

---

### GET `api/v1/user/me/`

Get current authenticated user's profile.

---

### PUT `api/v1/user/update/`

Update authenticated user's profile.

**Request body (example):**

```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

---

### DELETE `api/v1/user/delete/`

Delete authenticated user's account.

---

## 📝 Posts

### GET `api/v1/posts/`

Get a list of all posts.

---

### GET `api/v1/posts/user/{id}/`

Get all posts by a specific user.

---

### POST `api/v1/posts/create/`

Create a new post.

**Request body:**

```json
{
    "text":"String",
    "image" : "String",
    "tags": [
        {
            "text":"String"
        },
        {
            "text":"String"
        }
    ]
}
```

---

### PUT `api/v1/posts/update/{id}/`

Update a post by ID.

**Request body:**

```json
{
  "title": "updated title",
  "text": "updated content"
}
```

---

### DELETE `api/v1/posts/delete/{id}/`

Delete a post by ID.

---

## 💬 Comments

### GET `api/v1/posts/{post_id}/comments/`

Get all comments for a post.

---

### POST `api/v1/posts/{post_id}/comments/create/`

Create a new comment for a post.

**Request body:**

```json
{
  "text": "string"
}
```

---

### POST `api/v1/comments/{parent_id}/reply/create/`

Reply to a comment.

**Request body:**

```json
{
  "text": "string"
}
```

---

### PUT `api/v1/comments/update/{id}/`

Update a comment.

**Request body:**

```json
{
  "text": "updated content"
}
```

---

### DELETE `api/v1/comments/delete/{id}/`

Delete a comment by ID.

---

## 👍 Likes

### POST `api/v1/posts/{post_id}/like/add/`

Add a like to a post.

---

### POST `api/v1/comment/{comment_id}/like/add/`

Add a like to a comment.

---

### DELETE `api/v1/like/delete/{id}/`

Remove a like by ID.

---

## 🔔 Subscriptions

### GET `api/v1/user/{user_id}/subscriptions/`

Get all users that the specified user is subscribed to.

---

### GET `api/v1/user/{user_id}/subscribers/`

Get all users who subscribed to the specified user.

---

### POST `api/v1/subscription/create/{user_id}/`

Subscribe to a user.

---

### DELETE `api/v1/subscription/delete/{user_id}/`

Unsubscribe from a user.

---

## ⚙️ Notes

* All protected routes require a valid `Authorization: Bearer <access_token>` header.
* Requests and responses follow standard RESTful patterns.
* Pagination, filtering, and ordering may be supported (depending on backend configuration).
* The chat was not fully completed due to the fact that I decided to rewrite the backend into another language, perhaps I will complete it later.
* The sqlite test database is used.
