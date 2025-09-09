import express from 'express';
import { TaskService } from '../services/task.js';
import { ExportService } from '../services/export.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.get('/today', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.get('/heatmap', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;
    
    const heatmapData = await TaskService.getHeatmapData(
      userId, 
      startDate as string, 
      endDate as string
    );
    
    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch heatmap data'
    });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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

router.get('/export/:format', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { format } = req.params;
    const { startDate, endDate } = req.query;
    
    if (format !== 'csv' && format !== 'pdf') {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use csv or pdf'
      });
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const start = startDate as string || sevenDaysAgo.toISOString().split('T')[0];
    const end = endDate as string || today.toISOString().split('T')[0];
    
    const tasks = await TaskService.getTasksInDateRange(userId, start, end);
    
    if (format === 'csv') {
      const csvBuffer = await ExportService.generateCSV(tasks, start, end);
      const filename = `tarefas_${start}_${end}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvBuffer);
    } else {
      const pdfBuffer = await ExportService.generatePDF(tasks, start, end);
      const filename = `tarefas_${start}_${end}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export tasks'
    });
  }
});

export default router;