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

    console.log(`Uploading to R2: ${fileName}, Size: ${file.size} bytes, Mime: ${file.mimetype}`);

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await r2.send(command);
        console.log('R2 Upload completed successfully');
    } catch (err) {
        console.error('R2 Upload failed:', err);
        throw err;
    }

    return `${process.env.R2_PUBLIC_BASE_URL}/${fileName}`;
};

export const uploadBufferToR2 = async (buffer: Buffer, fileName: string, contentType: string): Promise<string> => {
    console.log(`Uploading to R2: ${fileName}, Size: ${buffer.length} bytes, Mime: ${contentType}`);

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
    });

    try {
        await r2.send(command);
        console.log('R2 Upload completed successfully');
    } catch (err) {
        console.error('R2 Upload failed:', err);
        throw err;
    }

    return `${process.env.R2_PUBLIC_BASE_URL}/${fileName}`;
};
