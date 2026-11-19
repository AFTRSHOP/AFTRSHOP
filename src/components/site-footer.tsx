import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="wordmark footer-wordmark" href="/" aria-label="AFTRSHOP home">
          AFTR<span>SHOP</span>
        </Link>
        <p>Made for the ones who move their own way.</p>
        <Link className="footer-shop-link" href="/collections/all">
          Shop the collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AFTRSHOP</span>
        <span>After the hours. On your terms.</span>
      </div>
    </footer>
  );
}
