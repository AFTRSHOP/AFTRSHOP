import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="announcement-bar">Built for the hours that last</div>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" href="/" aria-label="AFTRSHOP home">
            AFTR<span>SHOP</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/collections/all">Shop all</Link>
            <Link href="/#our-standard">Our standard</Link>
          </nav>

          <Link className="header-shop-link" href="/collections/all">
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open menu">Menu</summary>
            <nav aria-label="Mobile navigation">
              <Link href="/collections/all">Shop all</Link>
              <Link href="/#our-standard">Our standard</Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
