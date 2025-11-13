import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Settings,
  Bell,
  Shield,
  Palette,
  Camera,
} from "lucide-react";

import { fetchStaff, getToken } from "../lib/api";

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  location: string;
  expertise: string[];
  certifications: string[];
  timezone: string;
}

interface NotificationsState {
  emailNotifications: boolean;
  projectUpdates: boolean;
  clientMessages: boolean;
  deadlineReminders: boolean;
  teamMentions: boolean;
}

// Decode JWT from sessionStorage and extract the email claim
function getCurrentUserEmailFromToken(): string | null {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadBase64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/"); // base64url -> base64

    const json = atob(payloadBase64);
    const payload = JSON.parse(json);

    // Adjust these if your token uses different claim names
    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
}

export function Profile() {
  const [profileData, setProfileData] = useState<ProfileState>({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.designer@designstudio.com",
    phone: "",
    title: "",
    bio: "Passionate interior designer with experience creating beautiful, functional spaces. Specializing in residential design with a focus on sustainable materials and modern aesthetics.",
    location: "",
    expertise: ["Residential Design", "Space Planning", "Color Theory"],
    certifications: ["NCIDQ Certified"],
    timezone: "Africa/Johannesburg",
  });

  const [notifications, setNotifications] = useState<NotificationsState>({
    emailNotifications: true,
    projectUpdates: true,
    clientMessages: true,
    deadlineReminders: true,
    teamMentions: false,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Hydrate from staff table, matching the logged-in user's email
  useEffect(() => {
    let isMounted = true;

    async function loadProfileFromStaff() {
      try {
        setLoading(true);
        setErr(null);

        const emailFromToken = getCurrentUserEmailFromToken();
        const staffList = (await fetchStaff()) as any[];

        if (!isMounted) return;

        if (!staffList || staffList.length === 0) {
          setLoading(false);
          return;
        }

        let staffMember: any | undefined;
        if (emailFromToken) {
          staffMember = staffList.find(
            (s) =>
              s.email &&
              String(s.email).toLowerCase() === emailFromToken.toLowerCase()
          );
        }

        // Fallback: use first staff record if no match
        if (!staffMember) {
          staffMember = staffList[0];
        }

        if (!staffMember) {
          setLoading(false);
          return;
        }

        const name = staffMember.name || "";
        const parts = name.split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        setProfileData((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: staffMember.email || prev.email,
          phone: staffMember.phone || prev.phone,
          title: staffMember.role || prev.title,
          location: staffMember.location || prev.location,
        }));
      } catch (e: any) {
        if (!isMounted) return;
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfileFromStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileUpdate = (field: keyof ProfileState, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof NotificationsState, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {loading && (
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* PERSONAL TAB */}
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
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
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
                    onChange={(e) =>
                      handleProfileUpdate("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleProfileUpdate("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      handleProfileUpdate("email", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileUpdate("phone", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        handleProfileUpdate("location", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) =>
                    handleProfileUpdate("bio", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFESSIONAL TAB */}
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
                  onChange={(e) =>
                    handleProfileUpdate("title", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={profileData.timezone}
                  onValueChange={(value) =>
                    handleProfileUpdate("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Johannesburg">
                      Africa / Johannesburg
                    </SelectItem>
                    <SelectItem value="Africa/Harare">
                      Africa / Harare
                    </SelectItem>
                    <SelectItem value="Africa/Nairobi">
                      Africa / Nairobi
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Expertise Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      <Palette className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">
                    + Add Expertise
                  </Button>
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
                  <Button variant="outline" size="sm">
                    + Add Certification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(v) =>
                    handleNotificationChange("emailNotifications", v)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Project Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Changes to tasks and project status
                  </p>
                </div>
                <Switch
                  checked={notifications.projectUpdates}
                  onCheckedChange={(v) =>
                    handleNotificationChange("projectUpdates", v)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Client Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Direct messages from clients
                  </p>
                </div>
                <Switch
                  checked={notifications.clientMessages}
                  onCheckedChange={(v) =>
                    handleNotificationChange("clientMessages", v)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deadline Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Upcoming deadlines and milestones
                  </p>
                </div>
                <Switch
                  checked={notifications.deadlineReminders}
                  onCheckedChange={(v) =>
                    handleNotificationChange("deadlineReminders", v)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Team Mentions</p>
                  <p className="text-sm text-muted-foreground">
                    When someone mentions you in a channel
                  </p>
                </div>
                <Switch
                  checked={notifications.teamMentions}
                  onCheckedChange={(v) =>
                    handleNotificationChange("teamMentions", v)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
