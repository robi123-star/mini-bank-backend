"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountSchema = void 0;
const zod_1 = require("zod");
exports.amountSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
});
