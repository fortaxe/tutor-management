
import 'dotenv/config';
import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const run = async () => {
    console.log('Testing R2 Connection...');
    console.log('Endpoint:', process.env.R2_S3_ENDPOINT);
    console.log('Bucket:', process.env.R2_BUCKET);
    console.log('Access Key ID:', process.env.R2_ACCESS_KEY_ID ? '***' : 'Missing');

    const r2 = new S3Client({
        region: process.env.R2_REGION || 'auto',
        endpoint: process.env.R2_S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    const testFileName = `members/test-upload-${crypto.randomUUID()}.txt`;

    try {
        console.log(`Attempting to upload ${testFileName}...`);
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: testFileName,
            Body: 'This is a test file from the Gym Stack server debug script.',
            ContentType: 'text/plain',
        });

        await r2.send(command);
        console.log('Upload successful!');
        console.log(`URL: ${process.env.R2_PUBLIC_BASE_URL}/${testFileName}`);

        console.log('Listing objects in bucket (prefix: members/)...');
        const listCmd = new ListObjectsCommand({
            Bucket: process.env.R2_BUCKET,
            Prefix: 'members/',
            MaxKeys: 20
        });
        const res = await r2.send(listCmd);
        console.log('Objects found in members/:', res.Contents?.length || 0);
        res.Contents?.forEach(c => console.log(` - ${c.Key} (${c.Size} bytes)`));

    } catch (error) {
        console.error('Error:', error);
    }
};

run();
