import { useState, useEffect } from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from "./components/ui/sidebar"
import { Dashboard } from "./components/Dashboard"
import  Tasks  from "./components/Tasks"
import  CalendarView  from "./components/CalendarView"
import  FileManagement  from "./components/FileManagement"
import { Messages } from "./components/Messages"
import ClientManagement  from "./components/ClientManagement"
import { Reports } from "./components/Reports"
import { SearchInterface } from "./components/SearchInterface"
import  Projects  from "./components/Projects"
import { Login } from "./components/Login"
import { Profile } from "./components/Profile"
import { StaffManager } from "./components/StaffManager"
import { Home, CheckSquare, Folder, Calendar, Files, MessageSquare, Users, BarChart3, Search, User, Shield } from "lucide-react"

function AppHeader() {
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
    </header>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  useEffect(() => { if (localStorage.getItem('vl_token')) setIsAuthenticated(true); }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "tasks":
        return <Tasks />
      case "calendar":
        return <CalendarView />
      case "files":
        return <FileManagement />
      case "messages":
        return <Messages />
      case "clients":
        return <ClientManagement />
      case "projects":
        return <Projects />
      case "reports":
        return <Reports />
      case "search":
        return <SearchInterface />
      case "profile":
        return <Profile />
      case "staff":
        return <StaffManager />
      default:
        return <Dashboard />
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <SidebarProvider>
      <AppSidebarComponent 
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderCurrentView()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Mobile-friendly sidebar component using shadcn components
function AppSidebarComponent({ 
  onNavigate, 
  currentView 
}: { 
  onNavigate: (view: string) => void
  currentView: string 
}) {
  const items = [
    {
      title: "Dashboard",
      view: "dashboard",
      icon: Home,
    },
    {
      title: "Tasks",
      view: "tasks", 
      icon: CheckSquare,
    },
    {
      title: "Projects",
      view: "projects",
      icon: Folder,
    },
    {
      title: "Calendar",
      view: "calendar",
      icon: Calendar,
    },
    {
      title: "Files",
      view: "files",
      icon: Files,
    },
    {
      title: "Messages",
      view: "messages",
      icon: MessageSquare,
    },
    {
      title: "Clients",
      view: "clients",
      icon: Users,
    },
    {
      title: "Reports",
      view: "reports",
      icon: BarChart3,
    },
    {
      title: "Search",
      view: "search",
      icon: Search,
    },
    {
      title: "Profile",
      view: "profile",
      icon: User,
    },
    {
      title: "Staff Manager",
      view: "staff", 
      icon: Shield,
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col space-y-1 group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200 ease-linear">
          <h2 className="text-lg font-medium">DesignStudio Pro</h2>
          <p className="text-xs text-muted-foreground">Interior Design Management</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const IconComponent = item.icon
              return (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    isActive={currentView === item.view}
                    onClick={() => onNavigate(item.view)}
                    tooltip={item.title}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground p-2 group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200 ease-linear">
          © 2025 DesignStudio Pro
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


