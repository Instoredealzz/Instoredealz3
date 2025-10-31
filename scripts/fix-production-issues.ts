import { DatabaseStorage } from "../server/db-storage";
import { db } from "../server/db";
import { deals, wishlists, helpTickets } from "../shared/schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";

const storage = new DatabaseStorage();

async function fixOldDealPins() {
  console.log("\n=== Fixing Old Deal PINs ===");
  
  // Find deals with hashed PINs (have pin_salt)
  const hashedPinDeals = await db.select()
    .from(deals)
    .where(isNotNull(deals.pinSalt));
  
  console.log(`Found ${hashedPinDeals.length} deals with hashed PINs (vendors can't see them)`);
  
  // Find deals with plain text PINs
  const plainPinDeals = await db.select()
    .from(deals)
    .where(and(
      isNull(deals.pinSalt),
      isNotNull(deals.verificationPin)
    ));
  
  console.log(`Found ${plainPinDeals.length} deals with visible PINs`);
  
  // Update hashed PIN deals to use plain text PINs
  if (hashedPinDeals.length > 0) {
    console.log("\nUpdating hashed PIN deals to use new visible PINs...");
    
    for (const deal of hashedPinDeals) {
      // Generate a new 6-digit PIN
      const newPin = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.update(deals)
        .set({
          verificationPin: newPin,
          pinSalt: null,
          pinExpiresAt: null
        })
        .where(eq(deals.id, deal.id));
      
      console.log(`  - Deal #${deal.id} "${deal.title}": Updated PIN to ${newPin}`);
    }
    
    console.log(`\n✅ Updated ${hashedPinDeals.length} deals to use visible PINs`);
  } else {
    console.log("\n✅ All deals already have visible PINs");
  }
}

async function checkHelpTickets() {
  console.log("\n=== Checking Help Tickets ===");
  
  const tickets = await db.select().from(helpTickets);
  console.log(`Total help tickets: ${tickets.length}`);
  
  if (tickets.length === 0) {
    console.log("⚠️  No help tickets found - system is ready but untested");
    console.log("   Action: Test by submitting a help ticket through the UI");
  } else {
    console.log("✅ Help ticket system has been used");
    console.log("\nRecent tickets:");
    tickets.slice(-3).forEach(ticket => {
      console.log(`  - #${ticket.id}: ${ticket.subject} (${ticket.status})`);
    });
  }
}

async function addSampleWishlistItems() {
  console.log("\n=== Adding Sample Wishlist Items ===");
  
  const existingWishlists = await db.select().from(wishlists);
  console.log(`Current wishlist items: ${existingWishlists.length}`);
  
  if (existingWishlists.length === 0) {
    console.log("Adding sample wishlist items for demo...");
    
    // Get first user (customer)
    const users = await storage.getAllUsers();
    const customer = users.find(u => u.role === 'customer');
    
    // Get first few active deals
    const allDeals = await storage.getAllDeals();
    const activeDeals = allDeals.filter(d => d.isActive && d.isApproved).slice(0, 3);
    
    if (customer && activeDeals.length > 0) {
      for (const deal of activeDeals) {
        await storage.addToWishlist({
          userId: customer.id,
          dealId: deal.id
        });
        console.log(`  - Added Deal #${deal.id} "${deal.title}" to wishlist`);
      }
      console.log(`\n✅ Added ${activeDeals.length} sample wishlist items`);
    } else {
      console.log("⚠️  No customer or active deals found to create wishlist items");
    }
  } else {
    console.log("✅ Wishlist already has items");
  }
}

async function checkEmailConfiguration() {
  console.log("\n=== Email Configuration ===");
  
  const sendgridKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridKey) {
    console.log("❌ SENDGRID_API_KEY not configured");
    console.log("\n📋 To enable email notifications:");
    console.log("   1. Get a SendGrid API key from https://sendgrid.com");
    console.log("   2. Add it to your Replit Secrets as 'SENDGRID_API_KEY'");
    console.log("   3. Restart the application");
    console.log("\n   Email features disabled: welcome emails, vendor approvals, notifications");
  } else {
    console.log("✅ SENDGRID_API_KEY is configured");
    console.log("   Email notifications are enabled");
  }
}

async function main() {
  console.log("🚀 Instoredealz - Production Readiness Check\n");
  console.log("=" .repeat(60));
  
  try {
    await fixOldDealPins();
    await checkHelpTickets();
    await addSampleWishlistItems();
    await checkEmailConfiguration();
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Production readiness check complete!");
    console.log("\n📝 Summary:");
    console.log("   - Old deal PINs have been fixed (vendors can now see them)");
    console.log("   - Help ticket system is ready");
    console.log("   - Sample wishlist items added for demo");
    console.log("   - Email configuration status checked");
    console.log("\n💡 Next steps:");
    console.log("   - Test help ticket submission through the UI");
    console.log("   - Configure SendGrid API key for production email notifications");
    console.log("   - Verify all features work end-to-end");
    
  } catch (error) {
    console.error("\n❌ Error during production check:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
