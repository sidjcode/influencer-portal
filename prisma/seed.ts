import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    // Create 10 influencers
    for (let i = 0; i < 10; i++) {
        const influencer = await prisma.influencer.create({
            data: {
                channelName: faker.internet.userName(),
                category: faker.helpers.arrayElement(['Technology', 'Fashion', 'Gaming', 'Lifestyle', 'Food']),
                trackingUrl: faker.internet.url(),
            },
        })

        // Create 1-3 deals for each influencer
        const dealCount = faker.number.int({ min: 1, max: 3 })
        for (let j = 0; j < dealCount; j++) {
            const deal = await prisma.deal.create({
                data: {
                    influencerId: influencer.id,
                    contractedBy: faker.helpers.arrayElement(['DIRECT', 'AGENCY']),
                    agencyName: faker.company.name(),
                    pricingType: faker.helpers.arrayElement(['FIXED', 'CPM']),
                    fixedCost: faker.number.int({ min: 1000, max: 10000 }),
                    cpm: faker.number.int({ min: 5, max: 50 }),
                    priceCeiling: faker.number.int({ min: 10000, max: 50000 }),
                    viewGuarantee: faker.number.int({ min: 10000, max: 1000000 }),
                    viewGuaranteeDays: faker.number.int({ min: 7, max: 30 }),
                    postDate: faker.date.future(),
                },
            })

            // Create 1-5 videos for each deal
            const videoCount = faker.number.int({ min: 1, max: 5 })
            for (let k = 0; k < videoCount; k++) {
                await prisma.video.create({
                    data: {
                        dealId: deal.id,
                        influencerId: influencer.id,
                        youtubeId: faker.string.alphanumeric(11),
                        title: faker.lorem.sentence(),
                        views: faker.number.int({ min: 1000, max: 1000000 }),
                        likes: faker.number.int({ min: 100, max: 100000 }),
                        comments: faker.number.int({ min: 10, max: 10000 }),
                        postDate: faker.date.recent(),
                    },
                })
            }
        }
    }

    console.log('Seed data inserted successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })