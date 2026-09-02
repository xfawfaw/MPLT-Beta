import React from 'react';
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

interface MobileBottomNavProps {
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenProfile }) => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'habits', label: 'Habits', icon: CalendarCheck2 },
    { id: 'weekly', label: 'Sprint', icon: CalendarRange },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'finance', label: 'Finance', icon: Wallet },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] px-2 py-1.5 select-none safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setCurrentTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-[8px] transition-all min-w-[54px] ${
                isActive
                  ? 'text-[#18181B] font-bold'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                )}
              </div>
              <span className={`text-[10px] font-ui mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#18181B]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Profile Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-[8px] text-[#71717A] hover:text-[#18181B] transition-all min-w-[54px]"
        >
          <User size={19} className="stroke-[1.8]" />
          <span className="text-[10px] font-ui mt-0.5 font-medium tracking-tight">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
