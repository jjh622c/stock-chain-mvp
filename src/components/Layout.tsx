import { ReactNode } from "react";
import BottomTabNavigation from "./BottomTabNavigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding to account for fixed tab bar */}
      <div className="pb-20">
        {children}
      </div>
      
      {/* Fixed bottom tab navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default Layout;