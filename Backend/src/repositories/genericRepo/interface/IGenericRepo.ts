// src/repositories/genericRepo/interface/IGenericRepo.ts
import { Document, QueryFilter, UpdateQuery, QueryOptions } from 'mongoose';

export interface IGenericRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string, projection?: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>, projection?: string): Promise<T | null>;
  findAll(filter?: QueryFilter<T>, options?: QueryOptions): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  exists(filter: QueryFilter<T>): Promise<boolean>;
  count(filter?: QueryFilter<T>): Promise<number>;
}