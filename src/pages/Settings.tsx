import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Warehouse, Bell, Shield, Database, Zap } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your system preferences and configurations
        </p>
      </div>

      {/* Warehouse Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-primary p-2">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Warehouse Management</CardTitle>
              <CardDescription>Configure warehouses and storage locations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse-name">Default Warehouse</Label>
            <Input id="warehouse-name" placeholder="Main Warehouse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Multi-warehouse Support</Label>
              <p className="text-sm text-muted-foreground">
                Enable tracking across multiple locations
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Add New Warehouse</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-warning to-warning/80 p-2">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when products reach minimum stock level
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Out of Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Immediate notification for zero stock items
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pending Operations</Label>
              <p className="text-sm text-muted-foreground">
                Daily summary of pending receipts and deliveries
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-destructive to-destructive/80 p-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>Manage authentication and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add extra security layer with 2FA
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Auto-logout after 30 minutes of inactivity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="password">Change Password</Label>
            <Input id="password" type="password" placeholder="New password" />
            <Button variant="outline" size="sm">Update Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Backend Integration */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-info to-info/80 p-2">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Backend Integration</CardTitle>
              <CardDescription>Configure Firebase, MongoDB, and Flask connections</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firebase-key">Firebase API Key</Label>
            <Input id="firebase-key" type="password" placeholder="Enter Firebase API Key" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mongo-uri">MongoDB Connection URI</Label>
            <Input id="mongo-uri" type="password" placeholder="mongodb://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flask-url">Flask API URL</Label>
            <Input id="flask-url" placeholder="https://api.yourbackend.com" />
          </div>
          <Button className="bg-gradient-primary">
            <Zap className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button className="bg-gradient-primary">Save All Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
