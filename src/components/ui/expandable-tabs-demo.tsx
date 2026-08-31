import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs, type TabItem } from "@/components/ui/expandable-tabs";

export function DefaultDemo() {
  const tabs: TabItem[] = [
    { title: "Dashboard", icon: Home },
    { title: "Notifications", icon: Bell },
    { type: "separator" },
    { title: "Settings", icon: Settings },
    { title: "Support", icon: HelpCircle },
    { title: "Security", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

export function CustomColorDemo() {
  const tabs: TabItem[] = [
    { title: "Profile", icon: User },
    { title: "Messages", icon: Mail },
    { type: "separator" },
    { title: "Documents", icon: FileText },
    { title: "Privacy", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-emerald-700"
        activeBgColor="bg-emerald-50"
        className="border-emerald-200" 
      />
    </div>
  );
}

export default function ExpandableTabsDemo() {
  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">Default Variant</h3>
        <DefaultDemo />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">Custom Color Variant</h3>
        <CustomColorDemo />
      </div>
    </div>
  );
}
