# Server for FullStackReactApp

This is a simple Express server for the FullStackReactApp project.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Run in production mode:
   ```
   npm start
   ```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/test` - Test endpoint
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create a new item

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_COOKIE_EXPIRE=30
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
