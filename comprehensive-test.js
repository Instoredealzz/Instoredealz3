import { db } from './server/db.js';
import { users, vendors, deals, dealClaims } from './shared/schema.js';
import { sql, eq, and, desc } from 'drizzle-orm';

async function comprehensiveTest() {
  console.log('🧪 COMPREHENSIVE APPLICATION TEST\n');
  console.log('='.repeat(80));
  
  try {
    // ==================== DATABASE STATE ====================
    console.log('\n📊 CURRENT DATABASE STATE');
    console.log('-'.repeat(80));
    
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const vendorCount = await db.execute(sql`SELECT COUNT(*) as count FROM vendors`);
    const dealCount = await db.execute(sql`SELECT COUNT(*) as count FROM deals`);
    const claimCount = await db.execute(sql`SELECT COUNT(*) as count FROM deal_claims`);
    
    console.log(`👥 Total Users: ${userCount.rows[0].count}`);
    console.log(`🏪 Total Vendors: ${vendorCount.rows[0].count}`);
    console.log(`🎯 Total Deals: ${dealCount.rows[0].count}`);
    console.log(`🎫 Total Claims: ${claimCount.rows[0].count}`);
    
    // ==================== USER ROLES ====================
    console.log('\n👤 USER ROLES BREAKDOWN');
    console.log('-'.repeat(80));
    
    const userRoles = await db.execute(sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY count DESC
    `);
    
    userRoles.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count} users`);
    });
    
    // ==================== VENDOR STATUS ====================
    console.log('\n🏢 VENDOR STATUS');
    console.log('-'.repeat(80));
    
    const vendorStatus = await db.execute(sql`
      SELECT status, is_approved, COUNT(*) as count 
      FROM vendors 
      GROUP BY status, is_approved
    `);
    
    vendorStatus.rows.forEach(row => {
      console.log(`  ${row.status} (approved: ${row.is_approved}): ${row.count} vendors`);
    });
    
    // ==================== DEAL STATUS ====================
    console.log('\n🎯 DEAL STATUS');
    console.log('-'.repeat(80));
    
    const dealStatus = await db.execute(sql`
      SELECT 
        is_active,
        is_approved,
        COUNT(*) as count
      FROM deals 
      GROUP BY is_active, is_approved
    `);
    
    dealStatus.rows.forEach(row => {
      console.log(`  Active: ${row.is_active}, Approved: ${row.is_approved} - ${row.count} deals`);
    });
    
    // ==================== DEAL CATEGORIES ====================
    console.log('\n📦 DEALS BY CATEGORY');
    console.log('-'.repeat(80));
    
    const dealCategories = await db.execute(sql`
      SELECT category, COUNT(*) as count 
      FROM deals 
      WHERE is_active = true AND is_approved = true
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    dealCategories.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} deals`);
    });
    
    // ==================== CLAIM STATUS ====================
    console.log('\n🎫 DEAL CLAIMS STATUS');
    console.log('-'.repeat(80));
    
    const claimStatus = await db.execute(sql`
      SELECT status, COUNT(*) as count 
      FROM deal_claims 
      GROUP BY status
    `);
    
    if (claimStatus.rows.length > 0) {
      claimStatus.rows.forEach(row => {
        console.log(`  ${row.status}: ${row.count} claims`);
      });
    } else {
      console.log('  No claims found');
    }
    
    // ==================== VENDOR DEALS ====================
    console.log('\n🏪 DEALS PER VENDOR');
    console.log('-'.repeat(80));
    
    const vendorDeals = await db.execute(sql`
      SELECT 
        v.business_name,
        v.status,
        COUNT(d.id) as deal_count
      FROM vendors v
      LEFT JOIN deals d ON v.id = d.vendor_id
      GROUP BY v.id, v.business_name, v.status
      ORDER BY deal_count DESC
      LIMIT 10
    `);
    
    vendorDeals.rows.forEach(row => {
      console.log(`  ${row.business_name} (${row.status}): ${row.deal_count} deals`);
    });
    
    // ==================== CHECK FOR DUPLICATES ====================
    console.log('\n🔍 DUPLICATE CHECK');
    console.log('-'.repeat(80));
    
    const duplicateDeals = await db.execute(sql`
      SELECT title, COUNT(*) as count 
      FROM deals 
      GROUP BY title 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateDeals.rows.length > 0) {
      console.log('  ⚠️  DUPLICATES FOUND:');
      duplicateDeals.rows.forEach(row => {
        console.log(`    "${row.title}": ${row.count} copies`);
      });
    } else {
      console.log('  ✅ No duplicate deals found');
    }
    
    const duplicateVendors = await db.execute(sql`
      SELECT user_id, COUNT(*) as count 
      FROM vendors 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateVendors.rows.length > 0) {
      console.log('  ⚠️  DUPLICATE VENDOR PROFILES:');
      duplicateVendors.rows.forEach(row => {
        console.log(`    User ID ${row.user_id}: ${row.count} vendor profiles`);
      });
    } else {
      console.log('  ✅ No duplicate vendor profiles');
    }
    
    // ==================== TEST ACCOUNTS ====================
    console.log('\n👥 TEST ACCOUNTS AVAILABLE');
    console.log('-'.repeat(80));
    
    const testAccounts = await db.execute(sql`
      SELECT 
        u.email,
        u.role,
        u.name,
        v.business_name,
        v.status as vendor_status
      FROM users u
      LEFT JOIN vendors v ON u.id = v.user_id
      WHERE u.email IN ('admin@instoredealz.com', 'vendor@test.com', 'customer@test.com', 'demo@demo.com')
      ORDER BY u.role
    `);
    
    testAccounts.rows.forEach(row => {
      if (row.role === 'vendor') {
        console.log(`  📧 ${row.email}`);
        console.log(`     Role: ${row.role}`);
        console.log(`     Name: ${row.name}`);
        console.log(`     Business: ${row.business_name || 'No business'}`);
        console.log(`     Status: ${row.vendor_status || 'N/A'}`);
      } else {
        console.log(`  📧 ${row.email}`);
        console.log(`     Role: ${row.role}`);
        console.log(`     Name: ${row.name}`);
      }
      console.log('');
    });
    
    // ==================== RECENT ACTIVITY ====================
    console.log('\n📈 RECENT ACTIVITY');
    console.log('-'.repeat(80));
    
    const recentDeals = await db.execute(sql`
      SELECT 
        d.title,
        d.created_at,
        v.business_name
      FROM deals d
      JOIN vendors v ON d.vendor_id = v.id
      ORDER BY d.created_at DESC
      LIMIT 5
    `);
    
    console.log('  Recent Deals Created:');
    if (recentDeals.rows.length > 0) {
      recentDeals.rows.forEach(row => {
        const date = new Date(row.created_at).toLocaleString();
        console.log(`    - "${row.title}" by ${row.business_name} (${date})`);
      });
    } else {
      console.log('    No deals found');
    }
    
    // ==================== RECOMMENDATIONS ====================
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(80));
    
    const issues = [];
    
    if (duplicateDeals.rows.length > 0) {
      issues.push('⚠️  Remove duplicate deals');
    }
    
    if (duplicateVendors.rows.length > 0) {
      issues.push('⚠️  Remove duplicate vendor profiles');
    }
    
    const pendingVendors = await db.execute(sql`
      SELECT COUNT(*) as count FROM vendors WHERE status = 'pending'
    `);
    
    if (pendingVendors.rows[0].count > 0) {
      issues.push(`ℹ️  ${pendingVendors.rows[0].count} vendor(s) pending approval`);
    }
    
    const pendingDeals = await db.execute(sql`
      SELECT COUNT(*) as count FROM deals WHERE is_approved = false
    `);
    
    if (pendingDeals.rows[0].count > 0) {
      issues.push(`ℹ️  ${pendingDeals.rows[0].count} deal(s) pending approval`);
    }
    
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('  ✅ All systems look good!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

comprehensiveTest();
