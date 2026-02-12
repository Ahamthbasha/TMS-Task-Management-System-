import { OTP, IOTP } from '../../../models/otpModel';
import { IOTPRepository } from './IOtpRepo';

export class OTPRepository implements IOTPRepository {
  async create(email: string, otp: string): Promise<IOTP> {
    return await OTP.create({ email, otp });
  }

  async findByEmail(email: string): Promise<IOTP | null> {
    // Find the most recent OTP for this email (not expired by TTL)
    return await OTP.findOne({ email }).sort({ createdAt: -1 }).exec();
  }

  async deleteByEmail(email: string): Promise<void> {
    await OTP.deleteMany({ email });
  }
}