import { Calendar, Files, Home, MessageSquare, Search, Settings, BarChart3, Users, CheckSquare,  } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "#tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    url: "#calendar",
    icon: Calendar,
  },
  {
    title: "Files",
    url: "#files",
    icon: Files,
  },
  {
    title: "Messages",
    url: "#messages",
    icon: MessageSquare,
  },
  {
    title: "Clients",
    url: "#clients",
    icon: Users,
  },
  {
    title: "Reports",
    url: "#reports",
    icon: BarChart3,
  },
  {
    title: "Search",
    url: "#search",
    icon: Search,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>DesignStudio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}


