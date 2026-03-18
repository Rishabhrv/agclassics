"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  Heart,
  Bookmark,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .lib-sidebar {
    background: #0f0f10;
    border-right: 1px solid rgba(201,168,76,0.1);
    min-height: 100vh;
    width: 224px;
  }

  .lib-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    letter-spacing: 0.4px;
    color: #c8c4bc;                          /* ✅ light warm white — always readable */
    text-decoration: none;
    border-radius: 1px;
    transition: color 0.2s, background 0.2s;
    position: relative;
  }
  .lib-nav-link:hover {
    color: #f5f0e8;                          /* ✅ brightest white on hover */
    background: rgba(201,168,76,0.06);
  }
  .lib-nav-link.active {
    color: #c9a84c;                          /* gold for active */
    background: rgba(201,168,76,0.08);
  }
  .lib-nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 2px;
    background: #c9a84c;
  }

  .lib-cat-link {
    display: flex;
    align-items: center;
    padding: 7px 12px 7px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: #b8b4ac;                          /* ✅ readable light grey-white */
    text-decoration: none;
    border-radius: 1px;
    transition: color 0.2s, background 0.2s;
    position: relative;
  }
  .lib-cat-link::before {
    content: '';
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #c9a84c;
    margin-right: 10px;
    flex-shrink: 0;
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .lib-cat-link:hover {
    color: #f5f0e8;                          /* ✅ bright white on hover */
    background: rgba(201,168,76,0.05);
  }
  .lib-cat-link:hover::before { opacity: 1; }
  .lib-cat-link.active {
    color: #c9a84c;
    background: rgba(201,168,76,0.08);
  }
  .lib-cat-link.active::before {
    background: #c9a84c;
    opacity: 1;
  }

  .lib-section-label {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #c9a84c;                          /* ✅ gold section labels — more visible */
    padding: 0 12px;
    margin-bottom: 6px;
    display: block;
  }

  /* Subtle scroll in sidebar */
  .lib-sidebar-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.15) transparent;
  }
  .lib-sidebar-scroll::-webkit-scrollbar { width: 3px; }
  .lib-sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.15);
    border-radius: 2px;
  }
`;

export default function LibrarySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname() ?? "";
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/mylibrary/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoaded(true); });
  }, [loaded]);

  return (
    <>
      <style>{sidebarStyles}</style>

      <aside className="lib-sidebar hidden md:flex flex-col">

        {/* LOGO */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ height: 64, borderBottom: "1px solid rgba(201,168,76,0.1)" }}
        >
          <Link href="/">
            <Image
              src="/images/logo/AGClassicLogo.png"
              alt="My Library"
              width={110}
              height={30}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* SCROLLABLE NAV */}
        <div className="lib-sidebar-scroll flex-1 py-5 space-y-5">

          {/* MAIN LINKS */}
          <div>
            <span className="lib-section-label">Navigate</span>
            <nav className="space-y-[2px] px-2">
              <SidebarLink
                icon={<BookOpen size={14} strokeWidth={1.5} />}
                label="All Books"
                href="/library/MyLibrary"
                active={pathname === "/library/MyLibrary"}
              />
              <SidebarLink
                icon={<Clock size={14} strokeWidth={1.5} />}
                label="Continue Reading"
                href="/library/ContinueReadingPage"
                active={pathname === "/library/ContinueReadingPage"}
              />
              <SidebarLink
                icon={<Bookmark size={14} strokeWidth={1.5} />}
                label="Bookmarks"
                href="/library/BookmarksPage"
                active={pathname === "/library/BookmarksPage"}
              />
              <SidebarLink
                icon={<Heart size={14} strokeWidth={1.5} />}
                label="Favorites"
                href="/library/FavoritesPage"
                active={pathname === "/library/FavoritesPage"}
              />
            </nav>
          </div>

          {/* DIVIDER with diamond */}
          <div className="flex items-center gap-3 px-4">
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
            <div style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "#c9a84c", opacity: 0.5 }} />
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>

          {/* CATEGORIES */}
          {categories.length > 0 && (
            <div>
              <span className="lib-section-label">Genres</span>
              <nav className="space-y-[2px] px-2">
                {categories.map((cat) => (
                  <CategoryLink
                    key={cat.id}
                    label={cat.name}
                    href={`/library/category/${cat.slug}`}
                    active={pathname.startsWith(`/library/category/${cat.slug}`)}
                  />
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER STRIP */}
        <div
          className="shrink-0 px-5 py-4"
          style={{ borderTop: "1px solid rgba(201,168,76,0.08)" }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 12,
              color: "#9a968e",              /* ✅ slightly warmer & more legible */
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            Read with intention.
          </p>
        </div>
      </aside>
    </>
  );
}

/* ── SIDEBAR LINK ── */
function SidebarLink({
  icon,
  label,
  href,
  active,
}: {
  icon?: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={`lib-nav-link ${active ? "active" : ""}`}>
      <span style={{ color: active ? "#c9a84c" : "#c9a84c", opacity: active ? 1 : 0.6 }}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

/* ── CATEGORY LINK ── */
function CategoryLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={`lib-cat-link ${active ? "active" : ""}`}>
      {label}
    </Link>
  );
}