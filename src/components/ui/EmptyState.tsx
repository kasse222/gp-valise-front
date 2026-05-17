import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%)" }}
      >
        <Icon className="w-10 h-10" style={{ color: "#1B3A6B" }} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
