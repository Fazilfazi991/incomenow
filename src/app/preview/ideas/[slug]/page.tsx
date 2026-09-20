import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IdeaDetail } from "@/components/idea-detail";
import { detailedIdeas, getIdeaBySlug } from "@/content/ideas";

type IdeaPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return detailedIdeas.map((idea) => ({ slug: idea.slug }));
}

export async function generateMetadata({ params }: IdeaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);
  if (!idea?.detailAvailable) return { title: "Idea not found" };
  return { title: `IDEA #${idea.displayNumber} — ${idea.title}`, description: idea.summary };
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);
  if (!idea?.detailAvailable) notFound();

  return (
    <div className="idea-route">
      <div className="route-bar">
        <Link href="/preview/explore"><ArrowLeft size={16} /> Back to ideas</Link>
        <span>Local preview — sample opportunity</span>
      </div>
      <IdeaDetail idea={idea} />
    </div>
  );
}

