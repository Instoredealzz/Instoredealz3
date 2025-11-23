# InStoreDealz Vendor API - Code Examples

This document provides practical code examples for integrating with the InStoreDealz Vendor API in various programming languages.

## Table of Contents

1. [JavaScript/Node.js](#javascriptnodejs)
2. [Python](#python)
3. [cURL Commands](#curl-commands)
4. [Complete Workflow Example](#complete-workflow-example)

---

## JavaScript/Node.js

### Setup

```bash
npm install axios
```

### Configuration

```javascript
// config.js
module.exports = {
  API_BASE_URL: 'https://your-domain.com/api/v1',
  API_KEY: process.env.INSTOREDEALZ_API_KEY, // Store in environment variable
};
```

### 1. Authenticate and Get API Key

```javascript
const axios = require('axios');

async function authenticateVendor(vendorId, vendorEmail, password) {
  try {
    const response = await axios.post(
      'https://your-domain.com/api/v1/vendor/authenticate',
      {
        vendorId: vendorId,
        vendorEmail: vendorEmail,
        password: password
      }
    );

    if (response.data.success) {
      console.log('API Key:', response.data.data.apiKey);
      console.log('API Secret:', response.data.data.apiSecret);
      console.log('Store these securely!');
      
      // Store in environment variables or secure vault
      return response.data.data;
    }
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
authenticateVendor(123, 'vendor@example.com', 'your_password')
  .then(credentials => {
    // Save credentials securely
  });
```

### 2. Verify Claim Code

```javascript
const axios = require('axios');
const { API_BASE_URL, API_KEY } = require('./config');

async function verifyClaimCode(claimCode) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/claims/verify`,
      { claimCode: claimCode },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      const claim = response.data.data;
      console.log(`Claim verified for ${claim.customer.name}`);
      console.log(`Deal: ${claim.dealTitle}`);
      console.log(`Discount: ${claim.discountPercentage}%`);
      console.log(`Expected Savings: ₹${claim.savingsAmount}`);
      return claim;
    }
  } catch (error) {
    const errorData = error.response?.data;
    
    if (errorData?.code === 'CLAIM_EXPIRED') {
      console.error('This claim has expired');
    } else if (errorData?.code === 'ALREADY_VERIFIED') {
      console.error('This claim has already been used');
    } else if (errorData?.code === 'CLAIM_NOT_FOUND') {
      console.error('Invalid claim code');
    } else {
      console.error('Verification failed:', errorData?.message);
    }
    
    throw error;
  }
}

// Usage
verifyClaimCode('ABC123')
  .then(claim => {
    // Proceed with transaction
  })
  .catch(error => {
    // Handle error appropriately
  });
```

### 3. Complete Transaction

```javascript
async function completeTransaction(claimCode, billAmount, notes = '') {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/claims/complete`,
      {
        claimCode: claimCode,
        billAmount: billAmount,
        notes: notes
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      const result = response.data.data;
      console.log('Transaction completed successfully!');
      console.log(`Bill Amount: ₹${result.billAmount}`);
      console.log(`Customer Saved: ₹${result.actualSavings}`);
      return result;
    }
  } catch (error) {
    console.error('Transaction failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
completeTransaction('ABC123', 1000, 'Payment received')
  .then(result => {
    console.log('Transaction ID:', result.claimId);
  });
```

### 4. Check Claim Status

```javascript
async function checkClaimStatus(claimCode) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/claims/status`,
      {
        params: { claimCode: claimCode },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (response.data.success) {
      const status = response.data.data;
      console.log(`Claim Status: ${status.status}`);
      console.log(`Verified: ${status.vendorVerified ? 'Yes' : 'No'}`);
      
      if (status.vendorVerified) {
        console.log(`Bill Amount: ₹${status.billAmount}`);
        console.log(`Savings: ₹${status.actualSavings}`);
      }
      
      return status;
    }
  } catch (error) {
    console.error('Status check failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
checkClaimStatus('ABC123');
```

### 5. Get Vendor Analytics

```javascript
async function getVendorAnalytics(startDate = null, endDate = null, dealId = null) {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (dealId) params.dealId = dealId;

    const response = await axios.get(
      `${API_BASE_URL}/vendor/analytics`,
      {
        params: params,
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (response.data.success) {
      const analytics = response.data.data;
      
      console.log('=== Vendor Analytics ===');
      console.log(`Total Deals: ${analytics.overview.totalDeals}`);
      console.log(`Total Claims: ${analytics.overview.totalClaims}`);
      console.log(`Completed: ${analytics.overview.completedClaims}`);
      console.log(`Conversion Rate: ${analytics.overview.conversionRate.toFixed(2)}%`);
      console.log(`\nTotal Revenue: ₹${analytics.financial.totalRevenue.toLocaleString()}`);
      console.log(`Savings Provided: ₹${analytics.financial.totalSavingsProvided.toLocaleString()}`);
      
      console.log('\nTop Performing Deals:');
      analytics.dealPerformance.slice(0, 5).forEach((deal, index) => {
        console.log(`${index + 1}. ${deal.dealTitle}`);
        console.log(`   Revenue: ₹${deal.revenue.toLocaleString()}, Claims: ${deal.totalClaims}`);
      });
      
      return analytics;
    }
  } catch (error) {
    console.error('Analytics fetch failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
getVendorAnalytics('2025-11-01', '2025-11-30');
```

---

## Python

### Setup

```bash
pip install requests
```

### Configuration

```python
# config.py
import os

API_BASE_URL = 'https://your-domain.com/api/v1'
API_KEY = os.getenv('INSTOREDEALZ_API_KEY')
```

### 1. Authenticate and Get API Key

```python
import requests

def authenticate_vendor(vendor_id, vendor_email, password):
    """Authenticate vendor and get API key"""
    url = 'https://your-domain.com/api/v1/vendor/authenticate'
    
    payload = {
        'vendorId': vendor_id,
        'vendorEmail': vendor_email,
        'password': password
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        if data['success']:
            print(f"API Key: {data['data']['apiKey']}")
            print(f"API Secret: {data['data']['apiSecret']}")
            print("Store these securely!")
            return data['data']
            
    except requests.exceptions.RequestException as e:
        print(f"Authentication failed: {e}")
        if hasattr(e.response, 'json'):
            print(e.response.json())
        raise

# Usage
credentials = authenticate_vendor(123, 'vendor@example.com', 'your_password')
```

### 2. Verify Claim Code

```python
import requests
from config import API_BASE_URL, API_KEY

def verify_claim_code(claim_code):
    """Verify a customer's claim code"""
    url = f'{API_BASE_URL}/claims/verify'
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {'claimCode': claim_code}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        if data['success']:
            claim = data['data']
            print(f"Claim verified for {claim['customer']['name']}")
            print(f"Deal: {claim['dealTitle']}")
            print(f"Discount: {claim['discountPercentage']}%")
            print(f"Expected Savings: ₹{claim['savingsAmount']}")
            return claim
            
    except requests.exceptions.HTTPError as e:
        error_data = e.response.json()
        error_code = error_data.get('code')
        
        if error_code == 'CLAIM_EXPIRED':
            print('This claim has expired')
        elif error_code == 'ALREADY_VERIFIED':
            print('This claim has already been used')
        elif error_code == 'CLAIM_NOT_FOUND':
            print('Invalid claim code')
        else:
            print(f"Verification failed: {error_data.get('message')}")
        raise

# Usage
claim = verify_claim_code('ABC123')
```

### 3. Complete Transaction

```python
def complete_transaction(claim_code, bill_amount, notes=''):
    """Complete a transaction and mark claim as verified"""
    url = f'{API_BASE_URL}/claims/complete'
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {
        'claimCode': claim_code,
        'billAmount': bill_amount,
        'notes': notes
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        if data['success']:
            result = data['data']
            print('Transaction completed successfully!')
            print(f"Bill Amount: ₹{result['billAmount']}")
            print(f"Customer Saved: ₹{result['actualSavings']}")
            return result
            
    except requests.exceptions.RequestException as e:
        print(f"Transaction failed: {e}")
        if hasattr(e.response, 'json'):
            print(e.response.json())
        raise

# Usage
result = complete_transaction('ABC123', 1000, 'Payment received')
```

### 4. Get Vendor Analytics

```python
def get_vendor_analytics(start_date=None, end_date=None, deal_id=None):
    """Get vendor analytics and performance metrics"""
    url = f'{API_BASE_URL}/vendor/analytics'
    headers = {'X-API-Key': API_KEY}
    params = {}
    
    if start_date:
        params['startDate'] = start_date
    if end_date:
        params['endDate'] = end_date
    if deal_id:
        params['dealId'] = deal_id
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        if data['success']:
            analytics = data['data']
            
            print('=== Vendor Analytics ===')
            print(f"Total Deals: {analytics['overview']['totalDeals']}")
            print(f"Total Claims: {analytics['overview']['totalClaims']}")
            print(f"Completed: {analytics['overview']['completedClaims']}")
            print(f"Conversion Rate: {analytics['overview']['conversionRate']:.2f}%")
            print(f"\nTotal Revenue: ₹{analytics['financial']['totalRevenue']:,.2f}")
            print(f"Savings Provided: ₹{analytics['financial']['totalSavingsProvided']:,.2f}")
            
            print('\nTop Performing Deals:')
            for i, deal in enumerate(analytics['dealPerformance'][:5], 1):
                print(f"{i}. {deal['dealTitle']}")
                print(f"   Revenue: ₹{deal['revenue']:,.2f}, Claims: {deal['totalClaims']}")
            
            return analytics
            
    except requests.exceptions.RequestException as e:
        print(f"Analytics fetch failed: {e}")
        if hasattr(e.response, 'json'):
            print(e.response.json())
        raise

# Usage
analytics = get_vendor_analytics('2025-11-01', '2025-11-30')
```

---

## cURL Commands

### 1. Authenticate and Get API Key

```bash
curl -X POST https://your-domain.com/api/v1/vendor/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": 123,
    "vendorEmail": "vendor@example.com",
    "password": "your_password"
  }'
```

### 2. Verify Claim Code

```bash
curl -X POST https://your-domain.com/api/v1/claims/verify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_api_key_here" \
  -d '{
    "claimCode": "ABC123"
  }'
```

### 3. Complete Transaction

```bash
curl -X POST https://your-domain.com/api/v1/claims/complete \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_api_key_here" \
  -d '{
    "claimCode": "ABC123",
    "billAmount": 1000,
    "notes": "Payment received"
  }'
```

### 4. Check Claim Status

```bash
curl -X GET "https://your-domain.com/api/v1/claims/status?claimCode=ABC123" \
  -H "X-API-Key: sk_your_api_key_here"
```

### 5. Get Vendor Analytics

```bash
curl -X GET "https://your-domain.com/api/v1/vendor/analytics?startDate=2025-11-01&endDate=2025-11-30" \
  -H "X-API-Key: sk_your_api_key_here"
```

### 6. Get API Documentation

```bash
curl -X GET https://your-domain.com/api/v1/docs
```

---

## Complete Workflow Example

### JavaScript/Node.js - Full POS Integration

```javascript
const axios = require('axios');

class InStoreDealzPOS {
  constructor(apiKey, baseUrl = 'https://your-domain.com/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  async processClaimTransaction(claimCode, billAmount) {
    try {
      // Step 1: Verify the claim
      console.log('Step 1: Verifying claim code...');
      const verifyResponse = await axios.post(
        `${this.baseUrl}/claims/verify`,
        { claimCode },
        { headers: this.headers }
      );

      if (!verifyResponse.data.success) {
        throw new Error('Claim verification failed');
      }

      const claim = verifyResponse.data.data;
      console.log(`✓ Claim verified for ${claim.customer.name}`);
      console.log(`  Deal: ${claim.dealTitle} (${claim.discountPercentage}% off)`);

      // Step 2: Calculate discount
      const discountAmount = (billAmount * claim.discountPercentage) / 100;
      const finalAmount = billAmount - discountAmount;

      console.log(`\nBill Calculation:`);
      console.log(`  Original Amount: ₹${billAmount}`);
      console.log(`  Discount (${claim.discountPercentage}%): -₹${discountAmount}`);
      console.log(`  Final Amount: ₹${finalAmount}`);

      // Confirm with cashier
      console.log('\nProcessing payment...');

      // Step 3: Complete the transaction
      console.log('\nStep 2: Completing transaction...');
      const completeResponse = await axios.post(
        `${this.baseUrl}/claims/complete`,
        {
          claimCode,
          billAmount,
          notes: `Transaction processed at POS terminal`
        },
        { headers: this.headers }
      );

      if (completeResponse.data.success) {
        const result = completeResponse.data.data;
        console.log('✓ Transaction completed successfully!');
        console.log(`  Transaction ID: ${result.claimId}`);
        console.log(`  Customer saved: ₹${result.actualSavings}`);
        
        return {
          success: true,
          transactionId: result.claimId,
          billAmount: result.billAmount,
          savings: result.actualSavings,
          finalAmount: finalAmount
        };
      }

    } catch (error) {
      console.error('Transaction failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getDailyReport() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${this.baseUrl}/vendor/analytics`,
        {
          params: { startDate: today, endDate: today },
          headers: { 'X-API-Key': this.apiKey }
        }
      );

      if (response.data.success) {
        const analytics = response.data.data;
        console.log('\n=== Daily Report ===');
        console.log(`Claims Today: ${analytics.overview.totalClaims}`);
        console.log(`Completed: ${analytics.overview.completedClaims}`);
        console.log(`Revenue: ₹${analytics.financial.totalRevenue.toLocaleString()}`);
        console.log(`Savings Given: ₹${analytics.financial.totalSavingsProvided.toLocaleString()}`);
        return analytics;
      }
    } catch (error) {
      console.error('Failed to fetch daily report:', error.response?.data || error.message);
    }
  }
}

// Usage Example
const pos = new InStoreDealzPOS(process.env.INSTOREDEALZ_API_KEY);

// Process a customer transaction
async function processCustomer() {
  const claimCode = 'ABC123';
  const billAmount = 1000;
  
  const result = await pos.processClaimTransaction(claimCode, billAmount);
  
  if (result.success) {
    console.log('\n--- RECEIPT ---');
    console.log(`Transaction ID: ${result.transactionId}`);
    console.log(`Amount Paid: ₹${result.finalAmount}`);
    console.log(`You Saved: ₹${result.savings}`);
    console.log('Thank you for shopping with us!');
  } else {
    console.log(`\nError: ${result.error}`);
  }
}

// Get end-of-day report
async function endOfDayReport() {
  await pos.getDailyReport();
}

// Run examples
processCustomer().then(() => endOfDayReport());
```

### Python - Full POS Integration

```python
import requests
from datetime import datetime
import os

class InStoreDealzPOS:
    def __init__(self, api_key, base_url='https://your-domain.com/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def process_claim_transaction(self, claim_code, bill_amount):
        """Process a complete claim transaction"""
        try:
            # Step 1: Verify claim
            print('Step 1: Verifying claim code...')
            verify_response = requests.post(
                f'{self.base_url}/claims/verify',
                json={'claimCode': claim_code},
                headers=self.headers
            )
            verify_response.raise_for_status()
            
            claim = verify_response.json()['data']
            print(f"✓ Claim verified for {claim['customer']['name']}")
            print(f"  Deal: {claim['dealTitle']} ({claim['discountPercentage']}% off)")
            
            # Step 2: Calculate discount
            discount_amount = (bill_amount * claim['discountPercentage']) / 100
            final_amount = bill_amount - discount_amount
            
            print(f"\nBill Calculation:")
            print(f"  Original Amount: ₹{bill_amount}")
            print(f"  Discount ({claim['discountPercentage']}%): -₹{discount_amount}")
            print(f"  Final Amount: ₹{final_amount}")
            
            # Step 3: Complete transaction
            print('\nStep 2: Completing transaction...')
            complete_response = requests.post(
                f'{self.base_url}/claims/complete',
                json={
                    'claimCode': claim_code,
                    'billAmount': bill_amount,
                    'notes': 'Transaction processed at POS terminal'
                },
                headers=self.headers
            )
            complete_response.raise_for_status()
            
            result = complete_response.json()['data']
            print('✓ Transaction completed successfully!')
            print(f"  Transaction ID: {result['claimId']}")
            print(f"  Customer saved: ₹{result['actualSavings']}")
            
            return {
                'success': True,
                'transactionId': result['claimId'],
                'billAmount': result['billAmount'],
                'savings': result['actualSavings'],
                'finalAmount': final_amount
            }
            
        except requests.exceptions.RequestException as e:
            error_msg = e.response.json().get('message') if hasattr(e.response, 'json') else str(e)
            print(f'Transaction failed: {error_msg}')
            return {
                'success': False,
                'error': error_msg
            }
    
    def get_daily_report(self):
        """Get today's analytics report"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            response = requests.get(
                f'{self.base_url}/vendor/analytics',
                params={'startDate': today, 'endDate': today},
                headers={'X-API-Key': self.api_key}
            )
            response.raise_for_status()
            
            analytics = response.json()['data']
            print('\n=== Daily Report ===')
            print(f"Claims Today: {analytics['overview']['totalClaims']}")
            print(f"Completed: {analytics['overview']['completedClaims']}")
            print(f"Revenue: ₹{analytics['financial']['totalRevenue']:,.2f}")
            print(f"Savings Given: ₹{analytics['financial']['totalSavingsProvided']:,.2f}")
            
            return analytics
            
        except requests.exceptions.RequestException as e:
            print(f'Failed to fetch daily report: {e}')

# Usage Example
pos = InStoreDealzPOS(os.getenv('INSTOREDEALZ_API_KEY'))

# Process a customer transaction
claim_code = 'ABC123'
bill_amount = 1000

result = pos.process_claim_transaction(claim_code, bill_amount)

if result['success']:
    print('\n--- RECEIPT ---')
    print(f"Transaction ID: {result['transactionId']}")
    print(f"Amount Paid: ₹{result['finalAmount']}")
    print(f"You Saved: ₹{result['savings']}")
    print('Thank you for shopping with us!')
else:
    print(f"\nError: {result['error']}")

# Get end-of-day report
pos.get_daily_report()
```

---

## Error Handling Best Practices

### JavaScript

```javascript
async function safeApiCall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    if (error.response) {
      // Server responded with error
      const { code, message } = error.response.data;
      console.error(`API Error [${code}]: ${message}`);
      
      // Handle specific errors
      switch (code) {
        case 'CLAIM_EXPIRED':
          return { error: 'expired', message: 'This offer has expired' };
        case 'ALREADY_VERIFIED':
          return { error: 'used', message: 'This offer was already redeemed' };
        case 'UNAUTHORIZED_ACCESS':
          return { error: 'unauthorized', message: 'Access denied' };
        default:
          return { error: 'unknown', message };
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response received');
      return { error: 'network', message: 'Connection failed' };
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
      return { error: 'request', message: error.message };
    }
  }
}
```

### Python

```python
def safe_api_call(api_function, *args, **kwargs):
    """Safely call API with comprehensive error handling"""
    try:
        return api_function(*args, **kwargs)
    except requests.exceptions.HTTPError as e:
        if e.response is not None:
            error_data = e.response.json()
            code = error_data.get('code')
            message = error_data.get('message')
            
            print(f"API Error [{code}]: {message}")
            
            # Handle specific errors
            error_map = {
                'CLAIM_EXPIRED': ('expired', 'This offer has expired'),
                'ALREADY_VERIFIED': ('used', 'This offer was already redeemed'),
                'UNAUTHORIZED_ACCESS': ('unauthorized', 'Access denied')
            }
            
            if code in error_map:
                error_type, user_message = error_map[code]
                return {'error': error_type, 'message': user_message}
            
            return {'error': 'unknown', 'message': message}
    except requests.exceptions.ConnectionError:
        print('Network error - connection failed')
        return {'error': 'network', 'message': 'Connection failed'}
    except requests.exceptions.Timeout:
        print('Request timeout')
        return {'error': 'timeout', 'message': 'Request timed out'}
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return {'error': 'unexpected', 'message': str(e)}
```

---

## Security Best Practices

1. **Never hardcode API keys** - Use environment variables
2. **Implement retry logic** with exponential backoff
3. **Log API calls** for audit trail
4. **Validate responses** before processing
5. **Handle rate limits** gracefully
6. **Use HTTPS** for all API calls
7. **Rotate API keys** periodically

## Support

For technical support or integration assistance:
- Email: support@instoredealz.com
- Developer Documentation: https://docs.instoredealz.com/api
