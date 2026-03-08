import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Clock, User } from "lucide-react";

interface KanbanItem {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  details?: string | null;
  user_id?: string;
}

interface KanbanColumn {
  id: string;
  label: string;
  color: string;
}

interface KanbanBoardProps {
  items: KanbanItem[];
  columns: KanbanColumn[];
  onMoveItem: (itemId: string, newStatus: string) => void;
  onItemClick?: (item: KanbanItem) => void;
}

const KanbanBoard = ({ items, columns, onMoveItem, onItemClick }: KanbanBoardProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) + 1;
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) - 1;
    if (dragCounter.current[columnId] <= 0) {
      dragCounter.current[columnId] = 0;
      if (dragOverColumn === columnId) setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId && draggedItem) {
      const item = items.find(i => i.id === itemId);
      if (item && item.status !== columnId) {
        onMoveItem(itemId, columnId);
      }
    }
    setDraggedItem(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map(col => {
        const columnItems = items.filter(i => i.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-[260px] flex flex-col rounded-xl border transition-all duration-200 ${
              isOver
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 bg-muted/20"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={e => handleDragEnter(e, col.id)}
            onDragLeave={e => handleDragLeave(e, col.id)}
            onDrop={e => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="px-3 py-2.5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="text-[12px] font-bold text-foreground uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                  {columnItems.length}
                </Badge>
              </div>
            </div>

            {/* Column Items */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px]">
              {columnItems.length === 0 && (
                <div className={`border-2 border-dashed rounded-lg py-8 text-center transition-colors ${
                  isOver ? "border-primary/40 bg-primary/5" : "border-border/30"
                }`}>
                  <p className="text-[11px] text-muted-foreground">Drop here</p>
                </div>
              )}
              {columnItems.map(item => (
                <Card
                  key={item.id}
                  draggable
                  onDragStart={e => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onItemClick?.(item)}
                  className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all border border-border/50 rounded-lg ${
                    draggedItem === item.id ? "opacity-40 scale-95" : "opacity-100"
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                      <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                        {item.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {item.details && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.details}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{item.id.slice(0, 8)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
