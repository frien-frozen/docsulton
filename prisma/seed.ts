import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create admin user
    const hashedPassword = await bcrypt.hash('password1234', 10)

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            role: 'ADMIN'
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@example.com',
            role: 'ADMIN'
        }
    })

    console.log('✅ Admin user created:', admin.username)

    // Create services
    const offlineConsultation = await prisma.service.create({
        data: {
            name: JSON.stringify({
                uz: 'Offline Konsultatsiya',
                ru: 'Оффлайн Консультация',
                en: 'Offline Consultation'
            }),
            description: JSON.stringify({
                uz: '40 daqiqalik yuzma-yuz qabul. Analizlar, tashxis va davolash rejasi.',
                ru: '40-минутный личный прием. Анализы, диагноз и план лечения.',
                en: '40-minute in-person appointment. Analysis, diagnosis and treatment plan.'
            }),
            duration: 40,
            price: 420000,
            currency: 'UZS'
        }
    })

    const onlineConsultation = await prisma.service.create({
        data: {
            name: JSON.stringify({
                uz: 'Online Konsultatsiya',
                ru: 'Онлайн Консультация',
                en: 'Online Consultation'
            }),
            description: JSON.stringify({
                uz: '30 daqiqalik video aloqa. Shikoyatlar, maqsad va savollar.',
                ru: '30-минутная видеосвязь. Жалобы, цели и вопросы.',
                en: '30-minute video call. Complaints, goals and questions.'
            }),
            duration: 30,
            price: 250000,
            currency: 'UZS'
        }
    })

    const courseControl = await prisma.service.create({
        data: {
            name: JSON.stringify({
                uz: '3 Oylik Nazorat (Kurs)',
                ru: '3-месячный Контроль (Курс)',
                en: '3-Month Control (Course)'
            }),
            description: JSON.stringify({
                uz: '12 ta online konsultatsiya + Telegram orqali doimiy aloqa. Chegirma bilan: $250 (aslida $350).',
                ru: '12 онлайн-консультаций + постоянная связь через Telegram. Со скидкой: $250 (обычно $350).',
                en: '12 online consultations + constant contact via Telegram. Discounted: $250 (regular $350).'
            }),
            duration: 30, // Per session placeholder
            price: 3200000, // Approx $250
            currency: 'UZS'
        }
    })

    console.log('✅ Services created')

    // Create time slots for the next 7 days
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        // Create slots from 10:00 to 16:00
        for (let hour = 10; hour < 16; hour++) {
            const startTime = new Date(date)
            startTime.setHours(hour, 0, 0, 0)

            const endTime = new Date(startTime)
            endTime.setMinutes(endTime.getMinutes() + 30)

            await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    isBooked: false
                }
            })
        }
    }

    console.log('✅ Time slots created')



    // Create sample blog posts
    const posts = [
        {
            title: { uz: 'Erkaklar salomatligi sirlari', ru: 'Секреты мужского здоровья', en: 'Secrets of Men\'s Health' },
            slug: 'mens-health-secrets',
            excerpt: {
                uz: 'Erkaklar salomatligini saqlash bo\'yicha muhim maslahatlar va tavsiyalar.',
                ru: 'Важные советы и рекомендации по сохранению мужского здоровья.',
                en: 'Important tips and recommendations for maintaining men\'s health.'
            },
            content: {
                uz: '## Erkaklar salomatligi\n\nErkaklar salomatligi har bir yoshda muhim ahamiyatga ega. To\'g\'ri ovqatlanish, muntazam jismoniy mashqlar va stressni boshqarish asosiy omillardir.\n\n### Asosiy tavsiyalar:\n1. Muntazam tekshiruvdan o\'ting\n2. Sport bilan shug\'ullaning\n3. Zararli odatlardan voz keching',
                ru: '## Мужское здоровье\n\nЗдоровье мужчин важно в любом возрасте. Правильное питание, регулярные физические упражнения и управление стрессом являются ключевыми факторами.\n\n### Основные рекомендации:\n1. Проходите регулярные осмотры\n2. Занимайтесь спортом\n3. Откажитесь от вредных привычек',
                en: '## Men\'s Health\n\nMen\'s health is important at every age. Proper nutrition, regular exercise, and stress management are key factors.\n\n### Key Recommendations:\n1. Get regular check-ups\n2. Exercise regularly\n3. Quit bad habits'
            },
            coverImage: 'https://images.unsplash.com/photo-1571019611246-509c333dd80d?q=80&w=2940&auto=format&fit=crop',
            isPublished: true,
            tags: ['health', 'men', 'tips']
        },
        {
            title: { uz: 'Prostatit: Belgilari va davolash', ru: 'Простатит: Симптомы и лечение', en: 'Prostatitis: Symptoms and Treatment' },
            slug: 'prostatitis-symptoms',
            excerpt: {
                uz: 'Prostatit kasalligining belgilari va zamonaviy davolash usullari haqida.',
                ru: 'О симптомах простатита и современных методах лечения.',
                en: 'About symptoms of prostatitis and modern treatment methods.'
            },
            content: {
                uz: '## Prostatit nima?\n\nProstatit - bu prostata bezining yallig\'lanishi. Bu kasallik turli yoshdagi erkaklarda uchrashi mumkin.\n\n### Belgilari:\n- Og\'riq\n- Peshob chiqarishda muammolar\n- Harorat ko\'tarilishi',
                ru: '## Что такое простатит?\n\nПростатит - это воспаление предстательной железы. Это заболевание может встречаться у мужчин разного возраста.\n\n### Симптомы:\n- Боль\n- Проблемы с мочеиспусканием\n- Повышение температуры',
                en: '## What is Prostatitis?\n\nProstatitis is inflammation of the prostate gland. This disease can occur in men of different ages.\n\n### Symptoms:\n- Pain\n- Problems with urination\n- Fever'
            },
            coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2960&auto=format&fit=crop',
            isPublished: true,
            tags: ['disease', 'treatment', 'urology']
        },
        {
            title: { uz: 'Sog\'lom turmush tarzi', ru: 'Здоровый образ жизни', en: 'Healthy Lifestyle' },
            slug: 'healthy-lifestyle',
            excerpt: {
                uz: 'Kundalik hayotda sog\'lom turmush tarzini shakllantirish.',
                ru: 'Формирование здорового образа жизни в повседневности.',
                en: 'Forming a healthy lifestyle in daily life.'
            },
            content: {
                uz: '## Sog\'lom turmush tarzi\n\nSog\'lom bo\'lish uchun kun tartibiga rioya qilish muhim.\n\n> "Sog\'liq - bu eng katta boylik"\n\nHar kuni kamida 30 daqiqa piyoda yuring.',
                ru: '## Здоровый образ жизни\n\nДля здоровья важно соблюдать режим дня.\n\n> "Здоровье - это самое большое богатство"\n\nХодите пешком минимум 30 минут каждый день.',
                en: '## Healthy Lifestyle\n\nIt is important to follow a daily routine to be healthy.\n\n> "Health is the greatest wealth"\n\nWalk for at least 30 minutes every day.'
            },
            coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2940&auto=format&fit=crop',
            isPublished: true,
            tags: ['lifestyle', 'health', 'daily']
        }
    ]

    for (const post of posts) {
        await prisma.post.upsert({
            where: { slug: post.slug },
            update: {},
            create: {
                title: JSON.stringify(post.title),
                slug: post.slug,
                excerpt: JSON.stringify(post.excerpt),
                content: JSON.stringify(post.content),
                coverImage: post.coverImage,
                isPublished: post.isPublished,
                tags: JSON.stringify(post.tags)
            }
        })
    }

    console.log('✅ Sample blog posts created')


}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
