#!/usr/bin/env node

/**
 * Test Script: Corrected Customer Claim Code Flow
 * Tests the complete end-to-end claim code system with vendor data integration
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test credentials
const customerCreds = { email: 'customer@test.com', password: 'customer123' };
const vendorCreds = { email: 'vendor@test.com', password: 'vendor123' };
const adminCreds = { email: 'admin@instoredealz.com', password: 'admin123' };

let customerToken, vendorToken, adminToken;
let testDealId = 1;
let testClaimCode;

async function makeRequest(method, endpoint, data, token) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
}

async function testStep(stepName, testFunction) {
  console.log(`\n🔄 Testing: ${stepName}`);
  try {
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ ${stepName} - PASSED`);
      return result;
    } else {
      console.log(`❌ ${stepName} - FAILED: ${result.error}`);
      return result;
    }
  } catch (error) {
    console.log(`❌ ${stepName} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function authenticateUsers() {
  console.log('\n🔐 Authentication Phase');
  
  // Login customer
  const customerLogin = await makeRequest('POST', '/api/auth/login', customerCreds);
  if (!customerLogin.success) {
    throw new Error('Customer login failed');
  }
  customerToken = customerLogin.data.token;
  console.log('✅ Customer authenticated');

  // Login vendor
  const vendorLogin = await makeRequest('POST', '/api/auth/login', vendorCreds);
  if (!vendorLogin.success) {
    throw new Error('Vendor login failed');
  }
  vendorToken = vendorLogin.data.token;
  console.log('✅ Vendor authenticated');

  // Login admin
  const adminLogin = await makeRequest('POST', '/api/auth/login', adminCreds);
  if (!adminLogin.success) {
    throw new Error('Admin login failed');
  }
  adminToken = adminLogin.data.token;
  console.log('✅ Admin authenticated');
}

async function testClaimWithCode() {
  return await testStep('Customer claims deal with code', async () => {
    const result = await makeRequest('POST', `/api/deals/${testDealId}/claim-with-code`, {}, customerToken);
    
    if (result.success && result.data.claimCode) {
      testClaimCode = result.data.claimCode;
      console.log(`   📋 Claim Code Generated: ${testClaimCode}`);
      console.log(`   🏪 Vendor ID: ${result.data.vendorId}`);
      console.log(`   👤 Customer ID: ${result.data.customerId}`);
      console.log(`   📅 Expires: ${new Date(result.data.expiresAt).toLocaleString()}`);
      return result;
    }
    
    return { success: false, error: 'No claim code generated' };
  });
}

async function testPOSVerification() {
  return await testStep('Vendor verifies claim code via POS', async () => {
    const result = await makeRequest('POST', '/api/pos/verify-claim-code', {
      claimCode: testClaimCode
    }, vendorToken);
    
    if (result.success && result.data.valid) {
      console.log(`   ✅ Code Verified: ${result.data.claim.claimCode}`);
      console.log(`   👤 Customer: ${result.data.customer.customerName} (${result.data.customer.customerEmail})`);
      console.log(`   🏷️  Deal: ${result.data.deal.dealTitle}`);
      console.log(`   💰 Discount: ${result.data.deal.discountPercentage}%`);
      console.log(`   🏪 Vendor: ${result.data.vendor.vendorName}`);
      return result;
    }
    
    return { success: false, error: 'Code verification failed' };
  });
}

async function testTransactionCompletion() {
  return await testStep('Complete transaction with bill amount', async () => {
    const billAmount = 1000;
    const result = await makeRequest('POST', '/api/pos/complete-claim-transaction', {
      claimCode: testClaimCode,
      billAmount: billAmount
    }, vendorToken);
    
    if (result.success) {
      console.log(`   💸 Bill Amount: ₹${result.data.transaction.billAmount}`);
      console.log(`   💰 Actual Savings: ₹${result.data.transaction.actualSavings}`);
      console.log(`   👤 Customer New Total: ₹${result.data.customer.newTotalSavings}`);
      console.log(`   ⏰ Completed: ${new Date(result.data.transaction.completedAt).toLocaleString()}`);
      return result;
    }
    
    return { success: false, error: 'Transaction completion failed' };
  });
}

async function testAdminAnalytics() {
  return await testStep('Admin views comprehensive claim code analytics', async () => {
    const result = await makeRequest('GET', '/api/admin/claim-code-analytics', null, adminToken);
    
    if (result.success) {
      const analytics = result.data;
      console.log(`   📊 Total Claims: ${analytics.summary.totalClaims}`);
      console.log(`   ✅ Verified Claims: ${analytics.summary.verifiedClaims}`);
      console.log(`   💰 Total Savings: ₹${analytics.summary.totalSavings}`);
      console.log(`   📈 Verification Rate: ${analytics.summary.verificationRate}%`);
      console.log(`   🏪 Vendor Performance Records: ${analytics.vendorPerformance.length}`);
      console.log(`   📂 Category Breakdown: ${analytics.categoryBreakdown.length} categories`);
      
      // Show sample claim data with vendor info
      if (analytics.claims.length > 0) {
        const claim = analytics.claims[0];
        console.log(`   📋 Sample Claim Data:`);
        console.log(`      - Vendor ID: ${claim.vendorId}, Customer ID: ${claim.customerId}`);
        console.log(`      - Deal ID: ${claim.dealId}, Total Amount: ₹${claim.totalAmount}`);
        console.log(`      - Claimed At: ${claim.claimedAt}`);
      }
      
      return result;
    }
    
    return { success: false, error: 'Analytics fetch failed' };
  });
}

async function testVendorClaimedDeals() {
  return await testStep('Vendor views only claimed deals dashboard', async () => {
    const result = await makeRequest('GET', '/api/vendors/claimed-deals', null, vendorToken);
    
    if (result.success) {
      const dashboard = result.data;
      console.log(`   🏪 Vendor: ${dashboard.vendor.name} (${dashboard.vendor.city})`);
      console.log(`   📊 Dashboard Summary:`);
      console.log(`      - Total Claims: ${dashboard.summary.totalClaims}`);
      console.log(`      - Verified Claims: ${dashboard.summary.verifiedClaims}`);
      console.log(`      - Pending Claims: ${dashboard.summary.pendingClaims}`);
      console.log(`      - Total Revenue: ₹${dashboard.summary.totalRevenue}`);
      console.log(`      - Verification Rate: ${dashboard.summary.verificationRate}%`);
      console.log(`   📋 Claimed Deals: ${dashboard.claimedDeals.length}`);
      console.log(`   📈 Deal Performance: ${dashboard.dealPerformance.length} deals`);
      
      // Show sample claimed deal with complete data
      if (dashboard.claimedDeals.length > 0) {
        const claim = dashboard.claimedDeals[0];
        console.log(`   💼 Sample Claimed Deal:`);
        console.log(`      - Customer: ${claim.customerName} (ID: ${claim.customerId})`);
        console.log(`      - Deal: ${claim.dealTitle} (ID: ${claim.dealId})`);
        console.log(`      - Amount: ₹${claim.totalAmount}, Savings: ₹${claim.actualSavings}`);
        console.log(`      - Verified: ${claim.vendorVerified}, Code: ${claim.claimCode}`);
      }
      
      return result;
    }
    
    return { success: false, error: 'Vendor dashboard fetch failed' };
  });
}

async function testValidateDataFlow() {
  return await testStep('Validate complete data flow with vendor requirements', async () => {
    // Get the claim from admin analytics
    const analyticsResult = await makeRequest('GET', '/api/admin/claim-code-analytics', null, adminToken);
    if (!analyticsResult.success) {
      return { success: false, error: 'Could not fetch analytics for validation' };
    }
    
    const claims = analyticsResult.data.claims;
    const testClaim = claims.find(c => c.claimCode === testClaimCode);
    
    if (!testClaim) {
      return { success: false, error: 'Test claim not found in analytics' };
    }
    
    // Validate all required vendor data is present
    const requiredFields = ['vendorId', 'customerId', 'dealId', 'totalAmount', 'claimedAt'];
    const missingFields = requiredFields.filter(field => !testClaim[field] && testClaim[field] !== 0);
    
    if (missingFields.length > 0) {
      return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
    }
    
    console.log(`   ✅ All vendor-required data present:`);
    console.log(`      - Vendor ID: ${testClaim.vendorId}`);
    console.log(`      - Customer ID: ${testClaim.customerId}`);
    console.log(`      - Deal ID: ${testClaim.dealId}`);
    console.log(`      - Total Amount: ₹${testClaim.totalAmount}`);
    console.log(`      - Claimed At: ${testClaim.claimedAt}`);
    console.log(`      - Customer Name: ${testClaim.customerName}`);
    console.log(`      - Vendor Name: ${testClaim.vendorName}`);
    
    return { success: true, data: testClaim };
  });
}

async function runTests() {
  console.log('🚀 Starting Corrected Customer Claim Code Flow Tests');
  console.log('=' * 60);
  
  try {
    await authenticateUsers();
    
    const tests = [
      () => testClaimWithCode(),
      () => testPOSVerification(),
      () => testTransactionCompletion(),
      () => testAdminAnalytics(),
      () => testVendorClaimedDeals(),
      () => testValidateDataFlow()
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      const result = await test();
      if (result.success) passedTests++;
    }
    
    console.log('\n' + '=' * 60);
    console.log(`📋 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Corrected claim code system is fully operational.');
      console.log('\n✅ Key Features Verified:');
      console.log('   - Customer claim code generation with vendor data');
      console.log('   - POS verification with complete customer/deal info');
      console.log('   - Transaction completion with bill amount tracking');
      console.log('   - Admin analytics with all vendor-required data');
      console.log('   - Vendor dashboard showing only claimed deals');
      console.log('   - Complete data flow validation');
    } else {
      console.log(`⚠️  ${totalTests - passedTests} tests failed. System needs attention.`);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();