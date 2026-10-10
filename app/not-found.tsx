import Link from "next/link";
import { MagnifyingGlass, ArrowRight } from "@/lib/icons";

export default function NotFound() {
  return (
    <div className="empty-state not-found">
      <div className="empty-icon">
        <MagnifyingGlass size={35} />
      </div>
      <span className="intro-category">OFF THE RADAR · 404</span>
      <h1>This corner is still unexplored.</h1>
      <p>
        We couldn&apos;t find that page. There are plenty of good things back in
        the library.
      </p>
      <Link href="/" className="button primary">
        Back to the library <ArrowRight size={18} />
      </Link>
    </div>
  );
}
