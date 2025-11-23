# Vendor Onboarding Guide - InStoreDealz Platform

**Last Updated:** November 23, 2025  
**Version:** 2.0 (Updated with Third-Party API Support)

---

## 📚 Welcome to InStoreDealz!

This comprehensive guide covers two paths for managing deals on our platform:

1. **MANUAL PATH** - For vendors without POS system integration
2. **API PATH** - For vendors using Point of Sale (POS) systems

Both paths are fully supported! Choose based on your business setup.

---

## 📋 Prerequisites & Requirements

### Business Requirements
- Valid Business Registration
- Physical Store Location (for deal redemption)
- Business License
- Tax Registration (GST)
- Bank Account for payments

### Documentation Needed
- Business registration certificate
- GST/Tax registration
- Business license
- Bank account details
- Identity proof
- Address proof

---

## 🚀 Step-by-Step Onboarding Process

### **Step 1: Account Registration**
1. Visit vendor registration page
2. Enter personal information
3. Create strong password
4. Verify email address

### **Step 2: Business Profile Setup**
1. Business name and type
2. Contact information
3. Location details
4. Operating hours

### **Step 3: Business Verification**
1. Upload required documents
2. Set up bank account
3. Select business categories
4. Submit for approval

### **Step 4: Admin Approval**
- Admin reviews documents
- May request additional information
- Approval takes 2-3 business days
- You receive approval email

### **Step 5: Choose Your Path**

**At this point, you choose:**

```
DO YOU HAVE A POS SYSTEM?
     ↓                    ↓
   YES                   NO
     ↓                    ↓
   API PATH          MANUAL PATH
   (See Below)       (See Below)
```

---

## 🟢 PATH 1: MANUAL DEAL MANAGEMENT

**For vendors without POS system integration**

### **Deal Creation Process**

#### **Step 1: Create New Deal**
1. Login to vendor dashboard
2. Click "Create New Deal"
3. Fill in deal details:
   - Deal title (attractive name)
   - Description (clear details)
   - Category selection
   - High-quality images (3+)

#### **Step 2: Set Pricing & Discount**
1. Original price
2. Discount percentage (1-90%)
3. System auto-calculates discounted price
4. Maximum redemptions allowed

#### **Step 3: Set Verification PIN**
1. Create unique 6-character PIN (e.g., K9M3X7)
2. OR click "Generate" for auto-creation
3. PIN stays same for entire deal duration
4. You'll share this with customers

**Example PIN: K9M3X7, A1B2C3, XYZ789**

#### **Step 4: Set Location & Dates**
1. Store address
2. Latitude/Longitude (optional but recommended)
3. Validity dates
4. Operating hours for deal

#### **Step 5: Submit for Approval**
1. Review all details
2. Submit to admin
3. Wait 24-48 hours for approval
4. Receive email notification

### **Manual Customer Redemption Workflow**

#### **When Customer Claims Deal**
1. Customer gets: **Claim Code** (e.g., "ABC12345")
2. You see: Notification that code was issued
3. Code valid for: 24 hours

#### **When Customer Visits Your Store**
1. Customer shows claim code
2. You verify it in your system
3. You show customer the discount details
4. Customer shops and comes to checkout
5. You **manually apply discount** to their bill
6. Customer pays discounted amount
7. You mark transaction as complete

**Time to process:** 5-10 minutes per customer

### **Manual Management Dashboard**

**What You See:**
- Total deals created
- Active deals
- Total redemptions
- Revenue generated
- Customer ratings
- Performance analytics

**Reports Available:**
- Daily sales
- Weekly summaries
- Monthly analytics
- Customer demographics
- Deal performance

### **Manual Benefits**
✅ Simple setup (no technical integration needed)
✅ Full control over discount application
✅ Direct customer interaction
✅ Personal relationship building
✅ Flexibility in promotions

### **Manual Challenges**
⚠️ Manual data entry (time-consuming)
⚠️ Potential for human errors
⚠️ Slower checkout process
⚠️ Delayed data updates (24-48 hours)

---

## 🔵 PATH 2: API-BASED DEAL MANAGEMENT

**For vendors using modern POS systems**

### **When to Use API Path**

You should use the API path if you:
- ✅ Use POS systems like Pine Labs, Square, Reason
- ✅ Want automatic deal verification
- ✅ Want real-time transaction tracking
- ✅ Have significant transaction volume
- ✅ Want to eliminate manual errors

### **Prerequisites for API Path**

1. **Active InStoreDealz Account** - Vendor account approved
2. **Compatible POS System** - Pine Labs, Square, or similar
3. **Internet Connection** - For API calls
4. **Support from POS Provider** - They handle integration

### **API Integration Steps**

#### **Step 1: Get Your API Key**
1. Go to Settings → API Management
2. Click "Generate API Key"
3. Enter your email & password to verify
4. Copy your API Key (long string starting with "sk_")
5. **KEEP IT SECRET** - Like a password!

**Example API Key:**
```
sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4
```

#### **Step 2: Share API Key with POS Provider**
1. Get support contact from your POS provider
2. Send them:
   - Your API Key
   - Our API URL: `https://your-domain.com/api/v1`
3. Ask them to: "Integrate with InStoreDealz API"
4. They handle technical setup

#### **Step 3: Test Integration**
1. POS provider confirms setup complete
2. Test with 2-3 sample deals
3. Verify deals work in their system
4. Check that transactions are recorded

#### **Step 4: Go Live**
1. Activate API integration
2. Start processing real transactions
3. Monitor dashboard for updates
4. All deals now automated!

### **How API Redemption Works**

#### **Customer Claims Deal**
1. Customer gets: **Claim Code** (e.g., "ABC12345")
2. Code valid for: 24 hours
3. Customer comes to store with code

#### **Vendor Uses API to Process**
1. Customer shows code at checkout
2. POS system scans or enters code
3. POS **automatically** sends to our API
4. Our system **instantly** verifies code
5. Our system **instantly** calculates discount
6. Discount **automatically appears** in POS
7. Vendor applies discount (system-calculated)
8. Customer pays reduced amount
9. Transaction **automatically** recorded

**Time to process:** 2-3 seconds (vs 5-10 minutes manual!)

### **API Integration Benefits**

✨ **Speed**: 2-3 seconds vs 5-10 minutes  
✨ **Accuracy**: Zero manual errors  
✨ **Real-time**: Data updates instantly  
✨ **Automatic**: System handles discount calculation  
✨ **Analytics**: Live performance tracking  
✨ **Scalability**: Handle high transaction volume  
✨ **Customer Experience**: Faster checkout  

### **API Dashboard Features**

**Real-Time Metrics:**
- Claims verified (live count)
- Revenue (updated instantly)
- Customers served (today)
- Pending transactions

**Analytics:**
- Deal performance breakdown
- Conversion rates by deal
- Customer demographics
- Revenue by date range
- Payment summaries

**Advanced Reports:**
- Hourly transaction logs
- Customer behavior patterns
- Peak transaction times
- Device and payment methods

---

## 📊 Comparing Manual vs API

| Feature | Manual | API |
|---------|--------|-----|
| Setup Time | 5 minutes | 1-2 weeks (POS provider) |
| Processing Speed | 5-10 minutes | 2-3 seconds |
| Error Rate | High (manual) | Zero (automated) |
| Data Updates | 24-48 hours | Instant |
| Customer Experience | Slower | Faster |
| Cost | Free | Free |
| Scalability | Limited | High |
| Customer Support | Manual | Automated |
| Analytics | Basic | Advanced |

---

## 💼 Creating Your First Deal (Both Paths)

### **Deal Planning**

1. **Market Research**
   - Study competitor deals
   - Identify popular products
   - Set competitive pricing

2. **Deal Strategy**
   - Discount percentage (10-50% typical)
   - Deal duration
   - Inventory allocation
   - Target customer segment

### **Deal Creation Steps**

#### **1. Basic Information**
- Deal title (clear, attractive)
- Detailed description
- Category
- 3+ high-quality images

#### **2. Pricing Setup**
- Original price
- Discount percentage
- Auto-calculated final price
- Max redemptions

#### **3. Verification Setup**
- **MANUAL PATH:** Set 6-char PIN (K9M3X7)
- **API PATH:** System generates code automatically
- PIN/Code displayed at checkout

#### **4. Location & Dates**
- Store address
- Coordinates (optional)
- Valid from date
- Valid until date
- Operating hours

#### **5. Terms & Conditions**
- Usage restrictions
- Item exclusions
- Refund policy
- Special instructions

#### **6. Submit for Approval**
- Review carefully
- Submit to admin
- Wait 24-48 hours
- Receive approval email

---

## 🏪 Point of Sale (POS) Guide

### **Manual POS Process**

**When Customer Arrives:**
1. Customer shows claim code (screenshot or number)
2. You verify code in your system
3. You confirm deal details
4. Customer shops

**At Checkout:**
1. You manually calculate discount
2. You deduct from total
3. Customer pays discounted amount
4. You update system manually
5. Customer leaves

**Time:** 5-10 minutes per customer

### **API POS Process**

**When Customer Arrives:**
1. Customer shows claim code
2. POS scans or enters code
3. System verifies automatically ✨

**At Checkout:**
1. Discount auto-calculated ✨
2. POS shows reduced price ✨
3. Customer pays discounted amount
4. System updates automatically ✨
5. Customer leaves

**Time:** 2-3 seconds per customer ✨

---

## 📞 Getting Technical Support

### **For Manual Path Users**
- Email: vendor-support@instoredealz.com
- Phone: +91-XXXX-XXXX-XXXX
- Support hours: 9 AM - 7 PM (Mon-Sat)

### **For API Path Users**
- Email: api-support@instoredealz.com
- Phone: +91-XXXX-XXXX-XXXX
- 24/7 Support: For critical issues

### **Common Issues & Solutions**

**Manual Path Issues:**
- "Claim code not found" → Check code is active/not expired
- "Can't update transaction" → Ensure internet connection
- "Customer can't see discount" → Verify PIN is correct

**API Path Issues:**
- "API key not working" → Verify key copied correctly
- "POS not connecting" → Check internet/contact POS provider
- "Transaction not recorded" → Wait 2-3 seconds, then refresh

---

## 📊 Dashboard Analytics

### **Available Metrics**

**Overview:**
- Total deals created
- Active deals
- Total redemptions
- Total revenue

**Financial:**
- Daily earnings
- Weekly summaries
- Monthly reports
- Commission details

**Performance:**
- Redemption rates
- Customer ratings
- Deal popularity
- Conversion metrics

**Customer Data:**
- Demographics
- Repeat customers
- Peak visit times
- Satisfaction scores

---

## 💰 Payment & Commission

### **Commission Structure**
- Basic: 8% commission
- Premium: 6% commission
- Ultimate: 4% commission

### **Payment Schedule**
- Payments: Every Monday
- Minimum payout: ₹500
- Method: Direct bank transfer
- Processing: 2-3 business days

---

## ✅ Best Practices

### **Deal Creation Tips**
1. High-quality images (phone camera is fine)
2. Clear, honest descriptions
3. Competitive pricing
4. Reasonable discount (10-50%)
5. Regular updates and fresh deals

### **Customer Service**
1. Quick response to inquiries
2. Honor all deal terms
3. Excellent in-store experience
4. Professional behavior
5. Proper complaint handling

### **For Manual Path**
1. Keep claim code list handy
2. Verify codes carefully
3. Keep PIN secure
4. Update transactions daily
5. Monitor for fraud

### **For API Path**
1. Keep API key secret
2. Monitor for suspicious activity
3. Ensure internet stability
4. Test regularly
5. Report any issues immediately

---

## 🎯 Success Metrics

### **Target Goals**

**Monthly:**
- 5-10 active deals
- 30%+ redemption rate
- ₹10,000+ revenue
- 4.5+ star rating

**Quarterly:**
- 15-20 active deals
- 40%+ redemption rate
- ₹30,000+ revenue
- Consistent 4.5+ rating

**Annually:**
- Premium tier status
- 50+ successful deals
- ₹200,000+ revenue
- Top 10% vendors

---

## 🚀 Migration Path: Manual → API

**If You Start Manual:**
1. Run manual for 3-6 months
2. Build customer base
3. Get POS system
4. Contact our support
5. We help with API setup
6. Smoothly transition to automation

**No data loss!** All your deals and customers transfer to API.

---

## 📞 Support Contacts

### **Vendor Support**
- Email: vendor-support@instoredealz.com
- Phone: +91-XXXX-XXXX-XXXX
- WhatsApp: +91-XXXX-XXXX-XXXX
- Hours: Mon-Sat, 9 AM - 7 PM

### **API/Technical Support**
- Email: api-support@instoredealz.com
- Phone: +91-XXXX-XXXX-XXXX
- Hours: 24/7 for critical issues

### **Partnerships**
- Email: partnerships@instoredealz.com
- Phone: +91-XXXX-XXXX-XXXX

---

## 🎉 Next Steps

### **This Week:**
1. ☐ Complete onboarding
2. ☐ Verify documents
3. ☐ Choose your path (Manual or API)
4. ☐ Create first deal

### **Next Week:**
1. ☐ Set up 5-10 deals
2. ☐ Test claim and redemption process
3. ☐ Monitor first customers
4. ☐ Adjust based on feedback

### **Ongoing:**
1. ☐ Add new deals regularly
2. ☐ Monitor performance
3. ☐ Engage with customers
4. ☐ Expand your offerings

---

## 💡 Key Takeaways

**Choose Manual If:**
- No POS system yet
- Want to start immediately
- Prefer manual control
- Low transaction volume

**Choose API If:**
- Have POS system integration
- Want automation
- High transaction volume
- Need real-time tracking
- Want faster checkout

**Either Way:**
✅ Free to use  
✅ Easy to manage  
✅ Full customer support  
✅ Real savings for customers  
✅ Real growth for your business  

---

**Welcome to InStoreDealz! Let's grow your business together!** 🚀

*Last Updated: November 23, 2025*  
*Version: 2.0 - Updated with API Support*
