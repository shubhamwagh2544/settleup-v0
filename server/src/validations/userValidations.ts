import z from 'zod';

const userIdSchema = z.object({
    id: z.coerce.number().gte(0, 'UserId should be positive number'),
});

export { userIdSchema };
