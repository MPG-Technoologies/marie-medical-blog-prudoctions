import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HeartPulse,
  MessageSquareText,
} from "lucide-react";

import { TopicImprint } from "@/components/evidence/topic-imprint";
import type { PublicArticleSummary } from "@/lib/public-articles";

interface PortfolioArticleProps {
  article: PublicArticleSummary;
  imageUrl: string | null;
}

function formatDate(date: string | null): string | null {
  if (!date) return null;

  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function renderCategoryIcon(article: PublicArticleSummary) {
  const value =
    `${article.category?.name ?? ""} ${article.category?.slug ?? ""}`.toLowerCase();

  if (value.includes("heart") || value.includes("chronic")) {
    return (
      <HeartPulse aria-hidden="true" strokeWidth={1.35} className="h-7 w-7" />
    );
  }

  if (value.includes("communication")) {
    return (
      <MessageSquareText
        aria-hidden="true"
        strokeWidth={1.35}
        className="h-7 w-7"
      />
    );
  }

  if (value.includes("education") || value.includes("literacy")) {
    return (
      <BookOpen aria-hidden="true" strokeWidth={1.35} className="h-7 w-7" />
    );
  }

  return <FileText aria-hidden="true" strokeWidth={1.35} className="h-7 w-7" />;
}

export function PortfolioFeaturedCard({
  article,
  imageUrl,
}: PortfolioArticleProps) {
  const formattedDate = formatDate(article.published_at);

  const hasImage = Boolean(imageUrl && article.featured_image_alt?.trim());

  return (
    <article className="group relative overflow-hidden rounded-lg border border-subtle-divider bg-[#FFFDF9]/65 transition-colors duration-[220ms] group-hover:border-[#918579]/50">
      <div className="grid h-full sm:grid-cols-[42%_58%] xl:grid-cols-[44%_56%]">
        <div className="relative min-h-[220px] overflow-hidden bg-[#EEE6DA] sm:min-h-full">
          {hasImage && imageUrl && article.featured_image_alt ? (
            <Image
              src={imageUrl}
              alt={article.featured_image_alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 42vw, 16vw"
              className="object-cover object-center transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.018] motion-reduce:transform-none"
            />
          ) : (
            <div className="text-brand-oxide/60 flex h-full min-h-[220px] items-center justify-center">
              <FileText
                aria-hidden="true"
                strokeWidth={1.3}
                className="h-8 w-8"
              />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          {article.category && (
            <TopicImprint>{article.category.name}</TopicImprint>
          )}

          <h3 className="group-hover:text-brand-oxide mt-3 font-serif text-[1.35rem] leading-[1.06] font-medium tracking-tight text-ink transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-[1.45rem]">
            <Link href={`/blog/${article.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {article.title}
            </Link>
          </h3>

          {article.excerpt && (
            <p className="text-muted-ink mt-3 line-clamp-4 text-xs leading-[1.55] sm:text-sm">
              {article.excerpt}
            </p>
          )}

          <div className="mt-auto pt-5">
            <div className="text-muted-ink flex flex-wrap items-center gap-2 border-t border-subtle-divider pt-3 text-[0.65rem]">
              {formattedDate && <span>{formattedDate}</span>}

              {formattedDate && <span aria-hidden="true">•</span>}

              <span>{article.reading_time_minutes} min read</span>
            </div>

            <span className="text-brand-oxide mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-[160ms]">
              Read article{" "}
              <span className="inline-block transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PortfolioCompactCard({
  article,
}: {
  article: PublicArticleSummary;
}) {
  const icon = renderCategoryIcon(article);

  const formattedDate = formatDate(article.published_at);

  return (
    <article className="group relative rounded-lg border border-subtle-divider bg-[#FFFDF9]/55 p-4 transition-colors duration-[220ms] group-hover:border-[#918579]/50 sm:p-5">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[58px_minmax(0,1fr)_auto] sm:items-center">
        <div className="text-brand-oxide flex h-14 w-14 items-center justify-center rounded-lg border border-[#E0D3C5] bg-[#FBF4EA]">
          {icon}
        </div>

        <div className="min-w-0">
          {article.category && (
            <p className="text-brand-oxide text-[0.56rem] font-semibold tracking-[0.09em] uppercase">
              {article.category.name}
            </p>
          )}

          <h3 className="group-hover:text-brand-oxide mt-1 font-serif text-base leading-[1.1] font-medium text-ink transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-lg">
            <Link href={`/blog/${article.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {article.title}
            </Link>
          </h3>

          {article.excerpt && (
            <p className="text-muted-ink mt-1.5 line-clamp-2 text-xs leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="border-t border-subtle-divider pt-3 sm:min-w-[118px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
          <div className="text-muted-ink text-[0.62rem] leading-relaxed">
            {formattedDate && <div>{formattedDate}</div>}

            <div>{article.reading_time_minutes} min read</div>
          </div>

          <div className="text-brand-oxide mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-[160ms]">
            Read article{" "}
            <span className="inline-block transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
