# OpenDoors

A React Native Expo application implementing the Monty Hall problem as an interactive game with real prizes.

## Features

- Interactive Monty Hall game implementation
- Real prizes and rewards system
- User authentication and profiles
- Game statistics and history
- Push notifications for game updates

## Tech Stack

- React Native with Expo
- TypeScript
- Supabase for backend and authentication
- NativeWind for styling
- React Navigation for routing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/opendoors.git
cd opendoors
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements
│   ├── game/            # Game-specific components
│   └── common/          # Shared components
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── game/           # Game-related screens
│   ├── profile/        # User profile screens
│   └── rewards/        # Prize/rewards screens
├── navigation/          # Navigation configuration
├── services/           # API calls and external services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
└── assets/             # Images, fonts, etc.
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
