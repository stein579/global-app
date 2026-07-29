import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ScrollView } from "react-native";

import type { ReorderableListProps } from "./ReorderableList.types";

function SortableRow<T>({
  id,
  item,
  renderItem,
}: {
  id: string;
  item: T;
  renderItem: ReorderableListProps<T>["renderItem"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 1 : "auto",
        position: "relative",
      }}
    >
      {renderItem({ item, drag: () => {}, isActive: isDragging })}
    </div>
  );
}

/**
 * Web counterpart to ReorderableList.tsx. react-native-gesture-handler's
 * long-press/pan recognizers don't reliably activate through react-native-web
 * (verified against this app: a real long-press-and-drag pointer sequence
 * produced no reorder), so the browser gets its own implementation on
 * @dnd-kit, which is built for the DOM. `activationConstraint.delay`
 * reproduces the same "hold, then drag" gesture as the native long-press,
 * while still letting a quick tap fall through to the row's own onPress.
 */
export function ReorderableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  ListEmptyComponent,
}: ReorderableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = data.findIndex((item) => keyExtractor(item) === active.id);
    const newIndex = data.findIndex((item) => keyExtractor(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(data, oldIndex, newIndex));
  };

  if (data.length === 0) {
    return <>{ListEmptyComponent}</>;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map(keyExtractor)} strategy={verticalListSortingStrategy}>
          {data.map((item) => {
            const id = keyExtractor(item);
            return <SortableRow key={id} id={id} item={item} renderItem={renderItem} />;
          })}
        </SortableContext>
      </DndContext>
    </ScrollView>
  );
}
