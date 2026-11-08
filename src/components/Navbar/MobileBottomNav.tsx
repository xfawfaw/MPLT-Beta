import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, 
  CalendarCheck2, 
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
    { id: 'today', title: 'Today', icon: LayoutGrid },
    { id: 'system', title: 'System', icon: CalendarCheck2 },
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

  const normalizedTab = useMemo(() => {
    if (currentTab === 'dashboard' || currentTab === 'today') return 'today';
    if (['system', 'habits', 'weekly', 'tasks', 'goals', 'yearly', 'automations'].includes(currentTab)) return 'system';
    if (currentTab === 'finance') return 'finance';
    return 'today';
  }, [currentTab]);

  const selectedIndex = useMemo(() => {
    const idx = tabs.findIndex(t => t.id === normalizedTab);
    return idx >= 0 ? idx : 0;
  }, [tabs, normalizedTab]);

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
