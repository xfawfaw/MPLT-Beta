import React, { useState, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { flushSync } from 'react-dom';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Flame, 
  CalendarCheck2, 
  Wallet, 
  ShieldAlert, 
  Award, 
  Bell, 
  CalendarRange, 
  Plus, 
  ArrowRight,
  Workflow,
  Cpu,
  Activity,
  Lock,
  Unlock,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  title: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number | string }>;
  color: 'emerald' | 'blue' | 'amber' | 'purple' | 'indigo' | 'rose';
  position: { x: number; y: number };
  systemCategory: 'Habits' | 'Tasks' | 'Goals' | 'Finance' | 'Gamification';
}

export interface WorkflowConnection {
  from: string;
  to: string;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 105;

const mpltNodeTemplates: Omit<WorkflowNode, 'id' | 'position'>[] = [
  {
    type: 'trigger',
    title: 'Habit Checked',
    description: 'When any daily habit is marked complete',
    icon: CalendarCheck2,
    color: 'emerald',
    systemCategory: 'Habits',
  },
  {
    type: 'condition',
    title: 'Streak >= 7 Days',
    description: 'Verify if active streak reaches 1 week',
    icon: Flame,
    color: 'amber',
    systemCategory: 'Gamification',
  },
  {
    type: 'action',
    title: 'Grant +150 Bonus EXP',
    description: 'Award multiplier EXP & trigger telemetry',
    icon: Award,
    color: 'emerald',
    systemCategory: 'Gamification',
  },
  {
    type: 'trigger',
    title: 'High Priority Task',
    description: 'When a Priority: High task is logged',
    icon: Zap,
    color: 'blue',
    systemCategory: 'Tasks',
  },
  {
    type: 'action',
    title: 'Auto-Schedule Sprint',
    description: 'Insert automatically into Monday queue',
    icon: CalendarRange,
    color: 'indigo',
    systemCategory: 'Tasks',
  },
  {
    type: 'condition',
    title: 'Wants Budget > 30%',
    description: 'Detect when lifestyle spending spikes',
    icon: ShieldAlert,
    color: 'rose',
    systemCategory: 'Finance',
  },
  {
    type: 'action',
    title: 'Spending Lock Alert',
    description: 'Dispatch toast telemetry and alert user',
    icon: Bell,
    color: 'purple',
    systemCategory: 'Finance',
  },
];

const INITIAL_MPLT_NODES: WorkflowNode[] = [
  {
    id: 'node-trigger-habit',
    type: 'trigger',
    title: 'Habit "Morning Run" Done',
    description: 'User logs 5km run in Habit Matrix',
    icon: CalendarCheck2,
    color: 'emerald',
    position: { x: 40, y: 120 },
    systemCategory: 'Habits',
  },
  {
    id: 'node-cond-streak',
    type: 'condition',
    title: 'Verify Streak >= 7 Days',
    description: 'Current player streak is 28 days (True)',
    icon: Flame,
    color: 'amber',
    position: { x: 320, y: 120 },
    systemCategory: 'Gamification',
  },
  {
    id: 'node-act-exp',
    type: 'action',
    title: 'Award 2x EXP Multiplier',
    description: 'Add +150 EXP bonus & Level-Up check',
    icon: Sparkles,
    color: 'emerald',
    position: { x: 600, y: 120 },
    systemCategory: 'Gamification',
  },
  {
    id: 'node-trigger-tx',
    type: 'trigger',
    title: 'Wants Expense Logged',
    description: 'New discretionary purchase recorded',
    icon: Wallet,
    color: 'blue',
    position: { x: 40, y: 280 },
    systemCategory: 'Finance',
  },
  {
    id: 'node-cond-ratio',
    type: 'condition',
    title: 'Wants Ratio Exceeds 30%',
    description: 'Budget safety threshold verification',
    icon: ShieldAlert,
    color: 'rose',
    position: { x: 320, y: 280 },
    systemCategory: 'Finance',
  },
  {
    id: 'node-act-alert',
    type: 'action',
    title: 'Trigger Burn Rate Alert',
    description: 'Display warning banner in Dashboard',
    icon: Bell,
    color: 'purple',
    position: { x: 600, y: 280 },
    systemCategory: 'Finance',
  },
];

const INITIAL_MPLT_CONNECTIONS: WorkflowConnection[] = [
  { from: 'node-trigger-habit', to: 'node-cond-streak' },
  { from: 'node-cond-streak', to: 'node-act-exp' },
  { from: 'node-trigger-tx', to: 'node-cond-ratio' },
  { from: 'node-cond-ratio', to: 'node-act-alert' },
];

const colorStyles: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    bg: 'bg-emerald-50/50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  blue: {
    border: 'border-blue-500/30 hover:border-blue-500/60',
    bg: 'bg-blue-50/50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    bg: 'bg-amber-50/50',
    text: 'text-amber-700',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    bg: 'bg-purple-50/50',
    text: 'text-purple-700',
    iconBg: 'bg-purple-500/10 text-purple-600',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    bg: 'bg-indigo-50/50',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-500/60',
    bg: 'bg-rose-50/50',
    text: 'text-rose-700',
    iconBg: 'bg-rose-500/10 text-rose-600',
  },
};

function ConnectionLine({
  from,
  to,
  nodes,
}: {
  from: string;
  to: string;
  nodes: WorkflowNode[];
}) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode = nodes.find((n) => n.id === to);
  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + NODE_WIDTH;
  const startY = fromNode.position.y + NODE_HEIGHT / 2;
  const endX = toNode.position.x;
  const endY = toNode.position.y + NODE_HEIGHT / 2;

  const cp1X = startX + (endX - startX) * 0.5;
  const cp2X = endX - (endX - startX) * 0.5;

  const path = `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`;

  return (
    <g>
      {/* Outer subtle halo */}
      <path
        d={path}
        fill="none"
        stroke="#18181B"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.08}
      />
      {/* Flowing animated dash line */}
      <path
        d={path}
        fill="none"
        stroke="#18181B"
        strokeWidth={2}
        strokeDasharray="6,4"
        strokeLinecap="round"
        opacity={0.4}
      />
    </g>
  );
}

export const LifeAutomationView: React.FC = () => {
  const { addExp, setCurrentTab } = useApp();
  const [isLocked, setIsLocked] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_MPLT_NODES);
  const [connections, setConnections] = useState<WorkflowConnection[]>(INITIAL_MPLT_CONNECTIONS);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activePreset, setActivePreset] = useState<'custom' | 'gamification' | 'finance'>('custom');

  const [contentSize, setContentSize] = useState(() => {
    const maxX = Math.max(...INITIAL_MPLT_NODES.map((n) => n.position.x + NODE_WIDTH));
    const maxY = Math.max(...INITIAL_MPLT_NODES.map((n) => n.position.y + NODE_HEIGHT));
    return { width: maxX + 100, height: maxY + 100 };
  });

  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      dragStartPosition.current = { x: node.position.x, y: node.position.y };
      sound.playClick();
    }
  };

  const handleDrag = (nodeId: string, { offset }: PanInfo) => {
    if (draggingNodeId !== nodeId || !dragStartPosition.current) return;

    const newX = dragStartPosition.current.x + offset.x;
    const newY = dragStartPosition.current.y + offset.y;

    const constrainedX = Math.max(20, newX);
    const constrainedY = Math.max(20, newY);

    flushSync(() => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, position: { x: constrainedX, y: constrainedY } }
            : node
        )
      );
    });

    setContentSize((prev) => ({
      width: Math.max(prev.width, constrainedX + NODE_WIDTH + 100),
      height: Math.max(prev.height, constrainedY + NODE_HEIGHT + 100),
    }));
  };

  const handleDragEnd = () => {
    setDraggingNodeId(null);
    dragStartPosition.current = null;
    sound.playPop();
  };

  const addRandomNode = () => {
    const template = mpltNodeTemplates[Math.floor(Math.random() * mpltNodeTemplates.length)];
    const lastNode = nodes[nodes.length - 1];
    const newPosition = lastNode
      ? { x: lastNode.position.x + 260, y: lastNode.position.y }
      : { x: 50, y: 120 };

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      ...template,
      position: newPosition,
    };

    flushSync(() => {
      setNodes((prev) => [...prev, newNode]);
      if (lastNode) {
        setConnections((prev) => [...prev, { from: lastNode.id, to: newNode.id }]);
      }
    });

    setContentSize((prev) => ({
      width: Math.max(prev.width, newPosition.x + NODE_WIDTH + 100),
      height: Math.max(prev.height, newPosition.y + NODE_HEIGHT + 100),
    }));

    sound.playPop();

    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        left: newPosition.x + NODE_WIDTH - canvasRef.current.clientWidth + 150,
        behavior: 'smooth',
      });
    }
  };

  const handleRunPipelineSimulation = () => {
    setIsExecuting(true);
    sound.playLevelUp();
    addExp(100, 'Automated Life Pipeline Simulation Executed');

    setTimeout(() => {
      setIsExecuting(false);
    }, 1800);
  };

  const handleResetLayout = () => {
    setNodes(INITIAL_MPLT_NODES);
    setConnections(INITIAL_MPLT_CONNECTIONS);
    sound.playClick();
  };

  if (isLocked) {
    return (
      <div className="max-w-[1440px] mx-auto p-6 space-y-6">
        <div className="mplt-card p-8 bg-white border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center text-center max-w-xl mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#18181B] text-white flex items-center justify-center mb-4 shadow-sm">
            <Lock size={24} className="text-[#10B981]" />
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#71717A] font-ui">
              BETA v0.1 • FEATURE LOCKED
            </span>
          </div>

          <h2 className="text-[20px] font-bold text-[#18181B] font-ui tracking-tight mb-2">
            Life Automation Pipelines is Locked
          </h2>

          <p className="text-[12.5px] text-[#71717A] font-ui max-w-md leading-relaxed mb-6">
            During Beta v0.1, we are prioritizing core MVP stability across Habit Matrix, Weekly Sprints, Tasks, Strategic Goals, and 50/30/20 Budgeting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => {
                setCurrentTab('dashboard');
                sound.playClick();
              }}
              className="h-9 px-4 bg-[#18181B] text-white text-[12px] font-ui font-medium rounded-lg hover:bg-zinc-800 gap-1.5"
            >
              <ArrowLeft size={13} />
              Return to Master Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsLocked(false);
                sound.playPop();
              }}
              className="h-9 px-4 border-[#E2E8F0] text-[12px] font-ui text-[#71717A] hover:text-[#18181B] rounded-lg gap-1.5"
            >
              <Unlock size={13} />
              Preview Sandbox (Dev Mode)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* Header Banner */}
      <section className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[8px] bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Workflow size={20} className="text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-ui uppercase tracking-widest text-[#71717A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Logic Engine</span>
              <span>•</span>
              <span className="text-[#10B981] font-semibold">Reactive Rules & Triggers</span>
            </div>
            <h1 className="text-[17px] font-bold font-ui text-[#18181B] mt-0.5 tracking-tight">
              Life Automation Pipelines (Flow Graph)
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            className="h-8.5 text-[11px] font-ui gap-1.5 border-[#E2E8F0] hover:bg-[#F4F4F5] text-[#18181B]"
          >
            <RotateCcw size={12} />
            Reset Graph
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={addRandomNode}
            className="h-8.5 text-[11px] font-ui gap-1.5 border-[#E2E8F0] hover:bg-[#F4F4F5] text-[#18181B]"
          >
            <Plus size={13} />
            Add Rule Node
          </Button>

          <Button
            size="sm"
            disabled={isExecuting}
            onClick={handleRunPipelineSimulation}
            className="h-8.5 text-[11px] font-ui font-bold gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white shadow-xs"
          >
            <Play size={12} className={isExecuting ? 'animate-spin' : 'fill-white'} />
            {isExecuting ? 'Simulating Pipeline...' : 'Test Run Pipeline (+100 EXP)'}
          </Button>
        </div>
      </section>

      {/* Preset Strategy Tabs */}
      <div className="flex items-center justify-between gap-3 text-[11.5px] font-ui">
        <ExpandableTabs
          size="sm"
          tabs={[
            { id: 'custom', title: 'Active Life Pipeline', icon: Cpu },
            { id: 'gamification', title: 'EXP & Streak Boosters', icon: Sparkles },
            { id: 'finance', title: 'Budget Guardrails', icon: ShieldAlert },
          ]}
          selectedIndex={
            activePreset === 'custom' ? 0 : activePreset === 'gamification' ? 1 : 2
          }
          activeBgColor="bg-[#18181B]"
          activeColor="text-white"
          className="bg-white border-[#E2E8F0] rounded-[8px]"
          onChange={(idx) => {
            sound.playClick();
            if (idx === 0) {
              setActivePreset('custom');
            } else if (idx === 1) {
              setActivePreset('gamification');
              setNodes(INITIAL_MPLT_NODES.slice(0, 3));
              setConnections(INITIAL_MPLT_CONNECTIONS.slice(0, 2));
            } else if (idx === 2) {
              setActivePreset('finance');
              setNodes(INITIAL_MPLT_NODES.slice(3, 6));
              setConnections(INITIAL_MPLT_CONNECTIONS.slice(2, 4));
            }
          }}
        />

        <div className="hidden sm:flex items-center gap-3 text-[#71717A] font-num text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Reactive State Active
          </span>
        </div>
      </div>

      {/* Interactive Workflow Canvas */}
      <section className="mplt-card p-3 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
        
        {/* Canvas Toolbar & State */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#E2E8F0] mb-2 text-[11px]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-[4px] border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] font-num text-[10px] font-bold">
              60 FPS DRAGGABLE
            </Badge>
            <span className="text-[#71717A] font-ui">
              Drag nodes freely to rearrange execution topology
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#71717A] font-num text-[10.5px]">
            <span>{nodes.length} Nodes</span>
            <span>•</span>
            <span>{connections.length} Links</span>
          </div>
        </div>

        {/* Scrollable & Draggable Canvas Region */}
        <div
          ref={canvasRef}
          className="relative h-[460px] sm:h-[540px] w-full overflow-auto rounded-xl border border-[#E2E8F0] bg-[#F9FAFB] cursor-crosshair select-none"
          role="region"
          aria-label="Interactive Life Pipeline Canvas"
          tabIndex={0}
        >
          {/* Subtle Grid Background Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Dynamic Content Boundaries */}
          <div
            className="relative"
            style={{
              minWidth: contentSize.width,
              minHeight: contentSize.height,
            }}
          >
            {/* SVG Bezier Connection Curves */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={contentSize.width}
              height={contentSize.height}
              style={{ overflow: 'visible' }}
              aria-hidden="true"
            >
              {connections.map((c) => (
                <ConnectionLine
                  key={`${c.from}-${c.to}`}
                  from={c.from}
                  to={c.to}
                  nodes={nodes}
                />
              ))}
            </svg>

            {/* Draggable Rule Nodes */}
            {nodes.map((node) => {
              const Icon = node.icon;
              const isDragging = draggingNodeId === node.id;
              const style = colorStyles[node.color] || colorStyles.blue;

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  dragConstraints={{
                    left: 20,
                    top: 20,
                    right: 4000,
                    bottom: 4000,
                  }}
                  onDragStart={() => handleDragStart(node.id)}
                  onDrag={(_, info) => handleDrag(node.id, info)}
                  onDragEnd={handleDragEnd}
                  style={{
                    x: node.position.x,
                    y: node.position.y,
                    width: NODE_WIDTH,
                    transformOrigin: '0 0',
                  }}
                  className="absolute cursor-grab active:cursor-grabbing z-10"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.16 }}
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                >
                  <Card
                    className={`group/node relative w-full overflow-hidden rounded-[10px] border bg-white p-3 shadow-xs transition-all ${
                      style.border
                    } ${isDragging ? 'shadow-xl ring-2 ring-[#18181B]' : 'hover:shadow-md'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Node Icon Box */}
                      <div
                        className={`w-7 h-7 shrink-0 rounded-[6px] flex items-center justify-center ${style.iconBg}`}
                      >
                        <Icon size={14} />
                      </div>

                      {/* Content Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider font-ui ${style.text}`}>
                            {node.type}
                          </span>
                          <span className="text-[8px] font-num text-[#71717A] bg-[#F1F5F9] px-1 py-0.2 rounded">
                            {node.systemCategory}
                          </span>
                        </div>
                        <h4 className="truncate text-[11.5px] font-bold leading-tight text-[#18181B] font-ui">
                          {node.title}
                        </h4>
                        <p className="line-clamp-2 text-[9.5px] text-[#71717A] mt-0.5 leading-snug">
                          {node.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-[#F1F5F9] pt-1.5 text-[9px] text-[#71717A] font-ui">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        Active Link
                      </span>
                      <ArrowRight size={10} className="text-[#A1A1AA] group-hover/node:text-[#18181B] transition-colors" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer Metrics & Instructions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] text-[10.5px] text-[#71717A] font-ui">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#18181B] font-medium">
              <Activity size={12} className="text-[#10B981]" />
              Event Engine: Running
            </span>
            <span>•</span>
            <span>Optimistic Updates Enabled</span>
          </div>

          <div className="font-num text-[#71717A]">
            Hold & drag any card to orchestrate custom rule chains
          </div>
        </div>
      </section>
    </div>
  );
};
