# StreakSync Backend - claude.md

## 🎯 Project Overview
StreakSync is a habit tracking app with group-based streaks, leaderboards, and integrations (LeetCode, GitHub).

**Backend Stack**: Python (FastAPI) + PostgreSQL + JWT Auth
**Purpose**: REST API for user authentication, group management, task tracking, and streak calculation

---

## 📊 Database Schema

### Users
```python
id: int (PK)
username: str (unique, 50 chars max)
email: str (unique, verified)
password_hash: str (bcrypt)
created_at: timestamp
updated_at: timestamp
```

### Groups
```python
id: int (PK)
name: str (100 chars)
description: text
owner_id: int (FK → users)
visibility: str ('public' | 'private')
invite_token: str (unique, 50 chars)
invite_expires_at: timestamp (nullable)
created_at: timestamp
```

### GroupMembers
```python
id: int (PK)
user_id: int (FK → users) - ON DELETE CASCADE
group_id: int (FK → groups) - ON DELETE CASCADE
role: str ('admin' | 'member')
joined_at: timestamp
UNIQUE(user_id, group_id)
```

### Tasks
```python
id: int (PK)
group_id: int (FK → groups) - ON DELETE CASCADE
name: str (100 chars)
type: str ('manual' | 'leetcode' | 'github')
config: jsonb
  # manual: { "description": "Run 5km" }
  # leetcode: { "platform": "leetcode", "username": "user123" }
  # github: { "platform": "github", "username": "user123", "repositories": ["repo1"] }
is_required: bool (default: true)
created_at: timestamp
```

### DailyCompletions
```python
id: int (PK)
user_id: int (FK → users) - ON DELETE CASCADE
task_id: int (FK → tasks) - ON DELETE CASCADE
date: date
status: str ('completed' | 'pending')
completed_at: timestamp (nullable)
created_at: timestamp
UNIQUE(user_id, task_id, date)
```

### Streaks
```python
id: int (PK)
user_id: int (FK → users) - ON DELETE CASCADE
group_id: int (FK → groups) - ON DELETE CASCADE
current_streak: int (default: 0)
longest_streak: int (default: 0)
last_active_date: date
updated_at: timestamp
UNIQUE(user_id, group_id)
```

---

## 🔌 API Endpoints Reference

### Authentication (Public)

#### POST /auth/register
```python
# Request
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Response (201)
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-03-22T10:00:00Z"
}

# Errors: 400 (validation), 409 (duplicate username/email)
```

#### POST /auth/login
```python
# Request
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Response (200)
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 604800  # 7 days in seconds
}

# Errors: 401 (invalid credentials), 404 (user not found)
```

#### POST /auth/reset-password
```python
# Request
{
  "email": "john@example.com"
}

# Response (200)
{
  "message": "Password reset email sent"
}

# Note: Creates time-limited reset token (15-30 min), sent via email
```

#### POST /auth/reset-password/:token
```python
# Request
{
  "new_password": "NewSecurePass123!"
}

# Response (200)
{
  "message": "Password reset successfully"
}

# Errors: 400 (expired/invalid token), 422 (weak password)
```

---

### User Endpoints (Protected - Require JWT)

#### GET /users/me
```python
# Response (200)
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-03-22T10:00:00Z"
}
```

#### GET /users/dashboard
```python
# Response (200)
{
  "user": {
    "id": 1,
    "username": "john_doe"
  },
  "global_streak": {
    "current": 5,
    "longest": 12
  },
  "groups": [
    {
      "id": 10,
      "name": "LeetCode Daily",
      "current_streak": 5,
      "leaderboard_position": 2,
      "tasks_today": [
        {
          "id": 101,
          "name": "Solve LeetCode Problem",
          "type": "leetcode",
          "status": "completed"
        }
      ]
    }
  ],
  "streak_calendar": {
    "2025-03-22": "completed",
    "2025-03-21": "completed",
    "2025-03-20": "missed",
    "2025-03-19": "completed"
  }
}
```

---

### Group Endpoints (Protected)

#### POST /groups
```python
# Request
{
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "visibility": "public",
  "tasks": [
    {
      "name": "Solve LeetCode Problem",
      "type": "leetcode",
      "is_required": True,
      "config": {
        "platform": "leetcode",
        "username": "john_doe"
      }
    }
  ]
}

# Response (201)
{
  "id": 10,
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "owner_id": 1,
  "visibility": "public",
  "invite_token": "abc123xyz789",
  "created_at": "2025-03-22T10:00:00Z"
}
```

#### GET /groups/:id
```python
# Response (200)
{
  "id": 10,
  "name": "LeetCode Daily Challenge",
  "description": "Solve one problem per day",
  "owner_id": 1,
  "visibility": "public",
  "member_count": 15,
  "tasks": [
    {
      "id": 101,
      "name": "Solve LeetCode Problem",
      "type": "leetcode",
      "is_required": True
    }
  ],
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 2,
      "username": "alice",
      "current_streak": 10,
      "total_completions": 45
    },
    {
      "rank": 2,
      "user_id": 1,
      "username": "john_doe",
      "current_streak": 5,
      "total_completions": 32
    }
  ],
  "created_at": "2025-03-22T10:00:00Z"
}
```

#### POST /groups/:id/join
```python
# Request
{
  "invite_token": "abc123xyz789"
}

# Response (200)
{
  "message": "Successfully joined group",
  "group_id": 10,
  "user_id": 1
}

# Errors: 404 (group not found), 400 (invalid/expired token), 409 (already member)
```

#### POST /groups/:id/invite
```python
# Response (200)
{
  "invite_token": "abc123xyz789",
  "invite_link": "https://app.streaksync.com/join/abc123xyz789",
  "expires_at": "2025-04-22T10:00:00Z"
}

# Note: Admin-only endpoint
```

---

### Task Endpoints (Protected)

#### GET /tasks/today
```python
# Response (200)
{
  "tasks": [
    {
      "id": 101,
      "group_id": 10,
      "group_name": "LeetCode Daily",
      "name": "Solve LeetCode Problem",
      "type": "leetcode",
      "status": "completed",
      "completed_at": "2025-03-22T14:30:00Z"
    },
    {
      "id": 102,
      "group_id": 10,
      "group_name": "LeetCode Daily",
      "name": "Read Article",
      "type": "manual",
      "status": "pending",
      "completed_at": None
    }
  ]
}
```

#### POST /tasks/:id/complete
```python
# Request
{
  "status": "completed"
}

# Response (200)
{
  "task_id": 101,
  "user_id": 1,
  "date": "2025-03-22",
  "status": "completed",
  "streak_updated": True,
  "new_streak": 5,
  "completed_at": "2025-03-22T14:30:00Z"
}

# Errors: 404 (task not found), 400 (already completed today)
```

---

## 🧠 Core Business Logic

### Streak Calculation
```python
def update_streak(user_id: int, group_id: int):
    """
    Daily streak logic:
    - Get all REQUIRED tasks for group
    - Check if ALL completed for today (by user's timezone midnight)
    - If yes: increment streak, update last_active_date
    - If no: reset streak to 0
    """
    required_tasks = get_group_required_tasks(group_id)
    completed_tasks = get_user_completed_tasks_today(user_id, group_id)
    
    if len(completed_tasks) == len(required_tasks):
        streak.current_streak += 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.last_active_date = today
    else:
        streak.current_streak = 0
    
    return streak
```

### Task Completion Flow
```python
1. User calls POST /tasks/:id/complete
2. Validate:
   - Task exists
   - User is member of group
   - Task not already completed today
3. Create DailyCompletion record (status='completed')
4. Calculate if ALL required tasks done for today
5. If yes: update_streak(user_id, group_id)
6. Return updated streak info
```

### Timezone Handling
```python
- User provides timezone in preferences (e.g., "Asia/Kolkata")
- Store all dates in UTC in database
- When checking "today":
  - Convert current UTC time to user's timezone
  - Get date in user's timezone
  - Query DailyCompletions for that date
```

---

## 🔐 Authentication & Security

### JWT Token
```python
- Algorithm: HS256
- Expiry: 7 days (604800 seconds)
- Payload: { "sub": user_id, "exp": expiry_timestamp }
- Issued on login
- Validated on all protected endpoints
- No refresh tokens in Phase 1
```

### Password Security
```python
- Hash algorithm: bcrypt (rounds: 12)
- Never store plaintext passwords
- Never log passwords
- Validate: min 8 chars, mixed case, number/special char
```

### Reset Token
```python
- Random 32-char string
- Hashed in database
- Expires in 15-30 minutes
- One-time use only
- Sent via email
```

---

## 📁 Project Structure

```
streaksync-backend/
├── main.py                    # FastAPI app init
├── config.py                  # Settings (database, JWT secret, etc)
├── database.py                # SQLAlchemy session, engine
├── models/
│   ├── __init__.py
│   ├── user.py               # User model
│   ├── group.py              # Group, GroupMember models
│   ├── task.py               # Task model
│   ├── daily_completion.py   # DailyCompletion model
│   └── streak.py             # Streak model
├── schemas/
│   ├── __init__.py
│   ├── user.py               # Pydantic schemas for User
│   ├── group.py              # Pydantic schemas for Group
│   ├── task.py               # Pydantic schemas for Task
│   └── common.py             # Shared schemas
├── routes/
│   ├── __init__.py
│   ├── auth.py               # /auth endpoints
│   ├── users.py              # /users endpoints
│   ├── groups.py             # /groups endpoints
│   └── tasks.py              # /tasks endpoints
├── services/
│   ├── __init__.py
│   ├── auth_service.py       # Auth logic (hash, JWT)
│   ├── user_service.py       # User business logic
│   ├── group_service.py      # Group logic
│   ├── task_service.py       # Task & completion logic
│   └── streak_service.py     # Streak calculation
├── middleware/
│   ├── __init__.py
│   └── auth.py               # JWT verification middleware
├── utils/
│   ├── __init__.py
│   ├── email.py              # Email sending (for password reset)
│   └── validators.py         # Input validation
├── alembic/                  # Database migrations
│   ├── versions/
│   └── env.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Environment Setup
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup
```bash
createdb streaksync  # Create PostgreSQL database
python -m alembic upgrade head  # Run migrations
```

### 3. Environment Variables
```
# .env
DATABASE_URL=postgresql://user:password@localhost/streaksync
SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRATION=604800
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ENVIRONMENT=development
```

### 4. Run Server
```bash
uvicorn main:app --reload
# Server runs on http://localhost:8000
# Docs on http://localhost:8000/docs (Swagger UI)
```

---

## ✅ Implementation Priority (Phase 1)

### Must Have (Week 1-2)
- [ ] Auth (register, login, JWT)
- [ ] User profile (GET /users/me)
- [ ] Group CRUD (create, get, join)
- [ ] Task management (list, complete)
- [ ] Streak calculation

### Should Have (Week 2-3)
- [ ] Dashboard endpoint
- [ ] Leaderboard ranking
- [ ] Password reset
- [ ] Group invite tokens
- [ ] Input validation & error handling

### Nice to Have (Phase 2)
- [ ] LeetCode/GitHub API integration
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] Async email
- [ ] Admin endpoints

---

## 🧪 Testing Commands

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Test123!"}' | jq '.access_token'

# Get profile (replace TOKEN)
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"

# Get dashboard
curl -X GET http://localhost:8000/api/v1/users/dashboard \
  -H "Authorization: Bearer TOKEN"
```

---

## 📝 Key Implementation Notes

1. **Database Migrations**: Use Alembic. After schema changes: `alembic revision --autogenerate -m "message"`
2. **Timezone**: Always store UTC, convert to user timezone on retrieval
3. **Streak Logic**: Run check after task completion, not on separate cron job (Phase 1)
4. **Error Handling**: Return consistent error responses with status codes & messages
5. **Validation**: Use Pydantic schemas for request validation
6. **Logging**: Use Python logging module, never log passwords/sensitive data

---

## 🔗 Related Files
- Frontend: Check `frontend/claude.md` for UI expectations
- Database: Schema details in `alembic/versions/`
- API Docs: Auto-generated Swagger at `/docs` after running server

---

**Version**: 1.0 | **Last Updated**: March 2025