import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.cities.findMany({
            orderBy: { name_fr: 'asc' },
            select: {
                id: true,
                name_fr: true,
                name_ar: true,
                region: true,
                latitude: true,
                longitude: true,
            },
        });
    }

    findOne(id: number) {
        return this.prisma.cities.findUnique({
            where: { id },
        });
    }
}
