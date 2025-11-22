import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Warehouse, Bell, Shield, Database, Zap, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/firebase/config";

interface SystemSettings {
  warehouseName: string;
  multiWarehouseEnabled: boolean;
  lowStockAlerts: boolean;
  outOfStockAlerts: boolean;
  pendingOperationsAlerts: boolean;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  backupEnabled: boolean;
  autoBackupInterval: number;
  apiIntegrationEnabled: boolean;
  realtimeUpdatesEnabled: boolean;
}

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required');
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
          toast.success('Settings loaded successfully!');
        } else {
          throw new Error(data.message || 'Failed to load settings');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error occurred');
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      setError(`Failed to load settings: ${error.message}`);
      toast.error(`Failed to load settings: ${error.message}`);
      setSettings(null); // No fallback data - completely dynamic
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:5000/api/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });

        if (response.ok) {
          toast.success('Settings saved successfully!');
        } else {
          throw new Error('Failed to save settings');
        }
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    loadSettings();
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load settings</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your system preferences and configurations
          </p>
          {error && (
            <p className="text-yellow-600 text-sm mt-1">⚠️ {error}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
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
            <Input 
              id="warehouse-name" 
              placeholder="Main Warehouse" 
              value={settings.warehouseName}
              onChange={(e) => updateSetting('warehouseName', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Multi-warehouse Support</Label>
              <p className="text-sm text-muted-foreground">
                Enable tracking across multiple locations
              </p>
            </div>
            <Switch 
              checked={settings.multiWarehouseEnabled}
              onCheckedChange={(checked) => updateSetting('multiWarehouseEnabled', checked)}
            />
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
            <Switch 
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Out of Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Immediate notification for zero stock items
              </p>
            </div>
            <Switch 
              checked={settings.outOfStockAlerts}
              onCheckedChange={(checked) => updateSetting('outOfStockAlerts', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pending Operations</Label>
              <p className="text-sm text-muted-foreground">
                Daily summary of pending receipts and deliveries
              </p>
            </div>
            <Switch 
              checked={settings.pendingOperationsAlerts}
              onCheckedChange={(checked) => updateSetting('pendingOperationsAlerts', checked)}
            />
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
