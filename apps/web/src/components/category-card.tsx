import Link from "next/link";
import Image from "next/image";
import { PublicCategorySummary } from "@/lib/types";

export function CategoryCard({ category }: { category: PublicCategorySummary }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md"
    >
      <div className="relative h-32 w-full bg-muted">
        {category.image && <Image src={category.image} alt={category.name} fill className="object-cover" unoptimized />}
      </div>
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-primary">{category.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{category._count.companies} companies</p>
        {category.children && category.children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {category.children.map((child) => (
              <span key={child.id} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {child.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
