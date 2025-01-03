s4-shadowplay serves to provide a traditional file-management system GUI to Amazon S3.

## Why

This project started on the desire to obtain a form of private storage and seamless sharing of video game clips, commonly known as "shadowplays" or "replays", among friends. Over the years, we've accumulated a ridiculous amount of videos and have discussed methods of archiving them, as viewing them recently have been memorable and nostalgic. By the nature of these files being being around 2 minutes of uncompressed footage, file sizes range from 250 mb to 500 mb, accumulating to hundreds of gigabytes.

Commercial storage solutions like Google Drive and Dropbox seemed good for their built in collaboration of files, but each had their own missing features. **Ideally, we wanted something that contained the ALL of the following:**

- File tagging
- Traditional file structure and file operations
- Support for multiple users
- Role-based file access
- Search and filtering
- Embedded previews in temporary/permanent shareable public links
- Nice UI

Amazon S3 seemed the most unlikely storage solution possible out of any commercial storage service, as it lacked a GUI entirely, but it seemed most appropriate for us, especially for Amazon S3's [data protection](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html) and their method of object storage, requiring just simple HTTP requests to manage all files.

It was just a matter of creating our own interface for all this.

## Features

Everything is in alpha, even before alpha if such a stage existed, but base functionality is here with:
![s4shadowplaypreview](https://github.com/user-attachments/assets/3f6a7284-10a7-45f9-9ca4-16720cee8e12)

- Multi-file uploading and deleting to and from an AWS S3 Bucket
- Individual file uploading progress (needs CSS)
- Light and dark theme
- JWT token-based authentication for accounts
- Creating accounts
- Server-side and middleware authentication for pages and api routes
- ~~decently presentable layout, but still needs work~~

95% of UI components are from [shadcn](https://ui.shadcn.com/), great work from them, makes this project infinitely easier UI wise, especially for mobile view.

## Getting Started

Create `.env.local` in cloned root directory, with these contents:

```text
AWS_ACCESS_KEY_ID="aws key"
AWS_SECRET_ACCESS_KEY="aws secret access key"
AWS_REGION="aws region"
AWS_S3_BUCKET="aws s3 bucket name"
JWT_SECRET="jwt token"
```

AWS related keys and tokens can be generated and retrieved from the [AWS console](https://aws.amazon.com/console/) and generating an access key. JWT secret token can be generated by running:

```bash
openssl rand -base64 64
```

Install packages and run

```bash
npm i && npm run dev
```

Page and API routes will be running on [localhost:3000](http:localhost:3000) by default.

## Todo:

- ~~overhaul css layout~~
- full screen drag and drop
- JWT, add time refresh on interaction instead of set 1 hour times
- include account information in componenets, like account name
- file / directory things
  - folder operations
  - file operations (bulk select, bulk delete, move to folder)
  - shareable file public link
    - expire time (allow infinite...? default 1 hour maybe)
    - allow embed
  - file tagging
- add config file to user customization
  - system
    - upload chunk size (default: 5mb)
    - number of upload chunks (default: 100)
    - max concurrent files uploaded at same time (default: 7)
  - UI
    - colors
    - theming...?
- notification corner popup
  - upload failed (red)
  - upload success (green)
  - miscellaneous that i have no control over (aws being down etc)
  - lost internet connection (locally)

## Future Unlikely Plans

- Add system option of how the file to be uploaded, either in chunks or single file (single file currently implemented).
  - cost risk, as it may be the difference between 1 and 100 PUT requests. See [AWS S3 pricing](https://aws.amazon.com/s3/pricing/).
  - system config options
    - upload chunk size (default: 5mb)
    - number of upload chunks (default: 100)

## Review

This section helps to summarize everything that I have learned from solely this project and will continue to research.

- jwt and jose
  - properties of jwt tokens
  - creating a proper jwt token
  - session token expiration and resetting
- database
  - initializing and connecting database
  - read write to sqlite3 db
  - `user.db` to handle accounts
- nextjs (or frontend related)
  - file structure (pages)
    - certain file and folder names are reserved for nextjs
      - `/api` - files under here are automatically api routes
      - `index.js` - default page to load at root of \*directory
      - `middleware.js` - serverside before any page or route is loaded
      - allows easy authentication for page and api routing based on use
    - folder structure dictates how a page or api route will be structured
  - basic authentication
    - authorization context that can be used to conditionally render components on pages
  - `event.stopPropagation()`
  - `asChild` component property
- file streaming and uploading
  - multiple ways to handle file uploads to S3, most commonly is the method implemented here, where a file travels `frontend -> backend` then `backend -> S3 bucket`
  - multipart chunk uploading
- react usestate
  - array handling
  - adding and removing based on conditions
- miscellaneous - things that i learned and have decided not to implement in return for something else that fits this project's purpose more
  - sse (server sent event) - how information is passed from backend to frontend without strictly having to send response
    - originally used for tracking the original file upload progress from backend to frontend
  - concurrent vs parallelization - originally used to upload chunks of a file instead of sequentially, but introduced complexity in displaying upload progress
    - concurrent - one CPU core used to rapidly switch between tasks
    - parallel - usage of multiple cores for tasks
    - both were a risk to CPU performance and upload speed
- common internet codes
  - 200 - success
  - 304 - page has not changed since last refresh/visit
  - 404 - cannot find page/route
  - 405 - does not support method
  - 500 - internal server error

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
