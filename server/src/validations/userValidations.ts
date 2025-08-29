import z from 'zod';

const userSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    phoneNumber: z.string().nullable().optional(),
    address: z.string().optional(),
    profilePic: z.string()
        // .url()
        .optional(),
    email: z.string().email()
});

const userIdSchema = z.object({
    id: z.coerce.number().gte(0, 'UserId should be positive number'),
});

export {
    userIdSchema,
    userSchema
};
