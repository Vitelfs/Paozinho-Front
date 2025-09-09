import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TableSkeletonProps } from "@/types/datatable.type";

export const TableSkeleton = React.memo<TableSkeletonProps>(
  ({ columns = 4, rows = 5, showFilters = true, showPagination = true }) => {
    return (
      <div className="space-y-4">
        {/* Filtros e busca */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        )}

        {/* Tabela */}
        <div className="rounded-md border">
          {/* Header */}
          <div className="border-b bg-muted/50 p-4">
            <div className="flex items-center space-x-4">
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-20" />
              ))}
            </div>
          </div>

          {/* Rows */}
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="border-b p-4">
              <div className="flex items-center space-x-4">
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <Skeleton key={cellIndex} className="h-4 w-32" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {showPagination && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
    );
  }
);

TableSkeleton.displayName = "TableSkeleton";
