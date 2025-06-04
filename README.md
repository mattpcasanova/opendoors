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
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
```