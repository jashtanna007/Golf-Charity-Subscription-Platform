import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Heart,
  Trophy,
  CreditCard,
  Settings,
  Shield,
  Users,
  BarChart3,
  Gift,
  BadgeCheck,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/authStore";

function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const userLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Scores", href: "/scores", icon: Target },
    { label: "Leaderboard", href: "/leaderboard", icon: Medal },
    { label: "Prize Draws", href: "/draws", icon: Trophy },
    { label: "Charities", href: "/charities", icon: Heart },
    { label: "Subscription", href: "/subscription", icon: CreditCard },
    { label: "My Winnings", href: "/winnings", icon: Gift },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: BarChart3 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Draws", href: "/admin/draws", icon: Trophy },
    { label: "Charities", href: "/admin/charities", icon: Heart },
    { label: "Winners", href: "/admin/winners", icon: BadgeCheck },
    { label: "Security", href: "/admin/security", icon: Shield },
  ];

  const links = user?.role === "admin"
    ? [...adminLinks, { type: "divider" }, ...userLinks]
    : userLinks;

  return (
    <aside className="w-64 bg-white border-r border-outline-variant/20 min-h-[calc(100vh-64px)] py-6 px-3 hidden lg:block">
      <div className="space-y-1">
        {links.map((link, index) => {
          if (link.type === "divider") {
            return (
              <div key={`divider-${index}`} className="my-4 border-t border-outline-variant/20" />
            );
          }

          const Icon = link.icon;
          const isActive = location.pathname === link.href;

          return (
            <NavLink
              key={link.href}
              to={link.href}
              className={cn(
                "sidebar-link",
                isActive && "sidebar-link-active"
              )}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
