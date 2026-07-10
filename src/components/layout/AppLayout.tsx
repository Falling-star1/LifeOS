import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import MobileDrawer from './MobileDrawer';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BackgroundPicker, { BackgroundOption, loadBackground, saveBackground } from '@/components/BackgroundPicker';

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [background, setBackground] = useState<BackgroundOption | null>(loadBackground);

  useEffect(() => { saveBackground(background); }, [background]);

  const overlay = background?.overlay ?? 0.6;
  const isCustomImage = background?.type === 'custom';
  const isGradient = background?.type === 'preset' && background.value.startsWith('linear');

  return (
    <div className="relative flex h-[100dvh] text-gray-900 dark:text-gray-100">
      {/* 背景图层 */}
      {background && (
        <>
          {isCustomImage ? (
            <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
              style={{ backgroundImage: `url(${background.value})` }} />
          ) : isGradient ? (
            <div className="fixed inset-0 z-0 transition-all duration-700"
              style={{ background: background.value }} />
          ) : null}
          <div className="fixed inset-0 z-0 transition-all duration-700"
            style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
        </>
      )}

      {/* 主容器 */}
      <div className="relative z-10 flex h-full w-full">
        {!isMobile && <Sidebar onBgClick={() => setBgOpen(true)} />}
        {isMobile && <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onBgClick={() => setBgOpen(true)} />}

        <div className="flex flex-1 flex-col overflow-hidden">
          {isMobile && (
            <header className="flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-gray-800/60 dark:bg-gray-900/80"
              style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
            >
              <button
                aria-label="打开导航"
                onClick={() => setDrawerOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-xs font-bold text-white">L</span>
                </div>
                <span className="text-[15px] font-semibold">LifeOS</span>
              </div>
            </header>
          )}

          <main className={`flex-1 overflow-auto ${background ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm' : 'bg-white dark:bg-gray-950'}`}>
            <Outlet />
          </main>

          {isMobile && <BottomTabBar />}
        </div>
      </div>

      {bgOpen && <BackgroundPicker current={background} onSelect={setBackground} onClose={() => setBgOpen(false)} />}
    </div>
  );
}
