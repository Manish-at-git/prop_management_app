# API Flow Sequence Documentation

---

# 1. New User Onboarding Flow

This is the complete sequence followed when a new member registers for the first time.

## Step 1 – Load Associations

### API
```http
GET /api/associations
```

### Purpose
- Fetch all active associations.
- Populate the association dropdown on the login/request code page.

---

## Step 2 – Request Access Code

### API
```http
POST /api/auth/request-code
```

### Request
```json
{
  "associationId": "uuid",
  "name": "Manish Suthar",
  "email": "manish@gmail.com",
  "phone": "9898989898"
}
```

### Purpose
- User requests an access code.
- Request is stored for admin review.

---

## Step 3 – Admin Reviews Code Requests

### 3.1 View Pending Requests

```http
GET /api/code-requests
```

or

```http
GET /api/code-requests?status=PENDING&associationId=uuid
```

**Purpose**
- Display all pending code requests.

---

### 3.2 Approve Request

```http
POST /api/code-requests/:id/approve
```

**Purpose**
- Generate a new access code.
- Send the access code to the user's email.

---

### 3.3 Reject Request (Alternative)

```http
POST /api/code-requests/:id/reject
```

**Purpose**
- Reject the request.
- User must submit a new request if required.

---

## Step 4 – Validate Access Code

### API

```http
POST /api/auth/access-code
```

### Request

```json
{
  "code": "A1B2C3D4"
}
```

### Purpose
- Verify the access code.
- Return the member details linked to the code.

---

## Step 5A – Member Details Are Correct

### API

```http
POST /api/auth/create-account
```

### Request

```json
{
  "code": "A1B2C3D4",
  "firstName": "Manish",
  "lastName": "Suthar",
  "email": "manish@gmail.com",
  "phone": "9898989898",
  "password": "Str0ng@Pass",
  "confirmPassword": "Str0ng@Pass"
}
```

### Purpose
- Create the user account.
- Return JWT access token.
- Log the user into the application.

---

## Step 5B – Member Details Are Incorrect

### API

```http
POST /api/correction-requests
```

### Request

```json
{
  "requestedName": "Manish K. Suthar",
  "requestedAddress": "Block B, Apt 202",
  "reason": "My middle name was missing and apartment number is wrong"
}
```

### Purpose
- Submit a correction request.
- Admin reviews the request.
- After correction, a new access code may be issued.

---

# 2. Returning User Login Flow

## Login

### API

```http
POST /api/auth/login
```

### Request

```json
{
  "email": "manish@gmail.com",
  "password": "Str0ng@Pass"
}
```

### Purpose
- Authenticate the user.
- Return JWT access token.

All subsequent authenticated requests use:

```http
Authorization: Bearer <access_token>
```

---

# 3. Admin / Manager Operations

## Association Management

### Create Association

```http
POST /api/associations
```

**Purpose**
- Create a new association.

---

### List Associations

```http
GET /api/associations
```

**Purpose**
- Retrieve all associations.

---

### View Association

```http
GET /api/associations/:id
```

**Purpose**
- Retrieve details of a specific association.

---

### Update Association

```http
PATCH /api/associations/:id
```

**Purpose**
- Update association information.

---

## Access Code Management

### Generate Access Code

```http
POST /api/access-codes
```

**Purpose**
- Manually generate an access code.

---

### List Access Codes

```http
GET /api/access-codes
```

**Purpose**
- Retrieve all access codes.

---

### View Access Code

```http
GET /api/access-codes/:id
```

**Purpose**
- Retrieve details of a specific access code.

---

## User Management

### List Users

```http
GET /api/users
```

**Purpose**
- Retrieve all registered users.

---

### View User

```http
GET /api/users/:id
```

**Purpose**
- Retrieve details of a specific user.

---

### Update User

```http
PATCH /api/users/:id
```

**Purpose**
- Update user profile information.

---

### Activate / Suspend User

```http
PATCH /api/users/:id/status
```

### Example Request

```json
{
  "status": "ACTIVE"
}
```

or

```json
{
  "status": "SUSPENDED"
}
```

**Purpose**
- Change the user's account status.

---

## Correction Request Management

### List Pending Correction Requests

```http
GET /api/correction-requests?status=PENDING
```

**Purpose**
- Retrieve all pending correction requests.

---

### View Correction Request

```http
GET /api/correction-requests/:id
```

**Purpose**
- Retrieve details of a specific correction request.

---

### Resolve / Reject Correction Request

```http
PATCH /api/correction-requests/:id/status
```

### Example Request

```json
{
  "status": "RESOLVED"
}
```

or

```json
{
  "status": "REJECTED"
}
```

**Purpose**
- Resolve or reject a correction request.

---

# 4. Miscellaneous APIs

These APIs are administrative and are not necessarily executed in the primary onboarding flow.

## Associations

```text
POST  /api/associations
GET   /api/associations
GET   /api/associations/:id
PATCH /api/associations/:id
```

---

## Access Codes

```text
POST  /api/access-codes
GET   /api/access-codes
GET   /api/access-codes/:id
```

---

## Users

```text
GET   /api/users
GET   /api/users/:id
PATCH /api/users/:id
PATCH /api/users/:id/status
```

---

## Code Requests

```text
GET  /api/code-requests
GET  /api/code-requests?status=PENDING
POST /api/code-requests/:id/approve
POST /api/code-requests/:id/reject
```

---

## Correction Requests

```text
POST  /api/correction-requests
GET   /api/correction-requests
GET   /api/correction-requests/:id
PATCH /api/correction-requests/:id/status
```

---

# Overall API Execution Order

```text
New User

1. GET    /api/associations
2. POST   /api/auth/request-code
3. GET    /api/code-requests
4. POST   /api/code-requests/:id/approve
   OR
   POST   /api/code-requests/:id/reject
5. POST   /api/auth/access-code
6. POST   /api/auth/create-account
   OR
   POST   /api/correction-requests

Returning User

7. POST   /api/auth/login

After Login (Admin/Manager)

8. Association Management
9. Access Code Management
10. User Management
11. Correction Request Management
```