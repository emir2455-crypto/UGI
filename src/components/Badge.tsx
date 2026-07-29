export default function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`badge ${className || ""}`}>{children}</span>;
}
