import twilio from 'twilio';
import { query } from '../db/index.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber, otp) => {
  // In development, log OTP instead of sending SMS
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
    return { success: true, dev: true };
  }

  try {
    await client.messages.create({
      body: `Your farmer marketplace verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

export const saveOTP = async (phoneNumber, otp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    'INSERT INTO otps (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)',
    [phoneNumber, otp, expiresAt]
  );
};

export const verifyOTP = async (phoneNumber, otp) => {
  const result = await query(
    `SELECT * FROM otps
     WHERE phone_number = $1
     AND otp_code = $2
     AND expires_at > NOW()
     AND verified = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [phoneNumber, otp]
  );

  if (result.rows.length === 0) {
    return false;
  }

  // Mark OTP as verified
  await query(
    'UPDATE otps SET verified = TRUE WHERE id = $1',
    [result.rows[0].id]
  );

  return true;
};
