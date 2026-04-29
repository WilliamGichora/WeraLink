import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import {
  DARAJA_SHORTCODE,
  DARAJA_CONSUMER_KEY,
  DARAJA_CONSUMER_SECRET,
  DARAJA_PASSKEY,
  USE_MOCK_MPESA,
  APP_BASE_URL,
  isProduction
} from '../config/env.js';

const BASE_URL = isProduction
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';


let authToken = null;
let tokenExpiry = null;

export class MpesaService {
  /**
   * Generates or retrieves Daraja OAuth token
   */
  static async getAuthToken() {
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
      return authToken;
    }

    const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64');

    try {
      const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      authToken = response.data.access_token;
      tokenExpiry = Date.now() + (3500 * 1000);
      return authToken;
    } catch (error) {
      console.error('Mpesa Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  /**
   * Generates Daraja password
   */
  static getPassword(timestamp) {
    return Buffer.from(`${DARAJA_SHORTCODE}${DARAJA_PASSKEY}${timestamp}`).toString('base64');
  }

  /**
   * Triggers an STK Push to the Employer for Escrow Funding
   */
  static async triggerSTKPush(assignmentId, phoneNumber, amount) {
    if (USE_MOCK_MPESA) {
      return this.mockSTKPush(assignmentId, phoneNumber, amount);
    }

    const token = await this.getAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = this.getPassword(timestamp);
    const callbackUrl = `${process.env.APP_BASE_URL}/api/webhooks/mpesa/stkpush`;

    // Aggressively strip non-numeric characters (like +) and handle leading 0
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '254');

    try {
      const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        BusinessShortCode: DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: DARAJA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: assignmentId.substring(0, 12),
        TransactionDesc: 'WeraLink Escrow Payment'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Record transaction intent (Upsert to handle retries)
      await prisma.transaction.upsert({
        where: { assignmentId_type: { assignmentId, type: 'DEPOSIT_TO_ESCROW' } },
        create: {
          assignmentId,
          amount,
          type: 'DEPOSIT_TO_ESCROW',
          status: 'PENDING',
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          initiatedAt: new Date()
        },
        update: {
          status: 'PENDING',
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          initiatedAt: new Date(),
          retryCount: { increment: 1 }
        }
      });

      return response.data;
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  /**
   * Triggers B2C Payout to Worker
   */
  static async triggerB2CPayout(assignmentId, phoneNumber, amount) {
    if (USE_MOCK_MPESA) {
      return this.mockB2CPayout(assignmentId, phoneNumber, amount);
    }

    const token = await this.getAuthToken();
    const callbackUrl = `${process.env.APP_BASE_URL}/api/webhooks/mpesa/b2c`;
    // Aggressively strip non-numeric characters (like +) and handle leading 0
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '254');

    try {
      const response = await axios.post(`${BASE_URL}/mpesa/b2c/v3/paymentrequest`, {
        OriginatorConversationID: crypto.randomUUID(),
        InitiatorName: process.env.DARAJA_INITIATOR_NAME || 'testapi',
        SecurityCredential: process.env.DARAJA_SECURITY_CREDENTIAL || 'mock-cred',
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: DARAJA_SHORTCODE,
        PartyB: formattedPhone,
        Remarks: `WeraLink Payout for Assignment ${assignmentId.substring(0, 8)}`,
        QueueTimeOutURL: callbackUrl,
        ResultURL: callbackUrl,
        Occasion: 'Gig Payout'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // We handle the new transaction record creation in the webhook, but we log the attempt
      await prisma.transaction.create({
        data: {
          assignmentId,
          amount,
          type: 'PAYOUT_TO_WORKER',
          status: 'PENDING',
          checkoutRequestId: response.data.ConversationID // Using ConversationID for B2C
        }
      });

      return response.data;
    } catch (error) {
      console.error('B2C Payout Error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payout');
    }
  }

  /**
   * Queries the status of an STK Push request directly from Safaricom
   */
  static async querySTKPushStatus(checkoutRequestId) {
    if (USE_MOCK_MPESA) {
      console.log(`[Mock Mpesa] Querying status for ${checkoutRequestId} - Returning SUCCESS`);
      return { ResultCode: "0", ResultDesc: "Success" };
    }

    const token = await this.getAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = this.getPassword(timestamp);

    try {
      const response = await axios.post(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
        BusinessShortCode: DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('STK Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query M-Pesa transaction status');
    }
  }

  /** MOCK METHODS FOR DEVELOPMENT */
  static async mockSTKPush(assignmentId, phoneNumber, amount) {
    const mockCheckoutId = `ws_CO_${Date.now()}`;
    await prisma.transaction.upsert({
      where: { assignmentId_type: { assignmentId, type: 'DEPOSIT_TO_ESCROW' } },
      create: {
        assignmentId,
        amount,
        type: 'DEPOSIT_TO_ESCROW',
        status: 'PENDING',
        checkoutRequestId: mockCheckoutId,
        merchantRequestId: `12345-MOCK-${Date.now()}`,
        initiatedAt: new Date()
      },
      update: {
        status: 'PENDING',
        checkoutRequestId: mockCheckoutId,
        merchantRequestId: `12345-MOCK-${Date.now()}`,
        initiatedAt: new Date(),
        retryCount: { increment: 1 }
      }
    });

    return {
      MerchantRequestID: `12345-MOCK-${Date.now()}`,
      CheckoutRequestID: mockCheckoutId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing'
    };
  }

  static async mockB2CPayout(assignmentId, phoneNumber, amount) {
    const mockConversationId = `B2C_${Date.now()}`;
    await prisma.transaction.create({
      data: {
        assignmentId,
        amount,
        type: 'PAYOUT_TO_WORKER',
        status: 'PENDING',
        checkoutRequestId: mockConversationId
      }
    });

    return {
      ConversationID: mockConversationId,
      OriginatorConversationID: `O_${mockConversationId}`,
      ResponseCode: '0',
      ResponseDescription: 'Accept the service request successfully.'
    };
  }
}
