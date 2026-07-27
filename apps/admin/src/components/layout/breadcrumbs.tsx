"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Companies",
  categories: "Categories",
  masters: "Masters",
  countries: "Countries",
  "tech-stacks": "Tech Stacks",
  "employee-ranges": "Employee Ranges",
  "hourly-rate-ranges": "Hourly Rate Ranges",
  settings: "Settings",
  profile: "Profile",
  new: "New",
  users: "Users",
};

const labelFor = (segment: string) => {
  if (LABELS[segment]) return LABELS[segment];
  // Numeric or otherwise unrecognized segments are record ids -> the form
  // shown at that route is always an edit form.
  return "Edit";
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  let href = "";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/dashboard">Home</Link>} />
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          href += `/${segment}`;
          const isLast = index === segments.length - 1;
          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href}>{labelFor(segment)}</Link>} />
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
