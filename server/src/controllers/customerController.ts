import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { ICustomer } from '../../../shared/types';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments();

    res.json({
      success: true,
      data: {
        customers,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: ICustomer = req.body;
    const customer = new Customer(customerData);
    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
