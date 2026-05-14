import { Injectable } from '@nestjs/common';
import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: 'https://s3.cloud.ru',
      credentials: {
        accessKeyId:
          `${process.env.S3_BUCKET}:${process.env.S3_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.S3_SECRET_KEY}`,
      },
      forcePathStyle: true,
    });
  }
  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      return response.Buckets;
    } catch (err) {
      console.error('❌ Ошибка:', err);
    }
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: string | Buffer | Uint8Array | Blob,
  ) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: file,
    });
    const response = await this.s3Client.send(command);
    return `https://global.s3.cloud.ru/${bucket}/${path}`;
  }
}
