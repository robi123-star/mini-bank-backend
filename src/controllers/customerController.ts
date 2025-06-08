import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createCustomerSchema = z.object({
  fullName: z.string().min(1),
  address: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  nik: z.string().min(1),
});

const updateCustomerSchema = createCustomerSchema.partial();

export async function getCustomers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.customer.count({ where: { deletedAt: null } }),
    ]);

    res.json({
      data: customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
}

export async function createCustomer(req: Request, res: Response) {
  try {
    const parseResult = createCustomerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }
    const { fullName, address, birthDate, nik } = parseResult.data;

    const customer = await prisma.customer.create({
      data: {
        fullName,
        address,
        birthDate: new Date(birthDate),
        nik,
      },
    });

    res.status(201).json(customer);
  } catch {
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export async function getCustomerById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const customer = await prisma.customer.findFirst({ where: { id, deletedAt: null } });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
}

export async function updateCustomer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const parseResult = updateCustomerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const existing = await prisma.customer.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updates = parseResult.data;
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        fullName: updates.fullName,
        address: updates.address,
        birthDate: updates.birthDate ? new Date(updates.birthDate) : undefined,
        nik: updates.nik,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export async function deleteCustomer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.customer.findFirst({ where: { id, deletedAt: null } });

    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}
