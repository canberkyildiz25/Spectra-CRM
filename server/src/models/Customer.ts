import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from '../../../shared/types';

interface ICustomerDocument extends ICustomer, Document {}

const customerSchema = new Schema<ICustomerDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['prospect', 'customer', 'inactive'],
      default: 'prospect'
    },
    source: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Customer = mongoose.model<ICustomerDocument>('Customer', customerSchema);
