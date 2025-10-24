import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "./ui/checkbox"
import { Calendar } from "./ui/calendar";
import { Calendar as CalendarIcon, Plus, X, Users, DollarSign, MapPin, Briefcase  } from "lucide-react";
interface AddProjectFormProps {
  onSubmit: (projectData: any) => void
  onCancel: () => void
}

export function AddProjectForm({ onSubmit, onCancel }: AddProjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    type: "",
    budget: "",
    location: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    priority: "",
    tags: [] as string[],
    teamMembers: [] as string[],
    requirements: {
      spacePlanning: false,
      materialSelection: false,
      colorConsultation: false,
      lightingDesign: false,
      furnitureSelection: false,
      projectManagement: false,
      installationSupervision: false,
      finalStyling: false
    }
  })

  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const projectTypes = [
    "Residential - Single Family",
    "Residential - Multi-Family", 
    "Residential - High-End",
    "Commercial - Office",
    "Commercial - Retail",
    "Commercial - Hospitality",
    "Commercial - Healthcare",
    "Commercial - Educational",
    "Renovation - Kitchen",
    "Renovation - Bathroom",
    "Renovation - Full Home",
    "New Construction",
    "Consultation Only"
  ]

  const priorities = [
    { value: "low", label: "Low Priority", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ]

  const availableTeamMembers = [
    "Sarah Johnson - Senior Designer",
    "Michael Chen - Project Manager", 
    "Emma Rodriguez - Junior Designer",
    "David Thompson - Design Consultant",
    "Lisa Park - Material Coordinator",
    "Rachel Green - Interior Designer",
    "Tom Anderson - Project Manager",
    "Alex Chen - Workplace Designer",
    "Jennifer Lee - Project Director"
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRequirementChange = (requirement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: { ...prev.requirements, [requirement]: checked }
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTeamMemberToggle = (member: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(formData)
      setIsSubmitting(false)
    }, 1500)
  }

  const isFormValid = formData.name && formData.client && formData.type && formData.budget && formData.startDate && formData.endDate

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1>Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new interior design project with all the necessary details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Information
            </CardTitle>
            <CardDescription>
              Enter the basic details about your interior design project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Modern Downtown Apartment"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  placeholder="e.g., John & Jane Smith"
                  value={formData.client}
                  onChange={(e) => handleInputChange("client", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Project Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    placeholder="50,000"
                    className="pl-9"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, State"
                    className="pl-9"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project scope, client requirements, design style preferences, and any special considerations..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Set the start and end dates for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? formData.startDate.toLocaleDateString() : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleInputChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? formData.endDate.toLocaleDateString() : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleInputChange("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Service Requirements</CardTitle>
            <CardDescription>
              Select the design services needed for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.requirements).map(([key, checked]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={checked}
                    onCheckedChange={(checked) => handleRequirementChange(key, checked as boolean)}
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .toLowerCase()
                      .replace(/^\w/, c => c.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Assignment
            </CardTitle>
            <CardDescription>
              Select team members to assign to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableTeamMembers.map((member) => (
                <div key={member} className="flex items-center space-x-2">
                  <Checkbox
                    id={member}
                    checked={formData.teamMembers.includes(member)}
                    onCheckedChange={() => handleTeamMemberToggle(member)}
                  />
                  <Label htmlFor={member} className="cursor-pointer">
                    {member}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Project Tags</CardTitle>
            <CardDescription>
              Add tags to help categorize and search for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., modern, residential, kitchen)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  )
}






