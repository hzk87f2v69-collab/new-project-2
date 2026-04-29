# Ace Fitness

Ace Fitness is a premium fitness course selling website built with:

- HTML5, CSS3, Vanilla JavaScript
- Node.js and Express.js
- MongoDB with Mongoose
- JWT authentication
- Razorpay test/production payment flow

## Features

- Premium dark landing page with conversion-focused sections
- Programs page with single-track and bundle purchases
- Secure login and registration with bcrypt password hashing
- Protected dashboard with purchased courses, progress, and payment history
- Course player with week-wise modules, embedded videos, notes, and completion tracking
- Contact inquiry form stored in MongoDB
- Razorpay order creation, signature verification, payment persistence, and automatic course unlock

## Project Structure

```text
frontend/
public/
controllers/
middleware/
models/
routes/
utils/
data/
server.js
.env
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `.env` with:

- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CLIENT_URL`

4. Start the app:

```bash
npm run dev
```

5. Open:

```text
http://localhost:5000
```

## Razorpay Notes

- Use Razorpay test keys first.
- The frontend loads Razorpay Checkout from the official script.
- Orders are created on the backend.
- Signatures are verified securely on the backend before unlocking courses.

## Production Deployment Checklist

- Set strong production values in `.env`
- Use a managed MongoDB instance
- Add HTTPS via reverse proxy or hosting provider
- Replace sample support contact details
- Replace sample embedded videos with your licensed/private course videos
- Set `CLIENT_URL` to your live domain
- Keep Razorpay in test mode until final QA passes
