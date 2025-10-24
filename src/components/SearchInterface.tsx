import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { Search, Filter, FileText, MessageSquare, Users, Calendar, CheckSquare, File, Image, Video, Clock, User, Hash, ExternalLink } from "lucide-react"

// Mock search data
const searchResults = [
  {
    id: 1,
    type: "file",
    title: "Homepage_Mockup_v3.fig",
    description: "Latest homepage design with client feedback incorporated",
    content: "Design file for website redesign project including new color scheme and improved user flow",
    project: "Website Redesign",
    author: "Sarah Chen",
    date: "2025-03-02",
    category: "Design Files",
  },
  {
    id: 2,
    type: "message",
    title: "Client feedback discussion in #website-redesign",
    description: "Hey team! I've just uploaded the latest homepage mockups...",
    content: "Discussion about client feedback and next steps for the homepage redesign",
    project: "Website Redesign",
    author: "Sarah Chen",
    date: "2025-03-01",
    category: "Messages",
  },
  {
    id: 3,
    type: "task",
    title: "Update mobile responsive design",
    description: "Adjust mobile breakpoints for hero section based on feedback",
    content: "Task assigned to update mobile responsive design elements",
    project: "Website Redesign",
    author: "Mike Johnson",
    date: "2025-02-28",
    category: "Tasks",
  },
  {
    id: 4,
    type: "client",
    title: "TechCorp Inc.",
    description: "Technology company - Active client since August 2024",
    content: "Client information including contact details and project history",
    project: "Multiple Projects",
    author: "System",
    date: "2024-08-15",
    category: "Clients",
  },
  {
    id: 5,
    type: "calendar",
    title: "Project Kickoff Meeting",
    description: "Initial project discussion and requirements gathering",
    content: "Meeting scheduled for March 5th at 10:00 AM with TechCorp team",
    project: "Website Redesign",
    author: "Lisa Wang",
    date: "2025-03-05",
    category: "Calendar",
  },
  {
    id: 6,
    type: "file",
    title: "Project_Requirements.pdf",
    description: "Updated project requirements document with scope changes",
    content: "Complete project requirements including technical specifications and deliverables",
    project: "Website Redesign",
    author: "Mike Johnson",
    date: "2025-02-28",
    category: "Documents",
  },
]

const recentSearches = [
  "website mockups",
  "client feedback",
  "TechCorp",
  "Sarah Chen tasks",
  "March meetings",
]

const searchSuggestions = [
  "homepage design",
  "project requirements",
  "team meetings this week",
  "overdue tasks",
  "client communications",
]

export function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [results, setResults] = useState(searchResults)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setResults(searchResults)
      return
    }

    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      const filtered = searchResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.author.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setIsSearching(false)
    }, 300)
  }

  const filteredResults = results.filter(result => {
    const matchesType = typeFilter === "all" || result.type === typeFilter
    const matchesProject = projectFilter === "all" || result.project === projectFilter
    return matchesType && matchesProject
  })

  const getResult = (type: string) => {
    switch(type) {
      case 'file': return FileText
      case 'message': return MessageSquare
      case 'task': return CheckSquare
      case 'client': return Users
      case 'calendar': return Calendar
      default: return File
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'file': return 'default'
      case 'message': return 'secondary'
      case 'task': return 'outline'
      case 'client': return 'destructive'
      case 'calendar': return 'default'
      default: return 'outline'
    }
  }

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const projects = ["Website Redesign", "Mobile App Development", "Brand Identity", "E-commerce Platform"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Search</h1>
        <p className="text-muted-foreground">Find files, messages, tasks, clients, and more across your projects</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search across all your projects..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Filters and Suggestions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="file">Files</SelectItem>
                    <SelectItem value="message">Messages</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {!searchQuery && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2"
                        onClick={() => handleSearch(search)}
                      >
                        <Clock className="h-4 w-4 mr-2 opacity-50" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2"
                        onClick={() => handleSearch(suggestion)}
                      >
                        <Search className="h-4 w-4 mr-2 opacity-50" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {searchQuery && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Found {filteredResults.length} results for "{searchQuery}"
                </p>
              </div>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="author">By Author</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            {filteredResults.map((result) => {
              const IconComponent = getResult(result.type)
              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-lg leading-tight">
                            {highlightSearchTerm(result.title, searchQuery)}
                          </h3>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant={getTypeColor(result.type)}>
                              {result.category}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground">
                          {highlightSearchTerm(result.description, searchQuery)}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {result.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{result.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />

                            <span>{result.date}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.project}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredResults.length === 0 && searchQuery && (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="py-12">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchSuggestions.slice(0, 3).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearch(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!searchQuery && (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="py-12">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start searching</h3>
                  <p className="text-muted-foreground">
                    Search across files, messages, tasks, clients, and calendar events
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


