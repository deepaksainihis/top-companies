"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FaqRepeater({ name = "faqs" }: { name?: string }) {
  const { control, register } = useFormContext();
  const { fields, append, remove, swap } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No FAQs yet. Add the first question below.</p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Question</Label>
              <Input {...register(`${name}.${index}.question` as const)} placeholder="Question" />
            </div>
            <div className="flex items-center gap-1 pt-6">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === fields.length - 1}
                onClick={() => swap(index, index + 1)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Answer</Label>
            <Textarea rows={2} {...register(`${name}.${index}.answer` as const)} placeholder="Answer" />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ question: "", answer: "", sortOrder: fields.length })}
      >
        <Plus className="size-4" /> Add FAQ
      </Button>
    </div>
  );
}
