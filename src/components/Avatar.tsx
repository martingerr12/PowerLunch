/* eslint-disable @next/next/no-img-element */
const COLORS = ["#1F4D3A", "#D9553B", "#3D5A80", "#8C5E3C", "#6B4E71", "#2E6B52", "#B5832A"];

export default function Avatar({ name, src, size = 52 }: { name: string; src?: string | null; size?: number }) {
  if (src) return <img className="avimg" src={src} alt={name} style={{ width: size, height: size }} />;
  const initials = name.split(" ").filter((w) => /^[A-ZÀ-Ý]/.test(w)).map((w) => w[0]).slice(0, 2).join("") || "?";
  const color = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <div className="av" style={{ background: color, width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}
