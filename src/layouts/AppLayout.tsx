import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}
