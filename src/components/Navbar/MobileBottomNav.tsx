import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, 
  CalendarCheck2, 
  CalendarRange, 
  CheckSquare, 
  Wallet, 
  User 
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { ExpandableTabs, TabItem } from '../ui/expandable-tabs';

interface MobileBottomNavProps {
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenProfile }) => {
  const { currentTab, setCurrentTab } = useApp();

  const tabs: TabItem[] = useMemo(() => [
    { id: 'dashboard', title: 'Overview', icon: LayoutGrid },
    { id: 'habits', title: 'Habits', icon: CalendarCheck2 },
    { id: 'weekly', title: 'Sprint', icon: CalendarRange },
    { id: 'tasks', title: 'Tasks', icon: CheckSquare },
    { id: 'finance', title: 'Finance', icon: Wallet },
    { type: 'separator' },
    { 
      id: 'profile', 
      title: 'Profile', 
      icon: User,
      onClick: () => {
        sound.playClick();
        onOpenProfile();
      }
    },
  ], [onOpenProfile]);

  const selectedIndex = useMemo(() => {
    const idx = tabs.findIndex(t => t.id === currentTab);
    return idx >= 0 ? idx : null;
  }, [tabs, currentTab]);

  const handleChange = (index: number | null) => {
    if (index === null) return;
    const tab = tabs[index];
    if (!tab || tab.type === 'separator' || !tab.id) return;

    if (tab.id === 'profile') {
      sound.playClick();
      onOpenProfile();
      return;
    }

    sound.playClick();
    setCurrentTab(tab.id as any);
  };

  return (
    <nav 
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-3 pt-2 select-none flex items-center justify-center"
    >
      <div className="w-full max-w-md flex justify-center">
        <ExpandableTabs
          tabs={tabs}
          selectedIndex={selectedIndex}
          onChange={handleChange}
          activeBgColor="bg-[#18181B]"
          activeColor="text-white"
          className="bg-[#FAFAFA] border-[#E2E8F0] shadow-xs flex-nowrap w-full justify-between"
          size="default"
        />
      </div>
    </nav>
  );
};
