import app from './app.js';
import { initBucketCors } from './libs/s3/index.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on PORT: ${PORT}`);
  await initBucketCors();
});
