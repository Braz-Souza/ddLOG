import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/connection.js';
import type { User, AuthRequest, AuthResponse } from '@shared/types';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET || 'development-jwt-secret-not-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async createUser(pin: string): Promise<User> {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (existingUser) {
      throw new Error('User already exists');
    }

    const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
    
    const result = db.prepare(`
      INSERT INTO users (pin_hash) 
      VALUES (?) 
      RETURNING id, pin_hash, created_at
    `).get(pinHash) as User;

    return result;
  }

  static async authenticateUser(pin: string): Promise<AuthResponse> {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('Invalid PIN format');
    }

    const user = db.prepare('SELECT * FROM users LIMIT 1').get() as User | undefined;
    
    if (!user) {
      throw new Error('No user found. Please create your PIN first.');
    }

    const isValidPin = await bcrypt.compare(pin, user.pinHash);
    if (!isValidPin) {
      throw new Error('Invalid PIN');
    }

    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        createdAt: user.createdAt
      }
    };
  }

  static async hasUser(): Promise<boolean> {
    const user = db.prepare('SELECT id FROM users LIMIT 1').get();
    return !!user;
  }
}