import { 
    Calendar, 
    Files, 
    Home, 
    MessageSquare, 
    Search, 
    Settings, 
    BarChart3, 
    Users, 
    CheckSquare,
    Folder, // Added Folder (Projects)
    User,   // Added User (Profile)
    Shield  // Added Shield (Staff Manager)
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"; 

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader, // Added Header for Title/Subtitle
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

// --- Consolidated Navigation Items (including Projects, Profile, Staff) ---
const mainItems = [
  { title: "Dashboard", view: "dashboard", icon: Home },
  { title: "Tasks", view: "tasks", icon: CheckSquare },
  { title: "Projects", view: "projects", icon: Folder }, // From App.tsx list
  { title: "Calendar", view: "calendar", icon: Calendar },
  { title: "Files", view: "files", icon: Files },
  { title: "Messages", view: "messages", icon: MessageSquare },
  { title: "Clients", view: "clients", icon: Users },
  // REMOVED: { title: "Reports", view: "reports", icon: BarChart3 },
  { title: "Search", view: "search", icon: Search },
  { title: "Profile", view: "profile", icon: User }, // From App.tsx list
  { title: "Staff Manager", view: "staff", icon: Shield }, // From App.tsx list
];

// --- Main Exported Sidebar Component ---
export function AppSidebar() {
  const location = useLocation(); 
  
  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
            {/* Adapted Header from App.tsx */}
            <div className="flex flex-col space-y-1 group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200 ease-linear">
                <h2 className="text-lg font-medium">DesignStudio Pro</h2>
                <p className="text-xs text-muted-foreground">Interior Design Management</p>
            </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="space-y-0"> 
              {mainItems.map((item) => {
                    const IconComponent = item.icon
                    // Use location.pathname.startsWith to handle potential sub-routes gracefully
                    const isActive = location.pathname.startsWith(`/${item.view}`);

                    return (
                        <SidebarMenuItem key={item.view}>
                            <Link to={`/${item.view}`} className="w-full">
                                <SidebarMenuButton 
                                    isActive={isActive}
                                    tooltip={item.title}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu className="space-y-0"> 
                {/* Standard Settings link */}
            <SidebarMenuItem>
              <Link to="/settings" className="w-full">
                    <SidebarMenuButton 
                        isActive={location.pathname.startsWith('/settings')}
                        tooltip="Settings"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
                {/* Copyright info from App.tsx */}
                <div className="text-xs text-muted-foreground p-2 group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200 ease-linear">
                    © 2025 DesignStudio Pro
                </div>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}