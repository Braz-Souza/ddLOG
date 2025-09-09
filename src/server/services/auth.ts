import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/connection.js';
import type { User, AuthRequest, AuthResponse } from '../../types';

// Load environment variables dynamically to ensure they're available
import dotenv from 'dotenv';
dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET || 'development-jwt-secret-not-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

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
    
    const resultRow = db.prepare(`
      INSERT INTO users (pin_hash, failed_attempts, locked_until) 
      VALUES (?, 0, NULL) 
      RETURNING id, pin_hash, failed_attempts, locked_until, created_at
    `).get(pinHash) as any;

    // Map database columns to User interface
    return {
      id: resultRow.id,
      pinHash: resultRow.pin_hash,
      failedAttempts: resultRow.failed_attempts,
      lockedUntil: resultRow.locked_until,
      createdAt: resultRow.created_at
    };
  }

  static async authenticateUser(pin: string): Promise<AuthResponse> {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('PIN deve conter exatamente 6 dígitos');
    }

    const userRow = db.prepare('SELECT * FROM users LIMIT 1').get() as any;
    
    if (!userRow) {
      throw new Error('Nenhum usuário encontrado. Por favor, crie seu PIN primeiro.');
    }

    // Map database columns to User interface
    const user: User = {
      id: userRow.id,
      pinHash: userRow.pin_hash,
      failedAttempts: userRow.failed_attempts,
      lockedUntil: userRow.locked_until,
      createdAt: userRow.created_at
    };
    
    if (!user) {
      throw new Error('Nenhum usuário encontrado. Por favor, crie seu PIN primeiro.');
    }

    // Check if user is currently locked
    if (user.lockedUntil) {
      const lockoutTime = new Date(user.lockedUntil);
      const currentTime = new Date();
      
      if (currentTime < lockoutTime) {
        const remainingSeconds = Math.ceil((lockoutTime.getTime() - currentTime.getTime()) / 1000);
        throw new Error(`Acesso bloqueado. Tente novamente em ${remainingSeconds} segundos.`);
      } else {
        // Lockout expired, reset attempts
        db.prepare(`
          UPDATE users 
          SET failed_attempts = 0, locked_until = NULL 
          WHERE id = ?
        `).run(user.id);
        user.failedAttempts = 0;
        user.lockedUntil = undefined;
      }
    }

    const isValidPin = await bcrypt.compare(pin, user.pinHash);
    
    if (!isValidPin) {
      // Increment failed attempts
      const newFailedAttempts = user.failedAttempts + 1;
      
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the user
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        db.prepare(`
          UPDATE users 
          SET failed_attempts = ?, locked_until = ? 
          WHERE id = ?
        `).run(newFailedAttempts, lockUntil.toISOString(), user.id);
        
        throw new Error(`PIN incorreto. Muitas tentativas falharam. Acesso bloqueado por 30 segundos.`);
      } else {
        // Update failed attempts
        db.prepare(`
          UPDATE users 
          SET failed_attempts = ? 
          WHERE id = ?
        `).run(newFailedAttempts, user.id);
        
        const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
        throw new Error(`PIN incorreto. ${remainingAttempts} tentativa(s) restante(s).`);
      }
    }

    // Successful login - reset failed attempts
    db.prepare(`
      UPDATE users 
      SET failed_attempts = 0, locked_until = NULL 
      WHERE id = ?
    `).run(user.id);

    const payload = { id: user.id };
    const secret = JWT_SECRET as string;
    const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN as any });

    return {
      token,
      user: {
        id: user.id,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt
      }
    };
  }

  static async hasUser(): Promise<boolean> {
    const user = db.prepare('SELECT id FROM users LIMIT 1').get();
    return !!user;
  }
}