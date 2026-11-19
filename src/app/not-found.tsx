import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found page-gutter">
        <p className="eyebrow">404 / Wrong turn</p>
        <h1>Nothing here.<br />Keep moving.</h1>
        <Link className="button button-dark" href="/collections/all">Back to the collection <span aria-hidden="true">↗</span></Link>
      </main>
      <SiteFooter />
    </>
  );
}
