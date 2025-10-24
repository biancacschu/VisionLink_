import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Users, UserPlus, Mail, Phone, MapPin, Calendar, MoreHorizontal, Edit, Trash2, Shield, Activity, DollarSign, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  phone: string
  location: string
  projectsActive: number
  hourlyRate: number
  avatar?: string
}

export function StaffManager() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.designer@designstudio.com",
      role: "Senior Interior Designer",
      department: "Design",
      status: "active",
      joinDate: "2023-01-15",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      projectsActive: 8,
      hourlyRate: 85
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@designstudio.com",
      role: "Project Manager",
      department: "Operations",
      status: "active",
      joinDate: "2023-03-20",
      phone: "(555) 234-5678",
      location: "Los Angeles, CA",
      projectsActive: 12,
      hourlyRate: 75
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      email: "emma.rodriguez@designstudio.com",
      role: "Junior Designer",
      department: "Design",
      status: "active",
      joinDate: "2024-06-01",
      phone: "(555) 345-6789",
      location: "San Diego, CA",
      projectsActive: 4,
      hourlyRate: 55
    },
    {
      id: "4",
      name: "David Thompson",
      email: "david.thompson@designstudio.com",
      role: "Design Consultant",
      department: "Design",
      status: "inactive",
      joinDate: "2022-11-10",
      phone: "(555) 456-7890",
      location: "Sacramento, CA",
      projectsActive: 0,
      hourlyRate: 90
    },
    {
      id: "5",
      name: "Lisa Park",
      email: "lisa.park@designstudio.com",
      role: "Material Coordinator",
      department: "Procurement",
      status: "pending",
      joinDate: "2025-01-01",
      phone: "(555) 567-8901",
      location: "Oakland, CA",
      projectsActive: 0,
      hourlyRate: 45
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredStaff = staffMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || member.role === filterRole
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Design":
        return "bg-purple-100 text-purple-800"
      case "Operations":
        return "bg-blue-100 text-blue-800"
      case "Procurement":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalActiveStaff = staffMembers.filter(m => m.status === "active").length
  const totalProjects = staffMembers.reduce((sum, m) => sum + m.projectsActive, 0)
  const avgHourlyRate = Math.round(staffMembers.reduce((sum, m) => sum + m.hourlyRate, 0) / staffMembers.length)

  return (
    <div className="space-y-6">
      <div>
        <h1>Staff Manager</h1>
        <p className="text-muted-foreground">
          Manage your interior design team and their assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm font-medium">Total Staff</span>
            </div>
            <div className="text-2xl font-bold">{staffMembers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm font-medium">Active Staff</span>
            </div>
            <div className="text-2xl font-bold">{totalActiveStaff}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm font-medium">Active Projects</span>
            </div>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm font-medium">Avg. Rate</span>
            </div>
            <div className="text-2xl font-bold">R{avgHourlyRate}/hr</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team">Team Directory</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your interior design team
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Staff Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>
                        Add a new team member to your interior design studio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john.doe@designstudio.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="senior-designer">Senior Interior Designer</SelectItem>
                            <SelectItem value="junior-designer">Junior Designer</SelectItem>
                            <SelectItem value="project-manager">Project Manager</SelectItem>
                            <SelectItem value="design-consultant">Design Consultant</SelectItem>
                            <SelectItem value="material-coordinator">Material Coordinator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="procurement">Procurement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddDialogOpen(false)}>
                        Add Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="sm:max-w-sm"
                />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Senior Interior Designer">Senior Designer</SelectItem>
                    <SelectItem value="Junior Designer">Junior Designer</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Design Consultant">Consultant</SelectItem>
                    <SelectItem value="Material Coordinator">Coordinator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Projects</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.role}</div>
                            <Badge variant="outline" className={getDepartmentColor(member.department)}>
                              {member.department}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(member.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            {member.projectsActive}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            {member.hourlyRate}/hr
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Manage role-based access control for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Senior Interior Designer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>â€¢ Full project management access</li>
                        <li>â€¢ Client communication</li>
                        <li>â€¢ Material selection approval</li>
                        <li>â€¢ Team supervision</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Project Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>â€¢ Project timeline management</li>
                        <li>â€¢ Resource allocation</li>
                        <li>â€¢ Budget oversight</li>
                        <li>â€¢ Team coordination</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Junior Designer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>â€¢ Design task execution</li>
                        <li>â€¢ Basic project access</li>
                        <li>â€¢ Material research</li>
                        <li>â€¢ Collaborative design work</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Material Coordinator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>â€¢ Inventory management</li>
                        <li>â€¢ Vendor relationships</li>
                        <li>â€¢ Purchase coordination</li>
                        <li>â€¢ Delivery scheduling</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Analytics</CardTitle>
              <CardDescription>
                Performance metrics and team insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">92%</div>
                    <div className="text-sm text-muted-foreground">Team Utilization</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Avg Client Rating</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-muted-foreground">Projects This Month</div>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed analytics dashboard coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


