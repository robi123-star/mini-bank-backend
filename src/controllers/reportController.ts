import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { reportValidationSchema } from '../validation/reportValidation';

const prisma = new PrismaClient();

export const getReport = async (req: Request, res: Response) => {
  // Validate query parameters
  const parsed = reportValidationSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  const { start_date, end_date } = parsed.data;
  const whereClause: any = {};

  if (start_date && end_date) {
    whereClause.createdAt = {
      gte: new Date(start_date),
      lte: new Date(`${end_date}T23:59:59.999Z`),
    };
  } else if (start_date) {
    whereClause.createdAt = {
      gte: new Date(start_date),
    };
  } else if (end_date) {
    whereClause.createdAt = {
      lte: new Date(`${end_date}T23:59:59.999Z`),
    };
  }

  try {
    const reports = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomerBalance = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  // Convert customerId to a number
  const id = parseInt(customerId, 10);

  try {
    const customer = await prisma.customer.findUnique({
      where: { id }, // Use the numeric id
      // Adjust the select statement based on your actual schema
      select: { id: true, fullName: true, address: true, birthDate: true, nik: true }, // Example fields
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Return relevant customer information instead of balance
    return res.json({ customer });
  } catch (error) {
    console.error('Error fetching customer balance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomerTransactions = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  // Convert customerId to a number
  const id = parseInt(customerId, 10);

  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: id }, // Use the numeric id
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ transactions });
  } catch (error) {
    console.error('Error fetching customer transactions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ transactions });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
