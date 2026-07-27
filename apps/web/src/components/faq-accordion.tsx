import { ChevronDown } from "lucide-react";

export function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {faqs.map((faq, index) => (
        <details key={index} className="group p-4 open:pb-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
            {faq.question}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
