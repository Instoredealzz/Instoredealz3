import axios from 'axios';

interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

interface SendWhatsAppMessageParams {
  to: string;
  message: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && whatsappNumber) {
      this.config = {
        accountSid,
        authToken,
        whatsappNumber,
      };
      this.isEnabled = true;
      console.log('[WHATSAPP] WhatsApp service initialized successfully');
    } else {
      this.isEnabled = false;
      console.log('[WHATSAPP] WhatsApp service is disabled. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to enable.');
    }
  }

  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  public async sendMessage({ to, message }: SendWhatsAppMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isEnabled || !this.config) {
      console.log('[WHATSAPP] Service not enabled, skipping message');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    try {
      // Ensure the 'to' number has whatsapp: prefix
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
        new URLSearchParams({
          From: this.config.whatsappNumber,
          To: formattedTo,
          Body: message,
        }),
        {
          auth: {
            username: this.config.accountSid,
            password: this.config.authToken,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('[WHATSAPP] Message sent successfully:', {
        to: formattedTo,
        messageId: response.data.sid,
      });

      return {
        success: true,
        messageId: response.data.sid,
      };
    } catch (error: any) {
      console.error('[WHATSAPP] Failed to send message:', {
        to,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send WhatsApp message',
      };
    }
  }

  public async sendBulkMessages(
    recipients: Array<{ userId: number; phoneNumber: string; name: string }>,
    message: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<Array<{ userId: number; phoneNumber: string; success: boolean; messageId?: string; error?: string }>> {
    const results: Array<{ userId: number; phoneNumber: string; success: boolean; messageId?: string; error?: string }> = [];
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      // Personalize message with recipient name
      const personalizedMessage = message.replace(/{name}/g, recipient.name);
      
      const result = await this.sendMessage({
        to: recipient.phoneNumber,
        message: personalizedMessage,
      });

      results.push({
        userId: recipient.userId,
        phoneNumber: recipient.phoneNumber,
        ...result,
      });

      // Call progress callback if provided
      if (onProgress) {
        onProgress(i + 1, recipients.length);
      }

      // Add delay between messages to avoid rate limiting (Twilio has rate limits)
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return results;
  }
}

// Template messages
export const WhatsAppTemplates = {
  newDeal: (customerName: string, dealTitle: string, discountPercentage: number, vendorName: string) => 
    `Hi ${customerName}! 🎉\n\nNew deal alert: "${dealTitle}"\n💰 Get ${discountPercentage}% off at ${vendorName}\n\nCheck it out on Instoredealz app now!`,

  dealClaimed: (customerName: string, dealTitle: string, claimCode: string) =>
    `Hi ${customerName}! ✅\n\nYou've successfully claimed: "${dealTitle}"\n\nYour claim code: ${claimCode}\n\nShow this code at the store to redeem your deal!`,

  dealReminder: (customerName: string, dealTitle: string, expiryDate: string) =>
    `Hi ${customerName}! ⏰\n\nReminder: Your deal "${dealTitle}" expires on ${expiryDate}\n\nDon't miss out! Redeem it soon.`,

  marketingMessage: (message: string) => message,
};

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Helper function to format phone numbers for WhatsApp
export function formatWhatsAppNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Ensure it has country code
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return `whatsapp:+91${cleaned}`;
  }
  
  if (!cleaned.startsWith('+')) {
    return `whatsapp:+${cleaned}`;
  }
  
  return `whatsapp:${cleaned}`;
}
