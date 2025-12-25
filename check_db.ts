
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const latestBooking = await prisma.booking.findFirst({
        where: {
            user: {
                username: { contains: 'Test Patient' }
            }
        },
        include: {
            user: true,
            service: true,
            slot: true
        }
    })
    console.log('Latest Booking:', JSON.stringify(latestBooking, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
