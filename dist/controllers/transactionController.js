"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deposit = deposit;
exports.withdraw = withdraw;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const amountSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
});
async function deposit(req, res) {
    try {
        const customerId = Number(req.params.id);
        const adminId = req.user?.adminId;
        if (!adminId)
            return res.status(401).json({ error: 'Unauthorized' });
        const parseResult = amountSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const { amount } = parseResult.data;
        await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findFirst({ where: { id: customerId, deletedAt: null } });
            if (!customer)
                throw new Error('Customer not found');
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
    }
    catch (error) {
        if (error.message === 'Customer not found')
            return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Failed to process deposit' });
    }
}
async function withdraw(req, res) {
    try {
        const customerId = Number(req.params.id);
        const adminId = req.user?.adminId;
        if (!adminId)
            return res.status(401).json({ error: 'Unauthorized' });
        const parseResult = amountSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const { amount } = parseResult.data;
        await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findFirst({ where: { id: customerId, deletedAt: null } });
            if (!customer)
                throw new Error('Customer not found');
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
    }
    catch (error) {
        if (error.message === 'Customer not found')
            return res.status(404).json({ error: error.message });
        if (error.message === 'Insufficient balance')
            return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
}
