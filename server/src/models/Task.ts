import mongoose, { Document, Schema } from 'mongoose';
import { ITask } from '../types';

interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters']
    },
    description: {
      type: String,
      trim: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'AssignedTo is required']
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['customer', 'opportunity', 'general'],
        default: 'general'
      },
      id: {
        type: Schema.Types.ObjectId
      }
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
