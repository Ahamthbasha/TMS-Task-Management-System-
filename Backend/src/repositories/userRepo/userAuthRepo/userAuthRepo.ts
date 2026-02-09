import { User, IUser } from "../../../models/userModel"
import { GenericRepository } from '../../genericRepo/genericRepo';
import { IUserRepository } from './IuserAuthRepo';

export class UserRepository extends GenericRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  // No .exec() needed — findOne already returns Promise<IUser | null>
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email, isActive: true });
  }

  // For password we need .select('+password') → so we must go to the model directly here
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model
      .findOne({ email, isActive: true })
      .select('+password')
      .lean()           // optional: faster if you don't need mongoose document methods
      .exec();
  }

  // Your current findById is already correct (no extra .exec())
  async findById(id: string): Promise<IUser | null> {
    return super.findById(id);   // ← calls generic findById → already Promise
  }
}