"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportValidationSchema = void 0;
const zod_1 = require("zod");
exports.reportValidationSchema = zod_1.z.object({
    start_date: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid start date format. Use YYYY-MM-DD.' }),
    end_date: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid end date format. Use YYYY-MM-DD.' }),
});
