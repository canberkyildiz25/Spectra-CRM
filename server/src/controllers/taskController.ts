import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { ITask } from '../../../shared/types';

interface AuthRequest extends Request {
  userId?: string;
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, assignedTo } = req.query;
    let filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    } else {
      // If not specified, show tasks assigned to the current user
      filter.assignedTo = req.userId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .sort({ dueDate: 1, priority: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate(
      'assignedTo',
      'firstName lastName email'
    );

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskData: ITask = req.body;

    // Ensure assignedTo is set
    if (!taskData.assignedTo) {
      taskData.assignedTo = req.userId!;
    }

    const task = new Task(taskData);
    await task.save();
    await task.populate('assignedTo', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
