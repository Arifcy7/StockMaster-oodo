import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, User, MapPin, Phone, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mockFirestore } from "@/lib/mockFirebase";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  location: string;
  role: string;
  bio?: string;
  address?: string;
}

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    location: "",
    role: "warehouse_staff",
    bio: "",
    address: ""
  });

  const email = location.state?.email || "";
  const isFirstTime = location.state?.isFirstTime || false;

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

  const stockMasterRoles = [
    { value: 'admin', label: 'Admin', description: 'Full system access, user management' },
    { value: 'inventory_manager', label: 'Inventory Manager', description: 'Manage incoming & outgoing stock' },
    { value: 'warehouse_staff', label: 'Warehouse Staff', description: 'Perform transfers, picking, shelving, counting' }
  ];

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please log in again.");
      navigate("/auth");
    }
  }, [email, navigate]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!profileData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!profileData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!profileData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!profileData.department) {
      toast.error('Department is required');
      return false;
    }
    if (!profileData.location) {
      toast.error('Location is required');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const userData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`,
        email: email,
        role: profileData.role,
        department: profileData.department,
        location: profileData.location,
        phone: profileData.phone.trim(),
        bio: profileData.bio?.trim() || null,
        address: profileData.address?.trim() || null,
        status: 'active',
        created_at: mockFirestore.serverTimestamp(),
        updated_at: mockFirestore.serverTimestamp(),
        last_login: mockFirestore.serverTimestamp(),
        is_first_login: false
      };

      const result = await mockFirestore.collection('users').add(userData);
      
      // Store user data in localStorage for the session
      localStorage.setItem('currentUser', JSON.stringify({
        ...userData,
        id: result.id
      }));

      toast.success(`Welcome to StockMaster, ${profileData.firstName}!`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">StockMaster</h1>
              <p className="text-sm text-muted-foreground">Complete Your Profile</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isFirstTime ? "Welcome! Set up your profile" : "Update your profile"}
            </CardTitle>
            <CardDescription>
              {isFirstTime 
                ? "Please provide your information to complete your StockMaster account setup."
                : "Update your profile information and preferences."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={profileData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockMasterRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select value={profileData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="pl-10">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Work Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={profileData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your primary work location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Information */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself, your experience, or your role..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your home address"
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isFirstTime ? "Complete Setup" : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;