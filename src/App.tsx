import { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { GameScreen } from './components/GameScreen';
import { ProfileScreen, UserProfileData } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';

type Screen = 'login' | 'register' | 'home' | 'chat' | 'game' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    firstName: 'Eduardo',
    lastName: 'Gómez',
    phone: '+54 9 11 2345-6789',
    username: 'Eduardo',
  });
  const [unreadMessages, setUnreadMessages] = useState(1);
  const [chatTopic, setChatTopic] = useState<'cargar' | 'retirar' | null>(null);

  const handleLoginSuccess = (user: string) => {
    setUserProfile((prev) => ({
      ...prev,
      username: user,
      firstName: prev.username.toLowerCase() === user.toLowerCase() ? prev.firstName : user,
    }));
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const handleOpenPlay = () => {
    setCurrentScreen('game');
  };

  const handleOpenChat = (topic?: 'cargar' | 'retirar') => {
    setChatTopic(topic || null);
    setCurrentScreen('chat');
    setUnreadMessages(0);
  };

  const handleOpenProfile = () => {
    setCurrentScreen('profile');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <MobileFrame>
      <div className="relative flex flex-col h-full w-full overflow-hidden">
        {/* Screen 1: Login */}
        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        )}

        {/* Screen 1b: Registro */}
        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
            onRegisteredDemo={(newProfile) => {
              setUserProfile(newProfile);
            }}
          />
        )}

        {/* Screen 2: Inicio */}
        {currentScreen === 'home' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden">
              <HomeScreen
                username={userProfile.username}
                onPlay={handleOpenPlay}
                onOpenChat={handleOpenChat}
                onLogout={handleLogout}
                onOpenProfile={handleOpenProfile}
              />
            </div>
            <BottomNav
              currentScreen="home"
              onNavigate={(screen) => {
                if (screen === 'chat') handleOpenChat();
              }}
              unreadCount={unreadMessages}
            />
          </div>
        )}

        {/* Screen 3: Chat */}
        {currentScreen === 'chat' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden">
              <ChatScreen
                username={userProfile.username}
                onBackToHome={handleBackToHome}
                initialTopic={chatTopic}
              />
            </div>
            <BottomNav
              currentScreen="chat"
              onNavigate={(screen) => {
                if (screen === 'home') handleBackToHome();
              }}
              unreadCount={0}
            />
          </div>
        )}

        {/* Screen 4: Juego */}
        {currentScreen === 'game' && (
          <GameScreen onBackToHome={handleBackToHome} />
        )}

        {/* Screen 5: Perfil de Usuario */}
        {currentScreen === 'profile' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden">
              <ProfileScreen
                profile={userProfile}
                onBackToHome={handleBackToHome}
                onLogout={handleLogout}
              />
            </div>
            <BottomNav
              currentScreen="home"
              onNavigate={(screen) => {
                if (screen === 'chat') handleOpenChat();
                else handleBackToHome();
              }}
              unreadCount={unreadMessages}
            />
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
