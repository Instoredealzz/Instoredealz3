# Testing Guide: Using vendor@test.com Account

## ✅ What's Set Up For You

After restarting the application, you'll have:

### Demo Vendor Account
- **Email**: `vendor@test.com`
- **Password**: `vendor123`
- **Business Name**: Test Business Store
- **Location**: Delhi, India
- **Status**: ✅ Approved (ready to use POS)

### Demo Deals Created
**Deal 1: Electronics**
- **Title**: Test Deal - 40% Off Electronics
- **Discount**: 40%
- **PIN**: `TEST01`
- **Category**: Electronics
- **Status**: ✅ Active & Approved

**Deal 2: Fashion**
- **Title**: Test Deal - 30% Off Fashion
- **Discount**: 30%
- **PIN**: `TEST02`
- **Category**: Fashion
- **Status**: ✅ Active & Approved

### Demo Customer Account
- **Email**: `customer@test.com`
- **Password**: `customer123`
- **Name**: Test Customer
- **Location**: Mumbai, India

## 🎯 Complete Testing Flow

### Step 1: Verify Setup
1. Navigate to `/debug-data`
2. Confirm you see:
   - ✅ Test Business Store vendor
   - ✅ Two deals with PINs TEST01 and TEST02
   - ✅ Customer account: customer@test.com

### Step 2: Customer Claims a Deal

```
1. Login as CUSTOMER
   Email: customer@test.com
   Password: customer123

2. Browse deals on homepage or /deals page
   You should see:
   - "Test Deal - 40% Off Electronics" (from Test Business Store)
   - "Test Deal - 30% Off Fashion" (from Test Business Store)

3. Click on "Test Deal - 40% Off Electronics"

4. Click "Claim Deal" button

5. You'll receive a CLAIM CODE (e.g., "XY9Z2K")
   ⚠️ IMPORTANT: Write down this claim code!

6. Logout
```

### Step 3: Vendor Verifies via POS Dashboard

```
1. Login as VENDOR
   Email: vendor@test.com
   Password: vendor123

2. Navigate to: /vendor/pos-dashboard
   (Or click "POS Dashboard" in vendor menu)

3. Enter the customer's CLAIM CODE: XY9Z2K
   (The code you got in Step 2)

4. System will:
   ✓ Validate the claim code
   ✓ Show deal details: "Test Deal - 40% Off Electronics"
   ✓ Prompt for PIN verification

5. When prompted, customer enters PIN: TEST01
   (This is the verification PIN for this deal)

6. System response:
   ✅ "PIN Verified Successfully!"
```

### Step 4: Complete Transaction

```
1. Vendor enters bill amount: ₹1000

2. System calculates:
   Original Bill: ₹1000
   Discount (40%): -₹400
   Final Amount: ₹600

3. Customer pays: ₹600

4. Click "Complete Transaction"

5. Result:
   ✅ Transaction successful
   ✅ Customer saves ₹400
   ✅ Customer's total savings updated
   ✅ Deal redemption count increases
```

## 🔑 Quick Reference

| What | Details |
|------|---------|
| **Vendor Login** | vendor@test.com / vendor123 |
| **Customer Login** | customer@test.com / customer123 |
| **POS Dashboard** | /vendor/pos-dashboard |
| **Deal 1 PIN** | TEST01 (Electronics) |
| **Deal 2 PIN** | TEST02 (Fashion) |
| **Debug Page** | /debug-data |

## 📝 Testing Scenarios

### Scenario 1: Basic Flow (Electronics Deal)
```
Customer claims: "Test Deal - 40% Off Electronics"
Gets code: ABC123
Vendor enters: ABC123
Customer enters PIN: TEST01
Bill: ₹1000 → Pays ₹600 (saves ₹400)
```

### Scenario 2: Fashion Deal
```
Customer claims: "Test Deal - 30% Off Fashion"
Gets code: XYZ789
Vendor enters: XYZ789
Customer enters PIN: TEST02
Bill: ₹2000 → Pays ₹1400 (saves ₹600)
```

### Scenario 3: Multiple Claims
```
1. Customer claims Electronics deal → Code: ABC123
2. Customer claims Fashion deal → Code: XYZ789
3. Vendor verifies ABC123 with PIN TEST01
4. Vendor verifies XYZ789 with PIN TEST02
Both transactions complete successfully!
```

## ⚠️ Common Issues

### Issue: "Vendor profile not found"
**Solution**: Make sure you've restarted the application after updating init-database.ts

### Issue: "No deals found"
**Solution**: Check `/debug-data` - if empty, restart the application

### Issue: "PIN verification failed"
**Cause**: Using wrong PIN
**Solution**: 
- For Electronics deal → Use PIN: `TEST01`
- For Fashion deal → Use PIN: `TEST02`

### Issue: "This claim code is not for your deals"
**Cause**: This shouldn't happen with vendor@test.com since all test deals belong to this vendor
**Solution**: Verify you're logged in as vendor@test.com

## 🚀 Next Steps After Testing

Once you've successfully tested the basic flow:

1. **Test Multiple Customers**
   - Use demo@demo.com (password: demo123) as another customer
   - Claim the same deal from different customers
   - Verify all claims work correctly

2. **Test Edge Cases**
   - Try entering wrong PIN (should fail)
   - Try expired claim codes (24+ hours old)
   - Try verifying same claim code twice (should fail)

3. **Test Analytics**
   - After completing transactions, check vendor dashboard
   - View claim history
   - Check customer savings updated correctly

4. **Create Your Own Deals**
   - Login as vendor@test.com
   - Create new deals with custom PINs
   - Test the complete flow with your deals

## 📊 Expected Results

After completing one full transaction:

**Customer Side** (customer@test.com):
- Total Savings: ₹400 (or whatever discount was given)
- Deals Claimed: 1
- Claim History: Shows completed transaction

**Vendor Side** (vendor@test.com):
- Total Redemptions: 1
- Deal Analytics: Updated
- Transaction History: Shows completed transaction

## 🎉 Success Criteria

You've successfully tested when:
- ✅ Customer can see and claim Test Business Store deals
- ✅ Customer receives a valid claim code
- ✅ Vendor can verify claim code in POS dashboard
- ✅ PIN verification works with TEST01 or TEST02
- ✅ Transaction completes and shows correct calculations
- ✅ Customer savings are updated correctly
- ✅ No errors in the console

---

**Ready to Test?** 
1. Restart the application
2. Go to `/debug-data` to verify setup
3. Follow Step 2-4 above for your first test!
