"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
    nik: zod_1.z.string().min(1),
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial();
