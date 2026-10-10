import type { Metadata } from "next";
import CategoryPage, {
  generateMetadata as categoryMetadata,
} from "@/components/category-page";
import { categories } from "@/lib/types";
export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.toLowerCase() }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata({ params: Promise.resolve({ category: slug }) });
}
export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryPage params={Promise.resolve({ category: slug })} />;
}
