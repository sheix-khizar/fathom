import { getTemplates } from "@/lib/data/meetings";
import TemplatesClient from "@/components/templates/TemplatesClient";

export default function TemplatesPage() {
  const templates = getTemplates();
  return <TemplatesClient templates={templates} />;
}
