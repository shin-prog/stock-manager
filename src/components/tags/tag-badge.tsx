import { Badge } from "@/components/ui/badge";
import { getColorClasses } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  colorKey: string;
  className?: string;
}

export function TagBadge({ name, colorKey, className }: TagBadgeProps) {
  const color = getColorClasses(colorKey);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-bold transition-all shadow-xs border-[1.5px]",
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      {name}
    </Badge>
  );
}
