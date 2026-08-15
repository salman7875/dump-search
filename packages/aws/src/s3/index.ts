import s3Client from "./modules/s3-client.js";
import { initBucketCors } from "./modules/bucket.js";
import { createObjectCommand, getObjectCommand } from "./modules/object.js";
import { generateSignedUrl } from "./modules/signed-url.js";

export { initBucketCors };
export { createObjectCommand, getObjectCommand };
export { generateSignedUrl };

export default s3Client;
