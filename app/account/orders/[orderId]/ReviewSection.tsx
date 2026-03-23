"use client";

import { useState } from "react";
import { Star, X, ImagePlus, Send } from "lucide-react";
import AlertPopup from "@/components/Popups/AlertPopup";

type Props = {
  productId: number;
  productTitle: string;
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmerSweep {
    from { left: -60%; }
    to   { left: 160%; }
  }
  @keyframes fadeScale {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  .submit-btn {
    position: relative; overflow: hidden;
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #c9a84c;
    color: #0a0a0b;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 13px 24px;
    border: none;
    cursor: pointer;
    transition: background 250ms;
  }
  .submit-btn:hover { background: #f5f0e8; }
  .submit-btn:active { transform: scale(0.99); }
  .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .submit-btn::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  }
  .submit-btn:not(:disabled):hover::after { animation: shimmerSweep 0.55s ease; }

  .review-textarea {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 12px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #e8e0d0;
    resize: none;
    transition: border-color 200ms;
    outline: none;
  }
  .review-textarea::placeholder { color: #3a3a3e; }
  .review-textarea:focus { border-color: rgba(201,168,76,0.35); }

  .upload-zone {
    border: 1.5px dashed rgba(255,255,255,0.08);
    border-radius: 8px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 200ms, background 200ms;
    background: rgba(255,255,255,0.02);
  }
  .upload-zone:hover {
    border-color: rgba(201,168,76,0.3);
    background: rgba(201,168,76,0.04);
  }

  .preview-img-wrap {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .preview-img-wrap .remove-btn {
    position: absolute; top: 4px; right: 4px;
    width: 20px; height: 20px;
    background: rgba(0,0,0,0.7);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 200ms;
    cursor: pointer;
    border: none;
  }
  .preview-img-wrap:hover .remove-btn { opacity: 1; }

  .success-anim { animation: fadeScale 0.4s ease both; }
`;

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ReviewSection({ productId, productTitle }: Props) {
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [comment,    setComment]    = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [preview,    setPreview]    = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [toastOpen,  setToastOpen]  = useState(false);
  const [toastMsg,   setToastMsg]   = useState("");

  const toast = (msg: string) => { setToastMsg(msg); setToastOpen(true); };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setImageFiles(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitReview = async () => {
    if (!rating)         return toast("Please select a star rating.");
    if (!comment.trim()) return toast("Please write your review.");
    const token = localStorage.getItem("token");
    if (!token) return toast("Please log in to submit a review.");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("product_id", productId.toString());
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    imageFiles.forEach((f) => formData.append("images", f));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ag-classics/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setSubmitting(false);
    if (!res.ok) return toast("Failed to submit. Please try again.");

    setSubmitted(true);
    setRating(0); setComment(""); setImageFiles([]); setPreview([]);
    toast("Review submitted for approval!");
  };

  const active = hover || rating;

  /* ── Success state ── */
  if (submitted) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="success-anim flex flex-col items-center justify-center py-10 text-center">
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Send size={20} style={{ color: "#c9a84c" }} />
          </div>
          <h3
            className="font-light mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#f5f0e8" }}
          >
            Review Submitted
          </h3>
          <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: "#555259" }}>
            It will appear after approval.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-[11px] uppercase tracking-[2px] transition-colors"
            style={{ fontFamily: "'Jost', sans-serif", color: "#555259", textDecoration: "underline" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555259")}
          >
            Write another review
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <div className="space-y-5" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ── Star rating ── */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[3px] mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#555259" }}
          >
            Your Rating
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Star
                  size={26}
                  style={{
                    transition: "color 150ms, fill 150ms",
                    fill:   active >= n ? "#c9a84c" : "transparent",
                    color:  active >= n ? "#c9a84c" : "#3a3a3e",
                    strokeWidth: 1.5,
                  }}
                />
              </button>
            ))}
            <span
              className="ml-2 text-sm transition-all"
              style={{ color: active ? "#c9a84c" : "transparent" }}
            >
              {RATING_LABELS[active]}
            </span>
          </div>
        </div>

        {/* ── Comment ── */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[3px] mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#555259" }}
          >
            Your Review
          </p>
          <textarea
            rows={4}
            placeholder="Share your thoughts about this book — what you loved, who you'd recommend it to…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="review-textarea"
          />
          <p
            className="text-right text-[10px] mt-1"
            style={{ color: "#3a3a3e" }}
          >
            {comment.length} characters
          </p>
        </div>

        {/* ── Image upload ── */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[3px] mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#555259" }}
          >
            Photos{" "}
            <span className="normal-case tracking-normal text-[11px]" style={{ color: "#3a3a3e" }}>
              (optional, up to 4)
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            {preview.map((p, i) => (
              <div
                key={i}
                className="preview-img-wrap"
                style={{ width: 64, height: 64 }}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button className="remove-btn" onClick={() => removeImage(i)}>
                  <X size={10} style={{ color: "#fff" }} />
                </button>
              </div>
            ))}

            {preview.length < 4 && (
              <label
                className="upload-zone"
                style={{ width: 64, height: 64 }}
              >
                <ImagePlus size={16} style={{ color: "#3a3a3e", marginBottom: 3 }} />
                <span style={{ fontSize: 9, color: "#3a3a3e" }}>Add photo</span>
                <input
                  type="file" multiple accept="image/*"
                  className="hidden"
                  onChange={handleImages}
                />
              </label>
            )}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          className="submit-btn"
          onClick={submitReview}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg
                style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite", flexShrink: 0 }}
                viewBox="0 0 24 24" fill="none"
              >
                <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Submitting…
            </>
          ) : (
            <>
              <Send size={13} />
              Submit Review
            </>
          )}
        </button>

        <AlertPopup open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />
      </div>
    </>
  );
}