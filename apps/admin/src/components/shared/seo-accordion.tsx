"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";

interface SeoAccordionProps {
  /** Field name prefix, e.g. "" for a top-level Category form or "seo.home." for Settings. */
  prefix?: string;
  title?: string;
  /** Defaults to open when unset; pass explicitly when this isn't a lone field inside another form section. */
  defaultOpen?: boolean;
}

// A single SEO field block (meta title/description, canonical, OG fields,
// robots) reused for both the Category form and the Settings Home/About
// tabs - each instance just targets a different react-hook-form field
// prefix, since the underlying shape is identical everywhere it's used.
export function SeoAccordion({ prefix = "", title = "SEO", defaultOpen = true }: SeoAccordionProps) {
  const { control, register } = useFormContext();
  const field = (name: string) => `${prefix}${name}`;

  return (
    <Accordion defaultValue={defaultOpen ? ["seo"] : []}>
      <AccordionItem value="seo">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent className="space-y-4 px-1">
          <div className="space-y-1.5">
            <Label>Meta Title</Label>
            <Input {...register(field("metaTitle"))} />
          </div>
          <div className="space-y-1.5">
            <Label>Meta Description</Label>
            <Textarea rows={2} {...register(field("metaDescription"))} />
          </div>
          <div className="space-y-1.5">
            <Label>Canonical URL</Label>
            <Input {...register(field("canonicalUrl"))} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label>OG Title</Label>
            <Input {...register(field("ogTitle"))} />
          </div>
          <div className="space-y-1.5">
            <Label>OG Description</Label>
            <Textarea rows={2} {...register(field("ogDescription"))} />
          </div>
          <div className="space-y-1.5">
            <Label>OG Image</Label>
            <Controller
              control={control}
              name={field("ogImage")}
              render={({ field: f }) => (
                <ImageUpload value={f.value} onChange={(url) => f.onChange(url)} aspect="wide" />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Robots</Label>
            <Controller
              control={control}
              name={field("robots")}
              render={({ field: f }) => (
                <Select value={f.value || "index, follow"} onValueChange={f.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">index, follow</SelectItem>
                    <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
