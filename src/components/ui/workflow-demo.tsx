import { N8nWorkflowBlock } from "@/components/ui/n8n-workflow-block-shadcnui";

export default function WorkflowDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-5xl">
        <N8nWorkflowBlock />
      </div>
    </div>
  );
}

export { WorkflowDemo as Demo };
