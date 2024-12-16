s4-shadowplay is a personal project to serve as a file storage system utilizing Amazon S3 as the storage component. Primarily initially used to store video game clips, commonly known as "shadowplays" based on Nvidia, but has expanded to serve as cheaper alternative to storage solutions like Google Drive and Dropbox (gigabytes/US dollar).

## Getting Started

Create `.env.local` in cloned root directory, with these contents:

```text
AWS_ACCESS_KEY_ID="aws key"
AWS_SECRET_ACCESS_KEY="aws secret access key"
AWS_REGION="aws region"
AWS_S3_BUCKET="aws s3 bucket name"
JWT_SECRET="jwt token"
```

AWS related keys and tokens can be generated and retrieved from the AWS console and generating an access key. JWT secret token can be generated by running:

```bash
openssl rand -64 64
```

Install packages and run

```bash
npm i && npm run dev
```

Page will be running on [localhost:3000](http:localhost:3000) by default.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
