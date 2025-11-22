import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Settings, Database, Activity, Plus, UserPlus, Loader2, Eye, EyeOff, Search, Edit } from "lucide-react";
import { toast } from "sonner";
import { mockFirestore } from "@/lib/mockFirebase";
// Real Firebase imports for authentication
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// User interface following StockMaster specification
interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // computed from firstName + lastName
  email: string;
  role: 'admin' | 'inventory_manager' | 'warehouse_staff';
  department: string;
  location?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "warehouse_staff" as 'admin' | 'inventory_manager' | 'warehouse_staff',
    department: "",
    location: "",
    phone: "",
  });

  // StockMaster roles and departments as per specification
  const stockMasterRoles = [
    { value: 'admin', label: 'Admin', description: 'Full system access, user management' },
    { value: 'inventory_manager', label: 'Inventory Manager', description: 'Manage incoming & outgoing stock' },
    { value: 'warehouse_staff', label: 'Warehouse Staff', description: 'Perform transfers, picking, shelving, counting' }
  ];

  const departments = [
    'Warehouse Operations',
    'Inventory Management', 
    'Supply Chain',
    'Quality Control',
    'Logistics',
    'Administration'
  ];

  const locations = [
    'Main Warehouse',
    'Secondary Warehouse', 
    'Production Floor',
    'Shipping Dock',
    'Receiving Area',
    'Storage Room'
  ];

  const handleUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const generateUserActivity = (user: User) => {
    return [
      { action: 'Login', timestamp: new Date(Date.now() - 1000 * 60 * 30), details: 'Successful login from 192.168.1.100' },
      { action: 'Product Added', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: 'Added product: Sample Item XYZ' },
      { action: 'Receipt Created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), details: 'Created receipt RCP-2024-001' },
      { action: 'Profile Updated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'Updated contact information' }
    ];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use mock Firebase for development
      const result = await mockFirestore.collection('users').orderBy('created_at', 'desc').get();
      
      const userData = result.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || data.name?.split(' ')[0] || '',
          lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          role: data.role,
          department: data.department,
          location: data.location,
          phone: data.phone,
          status: data.status || 'active',
          created_at: data.created_at?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toISOString(),
          last_login: data.last_login?.toISOString()
        };
      }) as User[];
      
      setUsers(userData);
      if (userData.length > 0) {
        toast.success(`Loaded ${userData.length} users from Firebase`);
      } else {
        toast.info('No users found - Firebase collection is empty');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError('Failed to connect to Firebase');
      toast.error('Failed to load users from Firebase');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "warehouse_staff",
      department: "",
      location: "",
      phone: "",
    });
  };

  const validateForm = () => {
    if (!newUser.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!newUser.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!newUser.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!newUser.password || newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!newUser.role) {
      toast.error('Role is required');
      return false;
    }
    if (!newUser.department.trim()) {
      toast.error('Department is required');
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setIsCreating(true);
      setError(null);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUser.email.trim(), 
        newUser.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      const userData = {
        uid: firebaseUser.uid,
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        name: `${newUser.firstName.trim()} ${newUser.lastName.trim()}`,
        email: newUser.email.trim(),
        role: newUser.role,
        department: newUser.department.trim(),
        location: newUser.location.trim() || null,
        phone: newUser.phone.trim() || null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: auth.currentUser?.uid || 'admin'
      };

      // Store in Firestore with user's UID as document ID
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // Also store in mock Firebase for development consistency
      await mockFirestore.collection('users').add({
        ...userData,
        firebase_uid: firebaseUser.uid
      });
      
      console.log(`✅ User created successfully:`, {
        firebaseAuth: firebaseUser.uid,
        firestoreDoc: userData
      });

      toast.success(
        `User "${newUser.firstName} ${newUser.lastName}" created successfully!\n` +
        `Firebase Auth UID: ${firebaseUser.uid}\n` +
        `Stored in Firestore and can now log in.`
      );
      
      resetForm();
      setIsDialogOpen(false);
      await loadUsers(); // Reload users list
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak (minimum 6 characters)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "suspended": return "destructive";
      default: return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin": return "destructive";
      case "inventory_manager": return "default";
      case "warehouse_staff": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <Shield className="h-8 w-8" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-white/90 mt-3 text-lg">
                Manage users, roles, and system settings with enterprise-grade controls
                {error && (
                  <span className="block text-yellow-200 text-sm mt-1 font-medium">⚠️ {error}</span>
                )}
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg font-semibold">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with Firebase authentication and system access.
                  </DialogDescription>
                </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={newUser.role} onValueChange={(value) => handleInputChange('role', value as 'admin' | 'inventory_manager' | 'warehouse_staff')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select StockMaster role" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockMasterRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={newUser.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={newUser.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards with Gradients */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <Shield className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold">{new Set(users.map(u => u.department)).size}</p>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <Database className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage StockMaster users, roles, and permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {stockMasterRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div>
                        <p className="text-muted-foreground">No users found in database.</p>
                        <p className="text-sm text-muted-foreground mt-1">Click "Add User" to create your first user.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role) as any}>
                          {stockMasterRoles.find(r => r.value === user.role)?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status) as any}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleUserDetails(user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* User Details Dialog */}
          {selectedUser && (
            <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>User Details - {selectedUser.name}</DialogTitle>
                  <DialogDescription>
                    Complete user information and activity history
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Role</Label>
                      <p className="font-medium">{stockMasterRoles.find(r => r.value === selectedUser.role)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Department</Label>
                      <p className="font-medium">{selectedUser.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge variant={getStatusBadgeVariant(selectedUser.status) as any}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">Recent Activity</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {generateUserActivity(selectedUser).map((activity, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;