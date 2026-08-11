import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';
import { connectDB } from '../src/config/database';

/**
 * Vercel serverless giriş noktası.
 *
 * vercel.json bütün yolları buraya yönlendiriyor; Vercel yeniden yazmalarda
 * özgün yolu `req.url` içinde koruduğu için Express kendi yönlendiricisini
 * normal şekilde çalıştırabiliyor.
 *
 * Bağlantı her istekte bekleniyor ama gerçekte yalnızca soğuk başlatmada
 * kuruluyor — sonrası önbellekten dönüyor (bkz. config/database.ts).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    res.status(503).json({
      error: 'Database unavailable',
    });
    return;
  }

  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
