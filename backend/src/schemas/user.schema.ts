import { z } from 'zod'

export const createUserSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]+$/
            , 'Only letters, numbers, dots and underscores allowed'),
    email: z.email('Invalid email'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Must contain at least one letter and one number'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
