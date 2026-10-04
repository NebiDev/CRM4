import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

if (
    !env.AWS_REGION ||
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.S3_BUCKET_NAME
) {
    // Fail loudly at boot — S3 routes would silently break otherwise.
    throw new Error(
        "S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME.",
    );
}

export const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export const S3_BUCKET = env.S3_BUCKET_NAME;