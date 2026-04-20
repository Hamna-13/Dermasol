import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "Profile";

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Skin Analysis", path: "/analysis" },
    { label: "Conditions", path: "/conditions" },
    { label: "About", path: "/about" },
    ...(isAuthenticated
      ? [
          { label: "History", path: "/history" },
          { label: "Profile", path: "/profile" },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const getNavLinkClass = (path: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-primary-foreground/15 text-primary-foreground"
        : "text-primary-foreground hover:bg-primary-light/20"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-professional">
      <div className="container mx-auto px-4">
        <div className="flex min-h-[68px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img
                src="/logo.png"
                alt="Dermasol"
                className="h-9 w-9 object-contain"
              />
              <div className="leading-tight">
                <span className="block text-lg font-bold text-primary-foreground">
                  Dermasol
                </span>
                <span className="block text-[11px] text-primary-foreground opacity-90">
                  AI Dermatology
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavLinkClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                type="search"
                placeholder="Search conditions, symptoms..."
                className="h-9 border-primary-light/30 bg-primary-foreground/10 pl-10 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary-light/20"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="max-w-[140px] truncate whitespace-nowrap">
                    {displayName}
                  </span>
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-9 text-primary-foreground hover:bg-primary-light/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="h-9 text-primary-foreground hover:bg-primary-light/20"
              >
                Login
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-primary-light/20 py-2 md:hidden">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                type="search"
                placeholder="Search conditions, symptoms..."
                className="h-9 border-primary-light/30 bg-primary-foreground/10 pl-10 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavLinkClass(item.path)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-primary-foreground hover:bg-primary-light/20"
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    {displayName}
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start text-primary-foreground hover:bg-primary-light/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start text-primary-foreground hover:bg-primary-light/20"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;