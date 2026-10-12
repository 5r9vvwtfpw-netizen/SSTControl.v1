import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export interface QuarterlyReportMissingGuideData {
  key: string;
  title: string;
  missing: string[];
  step: string;
  route: string;
  instruction: string;
  actions: Array<{ href: string; label: string }>;
}

export function QuarterlyReportMissingGuide({ guide }: { guide: QuarterlyReportMissingGuideData }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3" data-testid={`quarterly-missing-guide-${guide.key}`}>
      <p className="font-medium">{guide.title}</p>
      <p className="mt-1 text-sm">
        <span className="font-medium">Falta:</span> {guide.missing.join(" · ")}
      </p>
      <p className="mt-2 text-sm">
        <span className="font-medium">Paso del PESV:</span> {guide.step}
      </p>
      <p className="text-sm">
        <span className="font-medium">Ruta:</span> {guide.route}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{guide.instruction}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {guide.actions.map((action) => (
          <Button key={action.href} variant="outline" size="sm" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
