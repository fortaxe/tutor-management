import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import type { Express } from 'express';
import multer from 'multer';

const r2 = new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export const uploadToR2 = async (file: Express.Multer.File, folder: string = 'members'): Promise<string> => {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await r2.send(command);

    return `${process.env.R2_PUBLIC_BASE_URL}/${fileName}`;
};
