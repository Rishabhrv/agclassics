"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type Book = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
};

type Props = {
  book: Book;
  visibleCount?: number; // kept for API compatibility, no longer used for sizing
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const cardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400&family=Jost:wght@300;400;500&display=swap');

  .lib-book-card {
    position: relative;
    overflow: hidden;
    background: #1a1a1c;
    cursor: pointer;
    /* Fill 100% of whatever parent gives us — no self-sizing */
    width: 100%;
    aspect-ratio: 2 / 3;
    display: block;
    transition: transform 0.4s ease;
  }
  .lib-book-card:hover { transform: scale(1.02); z-index: 2; }

  .lib-book-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease, filter 0.6s ease;
    filter: brightness(0.88) saturate(0.85);
  }
  .lib-book-card:hover img {
    transform: scale(1.07);
    filter: brightness(0.65) saturate(0.6);
  }

  .lib-book-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.96) 0%,
      rgba(10,10,11,0.45) 45%,
      transparent 70%
    );
    transition: background 0.4s;
  }
  .lib-book-card:hover .lib-book-overlay {
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.99) 0%,
      rgba(10,10,11,0.7) 55%,
      rgba(10,10,11,0.25) 100%
    );
  }

  .lib-book-info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 12px 12px 14px;
    transform: translateY(4px);
    transition: transform 0.4s ease;
  }
  .lib-book-card:hover .lib-book-info { transform: translateY(0); }

  .lib-book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.35;
    color: #f5f0e8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .lib-book-read-btn {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 6px 12px;
    background: #c9a84c;
    color: #0a0a0b;
    border: none;
    cursor: pointer;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.35s ease, transform 0.35s ease, background 0.3s;
    display: inline-block;
  }
  .lib-book-card:hover .lib-book-read-btn { opacity: 1; transform: translateY(0); }
  .lib-book-read-btn:hover { background: #f5f0e8; }

  .lib-fav-btn {
    position: absolute;
    top: 10px; right: 10px;
    z-index: 10;
    width: 28px; height: 28px;
    background: rgba(10,10,11,0.75);
    border: 1px solid rgba(201,168,76,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s;
  }
  .lib-fav-btn:hover { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.5); }
  .lib-fav-btn.active { background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.6); }

  .lib-book-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #1c1c1e, #2a2a2d);
    display: flex; align-items: center; justify-content: center;
  }
`;

export default function LibraryBookCard({ book }: Props) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/my-books/${book.slug}/favorite`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setFavorite(d.favorite))
      .catch(() => {});
  }, [book.slug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/my-books/${book.slug}/favorite`, {
      method: favorite ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorite(!favorite);
  };

  return (
    <>
      <style>{cardStyles}</style>

      {/* No outer wrapper — card fills 100% of whatever the parent gives */}
      <Link href={`/my-books/${book.slug}`} style={{ textDecoration: "none", display: "block", width: "100%" }}>
        <div className="lib-book-card">

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className={`lib-fav-btn ${favorite ? "active" : ""}`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={13}
              strokeWidth={1.5}
              style={{
                fill: favorite ? "#c9a84c" : "none",
                color: favorite ? "#c9a84c" : "#6b6b70",
                transition: "fill 0.3s, color 0.3s",
              }}
            />
          </button>

          {/* Cover image */}
          {book.main_image ? (
            <Image
              src={`${API_URL}${book.main_image}`}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="lib-book-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.5}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          )}

          {/* Overlay + info */}
          <div className="lib-book-overlay" />
          <div className="lib-book-info">
            <p className="lib-book-title">{book.title}</p>
            <span className="lib-book-read-btn">Read Now</span>
          </div>
        </div>
      </Link>
    </>
  );
}