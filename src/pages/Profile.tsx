import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";

const Profile = () => {
  // Mock data - will be replaced with Firebase user data
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "manager",
    department: "Warehouse Operations",
    location: "Main Warehouse",
    joinedDate: "January 15, 2024",
    avatar: "",
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "manager":
        return "bg-primary text-primary-foreground";
      case "staff":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
                <Badge className={getRoleColor(userProfile.role)}>
                  {userProfile.role}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {userProfile.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {userProfile.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {userProfile.joinedDate}
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                Upload New Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-primary p-2">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Doe" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={userProfile.email} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue={userProfile.phone} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" defaultValue={userProfile.department} />
          </div>
          
          <Button className="bg-gradient-primary">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-info to-info/80 p-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>Your access level and capabilities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Current Role</p>
                <p className="text-sm text-muted-foreground capitalize">{userProfile.role}</p>
              </div>
              <Badge className={`${getRoleColor(userProfile.role)} text-base px-4 py-2`}>
                {userProfile.role}
              </Badge>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                As an <span className="font-semibold text-foreground capitalize">{userProfile.role}</span>, you have access to:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• View and manage inventory</li>
                <li>• Create and process orders</li>
                <li>• Generate reports and analytics</li>
                {userProfile.role === 'admin' && <li>• Manage users and permissions</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firebase Integration Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Firebase Profile Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                User profile data will be synced with Firebase Authentication and stored in MongoDB. 
                Changes made here will be saved to the backend once integration is complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
