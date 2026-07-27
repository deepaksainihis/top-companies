"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuditFooter } from "@/components/shared/audit-footer";
import { ImageUpload } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SeoAccordion } from "@/components/shared/seo-accordion";
import { settingsFormSchema, SettingsFormValues } from "@/lib/schemas/settings";
import { useSettingsQuery, useUpdateSettings } from "@/lib/queries/settings";
import { getErrorMessage } from "@/lib/api-client";

const EMPTY_SEO = {
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  robots: "index, follow",
};

const DEFAULT_VALUES: SettingsFormValues = {
  general: {
    siteName: "",
    logo: "",
    favicon: "",
    contactEmail: "",
    phone: "",
    address: "",
    aboutContent: "",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "" },
  },
  seo: { home: EMPTY_SEO, about: EMPTY_SEO },
};

export default function SettingsPage() {
  const { data, isLoading } = useSettingsQuery();
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        general: {
          siteName: data.general.siteName ?? "",
          logo: data.general.logo ?? "",
          favicon: data.general.favicon ?? "",
          contactEmail: data.general.contactEmail ?? "",
          phone: data.general.phone ?? "",
          address: data.general.address ?? "",
          aboutContent: data.general.aboutContent ?? "",
          socialLinks: {
            facebook: data.general.socialLinks?.facebook ?? "",
            twitter: data.general.socialLinks?.twitter ?? "",
            linkedin: data.general.socialLinks?.linkedin ?? "",
            instagram: data.general.socialLinks?.instagram ?? "",
            youtube: data.general.socialLinks?.youtube ?? "",
          },
        },
        seo: {
          home: { ...EMPTY_SEO, ...data.seo.home },
          about: { ...EMPTY_SEO, ...data.seo.about },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage general site settings and SEO defaults.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="home-seo">Home Page SEO</TabsTrigger>
              <TabsTrigger value="about">About Page</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="general.siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload label="Logo" value={field.value} onChange={field.onChange} aspect="wide" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="general.favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload label="Favicon" value={field.value} onChange={field.onChange} aspect="square" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="general.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="general.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Social Links</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(["facebook", "twitter", "linkedin", "instagram", "youtube"] as const).map((platform) => (
                        <FormField
                          key={platform}
                          control={form.control}
                          name={`general.socialLinks.${platform}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">{platform}</FormLabel>
                              <FormControl>
                                <Input placeholder="https://" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="home-seo">
              <Card>
                <CardContent className="pt-6">
                  <SeoAccordion prefix="seo.home." title="Home Page SEO" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="general.aboutContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Page Content</FormLabel>
                        <FormControl>
                          <RichTextEditor value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <SeoAccordion prefix="seo.about." title="About Page SEO" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {data && <AuditFooter record={data.general} />}

          <div className="flex justify-end">
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
