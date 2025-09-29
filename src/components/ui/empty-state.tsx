import React from "react";
import { Button } from "@/components/ui/button";
import { Paragraph } from "@/components/ui/typography";
import type { EmptyStateProps } from "@/types/datatable.type";

export const EmptyState = React.memo<EmptyStateProps>(
  ({ title, description, actionLabel, onAction, icon: Icon }) => {
    return (
      <div className="text-center py-12">
        {Icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <Paragraph className="text-muted-foreground mb-2">{title}</Paragraph>
        {description && (
          <Paragraph className="text-sm text-muted-foreground mb-4">
            {description}
          </Paragraph>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
