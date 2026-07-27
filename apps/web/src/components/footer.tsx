import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { SocialLinks } from "@/lib/types";

// lucide-react dropped brand/logo icons a while back (trademark reasons) -
// react-icons/fa6 (Font Awesome Free) is the standard replacement for these.
const SOCIAL_ICONS: Record<keyof SocialLinks, typeof FaFacebook> = {
  facebook: FaFacebook,
  twitter: FaXTwitter,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  youtube: FaYoutube,
};

export function Footer({ siteName, socialLinks }: { siteName: string; socialLinks: SocialLinks | null }) {
  const activeSocials = (Object.keys(SOCIAL_ICONS) as (keyof SocialLinks)[]).filter((key) => socialLinks?.[key]);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold">{siteName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>

        {activeSocials.length > 0 && (
          <div className="flex items-center gap-3">
            {activeSocials.map((key) => {
              const Icon = SOCIAL_ICONS[key];
              const href = socialLinks?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}
