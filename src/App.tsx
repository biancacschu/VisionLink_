import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button"; 
import { 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from "./components/ui/sidebar"

// NEW: Import the consolidated sidebar component
import { AppSidebar } from "./components/AppSidebar.tsx"

// Imports with explicit .tsx extensions
import { Dashboard } from "./components/Dashboard.tsx"
import  Tasks  from "./components/Tasks.tsx"
import  CalendarView  from "./components/CalendarView.tsx"
import  FileManagement  from "./components/FileManagement.tsx"
import { Messages } from "./components/Messages.tsx"
import ClientManagement  from "./components/ClientManagement.tsx"
import { Reports } from "./components/Reports.tsx"
import { SearchInterface } from "./components/SearchInterface.tsx"
import  Projects  from "./components/Projects.tsx"
import { Login } from "./components/Login.tsx" 
import { Profile } from "./components/Profile.tsx"
import { StaffManager } from "./components/StaffManager.tsx"

// ✅ FIX 1: Import only the necessary abstraction functions: getToken and clearToken
import { getToken, clearToken } from "./lib/api" 


// --- AppHeader Component (Handles Logout Button) ---
function AppHeader({ handleLogout }: { handleLogout: () => void }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <header className="relative flex h-16 shrink-0 items-center px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="relative z-10">
        <SidebarTrigger className="-ml-1" />
      </div>
      {!isCollapsed && (
        <div className="flex items-center gap-2 ml-2">
          <div className="h-4 w-px bg-sidebar-border" />
          <h1 className="font-medium">DesignStudio Pro</h1>
        </div>
      )}

      {/* Logout Button (aligned right) */}
      <div className="ml-auto flex items-center gap-3">
          <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-sm text-red-500 hover:bg-red-50"
          >
              Log Out
          </Button>
      </div>
    </header>
  )
}


// --- 1. Layout Component for Authenticated Users ---
function AuthenticatedLayout({ handleLogout }: { handleLogout: () => void }) {
    return (
        <div className="flex min-h-screen"> 
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader handleLogout={handleLogout} /> 
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet /> 
                </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
    );
}


// --- 2. Main App Component ---
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    // ✅ FIX 2: Add a loading state for the authentication check
    const [isAuthChecking, setIsAuthChecking] = useState(true); 
    const navigate = useNavigate();
    
    // 1. Initial Check on mount
    useEffect(() => { 
        // Run the check to see if a token exists
        if (getToken()) { 
            setIsAuthenticated(true); 
        } 
        // ✅ FIX 3: Once the check is complete, set the checking state to false
        setIsAuthChecking(false);
    }, [])
    
    // handleLogin just updates state (token saving is in lib/api.ts)
    const handleLogin = () => {
        setIsAuthenticated(true); 
        navigate('/dashboard', { replace: true });
    }

    // Logout Function
    const handleLogout = () => {
        // Correctly abstracts to clearToken() which uses sessionStorage
        clearToken(); 
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    };

    // ✅ FIX 4: Show a simple loading screen while the check is running
    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading session...</p>
            </div>
        );
    }

    // Use a single <Routes> block for all navigation logic
    return (
        <Routes>
            {/* 1. The public login route */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} /> 

            {/* 2. The main Authenticated Layout route */}
            <Route 
                path="/" 
                element={isAuthenticated ? <AuthenticatedLayout handleLogout={handleLogout} /> : <Navigate to="/login" replace />}
            >
                {/* 3. Nested Protected Routes */}
                
                {/* Redirect the base path '/' to '/dashboard' */}
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* Actual Content Routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="files" element={<FileManagement />} />
                <Route path="messages" element={<Messages />} />
                <Route path="clients" element={<ClientManagement />} />
                <Route path="projects" element={<Projects />} />
                <Route path="reports" element={<Reports />} />
                <Route path="search" element={<SearchInterface />} />
                <Route path="profile" element={<Profile />} />
                <Route path="staff" element={<StaffManager />} />

                {/* Catch-all: If user types an unknown path, redirect to dashboard */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />

            </Route>
            
            {/* 4. Global fallback for any route not caught above (sends unauthenticated users to login) */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}