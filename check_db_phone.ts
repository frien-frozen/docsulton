
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // Check for the first booking (name lost)
    const bookingByPhone = await prisma.booking.findFirst({
        where: {
            user: { phone: { contains: '998901234567' } }
        },
        include: { user: true }
    })
    console.log('Booking by Phone:', JSON.stringify(bookingByPhone, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
