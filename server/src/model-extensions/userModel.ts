import {Prisma} from '@prisma/client';

export const userModel = Prisma.defineExtension({
    name: 'userWithFullName',
    model: {
        user: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute(user: any) {
                    return `${user.firstName} ${user.lastName}`;
                }
            }
        }
    }
})
