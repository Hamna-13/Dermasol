import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-professional">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-primary-light/20">
          <Link to="/" className="flex items-center space-x-2">
  <img 
    src="/logo.png" 
    alt="Dermasol" 
    className="h-10 w-auto" 
  />
  <div className="flex flex-col">
    <span className="text-xl font-bold text-primary-foreground">Dermasol</span>
    <span className="text-xs opacity-90 text-primary-foreground">AI Dermatology</span>
  </div>
</Link>

          
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-70" />
              <Input 
                type="search" 
                placeholder="Search conditions, symptoms..." 
                className="pl-10 bg-primary-foreground/10 border-primary-light/30 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm opacity-90">{user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-primary-foreground hover:bg-primary-light/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-primary-foreground hover:bg-primary-light/20"
              >
                Login
              </Button>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Main navigation */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 py-2">
            <Link 
              to="/" 
              className="py-2 px-3 hover:bg-primary-light/20 rounded transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/analysis" 
              className="py-2 px-3 hover:bg-primary-light/20 rounded transition-colors"
            >
              Skin Analysis
            </Link>
            <Link 
              to="/conditions" 
              className="py-2 px-3 hover:bg-primary-light/20 rounded transition-colors"
            >
              Conditions
            </Link>
            <Link 
              to="/about" 
              className="py-2 px-3 hover:bg-primary-light/20 rounded transition-colors"
            >
              About
            </Link>
            {isAuthenticated && (
              <Link 
                to="/history" 
                className="py-2 px-3 hover:bg-primary-light/20 rounded transition-colors"
              >
                History
              </Link>
            )}
            <div className="md:hidden py-2">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary-foreground hover:bg-primary-light/20"
                  onClick={() => {
                    logout();
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout ({user?.name})
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary-foreground hover:bg-primary-light/20"
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
