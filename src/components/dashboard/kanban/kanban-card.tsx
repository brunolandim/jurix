"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Card, CardBody, Tooltip } from "@/components/ui";
import { LegalCase, CasePriority } from "@/types";

const priorityColors: Record<CasePriority, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const priorityBorderColors: Record<CasePriority, string> = {
  low: "border-l-gray-500",
  medium: "border-l-blue-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

const priorityLabels: Record<CasePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

type KanbanCardContentProps = {
  legalCase: LegalCase;
  isDragging?: boolean;
};

export function KanbanCardContent({ legalCase, isDragging }: KanbanCardContentProps) {
  return (
    <Card
      className={`${isDragging ? "opacity-50 shadow-lg scale-105" : "hover:scale-[1.02]"} transition-all border-l-4 ${priorityBorderColors[legalCase.priority]}`}
    >
      <CardBody className="flex flex-col p-3 bg- gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-default-500 font-mono">
            {legalCase.number}
          </span>
          <Tooltip content={priorityLabels[legalCase.priority]} placement="top">
            <span
              className={`w-3 h-3 rounded-full ${priorityColors[legalCase.priority]}`}
            />
          </Tooltip>
        </div>

        <h4 className="font-medium text-sm line-clamp-2">{legalCase.title}</h4>
        <p className="text-xs text-default-500">{legalCase.client}</p>

        <div className="flex items-center justify-between text-xs text-default-400 mt-2">
          {legalCase.assignee && (
            <div className="flex gap-1 items-center">  
              <Avatar
              name={legalCase.assignee}
              src={legalCase.assigneePhoto ? legalCase.assigneePhoto : undefined}
              color="success"
              className="cursor-pointer w-8 h-8"
              />
              <span>{legalCase.assignee}</span>
          </div>
          )}
          <span className="ml-auto">
            {new Date(legalCase.updatedAt).toLocaleDateString("en-US")}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

type KanbanCardProps = {
  legalCase: LegalCase;
};

// Card with sortable (drag-and-drop)
export function KanbanCard({ legalCase }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: legalCase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <KanbanCardContent legalCase={legalCase} isDragging={isDragging} />
    </div>
  );
}
