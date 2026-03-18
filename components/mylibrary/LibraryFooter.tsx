const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400&family=Jost:wght@300;400&display=swap');

  .lib-footer {
    background: #0a0a0b;
    border-top: 1px solid rgba(201,168,76,0.1);
  }
`;

export default function LibraryFooter() {
  return (
    <>
      <style>{footerStyles}</style>

      <footer className="lib-footer">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Left — copyright */}
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 11,
              letterSpacing: "0.5px",
              color: "#6b6b70",
            }}
          >
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#8a6f2e" }}>My Library</span>
          </span>

          {/* Centre — ornament */}
          <div className="flex items-center gap-3">
            <div style={{ width: 30, height: 1, background: "rgba(201,168,76,0.15)" }} />
            <div
              style={{
                width: 4,
                height: 4,
                transform: "rotate(45deg)",
                background: "#8a6f2e",
                opacity: 0.6,
              }}
            />
            <div style={{ width: 30, height: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>

          {/* Right — tagline */}
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#6b6b70",
            }}
          >
            Happy Reading
          </span>
        </div>
      </footer>
    </>
  );
}