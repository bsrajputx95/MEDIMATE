# MediMate API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://your-backend.vercel.app
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx123456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx123456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Guest Login

```http
POST /api/auth/guest
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "guest_123456",
    "email": "guest@medimate.app",
    "name": "Guest User",
    "isGuest": true
  }
}
```

---

## Profile Endpoints

### Get Profile

```http
GET /api/profile
```

**Response:**
```json
{
  "id": "clx123456",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "onboardingCompleted": true
}
```

### Update Profile

```http
PUT /api/profile
```

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://..."
}
```

**Response:**
```json
{
  "id": "clx123456",
  "email": "user@example.com",
  "name": "John Updated",
  "avatar": "https://..."
}
```

### Complete Onboarding

```http
POST /api/profile/onboarding
```

**Request Body:**
```json
{
  "name": "John Doe",
  "gender": "male",
  "age": 30,
  "height": { "feet": 5, "inches": 10 },
  "weight": 165,
  "bloodGroup": "O+",
  "medicalConditions": ["none"]
}
```

---

## Health Endpoints

### Get Health Metrics

```http
GET /api/health/metrics
```

**Response:**
```json
{
  "heartRate": 72,
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "weight": 165,
  "sleep": 7.5,
  "steps": 8500,
  "calories": 1850,
  "waterIntake": 2.2
}
```

### Get Health Goals

```http
GET /api/health/goals
```

**Response:**
```json
[
  {
    "id": "goal_123",
    "type": "weight",
    "target": 160,
    "current": 165,
    "unit": "lbs",
    "deadline": "2024-06-01",
    "progress": 50
  }
]
```

### Create Health Goal

```http
POST /api/health/goals
```

**Request Body:**
```json
{
  "type": "steps",
  "target": 10000,
  "unit": "steps",
  "deadline": "2024-12-31"
}
```

### Update Health Goal

```http
PUT /api/health/goals/:id
```

**Request Body:**
```json
{
  "current": 9500
}
```

### Delete Health Goal

```http
DELETE /api/health/goals/:id
```

---

## CURA Endpoints

### Get Appointments

```http
GET /api/cura/appointments
```

**Response:**
```json
[
  {
    "id": "apt_123",
    "doctorName": "Dr. Sarah Johnson",
    "doctorAvatar": "https://...",
    "specialty": "Cardiology",
    "date": "2024-02-15",
    "time": "10:00 AM",
    "location": "City Medical Center",
    "type": "checkup",
    "status": "upcoming",
    "notes": "Annual checkup"
  }
]
```

### Create Appointment

```http
POST /api/cura/appointments
```

**Request Body:**
```json
{
  "doctorId": "doc_123",
  "date": "2024-02-20",
  "time": "2:00 PM",
  "type": "consultation",
  "notes": "Follow-up appointment"
}
```

### Cancel Appointment

```http
DELETE /api/cura/appointments/:id
```

### Get Doctors

```http
GET /api/cura/doctors
```

**Query Parameters:**
- `specialty` (optional): Filter by specialty

**Response:**
```json
[
  {
    "id": "doc_123",
    "name": "Dr. Sarah Johnson",
    "avatar": "https://...",
    "specialty": "Cardiology",
    "rating": 4.8,
    "experience": "15 years",
    "location": "City Medical Center",
    "availability": "Mon-Fri",
    "consultationFee": 150,
    "languages": ["English", "Spanish"]
  }
]
```

### Get Medications

```http
GET /api/cura/medications
```

**Response:**
```json
[
  {
    "id": "med_123",
    "name": "Lisinopril",
    "dosage": "10mg",
    "frequency": "Once daily",
    "prescribedBy": "Dr. Sarah Johnson",
    "startDate": "2024-01-01",
    "endDate": null,
    "instructions": "Take with water in the morning",
    "sideEffects": ["dizziness", "cough"],
    "reminderTimes": ["08:00"],
    "taken": false
  }
]
```

### Update Medication

```http
PUT /api/cura/medications/:id
```

**Request Body:**
```json
{
  "taken": true,
  "reminderTimes": ["08:00", "20:00"]
}
```

### Get Test Reports

```http
GET /api/cura/test-reports
```

**Response:**
```json
[
  {
    "id": "report_123",
    "testName": "Complete Blood Count",
    "testType": "Blood Test",
    "date": "2024-01-15",
    "doctorName": "Dr. Sarah Johnson",
    "clinic": "City Medical Center",
    "status": "completed",
    "results": "Normal",
    "value": "Within range",
    "normalRange": "4.5-11.0 WBC/μL"
  }
]
```

### Get Treatment Plans

```http
GET /api/cura/treatments
```

**Response:**
```json
[
  {
    "id": "plan_123",
    "title": "Hypertension Management",
    "description": "Comprehensive plan for managing blood pressure",
    "prescribedBy": "Dr. Sarah Johnson",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "milestones": [
      {
        "id": "ms_1",
        "title": "Initial assessment",
        "dueDate": "2024-01-15",
        "completed": true
      }
    ]
  }
]
```

---

## Community Endpoints

### Get Posts

```http
GET /api/community/posts
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "post_123",
      "content": "Just completed my 10K steps goal!",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "avatar": "https://...",
        "isAnonymous": false,
        "badges": ["Early Adopter"]
      },
      "likes": 24,
      "comments": 5,
      "shares": 2,
      "isLiked": false,
      "timestamp": "2024-02-10T10:30:00Z",
      "tags": ["fitness", "goals"]
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

### Create Post

```http
POST /api/community/posts
```

**Request Body:**
```json
{
  "content": "Feeling great after my morning workout!",
  "isAnonymous": false,
  "tags": ["fitness", "motivation"]
}
```

### Like Post

```http
POST /api/community/posts/:id/like
```

### Get Groups

```http
GET /api/community/groups
```

**Response:**
```json
[
  {
    "id": "group_123",
    "name": "Morning Runners",
    "description": "A community for early morning runners",
    "category": "Fitness",
    "memberCount": 1250,
    "postCount": 450,
    "isJoined": false,
    "isPrivate": false
  }
]
```

### Join Group

```http
POST /api/community/groups/:id/join
```

### Get Challenges

```http
GET /api/community/challenges
```

**Response:**
```json
[
  {
    "id": "challenge_123",
    "title": "30-Day Step Challenge",
    "description": "Walk 10,000 steps daily for 30 days",
    "category": "Fitness",
    "duration": "30 days",
    "participants": 500,
    "isJoined": false,
    "progress": null,
    "points": 500
  }
]
```

### Join Challenge

```http
POST /api/community/challenges/:id/join
```

### Get Polls

```http
GET /api/community/polls
```

**Response:**
```json
[
  {
    "id": "poll_123",
    "question": "What's your favorite time to exercise?",
    "options": [
      { "id": "opt_1", "text": "Morning", "votes": 150 },
      { "id": "opt_2", "text": "Afternoon", "votes": 75 },
      { "id": "opt_3", "text": "Evening", "votes": 200 }
    ],
    "totalVotes": 425,
    "hasVoted": false,
    "userVote": null,
    "endsAt": "2024-02-20T00:00:00Z"
  }
]
```

### Vote on Poll

```http
POST /api/community/polls/:id/vote
```

**Request Body:**
```json
{
  "optionId": "opt_1"
}
```

---

## Food & Nutrition Endpoints

### Analyze Food Image

```http
POST /api/food/analyze
```

**Request Body:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "foods": [
    {
      "name": "Grilled Chicken Salad",
      "calories": 350,
      "protein": 35,
      "carbs": 15,
      "fat": 18,
      "servingSize": "1 bowl"
    }
  ],
  "totalCalories": 350,
  "totalProtein": 35,
  "totalCarbs": 15,
  "totalFat": 18
}
```

---

## Chat/AI Endpoints

### Send Message to Health Buddy

```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "What are some tips for better sleep?",
  "conversationId": "conv_123"
}
```

**Response:**
```json
{
  "response": "Here are some tips for better sleep:\n1. Maintain a consistent sleep schedule\n2. Avoid screens before bed\n3. Create a relaxing bedtime routine\n4. Keep your bedroom cool and dark",
  "conversationId": "conv_123",
  "suggestions": [
    "How much sleep do I need?",
    "What foods help with sleep?",
    "Best exercises for better sleep"
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional information"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **AI endpoints**: 20 requests per minute

---

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```
