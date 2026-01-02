import { Outlet } from "react-router-dom";
import { LiquidGlassNav } from "@/components/LiquidGlassNav";

export function AppLayout() {
  return (
    <div className="min-h-screen pb-28">
      <Outlet />
      <LiquidGlassNav />
    </div>
  );
}
