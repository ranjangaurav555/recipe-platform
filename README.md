# Recipe Management and Sharing Platform

## Description
A Node.js and Express backend application that allows users to create, browse, search, review, and save recipes. It includes user authentication, collections, social features, and admin management.

## Technologies Used
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Token (JWT)
- HTML, CSS, JavaScript
- Multer for local image uploads

## Features
- User registration and login
- JWT authentication
- Profile management
- Create, update, and delete recipes
- Browse and search recipes
- Filter recipes by category, difficulty, dietary preferences, and cooking time
- Favorites and collections
- Recipe ratings and reviews
- Follow and unfollow users
- Activity feed
- Admin user management: ban and approve users
- Admin recipe management

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file and configure `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
4. Start the server using `node app.js`.
5. Open `http://localhost:3000`.

## API Routes
- `/api/auth` — Authentication and profile
- `/api/recipes` — Recipe management, browsing, and search
- `/api/favorites` — Favorite recipes
- `/api/collections` — Recipe collections
- `/api/reviews` — Ratings and reviews
- `/api/follows` — Follow and unfollow users
- `/api/activity` — Activity feed
- `/api/admin` — Admin user and recipe management

## Image Storage
Recipe images currently use local uploads. AWS S3 integration is not implemented.

## Database
PostgreSQL hosted on Neon.

## Testing
API endpoints are tested using Postman.
