// Mock Firebase implementation for development
import { toast } from "sonner";

// Mock Firestore data stores
const mockData = {
  users: [],
  products: [],
  movements: [],
  receipts: [],
  deliveries: [],
  transfers: [],
  adjustments: []
};

// Generate mock IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Firebase functions
export const mockFirestore = {
  collection: (name: string) => ({
    add: async (data: any) => {
      const newDoc = {
        id: generateId(),
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      if (!mockData[name as keyof typeof mockData]) {
        mockData[name as keyof typeof mockData] = [];
      }
      
      (mockData[name as keyof typeof mockData] as any[]).push(newDoc);
      console.log(`✅ Added to ${name}:`, newDoc);
      return { id: newDoc.id };
    },
    
    get: async () => ({
      docs: (mockData[name as keyof typeof mockData] as any[]).map(item => ({
        id: item.id,
        data: () => item,
        exists: true
      }))
    }),
    
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        const data = (mockData[name as keyof typeof mockData] as any[]).filter(item => {
          switch (operator) {
            case '==':
              return item[field] === value;
            case '!=':
              return item[field] !== value;
            case '>':
              return item[field] > value;
            case '>=':
              return item[field] >= value;
            case '<':
              return item[field] < value;
            case '<=':
              return item[field] <= value;
            default:
              return false;
          }
        });
        
        return {
          docs: data.map(item => ({
            id: item.id,
            data: () => item,
            exists: true
          }))
        };
      }
    }),
    
    orderBy: (field: string, direction: 'asc' | 'desc' = 'desc') => ({
      get: async () => {
        const data = (mockData[name as keyof typeof mockData] as any[]).slice();
        data.sort((a, b) => {
          const aVal = field === 'created_at' ? new Date(a.created_at).getTime() : a[field];
          const bVal = field === 'created_at' ? new Date(b.created_at).getTime() : b[field];
          return direction === 'desc' ? bVal - aVal : aVal - bVal;
        });
        
        return {
          docs: data.map(item => ({
            id: item.id,
            data: () => item,
            exists: true
          }))
        };
      }
    })
  }),
  
  // Additional Firebase-like methods
  serverTimestamp: () => new Date(),
  
  // Initialize with some sample data
  initSampleData: () => {
    // Sample products for Operations
    mockData.products = [
      {
        id: 'prod1',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        category: 'Electronics',
        description: 'High-quality wireless headphones with noise cancellation',
        stock: 150,
        unit: 'pieces',
        location: 'Main Warehouse',
        reorder_level: 20,
        supplier: 'TechCorp',
        cost_price: 45.00,
        selling_price: 79.99,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod2', 
        name: 'Ergonomic Office Chair',
        sku: 'EOC-002',
        category: 'Furniture',
        description: 'Comfortable office chair with lumbar support',
        stock: 45,
        unit: 'pieces',
        location: 'Secondary Warehouse',
        reorder_level: 10,
        supplier: 'OfficeMax',
        cost_price: 120.00,
        selling_price: 199.99,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod3',
        name: 'USB-C Charging Cable',
        sku: 'UCC-003', 
        category: 'Accessories',
        description: '6ft USB-C to USB-A charging cable',
        stock: 500,
        unit: 'pieces',
        location: 'Storage Room A',
        reorder_level: 50,
        supplier: 'CableCorp',
        cost_price: 3.50,
        selling_price: 9.99,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod4',
        name: 'Standing Desk Converter',
        sku: 'SDC-004',
        category: 'Furniture',
        description: 'Adjustable standing desk converter',
        stock: 25,
        unit: 'pieces',
        location: 'Main Warehouse',
        reorder_level: 5,
        supplier: 'ErgoFurniture',
        cost_price: 85.00,
        selling_price: 149.99,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod5',
        name: 'Mechanical Keyboard',
        sku: 'MK-005',
        category: 'Electronics',
        description: 'RGB mechanical gaming keyboard',
        stock: 75,
        unit: 'pieces',
        location: 'Storage Room B',
        reorder_level: 15,
        supplier: 'GameTech',
        cost_price: 55.00,
        selling_price: 99.99,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Sample users
    mockData.users = [
      {
        id: 'user1',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: 'admin@stockmaster.com',
        role: 'admin',
        department: 'IT',
        location: 'Main Office',
        phone: '+1-555-0001',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'user2',
        firstName: 'John',
        lastName: 'Manager',
        name: 'John Manager',
        email: 'john.manager@stockmaster.com',
        role: 'inventory_manager',
        department: 'Operations',
        location: 'Warehouse A',
        phone: '+1-555-0002',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'user3',
        firstName: 'Sarah',
        lastName: 'Staff',
        name: 'Sarah Staff',
        email: 'sarah.staff@stockmaster.com',
        role: 'warehouse_staff',
        department: 'Warehouse',
        location: 'Warehouse B',
        phone: '+1-555-0003',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Sample products
    mockData.products = [
      {
        id: 'prod1',
        name: 'Steel Rods',
        sku: 'STL-001',
        category: 'Raw Materials',
        stock: 250,
        unit: 'kg',
        status: 'In Stock',
        location: 'Warehouse A',
        reorder_level: 50,
        supplier: 'Metal Corp',
        cost_price: 15.50,
        selling_price: 25.00,
        description: 'High-quality steel rods for construction',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod2',
        name: 'Aluminum Sheets',
        sku: 'ALU-002',
        category: 'Raw Materials',
        stock: 15,
        unit: 'pieces',
        status: 'Low Stock',
        location: 'Warehouse B',
        reorder_level: 20,
        supplier: 'Aluminum Inc',
        cost_price: 45.00,
        selling_price: 65.00,
        description: 'Lightweight aluminum sheets',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Sample movements
    mockData.movements = [
      {
        id: 'mov1',
        product_name: 'Steel Rods',
        sku: 'STL-001',
        type: 'receipt',
        quantity: 100,
        from_location: null,
        to_location: 'Warehouse A',
        reference: 'REC-001',
        notes: 'Initial stock receipt',
        user_name: 'Admin User',
        timestamp: new Date()
      },
      {
        id: 'mov2',
        product_name: 'Aluminum Sheets',
        sku: 'ALU-002',
        type: 'adjustment',
        quantity: -5,
        from_location: 'Warehouse B',
        to_location: 'Warehouse B',
        reference: 'ADJ-001',
        notes: 'Damaged goods adjustment',
        user_name: 'John Manager',
        timestamp: new Date()
      }
    ];
    
    console.log('🔥 Mock Firebase data initialized with sample data');
    toast.success('Demo data loaded successfully!');
  }
};

// Initialize sample data on module load
mockFirestore.initSampleData();

export default mockFirestore;