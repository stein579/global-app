import DraggableFlatList, {
  type DragEndParams,
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import type { ReorderableListProps } from "./ReorderableList.types";

/**
 * Long-press-to-drag reorderable list, shared by 英文一覧 and 単語帳一覧.
 * Native (iOS/Android) uses react-native-draggable-flatlist, backed by
 * react-native-gesture-handler's native long-press + pan recognizers. See
 * ReorderableList.web.tsx for the browser implementation - RNGH's gesture
 * recognizers aren't reliable on web, so that one uses @dnd-kit instead.
 */
export function ReorderableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  refreshing,
  onRefresh,
  ListEmptyComponent,
}: ReorderableListProps<T>) {
  return (
    <DraggableFlatList
      data={data}
      keyExtractor={keyExtractor}
      containerStyle={{ flex: 1 }}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onDragEnd={({ data: reordered }: DragEndParams<T>) => onReorder(reordered)}
      renderItem={({ item, drag, isActive }: RenderItemParams<T>) => (
        <ScaleDecorator>{renderItem({ item, drag, isActive })}</ScaleDecorator>
      )}
      ListEmptyComponent={ListEmptyComponent as never}
    />
  );
}
