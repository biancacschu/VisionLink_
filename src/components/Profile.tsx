import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { User, Mail, Phone, MapPin, Briefcase, Settings, Bell, Shield, Palette, Camera } from "lucide-react"

export function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.designer@designstudio.com",
    phone: "(555) 123-4567",
    title: "Senior Interior Designer",
    bio: "Passionate interior designer with 8+ years of experience creating beautiful, functional spaces. Specializing in residential design with a focus on sustainable materials and modern aesthetics.",
    location: "San Francisco, CA",
    expertise: ["Residential Design", "Space Planning", "Color Theory", "Sustainable Design"],
    certifications: ["NCIDQ Certified", "LEED AP ID+C"],
    timezone: "Pacific Time (PT)"
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    clientMessages: true,
    deadlineReminders: true,
    teamMentions: false
  })

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileUpdate("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileUpdate("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileUpdate("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleProfileUpdate("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Details
              </CardTitle>
              <CardDescription>
                Manage your professional information and specializations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => handleProfileUpdate("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={profileData.timezone} onValueChange={(value) => handleProfileUpdate("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pacific Time (PT)">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Mountain Time (MT)">Mountain Time (MT)</SelectItem>
                    <SelectItem value="Central Time (CT)">Central Time (CT)</SelectItem>
                    <SelectItem value="Eastern Time (ET)">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expertise Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      <Palette className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">+ Add Expertise</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">+ Add Certification</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when projects are updated
                    </p>
                  </div>
                  <Switch
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("projectUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Client Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new client messages
                    </p>
                  </div>
                  <Switch
                    checked={notifications.clientMessages}
                    onCheckedChange={(checked) => handleNotificationChange("clientMessages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming project deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deadlineReminders}
                    onCheckedChange={(checked) => handleNotificationChange("deadlineReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Team Mentions</Label>
                    <p className="text-sm text-muted-foreground">
                      When someone mentions you in comments
                    </p>
                  </div>
                  <Switch
                    checked={notifications.teamMentions}
                    onCheckedChange={(checked) => handleNotificationChange("teamMentions", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  Download Account Data
                </Button>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}


