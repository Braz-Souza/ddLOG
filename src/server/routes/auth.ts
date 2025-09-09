import express from 'express';
import { AuthService } from '../services/auth.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const hasUser = await AuthService.hasUser();
    
    res.json({
      success: true,
      data: {
        hasUser,
        requiresSetup: !hasUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check auth status'
    });
  }
});

router.post('/setup', async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    const user = await AuthService.createUser(pin);
    
    res.status(201).json({
      success: true,
      data: {
        message: 'User created successfully',
        userId: user.id
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    const authResult = await AuthService.authenticateUser(pin);
    
    res.json({
      success: true,
      data: authResult
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
});

export default router;