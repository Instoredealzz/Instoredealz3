# Quick Testing Reference Card

## 🎯 The Complete Testing Flow

### Step 1️⃣: Check Available Deals & PINs
```
Navigate to: /debug-data
Find: Your test deal with its PIN
Note: Vendor who owns this deal
```

### Step 2️⃣: Customer Claims Deal
```
Login: Customer account (any customer from debug page)
Action: Browse deals → Claim a deal
Get: Claim code (6 characters, e.g., "XY9Z2K")
```

### Step 3️⃣: Vendor Verifies in POS
```
Login: Vendor account (must be the vendor who owns the deal!)
Navigate: /vendor/pos-dashboard
Enter: Customer's claim code
System: Prompts for PIN verification
Customer: Enters the PIN (from /debug-data)
Result: ✅ Verified or ❌ Invalid
```

### Step 4️⃣: Complete Transaction
```
Vendor: Enters bill amount
System: Calculates discount & final amount
Customer: Pays discounted amount
Result: ✅ Transaction complete, savings recorded
```

## 🔑 Key Points

| Aspect | Details |
|--------|---------|
| **Customer View** | Sees ALL vendors' deals |
| **Vendor POS** | Only verifies THEIR OWN deals |
| **PIN Location** | `/debug-data` page (for testing only) |
| **Claim Code** | 6-character code given after claiming |
| **Verification** | Must use correct vendor's POS dashboard |

## ⚠️ Common Testing Mistakes

❌ **Wrong**: Customer claims from Vendor A → Try to verify at Vendor B's POS
- **Result**: Error - "This claim code is not for your deals"

✅ **Right**: Customer claims from Vendor A → Verify at Vendor A's POS
- **Result**: Success!

❌ **Wrong**: Using PIN from Deal #10 to verify Deal #5
- **Result**: PIN verification failed

✅ **Right**: Using PIN from Deal #5 to verify Deal #5
- **Result**: PIN verified!

## 📋 Example Test Scenario

**Setup** (from `/debug-data`):
```
Vendor: "ABC Restaurant" (ID: 5)
  └─ Deal: "Lunch Special - 30% off" (ID: 12)
     └─ PIN: B4K7M2
  └─ Vendor Login: vendor@abc.com

Customer: customer@test.com
```

**Test Execution**:
```
1. Login as: customer@test.com
2. Find deal: "Lunch Special - 30% off"
3. Click: Claim Deal
4. Receive: Claim code "P3Q9R2"
5. Logout

6. Login as: vendor@abc.com
7. Go to: POS Dashboard
8. Enter code: P3Q9R2
9. System shows: Deal #12 - "Lunch Special"
10. Customer enters PIN: B4K7M2
11. System: ✅ PIN Verified!
12. Enter bill: ₹100
13. System shows: Pay ₹70 (30% off = ₹30 saved)
14. Complete transaction
15. Result: Customer total savings += ₹30
```

## 🔍 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "PIN verification failed" | Wrong PIN or PIN from different deal | Check `/debug-data` for correct PIN |
| "This claim code is not for your deals" | Logged in as wrong vendor | Login as the vendor who created the deal |
| "Deal not found" | Deal inactive or not approved | Check deal status on debug page |
| "Claim code has expired" | Code older than 24 hours | Claim the deal again |

## 🚀 Quick Commands

| Action | URL/Path |
|--------|----------|
| View all PINs | `/debug-data` |
| Customer login | `/login` |
| Vendor POS | `/vendor/pos-dashboard` |
| Browse deals | `/deals` or homepage |

## 💡 Pro Testing Tips

1. **Keep `/debug-data` open** in another tab for quick PIN reference
2. **Test with multiple vendors** to ensure isolation works
3. **Try expired codes** to test validation
4. **Test wrong PINs** to verify security
5. **Check analytics** after transactions to verify data flow

---

**Remember**: The `/debug-data` page is your testing friend - it shows you everything you need to test the complete flow! 🎉
