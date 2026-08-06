import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// Ortam değişkeni her zaman string gelir, ama @types/jsonwebtoken bunu
// number | StringValue olarak daraltıyor - o yüzden tipi açıkça veriyoruz.
const JWT_EXPIRE = (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
