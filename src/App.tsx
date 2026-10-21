import { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { RecoveryScreen } from './components/RecoveryScreen';
import { HomeScreen } from './components/HomeScreen';
import { CasinosScreen } from './components/CasinosScreen';
import { ChatScreen } from './components/ChatScreen';
import { GameScreen } from './components/GameScreen';
import { ProfileScreen, UserProfileData } from './components/ProfileScreen';
import { BottomNav, NavTab } from './components/BottomNav';

type Screen = 'login' | 'register' | 'recovery' | 'home' | 'casinos' | 'chat' | 'game' | 'profile';

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
  const [selectedGame, setSelectedGame] = useState<{ url: string; name: string }>({
    url: 'https://ganamosbet.org/',
    name: 'GanamosBet',
  });
  const [previousScreenBeforeGame, setPreviousScreenBeforeGame] = useState<'home' | 'casinos'>('home');

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
    setSelectedGame({ url: 'https://ganamosbet.org/', name: 'GanamosBet' });
    setPreviousScreenBeforeGame('home');
    setCurrentScreen('game');
  };

  const handleSelectPlatform = (url: string, name: string) => {
    setSelectedGame({ url, name });
    setPreviousScreenBeforeGame('casinos');
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

  const handleBackFromGame = () => {
    setCurrentScreen(previousScreenBeforeGame);
  };

  const handleBottomNav = (tab: NavTab) => {
    if (tab === 'chat') {
      handleOpenChat();
    } else {
      setCurrentScreen(tab);
    }
  };

  return (
    <MobileFrame>
      <div
        key={currentScreen}
        className="animate-screen-fade relative flex flex-col h-full w-full overflow-hidden"
      >
        {/* Screen 1: Login */}
        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
            onNavigateToRecovery={() => setCurrentScreen('recovery')}
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

        {/* Screen 1c: Recuperación de usuario o contraseña */}
        {currentScreen === 'recovery' && (
          <RecoveryScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
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
              onNavigate={handleBottomNav}
              unreadCount={unreadMessages}
            />
          </div>
        )}

        {/* Screen 2b: Casinos */}
        {currentScreen === 'casinos' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden">
              <CasinosScreen onSelectPlatform={handleSelectPlatform} />
            </div>
            <BottomNav
              currentScreen="casinos"
              onNavigate={handleBottomNav}
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
              onNavigate={handleBottomNav}
              unreadCount={0}
            />
          </div>
        )}

        {/* Screen 4: Juego / Plataforma Seleccionada */}
        {currentScreen === 'game' && (
          <GameScreen
            onBackToHome={handleBackFromGame}
            gameUrl={selectedGame.url}
            gameTitle={selectedGame.name}
          />
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
              onNavigate={handleBottomNav}
              unreadCount={unreadMessages}
            />
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
