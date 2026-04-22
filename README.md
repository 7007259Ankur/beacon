# Beacon 🔦

A modern social media app — share posts, follow people, chat, and get notified in real time.

**Live site → [beacon.netlify.app](https://beaconv.netlify.app/)**

---

## Features

- Google Sign-In
- Create posts with images
- Like, comment & reply, share
- Follow / unfollow users
- Real-time messaging
- Notifications (likes, follows, messages)
- Edit profile & avatar
- Installable as a PWA on Android

## Tech Stack

- React + TypeScript + Vite
- Firebase (Auth + Firestore)
- Cloudinary (image uploads)
- Tailwind CSS + shadcn/ui

## Local Setup

```bash
git clone https://github.com/7007259Ankur/beacon.git
cd beacon
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

### Required env vars

```
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Firebase config is in `firebase-applet-config.json`.
