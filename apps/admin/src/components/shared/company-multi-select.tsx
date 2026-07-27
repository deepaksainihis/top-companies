"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, ChevronsUpDown, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCompaniesQuery } from "@/lib/queries/companies";

interface SelectedCompanyField {
  id: string;
  companyId: number;
  name: string;
  logo: string | null;
}

export function CompanyMultiSelect({ name = "companies" }: { name?: string }) {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching } = useCompaniesQuery({ page: 1, limit: 10, search: debounced, status: "ACTIVE" });
  const selectedFields = fields as unknown as SelectedCompanyField[];
  const selectedIds = new Set(selectedFields.map((f) => f.companyId));
  const results = (data?.data ?? []).filter((c) => !selectedIds.has(c.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedFields.findIndex((f) => f.id === active.id);
    const newIndex = selectedFields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // arrayMove just computes the resulting order for us to hand to RHF's
    // own `move` - useFieldArray needs to be the one mutating its state.
    arrayMove(selectedFields, oldIndex, newIndex);
    move(oldIndex, newIndex);
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal" />
          }
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-4" /> Search companies to add...
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search companies..." value={search} onValueChange={setSearch} />
            <CommandList>
              {isFetching && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
              {!isFetching && <CommandEmpty>No companies found.</CommandEmpty>}
              <CommandGroup>
                {results.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={String(company.id)}
                    onSelect={() => {
                      append({
                        companyId: company.id,
                        displayOrder: fields.length,
                        name: company.name,
                        logo: company.logo,
                      });
                      setSearch("");
                    }}
                  >
                    {company.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No companies attached yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y rounded-lg border">
              {selectedFields.map((item, index) => (
                <SortableCompanyRow key={item.id} item={item} rank={index + 1} onRemove={() => remove(index)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableCompanyRow({
  item,
  rank,
  onRemove,
}: {
  item: SelectedCompanyField;
  rank: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 bg-background p-2.5">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="w-6 shrink-0 text-center text-xs font-medium text-muted-foreground">{rank}</span>
      <div className="relative size-8 shrink-0 overflow-hidden rounded bg-muted">
        {item.logo && <Image src={item.logo} alt="" fill className="object-cover" unoptimized />}
      </div>
      <span className="flex-1 truncate text-sm">{item.name}</span>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </li>
  );
}
