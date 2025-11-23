# InStoreDealz Third-Party Vendor API Documentation

## Overview

The InStoreDealz Vendor API allows approved vendors to integrate their Point of Sale (POS) systems with the InStoreDealz platform. This enables automated deal verification, transaction processing, and analytics reporting.

**Base URL:** `https://your-domain.com/api/v1`

**Version:** 1.0.0

## Authentication

All API requests (except authentication) require an API key passed in the request headers.

### Obtaining API Keys

**Endpoint:** `POST /vendor/authenticate`

**Request:**
```json
{
  "vendorId": 123,
  "vendorEmail": "vendor@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_1234567890abcdef...",
    "apiSecret": "sk_0987654321fedcba...",
    "vendorId": 123,
    "businessName": "Example Store",
    "expiresAt": null,
    "rateLimit": 1000,
    "createdAt": "2025-11-23T07:00:00.000Z"
  },
  "message": "API key generated successfully. Store this securely - it won't be shown again."
}
```

**Important:** Store the `apiKey` and `apiSecret` securely. The secret will not be shown again.

### Using API Keys

Include your API key in the `X-API-Key` header for all authenticated requests:

```
X-API-Key: sk_1234567890abcdef...
```

## Endpoints

### 1. Verify Claim Code

Verify a customer's claim code before processing the transaction.

**Endpoint:** `POST /claims/verify`

**Authentication:** Required

**Request Body:**
```json
{
  "claimCode": "ABC123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claimId": 456,
    "claimCode": "ABC123",
    "status": "claimed",
    "dealId": 789,
    "dealTitle": "50% Off Electronics",
    "discountPercentage": 50,
    "customer": {
      "id": 101,
      "name": "John Doe",
      "membershipPlan": "gold"
    },
    "claimedAt": "2025-11-23T06:00:00.000Z",
    "expiresAt": "2025-11-30T23:59:59.000Z",
    "savingsAmount": "500.00"
  },
  "message": "Claim verified successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing claim code
- **404 Not Found** - Claim code not found
- **403 Forbidden** - Claim belongs to different vendor
- **400 Bad Request** - Claim expired or already verified

### 2. Complete Transaction

Mark a claim as verified and complete the transaction.

**Endpoint:** `POST /claims/complete`

**Authentication:** Required

**Request Body:**
```json
{
  "claimCode": "ABC123",
  "billAmount": 1000,
  "notes": "Transaction completed successfully"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claimId": 456,
    "claimCode": "ABC123",
    "status": "completed",
    "billAmount": "1000.00",
    "actualSavings": "500.00",
    "verifiedAt": "2025-11-23T07:30:00.000Z",
    "dealTitle": "50% Off Electronics",
    "discountPercentage": 50
  },
  "message": "Transaction completed successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing required fields (claimCode or billAmount)
- **400 Bad Request** - Invalid bill amount (must be > 0)
- **404 Not Found** - Claim not found
- **403 Forbidden** - Unauthorized access
- **400 Bad Request** - Transaction already completed

### 3. Check Claim Status

Check the current status of a claim.

**Endpoint:** `GET /claims/status`

**Authentication:** Required

**Query Parameters:**
- `claimCode` (string, optional) - The claim code to check
- `claimId` (number, optional) - The claim ID to check

**Note:** Provide either `claimCode` OR `claimId`

**Example:** `GET /claims/status?claimCode=ABC123`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claimId": 456,
    "claimCode": "ABC123",
    "status": "completed",
    "dealId": 789,
    "dealTitle": "50% Off Electronics",
    "discountPercentage": 50,
    "customer": {
      "id": 101,
      "name": "John Doe",
      "membershipPlan": "gold"
    },
    "claimedAt": "2025-11-23T06:00:00.000Z",
    "verifiedAt": "2025-11-23T07:30:00.000Z",
    "vendorVerified": true,
    "billAmount": "1000.00",
    "actualSavings": "500.00",
    "savingsAmount": "500.00",
    "expiresAt": "2025-11-30T23:59:59.000Z",
    "isExpired": false
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing identifier (need claimCode or claimId)
- **404 Not Found** - Claim not found
- **403 Forbidden** - Unauthorized access

### 4. Vendor Analytics

Retrieve analytics and performance metrics for your deals.

**Endpoint:** `GET /vendor/analytics`

**Authentication:** Required

**Query Parameters:**
- `startDate` (ISO 8601 date, optional) - Filter claims from this date
- `endDate` (ISO 8601 date, optional) - Filter claims until this date
- `dealId` (number, optional) - Filter by specific deal

**Example:** `GET /vendor/analytics?startDate=2025-11-01&endDate=2025-11-30`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "vendorId": 123,
      "businessName": "Example Store",
      "totalDeals": 15,
      "activeDeals": 10,
      "totalClaims": 250,
      "completedClaims": 200,
      "pendingClaims": 45,
      "expiredClaims": 5,
      "conversionRate": 80.0
    },
    "financial": {
      "totalRevenue": 125000.00,
      "totalSavingsProvided": 62500.00,
      "averageTransactionValue": 625.00,
      "currency": "INR"
    },
    "dealPerformance": [
      {
        "dealId": 789,
        "dealTitle": "50% Off Electronics",
        "totalClaims": 100,
        "completedClaims": 85,
        "revenue": 85000.00,
        "savingsProvided": 42500.00,
        "conversionRate": 85.0
      }
    ],
    "period": {
      "startDate": "2025-11-01",
      "endDate": "2025-11-30"
    }
  }
}
```

### 5. API Documentation

Get complete API documentation in JSON format.

**Endpoint:** `GET /docs`

**Authentication:** Not required

**Response:** Returns this documentation in JSON format with endpoint details, error codes, and examples.

## Error Codes

| Code | Description |
|------|-------------|
| `API_KEY_REQUIRED` | API key is missing from request headers |
| `INVALID_API_KEY` | The provided API key is invalid |
| `API_KEY_INACTIVE` | This API key has been deactivated |
| `API_KEY_EXPIRED` | This API key has expired |
| `VENDOR_NOT_APPROVED` | Vendor account is not approved |
| `CLAIM_NOT_FOUND` | Claim code not found |
| `CLAIM_EXPIRED` | This claim code has expired |
| `ALREADY_VERIFIED` | This claim has already been verified |
| `ALREADY_COMPLETED` | This transaction has already been completed |
| `UNAUTHORIZED_ACCESS` | Access denied to this resource |
| `MISSING_REQUIRED_FIELDS` | Required fields are missing from the request |
| `MISSING_CREDENTIALS` | vendorId, vendorEmail, and password are required |
| `INVALID_CREDENTIALS` | Invalid vendor credentials |
| `MISSING_CLAIM_CODE` | claimCode is required |
| `MISSING_IDENTIFIER` | Either claimCode or claimId is required |
| `INVALID_AMOUNT` | billAmount must be greater than 0 |

## Rate Limiting

Default rate limit: **1,000 requests per minute** per API key

When rate limit is exceeded, you'll receive:
- HTTP Status: `429 Too Many Requests`
- Response includes retry-after information

## Best Practices

### 1. Secure API Key Storage
- Never commit API keys to version control
- Store keys in environment variables or secure vaults
- Rotate keys periodically

### 2. Transaction Workflow
```
1. Customer presents claim code at checkout
2. Call POST /claims/verify to validate the claim
3. If valid, process the transaction with applied discount
4. Call POST /claims/complete with final bill amount
5. Optionally, call GET /claims/status to confirm
```

### 3. Error Handling
```javascript
try {
  const response = await verifyClaimCode(claimCode);
  // Process successful verification
} catch (error) {
  if (error.code === 'CLAIM_EXPIRED') {
    // Inform customer claim has expired
  } else if (error.code === 'ALREADY_VERIFIED') {
    // Claim already used
  }
  // Handle other errors appropriately
}
```

### 4. Analytics Monitoring
- Call `/vendor/analytics` daily to track performance
- Monitor conversion rates to optimize deals
- Use date ranges for historical analysis

## Integration Examples

See `VENDOR_API_EXAMPLES.md` for complete code examples in:
- JavaScript/Node.js
- Python
- cURL commands

## Support

For API support, contact:
- Email: support@instoredealz.com
- Documentation: https://docs.instoredealz.com/api

## Changelog

### Version 1.0.0 (2025-11-23)
- Initial release
- Authentication endpoint
- Claim verification and completion
- Status checking
- Vendor analytics
- API documentation endpoint
