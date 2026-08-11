import mongoose from 'mongoose';

/**
 * Bağlantı, modül kapsamında değil global'de tutuluyor.
 *
 * Serverless'ta tek bir lambda örneği arka arkaya birçok isteğe bakar ve
 * modüller bu ömür boyunca yeniden değerlendirilebilir. Bağlantıyı global'e
 * asmazsak her istek yeni bir bağlantı açar ve Atlas'ın ücretsiz katmanındaki
 * bağlantı limiti kısa sürede dolar.
 *
 * Söz (promise) de önbellekleniyor: aynı anda gelen iki istek tek bir
 * bağlantıyı bekler, iki ayrı bağlantı açmaz.
 */
type ConnectionCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = global as unknown as { _mongooseCache?: ConnectionCache };

const cache: ConnectionCache =
  globalForMongoose._mongooseCache ?? { conn: null, promise: null };

globalForMongoose._mongooseCache = cache;

export const connectDB = async () => {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intertek-crm';

    cache.promise = mongoose.connect(uri, {
      // Bağlı değilken sorguları tamponlamak yerine hemen hata ver. Tamponlama
      // serverless'ta isteği 10 saniye askıda tutup öyle patlatıyor; erken ve
      // okunur bir hata daha iyi.
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Başarısız sözü tutma, yoksa örnek ısındığı sürece her istek aynı
    // hatayı yeniden görür ve bir daha asla denenmez.
    cache.promise = null;
    throw error;
  }

  console.log('✅ MongoDB connected');
  return cache.conn;
};

export const disconnectDB = async () => {
  if (!cache.conn) return;
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
  console.log('✅ MongoDB disconnected');
};
