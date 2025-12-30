# Backend API Design & Implementation Guide

This document outlines the expected API endpoints, request/response shapes for building the backend.

## Base URL
```
http://127.0.0.1:5000/api/v1
```

## Authentication

### POST /auth/login
Login and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here"
}
```

---

## Clients

### GET /clients
List clients with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20)
- `search` (string): Search in clientName, institution, email, clientId
- `sortBy` (string): Field to sort by
- `sortOrder` (string): 'asc' or 'desc'
- `startDate` (ISO string): Filter by createdAt >= startDate
- `endDate` (ISO string): Filter by createdAt <= endDate

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "clientId": "CLT-0001",
      "clientName": "John Doe",
      "institution": "Harvard University",
      "phone": "+1 234-567-8900",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

### GET /clients/:id
Get a single client.

### POST /clients
Create a new client.

**Request:**
```json
{
  "clientId": "CLT-0001",
  "clientName": "John Doe",
  "institution": "Harvard University",
  "phone": "+1 234-567-8900",
  "email": "john@example.com"
}
```

### PUT /clients/:id
Update a client.

### DELETE /clients/:id
Delete a client.

---

## Products

### GET /products
List products with pagination and filters.

**Query Parameters:** Same as clients

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "productId": "PRD-0001",
      "name": "Essay",
      "pricePerUnit": 15.00,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### GET /products/:id
### POST /products
### PUT /products/:id
### DELETE /products/:id

---

## Orders

### GET /orders
List orders with pagination and filters.

**Additional Query Parameters:**
- `clientId` (string): Filter by client
- `productId` (string): Filter by product

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderId": "ORD-00001",
      "clientId": "client-uuid",
      "productId": "product-uuid",
      "orderClass": "Graduate",
      "week": "Week 5",
      "genre": "Academic",
      "pagesOrSlides": 10,
      "totalCost": 150.00,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "client": { /* Client object */ },
      "product": { /* Product object */ }
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### POST /orders
**Request:**
```json
{
  "orderId": "ORD-00001",
  "clientId": "client-uuid",
  "productId": "product-uuid",
  "orderClass": "Graduate",
  "week": "Week 5",
  "genre": "Academic",
  "pagesOrSlides": 10
}
```

**Note:** `totalCost` is calculated server-side as `product.pricePerUnit * pagesOrSlides`

### GET /orders/:id
### PUT /orders/:id
### DELETE /orders/:id

---

## Invoices/Reports

### GET /invoices/data
Get orders for invoice generation.

**Query Parameters:**
- `clientId` (string, required for invoices): Client ID
- `startDate` (ISO string, required): Period start
- `endDate` (ISO string, required): Period end

**Response (200):**
```json
{
  "orders": [ /* Array of Order objects */ ],
  "client": { /* Client object */ },
  "totalAmount": 1500.00,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Client ID is required",
    "details": {}
  }
}
```

**Status Codes:**
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
