"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface Tab {
  id?: string;
  title: string;
  icon: LucideIcon;
  type?: never;
  badge?: string | number;
  iconClassName?: string;
  onClick?: () => void;
}

export interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  id?: never;
  badge?: never;
  iconClassName?: never;
  onClick?: never;
}

export type TabItem = Tab | Separator;

export interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  activeBgColor?: string;
  selectedIndex?: number | null;
  defaultIndex?: number | null;
  allowDeselect?: boolean;
  allowToggle?: boolean;
  size?: "sm" | "default" | "lg";
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: (custom: { isSelected: boolean; size: "sm" | "default" | "lg" }) => {
    const isSm = custom.size === "sm";
    const isLg = custom.size === "lg";
    const pad = isSm ? ".4rem" : isLg ? ".6rem" : ".5rem";
    return {
      gap: 0,
      paddingLeft: pad,
      paddingRight: pad,
    };
  },
  animate: (custom: { isSelected: boolean; size: "sm" | "default" | "lg" }) => {
    const isSm = custom.size === "sm";
    const isLg = custom.size === "lg";
    const inactivePad = isSm ? ".4rem" : isLg ? ".6rem" : ".5rem";
    const activePad = isSm ? ".65rem" : isLg ? "1rem" : ".85rem";
    const activeGap = isSm ? ".35rem" : isLg ? ".6rem" : ".5rem";
    return {
      gap: custom.isSelected ? activeGap : 0,
      paddingLeft: custom.isSelected ? activePad : inactivePad,
      paddingRight: custom.isSelected ? activePad : inactivePad,
    };
  },
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring" as const, bounce: 0, duration: 0.35 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-foreground",
  activeBgColor = "bg-secondary",
  selectedIndex: controlledIndex,
  defaultIndex = null,
  allowDeselect = false,
  allowToggle = false,
  size = "default",
  onChange,
}: ExpandableTabsProps) {
  const [internalSelected, setInternalSelected] = React.useState<number | null>(
    controlledIndex !== undefined ? controlledIndex : defaultIndex
  );

  const isControlled = controlledIndex !== undefined;
  const selected = isControlled ? controlledIndex : internalSelected;

  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLElement>, () => {
    if (allowDeselect) {
      if (!isControlled) {
        setInternalSelected(null);
      }
      onChange?.(null);
    }
  });

  const handleSelect = (index: number) => {
    const tab = tabs[index];
    if (tab && tab.type !== "separator" && tab.onClick) {
      tab.onClick();
    }

    const isCurrent = selected === index;
    const shouldDeselect = (allowToggle || allowDeselect) && isCurrent;
    const nextIndex = shouldDeselect ? null : index;

    if (!isControlled) {
      setInternalSelected(nextIndex);
    }
    onChange?.(nextIndex);
  };

  const Separator = () => (
    <motion.div layout className="mx-1 h-[20px] w-[1px] bg-border/60 flex-shrink-0" aria-hidden="true" />
  );

  const iconSizes = {
    sm: 14,
    default: 16,
    lg: 18,
  };

  const containerPadding = {
    sm: "p-0.5 gap-1 rounded-lg",
    default: "p-1 gap-1.5 rounded-xl",
    lg: "p-1.5 gap-2 rounded-2xl",
  };

  const buttonPadding = {
    sm: "h-7 text-[11px] font-ui rounded-md",
    default: "h-8.5 text-xs font-ui rounded-lg",
    lg: "h-10 text-sm font-ui rounded-xl",
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center border border-border bg-card shadow-2xs select-none",
        containerPadding[size],
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;

        return (
          <motion.button
            key={tab.id || tab.title || index}
            layout
            type="button"
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={{ isSelected, size }}
            onClick={() => handleSelect(index)}
            transition={transition}
            title={tab.title ? `${tab.title}${tab.badge !== undefined ? ` (${tab.badge})` : ''}` : undefined}
            className={cn(
              "relative flex items-center justify-center font-medium transition-colors duration-200 cursor-pointer",
              buttonPadding[size],
              isSelected
                ? cn(activeBgColor, activeColor, "shadow-2xs font-semibold")
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            aria-selected={isSelected}
            role="tab"
          >
            <Icon size={iconSizes[size]} className={cn("flex-shrink-0", tab.iconClassName)} />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap leading-none flex items-center gap-1.5"
                >
                  <span>{tab.title}</span>
                  {tab.badge !== undefined && (
                    <span className="text-[9.5px] font-num px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-current leading-none font-semibold">
                      {tab.badge}
                    </span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
