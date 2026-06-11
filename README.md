# Smart Clinic Appointment

Minimal NestJS + MongoDB + HBS clinic appointment app.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies with `npm install`
4. Run development server with `npm run start:dev`

## Main routes

- `/` home
- `/auth/register`
- `/auth/login`
- `/auth/logout`
- `/auth/activate/:token`
- `/dashboard`
- `/doctors`
- `/appointments/new`
- `/appointments/my`
- `/profile`
- `/admin/users`
- `/admin/departments`
- `/admin/doctors`
- `/admin/appointments`
- `/doctor/schedule`
- `/doctor/appointments`

