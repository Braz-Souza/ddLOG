import express from 'express';
import { TaskService } from '../services/task.js';
import { TEMP_USER_ID } from '../services/tempUser.js';
// import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const taskData = req.body;

    const task = await TaskService.createTask(userId, taskData);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const { date } = req.query;
    
    const tasks = await TaskService.getTasks(userId, date as string);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks'
    });
  }
});

router.get('/today', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const tasks = await TaskService.getTodayTasks(userId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch today tasks'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const { id } = req.params;
    
    const task = await TaskService.getTaskById(userId, id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch task'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const { id } = req.params;
    const updates = req.body;
    
    const task = await TaskService.updateTask(userId, id, updates);
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task'
    });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const { id } = req.params;
    const updates = req.body;
    
    const task = await TaskService.updateTask(userId, id, updates);
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = TEMP_USER_ID;
    const { id } = req.params;
    
    const deleted = await TaskService.deleteTask(userId, id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task'
    });
  }
});

export default router;