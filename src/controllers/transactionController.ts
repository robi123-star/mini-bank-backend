import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const amountSchema = z.object({
  amount: z.number().positive(),
});

export async function deposit(req: Request, res: Response) {
  try {
    const customerId = Number(req.params.id);
    const adminId = (req as any).user?.adminId;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const parseResult = amountSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const { amount } = parseResult.data;

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({ where: { id: customerId, deletedAt: null } });
      if (!customer) throw new Error('Customer not found');

      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'deposit',
          customerId,
          adminId,
        },
      });

      const admin = await tx.admin.findUnique({ where: { id: adminId } });

      res.status(201).json({ transaction, admin: { id: admin?.id, email: admin?.email } });
    });
  } catch (error: any) {
    if (error.message === 'Customer not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Failed to process deposit' });
  }
}

export async function withdraw(req: Request, res: Response) {
  try {
    const customerId = Number(req.params.id);
    const adminId = (req as any).user?.adminId;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const parseResult = amountSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const { amount } = parseResult.data;

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({ where: { id: customerId, deletedAt: null } });
      if (!customer) throw new Error('Customer not found');

      const depositSum = await tx.transaction.aggregate({
        where: { customerId, type: 'deposit' },
        _sum: { amount: true },
      });
      const withdrawSum = await tx.transaction.aggregate({
        where: { customerId, type: 'withdraw' },
        _sum: { amount: true },
      });

      const balance = (depositSum._sum.amount ?? 0) - (withdrawSum._sum.amount ?? 0);

      if (amount > balance) {
        throw new Error('Insufficient balance');
      }

      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'withdraw',
          customerId,
          adminId,
        },
      });

      const admin = await tx.admin.findUnique({ where: { id: adminId } });

      res.status(201).json({ transaction, admin: { id: admin?.id, email: admin?.email } });
    });
  } catch (error: any) {
    if (error.message === 'Customer not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Insufficient balance') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
}
