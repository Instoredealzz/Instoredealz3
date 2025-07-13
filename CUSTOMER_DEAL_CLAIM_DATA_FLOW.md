# Customer Deal Claim - Complete Data Flow Analysis

## When a Customer Claims a Deal: Complete Information Population

### 🔄 **PHASE 1: Initial Claim (POST /api/deals/:id/claim)**

#### ✅ **DealClaim Record Created in `dealClaims` Table:**
```sql
INSERT INTO deal_claims (
  id,              -- Auto-generated serial ID
  userId,          -- Customer's user ID from JWT token
  dealId,          -- ID of the deal being claimed
  claimedAt,       -- Current timestamp when claim was made
  usedAt,          -- NULL (not used yet)
  savingsAmount,   -- "0" (no savings until PIN verification)
  status,          -- "pending" (awaiting store verification)
  billAmount,      -- NULL (no bill amount yet)
  actualSavings    -- NULL (no actual savings yet)
)
```

#### 📊 **System Log Entry Created:**
```sql
INSERT INTO system_logs (
  userId,          -- Customer's user ID
  action,          -- "DEAL_CLAIMED_PENDING"
  details,         -- JSON: {dealId, dealTitle, status: "pending_verification"}
  ipAddress,       -- Customer's IP address
  userAgent,       -- Customer's browser info
  createdAt        -- Current timestamp
)
```

#### 📝 **Response Data Sent to Customer:**
```json
{
  "id": 626,                    // Claim ID
  "userId": 38,                 // Customer ID
  "dealId": 1,                  // Deal ID
  "savingsAmount": 0,           // No savings yet
  "status": "pending",          // Awaiting verification
  "claimedAt": "2025-07-13T07:01:09.016Z",
  "usedAt": null,               // Not used yet
  "billAmount": null,           // No bill amount yet
  "actualSavings": null,        // No actual savings yet
  "message": "Deal claimed! Visit the store and verify your PIN to complete the redemption.",
  "requiresVerification": true
}
```

---

### 🔄 **PHASE 2: PIN Verification (POST /api/deals/:id/verify-pin)**

#### ✅ **PIN Attempt Record Created in `pinAttempts` Table:**
```sql
INSERT INTO pin_attempts (
  dealId,          -- Deal ID being verified
  userId,          -- Customer's user ID
  ipAddress,       -- Customer's IP address
  userAgent,       -- Customer's browser info
  success,         -- true/false based on PIN verification
  attemptedAt      -- Current timestamp
)
```

#### 🔄 **DealClaim Record Updated (if PIN correct):**
```sql
UPDATE deal_claims SET
  status = "used",             -- Changed from "pending" to "used"
  usedAt = NOW(),              -- Timestamp when PIN was verified
  savingsAmount = [calculated] -- Actual savings based on discount percentage
WHERE id = [claimId] AND userId = [customerId]
```

#### 👤 **User Record Updated:**
```sql
UPDATE users SET
  totalSavings = totalSavings + [newSavings],  -- Add to customer's total savings
  dealsClaimed = dealsClaimed + 1              -- Increment deals claimed counter
WHERE id = [customerId]
```

#### 📊 **Additional System Log Entry:**
```sql
INSERT INTO system_logs (
  userId,          -- Customer's user ID
  action,          -- "DEAL_PIN_VERIFIED"
  details,         -- JSON: {dealId, dealTitle, savingsAmount, claimId}
  ipAddress,       -- Customer's IP address
  userAgent,       -- Customer's browser info
  createdAt        -- Current timestamp
)
```

---

### 🔄 **PHASE 3: Bill Amount Update (PUT /api/deals/:id/update-bill)**

#### 🔄 **DealClaim Record Further Updated:**
```sql
UPDATE deal_claims SET
  billAmount = [customerEnteredAmount],        -- Total bill amount customer paid
  actualSavings = [calculatedActualSavings]   -- Recalculated based on actual bill
WHERE id = [claimId] AND userId = [customerId]
```

#### 👤 **User Total Savings Recalculated:**
```sql
UPDATE users SET
  totalSavings = [recalculatedTotal]  -- Updated based on actual bill amounts
WHERE id = [customerId]
```

---

## 📍 **Where This Information Gets Displayed:**

### 🏠 **Customer Dashboard:**
- **Total Savings**: Sum of all `actualSavings` from `dealClaims` where `status = "used"`
- **Deals Claimed**: Count of all `dealClaims` records for the customer
- **Recent Claims**: List of recent `dealClaims` with deal titles and savings

### 📋 **Customer Claims History (/api/customers/me/claims):**
- Complete list of all customer's `dealClaims` records
- Shows status, savings amounts, claim dates, and bill amounts
- Filterable by status (pending, used, expired)

### 👤 **Customer Profile:**
- Membership tier and benefits
- Total lifetime savings
- Number of deals claimed
- Join date and activity summary

### 📊 **Admin Dashboard:**
- Customer activity metrics
- Total platform savings
- Claim completion rates
- Revenue calculations (5% commission on savings)

### 🏪 **Vendor Analytics:**
- Number of claims for their deals
- Total savings provided to customers
- Deal performance metrics
- Revenue generated for the platform

---

## 🔍 **Real-Time Data Flow:**

1. **Customer clicks "Claim Deal"** → Creates pending claim record
2. **Customer visits store** → Shows vendor the claim exists
3. **Customer provides PIN** → Verifies and completes redemption
4. **Customer enters bill amount** → Updates actual savings calculation
5. **All dashboards update** → Real-time reflection across the platform

## 🔐 **Security & Audit Trail:**

- Every PIN attempt is logged (success/failure) in `pinAttempts`
- All major actions are logged in `systemLogs` with IP and user agent
- Claim status progression is tracked: `pending` → `used` → `completed`
- Rate limiting prevents PIN brute force attempts