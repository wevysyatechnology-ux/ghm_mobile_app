# WeVysya Mobile App

A comprehensive business networking platform built with React Native and Expo.

## 🚀 Features

- **AI Assistant** - Voice-enabled AI assistant for business queries
- **Push Notifications** - Real-time notifications for deals, links, and meetings
- **Business Links** - Share verified business contacts with house members
- **Deals Tracking** - Record and track business deals
- **I2WE Meetings** - Schedule 1-on-1 meetings with members
- **Voice OS Integration** - Voice commands and transcription
- **Knowledge Base** - AI-powered business knowledge search

## 📱 Tech Stack

- **Frontend**: React Native, Expo Router
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **AI**: OpenAI GPT-4, Embeddings
- **Notifications**: Expo Push Notifications
- **Authentication**: Supabase Auth

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- EAS CLI (for builds)
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Install EAS CLI globally
npm install -g eas-cli

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

```bash
# Apply migrations
npx supabase db push

# Deploy edge functions
npx supabase functions deploy send-notification
npx supabase functions deploy classify-intent
npx supabase functions deploy transcribe
npx supabase functions deploy embeddings
```

## 🏃 Running the App

### Development

```bash
# Start Expo dev server
npm run dev

# Run on iOS simulator
npm run dev -- --ios

# Run on Android emulator
npm run dev -- --android

# Run on web
npm run dev -- --web
```

### Building with EAS

```bash
# Build for Android (APK)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview

# Production builds
eas build --platform all --profile production
```

## 📂 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── *-form.tsx         # Form screens (deals, links, i2we)
├── components/            # Reusable components
│   ├── activity/
│   ├── ai/
│   ├── channels/
│   ├── discover/
│   ├── profile/
│   └── shared/
├── contexts/              # React contexts (Auth, AI)
├── hooks/                 # Custom React hooks
├── services/              # Business logic & API services
├── supabase/
│   ├── functions/         # Edge functions
│   └── migrations/        # Database migrations
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔔 Push Notifications

Push notifications are configured for:
- Business links received
- Deals recorded
- I2WE meetings scheduled
- Meeting reminders
- AI match suggestions

**Note**: Push notifications only work on physical iOS/Android devices, not on web or simulators.

## 📚 Documentation

- [Push Notifications Setup](PUSH_NOTIFICATIONS_SETUP.md)
- [Voice OS Integration](VOICE_OS_COMPLETE_GUIDE.md)
- [Database Setup](DATABASE_SETUP.md)
- [Backend Setup](BACKEND_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

WeVysya Development Team

---

**Note**: This is a production application. Handle credentials and API keys securely.
