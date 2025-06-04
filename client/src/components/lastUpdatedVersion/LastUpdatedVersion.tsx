export default function LastUpdatedVersion() {
  return (
    <span
      className="text-xs text-[#8a8a8a] absolute bottom-1 left-2"
      style={{ fontSize: "10px" }}
    >
      Last updated: {process.env.VITE_LAST_UPDATED} / version{" "}
      {process.env.VITE_VERSION}
    </span>
  );
}
