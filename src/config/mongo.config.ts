import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nestdb',
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));
