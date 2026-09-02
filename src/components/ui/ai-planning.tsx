import React, { useState, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Loader2, 
  Check, 
  Search, 
  FileText, 
  BrainCircuit, 
  AlertTriangle, 
  Code, 
  TerminalSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlanStepStatus = 'pending' | 'active' | 'success' | 'error';

export interface PlanStep {
  id: string;
  title: string;
  subtitle?: string;
  content?: React.ReactNode;
  status: PlanStepStatus;
  icon?: React.ReactNode;
  duration?: string;
  defaultExpanded?: boolean;
  priority?: 'High' | 'Med' | 'Low';
  category?: string;
  expReward?: number;
  onToggle?: () => void;
  onDelete?: () => void;
}

export interface AgentPlanningProps {
  title?: string;
  subtitle?: string;
  steps?: PlanStep[];
  className?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onAddStep?: () => void;
}

export const DEFAULT_PLAN_STEPS: PlanStep[] = [
  {
    id: '1',
    title: 'Analyze request and extract constraints',
    status: 'success',
    duration: '0.4s',
    icon: <Search className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-2 font-mono text-[11px] text-[#71717A] mt-2">
        <div className="flex items-start gap-2 text-[#10B981] font-medium">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Parsed user intent: Build minimalist UI Component</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-1.5 mt-3 bg-[#F9FAFB] p-2.5 rounded-md border border-[#E2E8F0]">
          <span className="text-[#71717A] font-medium">Language:</span>
          <span className="text-[#18181B] font-bold">TypeScript, React</span>
          
          <span className="text-[#71717A] font-medium">Styling:</span>
          <span className="text-[#18181B] font-bold">Tailwind CSS v4 (OKLCH variables)</span>
          
          <span className="text-[#71717A] font-medium">Constraints:</span>
          <span className="text-amber-600 font-bold">Single-file, Interactive, No Overlaps</span>
        </div>
      </div>
    )
  },
  {
    id: '2',
    title: 'Search UI knowledge base',
    status: 'success',
    duration: '1.2s',
    icon: <FileText className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-3 font-mono text-[11px] mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[#71717A]">Executing tool:</span>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold flex items-center gap-1">
            <TerminalSquare className="w-3 h-3" />
            vector_search
          </span>
        </div>
        <div className="p-3 rounded-md bg-white border border-[#E2E8F0] shadow-xs text-[#71717A]">
          <div className="text-[#10B981] mb-2 font-semibold">Success: Retrieved 3 semantic patterns</div>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Claude 3.5 Sonnet thinking block layout</li>
            <li>Tailwind flex-timeline micro-interactions</li>
            <li>React state-driven accordions with smooth max-height</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: '3',
    title: 'Synthesize component logic',
    status: 'active',
    duration: '...',
    icon: <BrainCircuit className="w-3.5 h-3.5" />,
    defaultExpanded: true,
    content: (
      <div className="space-y-3 font-mono text-[11px] mt-2">
        <div className="flex items-center gap-2 text-sky-600 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Generating structured timeline layout...</span>
        </div>
        
        <div className="relative rounded-md overflow-hidden bg-[#18181B] text-white border border-zinc-800 p-3.5 shadow-inner">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-70" />
          <div className="text-zinc-300 space-y-1.5 leading-relaxed">
            <div><span className="text-purple-400">const</span> <span className="text-sky-300">timelineLayout</span> = <span className="text-amber-300">useMemo</span>(...)</div>
            <div className="pl-4 text-zinc-400">- Fixing absolute positioning overlaps</div>
            <div className="pl-4 text-zinc-400">- Applying distinct icon columns</div>
            <div className="pl-4 text-zinc-200 font-medium animate-pulse flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-[#10B981]" />
              Injecting rich content panels |
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: '4',
    title: 'Review dependency conflicts',
    status: 'error',
    duration: '0.8s',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-2 font-mono text-[11px] mt-2 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200">
          <div className="text-[#E11D48] font-bold mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning: Component styling deviation
          </div>
          <div className="text-rose-700 leading-relaxed text-[11px]">
            Previous absolute positioning caused icon overlaps. Sub-agent is resolving layout tree to a strict flex-row grid before continuing execution.
          </div>
        </div>
      </div>
    )
  },
  {
    id: '5',
    title: 'Execute final rendering',
    status: 'pending',
    icon: <Code className="w-3.5 h-3.5" />,
  }
];

export const AgentPlanning: React.FC<AgentPlanningProps> = ({
  title = "Agent is planning",
  subtitle,
  steps = DEFAULT_PLAN_STEPS,
  className,
  isCollapsible = true,
  defaultExpanded = true,
  onAddStep
}) => {
  const [isMainExpanded, setIsMainExpanded] = useState(defaultExpanded);
  
  // Track expanded state of individual step details
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    steps.reduce((acc, step) => {
      acc[step.id] = step.defaultExpanded || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const mainContentRef = useRef<HTMLDivElement>(null);

  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActive = steps.some(s => s.status === 'active');
  const allSuccess = steps.every(s => s.status === 'success');

  const getStatusColor = (status: PlanStepStatus) => {
    switch (status) {
      case 'success': 
        return 'bg-emerald-50 text-[#10B981] ring-[#10B981]/20 border border-[#10B981]/30';
      case 'active': 
        return 'bg-sky-50 text-sky-600 ring-sky-500/20 border border-sky-300 animate-pulse';
      case 'error': 
        return 'bg-rose-50 text-[#E11D48] ring-rose-500/20 border border-rose-300';
      case 'pending': 
        return 'bg-[#F1F5F9] text-[#71717A] ring-[#E2E8F0] border border-[#E2E8F0]';
    }
  };

  return (
    <div className={cn("w-full font-ui text-[#18181B]", className)}>
      {/* Outer Card Container */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs rounded-xl overflow-hidden transition-all duration-300">
        
        {/* Top Header / Trigger Badge */}
        <div 
          onClick={() => isCollapsible && setIsMainExpanded(!isMainExpanded)}
          className={cn(
            "flex items-center justify-between px-4 py-3.5 select-none transition-colors",
            isCollapsible && "cursor-pointer hover:bg-[#F9FAFB]",
            isMainExpanded ? "bg-[#F9FAFB]/70 border-b border-[#E2E8F0]" : ""
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-5 h-5">
              {hasActive ? (
                <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
              ) : allSuccess ? (
                <Check className="w-4 h-4 text-[#10B981]" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-[#71717A]" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[13.5px] font-bold text-[#18181B] tracking-tight font-ui">
                {title}
              </span>
              {subtitle && (
                <span className="text-[11px] text-[#71717A] font-ui">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddStep && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddStep();
                }}
                className="text-[11px] font-bold text-[#18181B] hover:bg-white border border-[#E2E8F0] px-2 py-1 rounded-[6px] transition-all shadow-2xs"
              >
                + Add Step
              </button>
            )}
            {isCollapsible && (
              <div className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-white border border-transparent hover:border-[#E2E8F0] text-[#71717A] transition-colors">
                {isMainExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Main Timeline Area */}
        <div 
          className={cn(
            "grid transition-all duration-400 ease-in-out bg-[#FFFFFF]",
            isMainExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div ref={mainContentRef} className="p-4 sm:p-5 flex flex-col">
              
              {steps.map((step, index) => {
                const isStepExpanded = expandedSteps[step.id];
                const isLast = index === steps.length - 1;
                
                return (
                  <div 
                    key={step.id} 
                    className={cn(
                      "relative flex gap-3.5 transition-all duration-300",
                      step.status === 'pending' ? "opacity-70" : "opacity-100"
                    )}
                  >
                    {/* Timeline connecting line */}
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 bottom-[-8px] w-[2px] bg-[#E2E8F0] z-0" />
                    )}

                    {/* Icon Column / Node Checkbox */}
                    <div className="relative z-10 flex-none w-6 h-6 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          step.onToggle?.();
                        }}
                        className={cn(
                          "flex items-center justify-center w-full h-full rounded-full ring-4 ring-white transition-all duration-200 cursor-pointer",
                          getStatusColor(step.status)
                        )}
                        title={step.status === 'success' ? 'Completed — Click to undo' : 'Click to complete'}
                      >
                        {step.status === 'success' ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : step.status === 'active' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          step.icon || <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 pb-5 min-w-0">
                      {/* Step Header Bar */}
                      <div 
                        className={cn(
                          "flex items-center justify-between group rounded-md -mx-1.5 px-1.5 py-1 transition-colors select-none",
                          step.content ? "cursor-pointer hover:bg-[#F9FAFB]" : ""
                        )}
                        onClick={(e) => step.content && toggleStep(step.id, e)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={cn(
                            "text-[13px] tracking-tight transition-colors duration-150 truncate font-ui",
                            step.status === 'success' ? "line-through text-[#71717A] font-medium" :
                            step.status === 'active' ? "text-[#18181B] font-bold" : 
                            step.status === 'error' ? "text-[#E11D48] font-bold" : 
                            "text-[#18181B] font-medium group-hover:text-black"
                          )}>
                            {step.title}
                          </span>

                          {step.priority && (
                            <span className={cn(
                              "text-[9px] font-bold font-num px-1.5 py-0.5 rounded-[3.5px] uppercase border",
                              step.priority === 'High' ? "bg-rose-50 text-[#E11D48] border-rose-200" :
                              step.priority === 'Med' ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-[#F1F5F9] text-[#71717A] border-[#E2E8F0]"
                            )}>
                              {step.priority}
                            </span>
                          )}

                          {step.category && (
                            <span className="hidden sm:inline text-[9.5px] font-ui px-1.5 py-0.5 rounded-[3.5px] bg-[#F1F5F9] text-[#71717A] border border-[#E2E8F0]">
                              {step.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          {step.expReward && (
                            <span className="text-[10px] font-num font-bold text-[#10B981]">
                              +{step.expReward} XP
                            </span>
                          )}
                          {step.duration && (
                            <span className="text-[10.5px] font-num text-[#71717A] tabular-nums">
                              {step.duration}
                            </span>
                          )}
                          {step.content && (
                            <div className="text-[#A1A1AA] group-hover:text-[#18181B] transition-colors">
                              {isStepExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step Expanded Content */}
                      {step.content && (
                        <div 
                          className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            isStepExpanded ? "grid-rows-[1fr] mt-1.5 opacity-100" : "grid-rows-[0fr] mt-0 opacity-0"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="pt-1 pb-1">
                              {step.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-white border border-[#E2E8F0]")}>
      <h1 className="text-2xl font-bold mb-2">Component Example</h1>
      <h2 className="text-xl font-semibold">{count}</h2>
      <div className="flex gap-2">
        <button onClick={() => setCount((prev) => prev - 1)} className="px-3 py-1 border rounded bg-[#F9FAFB]">-</button>
        <button onClick={() => setCount((prev) => prev + 1)} className="px-3 py-1 border rounded bg-[#18181B] text-white">+</button>
      </div>
    </div>
  );
};

export default AgentPlanning;
