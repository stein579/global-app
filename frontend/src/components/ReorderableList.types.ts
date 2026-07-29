import type { ReactNode } from "react";

export interface ReorderableListRenderItemParams<T> {
  item: T;
  drag: () => void;
  isActive: boolean;
}

export interface ReorderableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (params: ReorderableListRenderItemParams<T>) => ReactNode;
  onReorder: (data: T[]) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: ReactNode;
}
