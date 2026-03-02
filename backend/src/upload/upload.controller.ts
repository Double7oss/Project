import {
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const imageStorage = diskStorage({
    destination: join(process.cwd(), 'uploads', 'images'),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
});

const documentStorage = diskStorage({
    destination: join(process.cwd(), 'uploads', 'documents'),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
});

@Controller('upload')
export class UploadController {
    constructor() { }

    // POST /api/upload/image
    @UseGuards(JwtAuthGuard)
    @Post('image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: imageStorage,
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new Error('Only image files are allowed'), false);
                }
                cb(null, true);
            },
        }),
    )
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        const url = `/uploads/images/${file.filename}`;
        return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
    }

    // POST /api/upload/document
    @UseGuards(JwtAuthGuard)
    @Post('document')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: documentStorage,
            limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(pdf|jpg|jpeg|png|gif)$/)) {
                    return cb(new Error('Only PDF and image files are allowed'), false);
                }
                cb(null, true);
            },
        }),
    )
    uploadDocument(@UploadedFile() file: Express.Multer.File) {
        const url = `/uploads/documents/${file.filename}`;
        return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
    }
}
