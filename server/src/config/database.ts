import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intertek-crm';
    
    await mongoose.connect(uri);
    
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
  }
};
