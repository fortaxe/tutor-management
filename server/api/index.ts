import app from '../app';
import { connectDB } from '../connectDB';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let isConnected = false;

const handler = async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only connect if not already connected
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Use the express app as middleware
  return new Promise((resolve, reject) => {
    // @ts-ignore
    app(req, res, (err: any) => {
      if (err) return reject(err);
      resolve(undefined);
    });
  });
};

// ... existing code ...

export default handler;
