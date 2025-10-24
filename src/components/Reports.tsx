import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { Download, Calendar, TrendingUp, TrendingDown, Users, DollarSign, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"

const projectStatusData = [
  { name: "Completed", value: 45, color: "#22c55e" },
  { name: "In Progress", value: 35, color: "#3b82f6" },
  { name: "On Hold", value: 15, color: "#f59e0b" },
  { name: "Cancelled", value: 5, color: "#ef4444" },
]

const monthlyRevenueData = [
  { month: "Jan", revenue: 45000, projects: 8 },
  { month: "Feb", revenue: 52000, projects: 10 },
  { month: "Mar", revenue: 48000, projects: 9 },
  { month: "Apr", revenue: 61000, projects: 12 },
  { month: "May", revenue: 55000, projects: 11 },
  { month: "Jun", revenue: 67000, projects: 14 },
]

const teamProductivityData = [
  { name: "Sarah Chen", completed: 12, inProgress: 3, efficiency: 85 },
  { name: "Mike Johnson", completed: 10, inProgress: 4, efficiency: 78 },
  { name: "Emily Rodriguez", completed: 8, inProgress: 2, efficiency: 92 },
  { name: "David Kim", completed: 11, inProgress: 5, efficiency: 75 },
  { name: "Alex Thompson", completed: 7, inProgress: 3, efficiency: 88 },
  { name: "Lisa Wang", completed: 9, inProgress: 1, efficiency: 95 },
]

const clientDistributionData = [
  { industry: "Private Clients", clients: 12, revenue: 380000 },
  { industry: "Hospitality", clients: 6, revenue: 520000 },
  { industry: "Commercial", clients: 8, revenue: 295000 },
  { industry: "Retail", clients: 4, revenue: 175000 },
  { industry: "Restaurant", clients: 3, revenue: 150000 },
]

const taskCompletionData = [
  { week: "Week 1", completed: 45, total: 52 },
  { week: "Week 2", completed: 38, total: 45 },
  { week: "Week 3", completed: 52, total: 58 },
  { week: "Week 4", completed: 41, total: 48 },
]

export function Reports() {
  const [timeRange, setTimeRange] = useState("6months")
  const [reportType, setReportType] = useState("overview")

  const kpiData = [
    {
      title: "Total Revenue",
      value: "R1,520,000",
      change: "+18.5%",
      changeType: "positive",
      icon: DollarSign,
      description: "vs last quarter",
    },
    {
      title: "Active Projects",
      value: "12",
      change: "+2",
      changeType: "positive", 
      icon: FileText,
      description: "vs last month",
    },
    {
      title: "Rooms Designed",
      value: "87",
      change: "+23%",
      changeType: "positive",
      icon: CheckCircle2,
      description: "vs last month",
    },
    {
      title: "Design Efficiency",
      value: "92%",
      change: "+3%",
      changeType: "positive",
      icon: TrendingUp,
      description: "vs last month",
    },
    {
      title: "Client Satisfaction",
      value: "4.9/5",
      change: "+0.1",
      changeType: "positive",
      icon: Users,
      description: "average rating",
    },
    {
      title: "Pending Approvals",
      value: "4",
      change: "-2",
      changeType: "positive",
      icon: AlertCircle,
      description: "vs last week",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track design project progress, team performance, and business metrics</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => {
          const IconComponent = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className={`flex items-center ${
                    kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {kpi.change}
                  </span>
                  <span>{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
          <TabsTrigger value="team" className="text-xs sm:text-sm">Team</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs sm:text-sm">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue and project count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? `R${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Projects'
                    ]} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {projectStatusData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs sm:text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Completion Rate</CardTitle>
              <CardDescription>Weekly task completion trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                  <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Projects by completion date</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Projects"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <CardDescription>Current project status overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">On Track</span>
                    <span className="text-sm font-medium">12 projects</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">At Risk</span>
                    <span className="text-sm font-medium">4 projects</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Behind Schedule</span>
                    <span className="text-sm font-medium">2 projects</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Profitability</CardTitle>
              <CardDescription>Revenue by project type and client</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clientDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="industry" 
                    fontSize={12} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `R${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Clients'
                  ]} />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Individual team member performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamProductivityData.map((member) => (
                  <div key={member.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="outline">
                          {member.completed} completed
                        </Badge>
                        <Badge variant="secondary">
                          {member.inProgress} in progress
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {member.efficiency}% efficiency
                      </span>
                    </div>
                    <Progress value={member.efficiency} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Tasks by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={teamProductivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      fontSize={10}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                    <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Workload</CardTitle>
                <CardDescription>Current task allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamProductivityData.slice(0, 4).map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <span className="text-sm">{member.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20">
                        <Progress value={(member.inProgress / 6) * 100} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {member.inProgress}/6
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Industry</CardTitle>
                <CardDescription>Client revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={clientDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="industry" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `R${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Acquisition</CardTitle>
                <CardDescription>New clients over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="New Clients"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>Highest value clients and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientDistributionData.map((client) => (
                  <div key={client.industry} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm sm:text-base">{client.industry} Clients</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{client.clients} active clients</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-medium text-primary text-sm sm:text-base">
                        R{client.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Avg: R{Math.round(client.revenue / client.clients).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}




