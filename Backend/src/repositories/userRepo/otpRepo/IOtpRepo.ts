import { IOTP } from '../../../models/otpModel';

export interface IOTPRepository {
  create(email: string, otp: string): Promise<IOTP>;
  findByEmail(email: string): Promise<IOTP | null>;
  deleteByEmail(email: string): Promise<void>;
  // Remove incrementAttemptCount if not using it
}