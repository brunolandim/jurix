'use client';

import { Card, CardBody, Skeleton } from '@/components/ui';

function CardSkeleton() {
  return (
    <Card>
      <CardBody className="p-3 gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
        <div className="flex items-center justify-between mt-1">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

function ColumnSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="shrink-0 w-72 bg-default-100 rounded-lg flex flex-col">
      <div className="p-3 border-b border-default-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto  flex-1 min-h-0">
      <ColumnSkeleton cardCount={4} />
      <ColumnSkeleton cardCount={5} />
      <ColumnSkeleton cardCount={6} />
      <ColumnSkeleton cardCount={7} />
      <ColumnSkeleton cardCount={8} />
      <ColumnSkeleton cardCount={9} />
    </div>
  );
}
