// src/components/StaffManager.tsx
import { useEffect, useState } from "react";
import { fetchStaff, createStaffMember, getToken } from "../lib/api";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  phone: string;
  location: string;
  projectsActive: number;
  avatar?: string | null;
}

interface NewStaffFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

// Helper: decode JWT and extract email
function getCurrentUserEmailFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);
    // Adjust keys if your token uses different claim names
    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
}

// Helper: map API response to StaffMember
function mapStaffFromApi(s: any): StaffMember {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    department: s.department,
    status: s.status,
    joinDate: s.joinDate ?? s.join_date ?? "",
    phone: s.phone ?? "",
    location: s.location ?? "",
    projectsActive: s.projectsActive ?? s.projects_active ?? 0,
    avatar: s.avatar ?? s.avatar_url ?? null,
  };
}

const initialNewStaff: NewStaffFormState = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  department: "Design",
};

export function StaffManager() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaffFormState>(initialNewStaff);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch staff from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStaff() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStaff();
        if (!isMounted) return;
        setStaffMembers((data as any[]).map(mapStaffFromApi));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load staff");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentUserEmail = getCurrentUserEmailFromToken();
  const currentUser =
    currentUserEmail &&
    staffMembers.find(
      (m) =>
        m.email &&
        m.email.toLowerCase() === currentUserEmail.toLowerCase()
    );

  const filteredStaff = staffMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 text-yellow-800"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Design":
        return "bg-purple-100 text-purple-800";
      case "Operations":
        return "bg-blue-100 text-blue-800";
      case "Procurement":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalActiveStaff = staffMembers.filter(
    (m) => m.status === "active"
  ).length;
  const totalProjects = staffMembers.reduce(
    (sum, m) => sum + (m.projectsActive || 0),
    0
  );
  const avgProjectsPerStaff =
    staffMembers.length > 0
      ? Math.round((totalProjects / staffMembers.length) * 10) / 10
      : 0;

  const roleOptions = Array.from(new Set(staffMembers.map((s) => s.role))).sort();

  // --- Add Staff submit handler (POST /api/staff) ---
  async function handleAddStaffSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaff.firstName.trim() || !newStaff.email.trim() || !newStaff.role) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        email: newStaff.email.trim(),
        role: newStaff.role,
        department: newStaff.department || "Design",
        status: "active",
      };

      const created = await createStaffMember(payload);
      const mapped = mapStaffFromApi(created);

      setStaffMembers((prev) => [...prev, mapped]);
      setNewStaff(initialNewStaff);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Staff Manager</h1>
        <p className="text-muted-foreground">Loading team data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1>Staff Manager</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Staff Manager</h1>
        <p className="text-muted-foreground">
          Manage your interior design team and their assignments
        </p>
      </div>

      {/* Optional: show current user summary */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Based on the currently logged-in account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{currentUser.name}</div>
              <div className="text-sm text-muted-foreground">
                {currentUser.email}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentUser.role} · {currentUser.department}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm font-medium">
                Avg. Projects / Staff
              </span>
            </div>
            <div className="text-2xl font-bold">{avgProjectsPerStaff}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team">Team Directory</TabsTrigger>
          <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* TEAM TAB */}
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
                    <form className="space-y-4 py-4" onSubmit={handleAddStaffSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={newStaff.firstName}
                            onChange={(e) =>
                              setNewStaff((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={newStaff.lastName}
                            onChange={(e) =>
                              setNewStaff((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@studio.com"
                          value={newStaff.email}
                          onChange={(e) =>
                            setNewStaff((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newStaff.role}
                          onValueChange={(value) =>
                            setNewStaff((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                            {roleOptions.length === 0 && (
                              <SelectItem value="Interior Designer">
                                Interior Designer
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={newStaff.department}
                          onValueChange={(value) =>
                            setNewStaff((prev) => ({
                              ...prev,
                              department: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Procurement">
                              Procurement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            setNewStaff(initialNewStaff);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Adding..." : "Add Member"}
                        </Button>
                      </div>
                    </form>
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
                <Select
                  value={filterRole}
                  onValueChange={(value) => setFilterRole(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value)}
                >
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
                      <TableHead>Role &amp; Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Projects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar ?? undefined} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {member.name}
                                {currentUser &&
                                  member.id === currentUser.id && (
                                    <Badge variant="outline">You</Badge>
                                  )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.role}</div>
                            <Badge
                              variant="outline"
                              className={getDepartmentColor(
                                member.department
                              )}
                            >
                              {member.department}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            {member.projectsActive}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
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

        {/* Roles + Analytics tabs unchanged (static for now) */}
        {/* ... */}
      </Tabs>
    </div>
  );
}
