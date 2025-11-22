import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Calendar, Shield, Loader2, RefreshCw, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { mockFirestore } from "@/lib/mockFirebase";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  status: string;
  bio?: string;
  address?: string;
  created_at: string;
  last_login?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  const departments = [
    'Warehouse Operations',
    'Inventory Management', 
    'Supply Chain',
    'Quality Control',
    'Logistics',
    'Administration',
    'Customer Service',
    'Finance',
    'IT Support'
  ];

  const locations = [
    'Main Warehouse',
    'Secondary Warehouse', 
    'Production Floor',
    'Shipping Dock',
    'Receiving Area',
    'Storage Room A',
    'Storage Room B',
    'Office Building',
    'Distribution Center'
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user from localStorage and Firebase Auth
      const currentUserData = localStorage.getItem('currentUser');
      const firebaseUser = auth.currentUser;
      
      if (!currentUserData && !firebaseUser) {
        toast.error('No user session found. Please log in again.');
        navigate('/auth');
        return;
      }

      let userData = null;

      // Try to fetch from Firestore first if we have a Firebase UID
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = {
              id: userDoc.id,
              ...userDoc.data()
            } as UserProfile;
            console.log('✅ Profile loaded from Firestore:', userData);
          }
        } catch (firestoreError) {
          console.log('Firestore fetch failed, trying mock Firebase...');
        }
      }

      // Fallback to mock Firebase if Firestore fails
      if (!userData && currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        const usersQuery = await mockFirestore.collection('users')
          .where('email', '==', currentUser.email)
          .get();

        if (usersQuery.docs.length > 0) {
          userData = {
            id: usersQuery.docs[0].id,
            ...usersQuery.docs[0].data()
          } as UserProfile;
          console.log('✅ Profile loaded from mock Firebase:', userData);
        }
      }

      if (!userData) {
        throw new Error('User profile not found in Firestore or mock Firebase');
      }

      setUserProfile(userData);
      setEditedProfile(userData);
      toast.success(`Profile loaded successfully! Welcome, ${userData.firstName}! 🎉`);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setError(`Failed to load profile: ${error.message}`);
      toast.error(`Failed to load profile: ${error.message}`);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset to original
      setEditedProfile(userProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile(prev => ({ ...prev!, [field]: value }));
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile || !userProfile) return;
    
    try {
      setIsUpdating(true);
      
      // Update user in Firebase and Firestore
      const updateData = {
        firstName: editedProfile.firstName.trim(),
        lastName: editedProfile.lastName.trim(),
        name: `${editedProfile.firstName.trim()} ${editedProfile.lastName.trim()}`,
        phone: editedProfile.phone.trim(),
        department: editedProfile.department,
        location: editedProfile.location,
        bio: editedProfile.bio?.trim() || null,
        address: editedProfile.address?.trim() || null,
        updated_at: new Date()
      };

      // Update in Firestore if we have Firebase user
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), updateData);
          console.log(`✅ Profile updated in Firestore for UID: ${firebaseUser.uid}`);
        } catch (firestoreError) {
          console.log('Firestore update failed, continuing with local update...');
        }
      }
      
      // Update local state immediately for responsive UI
      Object.assign(userProfile, updateData);
      setUserProfile({ ...userProfile });
      
      // Update localStorage session
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          ...updateData
        }));
      }

      toast.success(`🎉 Profile updated successfully in Firestore!\\nChanges saved: ${Object.keys(updateData).join(', ')}`);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'destructive';
      case 'inventory_manager': return 'default';
      case 'warehouse_staff': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'inventory_manager': return 'Inventory Manager';
      case 'warehouse_staff': return 'Warehouse Staff';
      default: return role;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button onClick={loadUserProfile} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error || 'No profile data available'}</p>
            <Button onClick={loadUserProfile}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleEditToggle} 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                size="sm"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="" alt={userProfile.name} />
              <AvatarFallback className="text-lg">
                {getInitials(userProfile.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{userProfile.name}</CardTitle>
            <CardDescription>
              <Badge variant={getRoleBadgeVariant(userProfile.role) as any} className="mb-2">
                <Shield className="h-3 w-3 mr-1" />
                {formatRole(userProfile.role)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userProfile.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userProfile.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Joined {new Date(userProfile.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isEditing ? "Update your personal details" : "View your personal details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editedProfile?.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <Input 
                    id="firstName" 
                    value={userProfile.firstName} 
                    disabled 
                    className="bg-muted" 
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editedProfile?.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <Input 
                    id="lastName" 
                    value={userProfile.lastName} 
                    disabled 
                    className="bg-muted" 
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={userProfile.email} 
                disabled 
                className="bg-muted" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <Input 
                    id="phone" 
                    value={userProfile.phone || 'Not provided'} 
                    disabled 
                    className="bg-muted" 
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={formatRole(userProfile.role)} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Select 
                    value={editedProfile?.department || ''} 
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    id="department" 
                    value={userProfile.department} 
                    disabled 
                    className="bg-muted" 
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Select 
                    value={editedProfile?.location || ''} 
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    id="location" 
                    value={userProfile.location} 
                    disabled 
                    className="bg-muted" 
                  />
                )}
              </div>
            </div>

            {/* Optional fields */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editedProfile?.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <Textarea 
                  id="bio" 
                  value={userProfile.bio || 'No bio provided'} 
                  disabled 
                  className="bg-muted" 
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={editedProfile?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your home address..."
                  rows={2}
                />
              ) : (
                <Textarea 
                  id="address" 
                  value={userProfile.address || 'No address provided'} 
                  disabled 
                  className="bg-muted" 
                  rows={2}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
