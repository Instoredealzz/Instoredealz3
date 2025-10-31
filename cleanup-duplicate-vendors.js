import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function cleanupDuplicateVendors() {
  try {
    console.log('🔍 Checking for duplicate vendor profiles...\n');
    
    const duplicateVendors = await db.execute(sql`
      SELECT user_id, COUNT(*) as count 
      FROM vendors 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateVendors.rows.length === 0) {
      console.log('✅ No duplicate vendor profiles found\n');
      process.exit(0);
    }
    
    console.log('⚠️  Found duplicate vendor profiles:');
    duplicateVendors.rows.forEach(row => {
      console.log(`   User ID ${row.user_id}: ${row.count} vendor profiles`);
    });
    
    console.log('\n🧹 Cleaning up duplicates...');
    console.log('   Keeping only the OLDEST vendor profile for each user\n');
    
    // Step 1: Update deals to reference the oldest vendor profile
    console.log('   Step 1: Updating deal references to oldest vendor profile...');
    await db.execute(sql`
      UPDATE deals d
      SET vendor_id = (
        SELECT MIN(v2.id)
        FROM vendors v2
        WHERE v2.user_id = (
          SELECT v3.user_id
          FROM vendors v3
          WHERE v3.id = d.vendor_id
        )
      )
      WHERE vendor_id IN (
        SELECT v.id
        FROM vendors v
        WHERE v.user_id IN (
          SELECT user_id
          FROM vendors
          GROUP BY user_id
          HAVING COUNT(*) > 1
        )
        AND v.id NOT IN (
          SELECT MIN(id)
          FROM vendors
          GROUP BY user_id
          HAVING COUNT(*) > 1
        )
      )
    `);
    console.log('   ✅ Deal references updated');
    
    // Step 2: Update vendor_approvals to reference the oldest vendor profile
    console.log('   Step 2: Updating vendor approval references...');
    await db.execute(sql`
      UPDATE vendor_approvals va
      SET vendor_id = (
        SELECT MIN(v2.id)
        FROM vendors v2
        WHERE v2.user_id = (
          SELECT v3.user_id
          FROM vendors v3
          WHERE v3.id = va.vendor_id
        )
      )
      WHERE vendor_id IN (
        SELECT v.id
        FROM vendors v
        WHERE v.user_id IN (
          SELECT user_id
          FROM vendors
          GROUP BY user_id
          HAVING COUNT(*) > 1
        )
        AND v.id NOT IN (
          SELECT MIN(id)
          FROM vendors
          GROUP BY user_id
          HAVING COUNT(*) > 1
        )
      )
    `);
    console.log('   ✅ Vendor approval references updated');
    
    // Step 3: Delete duplicate vendor profiles (keeping the oldest one)
    console.log('   Step 3: Deleting duplicate vendor profiles...');
    const deleteResult = await db.execute(sql`
      DELETE FROM vendors
      WHERE id IN (
        SELECT id FROM (
          SELECT id, 
                 ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id ASC) as rn
          FROM vendors
        ) t
        WHERE t.rn > 1
      )
    `);
    console.log('   ✅ Duplicate vendor profiles deleted');
    
    // Step 4: Add unique constraint to user_id
    console.log('   Step 4: Adding unique constraint to user_id column...');
    try {
      await db.execute(sql`
        ALTER TABLE vendors 
        ADD CONSTRAINT vendors_user_id_unique UNIQUE (user_id)
      `);
      console.log('   ✅ Unique constraint added');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('   ℹ️  Unique constraint already exists');
      } else {
        console.log('   ⚠️  Could not add unique constraint:', error.message);
      }
    }
    
    // Verify cleanup
    const finalVendorCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM vendors
    `);
    
    const remainingDuplicates = await db.execute(sql`
      SELECT user_id, COUNT(*) as count 
      FROM vendors 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    console.log('\n📊 RESULTS:');
    console.log(`   Total vendors remaining: ${finalVendorCount.rows[0].count}`);
    
    if (remainingDuplicates.rows.length > 0) {
      console.log('   ⚠️  Still have duplicates:');
      remainingDuplicates.rows.forEach(row => {
        console.log(`     User ID ${row.user_id}: ${row.count} profiles`);
      });
    } else {
      console.log('   ✅ No duplicate vendor profiles remaining!');
    }
    
    console.log('\n✅ Cleanup complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDuplicateVendors();
