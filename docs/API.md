# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require:
```
Authorization: Bearer <token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Auth Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

## Customer Endpoints

### Get All Customers
```
GET /customers
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - status: prospect|customer|inactive
  - search: string

Response:
{
  "success": true,
  "data": {
    "customers": [...],
    "total": 100,
    "page": 1
  }
}
```

### Get Customer
```
GET /customers/:id

Response:
{
  "success": true,
  "data": { ... customer object ... }
}
```

### Create Customer
```
POST /customers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "status": "prospect"
}
```

### Update Customer
```
PUT /customers/:id
Content-Type: application/json

{
  "firstName": "Jane",
  "status": "customer"
}
```

### Delete Customer
```
DELETE /customers/:id
```

## Opportunity Endpoints

Similar structure as Customer endpoints:
- `GET /opportunities`
- `GET /opportunities/:id`
- `POST /opportunities`
- `PUT /opportunities/:id`
- `DELETE /opportunities/:id`

## Task Endpoints

Similar structure as Customer endpoints:
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
