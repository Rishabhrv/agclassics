"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, Heart, Bookmark } from "lucide-react";

type Category = { id: number; name: string; slug: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  /* Thin scrollbar for sidebar */
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

  /* Active left accent bar */
  .lib-nav-link-active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; height: 60%;
    width: 2px;
    background: #c9a84c;
  }

  /* Mobile nav active dot */
  .lib-mobile-nav-active::after {
    content: '';
    position: absolute;
    bottom: 2px; left: 50%;
    transform: translateX(-50%);
    width: 3px; height: 3px;
    border-radius: 50%;
    background: #c9a84c;
  }
`;

const NAV_ITEMS = [
  { icon: <BookOpen size={14} strokeWidth={1.5} />, label: "All Books",         href: "/library/MyLibrary" },
  { icon: <Clock    size={14} strokeWidth={1.5} />, label: "Continue Reading",   href: "/library/ContinueReadingPage" },
  { icon: <Bookmark size={14} strokeWidth={1.5} />, label: "Bookmarks",          href: "/library/BookmarksPage" },
  { icon: <Heart    size={14} strokeWidth={1.5} />, label: "Favorites",          href: "/library/FavoritesPage" },
];

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
      <style>{minimalStyles}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col bg-[#0f0f10] border-r border-[rgba(201,168,76,0.1)] min-h-screen"
        style={{ width: 224 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center shrink-0 h-16 border-b border-[rgba(201,168,76,0.1)]">
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

        {/* Scrollable nav */}
        <div className="lib-sidebar-scroll flex-1 py-5 space-y-5">

          {/* MAIN LINKS */}
          <div>
            <span
              className="text-[8px] tracking-[4px] uppercase text-[#c9a84c] px-3 mb-1.5 block"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Navigate
            </span>
            <nav className="space-y-[2px] px-2">
              {NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                />
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
            <div className="w-1 h-1 rotate-45 bg-[#c9a84c] opacity-50" />
            <div className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
          </div>

          {/* CATEGORIES */}
          {categories.length > 0 && (
            <div>
              <span
                className="text-[8px] tracking-[4px] uppercase text-[#c9a84c] px-3 mb-1.5 block"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Genres
              </span>
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

        {/* Footer strip */}
        <div className="shrink-0 px-5 py-4 border-t border-[rgba(201,168,76,0.08)]">
          <p
            className="text-[12px] text-[#9a968e] text-center leading-[1.5] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Read with intention.
          </p>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f10] border-t border-[rgba(201,168,76,0.12)] flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? "lib-mobile-nav-active" : ""
              }`}
            >
              <span
                className={`transition-colors duration-200 ${
                  isActive ? "text-[#c9a84c]" : "text-[#6b6b70]"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9px] tracking-[0.5px] transition-colors duration-200 ${
                  isActive ? "text-[#c9a84c]" : "text-[#6b6b70]"
                }`}
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
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
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 px-3 py-[9px] rounded-[1px] text-[13px] tracking-[0.4px] transition-colors duration-200 no-underline
        ${active
          ? "text-[#c9a84c] bg-[rgba(201,168,76,0.08)] lib-nav-link-active"
          : "text-[#c8c4bc] hover:text-[#f5f0e8] hover:bg-[rgba(201,168,76,0.06)]"
        }`}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <span
        className="transition-opacity duration-200"
        style={{ color: "#c9a84c", opacity: active ? 1 : 0.6 }}
      >
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
    <Link
      href={href}
      className={`relative flex items-center px-3 py-[7px] rounded-[1px] text-[12px] tracking-[0.3px] transition-colors duration-200 no-underline
        before:content-[''] before:block before:w-[3px] before:h-[3px] before:rounded-full before:bg-[#c9a84c] before:mr-2.5 before:shrink-0 before:transition-opacity
        ${active
          ? "text-[#c9a84c] bg-[rgba(201,168,76,0.08)] before:opacity-100"
          : "text-[#b8b4ac] hover:text-[#f5f0e8] hover:bg-[rgba(201,168,76,0.05)] before:opacity-50 hover:before:opacity-100"
        }`}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {label}
    </Link>
  );
}