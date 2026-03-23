# StreakArena API Reference

Base URL: `http://localhost:3000/api/v1`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Auth

### POST /auth/register
Create a new account.

**Request**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response 201**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-03-22T10:00:00.000Z"
}
```

**Errors:** `400` missing fields · `409` duplicate email/username · `422` weak password

---

### POST /auth/login
Authenticate and receive a JWT.

**Request**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 604800
}
```

**Errors:** `400` missing fields · `401` invalid credentials

---

### POST /auth/logout
🔒 Protected. Invalidates the session client-side.

**Response 200**
```json
{ "message": "Logged out successfully" }
```

---

### POST /auth/reset-password
Request a password reset token (sent via email in production; returned directly in dev).

**Request**
```json
{ "email": "john@example.com" }
```

**Response 200**
```json
{
  "message": "Password reset token generated",
  "reset_token": "a1b2c3..."
}
```

---

### POST /auth/reset-password/:token
Set a new password using the reset token.

**Request**
```json
{ "new_password": "NewSecurePass123!" }
```

**Response 200**
```json
{ "message": "Password reset successfully" }
```

**Errors:** `400` expired/invalid token · `422` weak password

---

## Users

### GET /users/me
🔒 Protected. Get the authenticated user's profile.

**Response 200**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-03-22T10:00:00.000Z"
}
```

---

### GET /users/dashboard
🔒 Protected. Full dashboard with streaks, groups, and calendar.

**Response 200**
```json
{
  "user": { "id": 1, "username": "john_doe" },
  "global_streak": { "current": 5, "longest": 12 },
  "groups": [
    {
      "id": 10,
      "name": "LeetCode Daily",
      "current_streak": 5,
      "leaderboard_position": 2,
      "tasks_today": [
        { "id": 101, "name": "Solve LeetCode Problem", "type": "leetcode", "status": "completed" }
      ]
    }
  ],
  "streak_calendar": {
    "2025-03-22": "completed",
    "2025-03-21": "completed",
    "2025-03-20": "missed"
  }
}
```

---

## Groups

### POST /groups
🔒 Protected. Create a new group (creator becomes admin).

**Request**
```json
{
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "visibility": "public",
  "tasks": [
    {
      "name": "Solve LeetCode Problem",
      "type": "leetcode",
      "is_required": true,
      "config": { "platform": "leetcode", "username": "john_doe" }
    }
  ]
}
```

**Response 201**
```json
{
  "id": 10,
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "owner_id": 1,
  "visibility": "public",
  "invite_token": "abc123xyz789",
  "created_at": "2025-03-22T10:00:00.000Z"
}
```

**Errors:** `400` missing name

---

### GET /groups/search
🔒 Protected. Search public groups by name.

**Query params:** `q` (search term) · `page` (default: 1) · `limit` (default: 20)

**Example:** `GET /groups/search?q=leetcode&page=1&limit=10`

**Response 200**
```json
{
  "groups": [
    {
      "id": 10,
      "name": "LeetCode Daily Challenge",
      "description": "Solve one problem per day",
      "visibility": "public",
      "owner": { "id": 1, "username": "john_doe" },
      "created_at": "2025-03-22T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 10, "pages": 1 }
}
```

---

### GET /groups/:id
🔒 Protected. Get group details with tasks and leaderboard.

**Response 200**
```json
{
  "id": 10,
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "owner_id": 1,
  "visibility": "public",
  "member_count": 15,
  "tasks": [
    { "id": 101, "name": "Solve LeetCode Problem", "type": "leetcode", "is_required": true }
  ],
  "leaderboard": [
    { "rank": 1, "user_id": 2, "username": "alice", "current_streak": 10, "total_completions": 45 },
    { "rank": 2, "user_id": 1, "username": "john_doe", "current_streak": 5, "total_completions": 32 }
  ],
  "created_at": "2025-03-22T10:00:00.000Z"
}
```

**Errors:** `404` group not found

---

### POST /groups/:id/join
🔒 Protected. Join a group using an invite token.

**Request**
```json
{ "invite_token": "abc123xyz789" }
```

**Response 200**
```json
{
  "message": "Successfully joined group",
  "group_id": 10,
  "user_id": 1
}
```

**Errors:** `400` missing/invalid/expired token · `404` group not found · `409` already a member

---

### POST /groups/:id/invite
🔒 Protected. Generate a new invite link (admin only).

**Response 200**
```json
{
  "invite_token": "abc123xyz789",
  "invite_link": "http://localhost:3000/api/v1/groups/10/join",
  "expires_at": "2025-04-22T10:00:00.000Z"
}
```

**Errors:** `403` not an admin

---

## Tasks

### GET /tasks/today
🔒 Protected. Get all tasks for today across all groups the user belongs to.

**Response 200**
```json
{
  "tasks": [
    {
      "id": 101,
      "group_id": 10,
      "group_name": "LeetCode Daily",
      "name": "Solve LeetCode Problem",
      "type": "leetcode",
      "status": "completed",
      "completed_at": "2025-03-22T14:30:00.000Z"
    },
    {
      "id": 102,
      "group_id": 10,
      "group_name": "LeetCode Daily",
      "name": "Read Article",
      "type": "manual",
      "status": "pending",
      "completed_at": null
    }
  ]
}
```

---

### POST /tasks
🔒 Protected. Create a task in a group (admin only).

**Request**
```json
{
  "group_id": 10,
  "name": "Read a tech article",
  "type": "manual",
  "is_required": true,
  "config": { "description": "Read any tech article for 10 mins" }
}
```

**Response 201**
```json
{
  "id": 102,
  "group_id": 10,
  "name": "Read a tech article",
  "type": "manual",
  "config": { "description": "Read any tech article for 10 mins" },
  "is_required": true,
  "created_at": "2025-03-22T10:00:00.000Z"
}
```

**Errors:** `400` missing fields · `403` not an admin

---

### DELETE /tasks/:id
🔒 Protected. Delete a task (admin only).

**Response 200**
```json
{ "message": "Task deleted" }
```

**Errors:** `403` not an admin · `404` task not found

---

### POST /tasks/:id/complete
🔒 Protected. Mark a task as completed for today.

**Response 200**
```json
{
  "task_id": 101,
  "user_id": 1,
  "date": "2025-03-22",
  "status": "completed",
  "streak_updated": true,
  "new_streak": 5,
  "completed_at": "2025-03-22T14:30:00.000Z"
}
```

**Errors:** `400` already completed today · `403` not a group member · `404` task not found

---

## Error Format

All errors follow this shape:
```json
{ "error": "Human-readable error message" }
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity (e.g. weak password) |
| 500 | Internal server error |
