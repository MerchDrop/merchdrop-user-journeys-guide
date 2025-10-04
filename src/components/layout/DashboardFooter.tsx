import React from 'react';
import { Link } from 'react-router-dom';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="px-6 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between text-sm text-muted-foreground">
        <p className="text-xs sm:text-sm">
          © {currentYear} MerchDrop. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <Link to="/support" className="hover:text-foreground transition-colors">
            Support
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
