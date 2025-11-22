import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Warehouse, Bell, Shield, Database, Zap, Loader2, RefreshCw, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface WarehouseLocation {
  id: string;
  name: string;
  address: string;
  type: 'Main Warehouse' | 'Secondary Warehouse' | 'Production Floor' | 'Shipping Dock' | 'Storage Room';
  isActive: boolean;
  capacity: number;
  manager: string;
  description: string;
}

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
  warehouses: WarehouseLocation[];
}

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    warehouseName: "Main Warehouse",
    multiWarehouseEnabled: true,
    lowStockAlerts: true,
    outOfStockAlerts: true,
    pendingOperationsAlerts: true,
    sessionTimeout: 30,
    twoFactorEnabled: false,
    backupEnabled: true,
    autoBackupInterval: 24,
    apiIntegrationEnabled: true,
    realtimeUpdatesEnabled: true,
    warehouses: [
      {
        id: "1",
        name: "Main Warehouse",
        address: "123 Industrial Drive, City",
        type: "Main Warehouse",
        isActive: true,
        capacity: 10000,
        manager: "John Smith",
        description: "Primary storage facility"
      },
      {
        id: "2", 
        name: "Secondary Warehouse",
        address: "456 Storage Ave, City",
        type: "Secondary Warehouse",
        isActive: true,
        capacity: 5000,
        manager: "Jane Doe",
        description: "Overflow storage"
      },
      {
        id: "3",
        name: "Production Floor",
        address: "789 Manufacturing St, City", 
        type: "Production Floor",
        isActive: true,
        capacity: 2000,
        manager: "Mike Johnson",
        description: "Work-in-progress storage"
      },
      {
        id: "4",
        name: "Shipping Dock",
        address: "321 Logistics Blvd, City",
        type: "Shipping Dock", 
        isActive: true,
        capacity: 1500,
        manager: "Sarah Wilson",
        description: "Outbound shipment staging"
      }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseLocation | null>(null);
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    address: "",
    type: "Main Warehouse" as WarehouseLocation['type'],
    capacity: 0,
    manager: "",
    description: ""
  });

  useEffect(() => {
    // Load settings from localStorage or Firebase
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would load from Firebase/backend
      // For now, we use the default settings above
      toast.success('Settings loaded successfully!');
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // In a real app, this would save to Firebase/backend
      localStorage.setItem('stockmaster-settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      name: "",
      address: "",
      type: "Main Warehouse",
      capacity: 0,
      manager: "",
      description: ""
    });
    setIsWarehouseDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseLocation) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      name: warehouse.name,
      address: warehouse.address,
      type: warehouse.type,
      capacity: warehouse.capacity,
      manager: warehouse.manager,
      description: warehouse.description
    });
    setIsWarehouseDialogOpen(true);
  };

  const handleSaveWarehouse = () => {
    if (!warehouseForm.name || !warehouseForm.address) {
      toast.error('Please fill in required fields');
      return;
    }

    const newWarehouse: WarehouseLocation = {
      id: editingWarehouse ? editingWarehouse.id : Date.now().toString(),
      name: warehouseForm.name,
      address: warehouseForm.address,
      type: warehouseForm.type,
      isActive: true,
      capacity: warehouseForm.capacity,
      manager: warehouseForm.manager,
      description: warehouseForm.description
    };

    if (editingWarehouse) {
      setSettings({
        ...settings,
        warehouses: settings.warehouses.map(w => w.id === editingWarehouse.id ? newWarehouse : w)
      });
      toast.success('Warehouse updated successfully');
    } else {
      setSettings({
        ...settings,
        warehouses: [...settings.warehouses, newWarehouse]
      });
      toast.success('Warehouse added successfully');
    }

    setIsWarehouseDialogOpen(false);
    setEditingWarehouse(null);
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      setSettings({
        ...settings,
        warehouses: settings.warehouses.filter(w => w.id !== warehouseId)
      });
      toast.success('Warehouse deleted successfully');
    }
  };

  const toggleWarehouseStatus = (warehouseId: string) => {
    setSettings({
      ...settings,
      warehouses: settings.warehouses.map(w => 
        w.id === warehouseId ? { ...w, isActive: !w.isActive } : w
      )
    });
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            StockMaster System Configuration and Warehouse Management
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Warehouse Management - StockMaster Feature */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Warehouse Management</CardTitle>
                <CardDescription>Configure and manage multiple warehouse locations for StockMaster</CardDescription>
              </div>
            </div>
            <Button onClick={handleAddWarehouse} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Warehouse
            </Button>
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
                Enable tracking across multiple locations and warehouses
              </p>
            </div>
            <Switch 
              checked={settings.multiWarehouseEnabled}
              onCheckedChange={(checked) => updateSetting('multiWarehouseEnabled', checked)}
            />
          </div>
          
          {/* Warehouses Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {warehouse.name}
                      </div>
                    </TableCell>
                    <TableCell>{warehouse.type}</TableCell>
                    <TableCell>{warehouse.address}</TableCell>
                    <TableCell>{warehouse.manager}</TableCell>
                    <TableCell>{warehouse.capacity.toLocaleString()} units</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={warehouse.isActive}
                          onCheckedChange={() => toggleWarehouseStatus(warehouse.id)}
                          size="sm"
                        />
                        <span className={`text-xs ${warehouse.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {warehouse.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditWarehouse(warehouse)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
            <DialogDescription>
              Configure warehouse details for StockMaster multi-location support
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                  placeholder="Enter warehouse name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={warehouseForm.type}
                  onChange={(e) => setWarehouseForm({...warehouseForm, type: e.target.value as WarehouseLocation['type']})}
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Secondary Warehouse">Secondary Warehouse</option>
                  <option value="Production Floor">Production Floor</option>
                  <option value="Shipping Dock">Shipping Dock</option>
                  <option value="Storage Room">Storage Room</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={warehouseForm.address}
                onChange={(e) => setWarehouseForm({...warehouseForm, address: e.target.value})}
                placeholder="Enter warehouse address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={warehouseForm.manager}
                  onChange={(e) => setWarehouseForm({...warehouseForm, manager: e.target.value})}
                  placeholder="Manager name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={warehouseForm.capacity}
                  onChange={(e) => setWarehouseForm({...warehouseForm, capacity: parseInt(e.target.value) || 0})}
                  placeholder="Storage capacity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={warehouseForm.description}
                onChange={(e) => setWarehouseForm({...warehouseForm, description: e.target.value})}
                placeholder="Warehouse description"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsWarehouseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveWarehouse}>
                {editingWarehouse ? 'Update' : 'Add'} Warehouse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-2">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>StockMaster Notifications</CardTitle>
              <CardDescription>Configure alert preferences for inventory management</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when products reach reorder level
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

      {/* System Integration */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-2">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>System Integration</CardTitle>
              <CardDescription>Configure Firebase and backend connections for StockMaster</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Real-time Updates</Label>
              <p className="text-sm text-muted-foreground">
                Enable live data synchronization across all devices
              </p>
            </div>
            <Switch 
              checked={settings.realtimeUpdatesEnabled}
              onCheckedChange={(checked) => updateSetting('realtimeUpdatesEnabled', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>API Integration</Label>
              <p className="text-sm text-muted-foreground">
                Enable external API connections for inventory sync
              </p>
            </div>
            <Switch 
              checked={settings.apiIntegrationEnabled}
              onCheckedChange={(checked) => updateSetting('apiIntegrationEnabled', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup data every 24 hours
              </p>
            </div>
            <Switch 
              checked={settings.backupEnabled}
              onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
            />
          </div>
          <Button className="mt-4">
            <Zap className="mr-2 h-4 w-4" />
            Test Database Connection
          </Button>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save All Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
