
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
      <div className="text-center glass-panel p-8 max-w-md animate-fade-in mx-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <span className="text-3xl font-bold">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
