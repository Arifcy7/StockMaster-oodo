// Firebase service for real authentication and Firestore data management
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: 'admin' | 'inventory_manager' | 'warehouse_staff';
  department: string;
  location?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  bio?: string;
  address?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: string;
}

export interface Product {
  id?: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  description: string;
  supplier: string;
  status: string;
  location: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Receipt {
  id?: string;
  receipt_id: string;
  supplier: string;
  items: OperationItem[];
  total_items: number;
  total_value: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface Delivery {
  id?: string;
  delivery_id: string;
  customer: string;
  product_id: string;
  product_name: string;
  quantity: number;
  to_location: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface Transfer {
  id?: string;
  transfer_id: string;
  product_id: string;
  product_name: string;
  from_location: string;
  to_location: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface Adjustment {
  id?: string;
  adjustment_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  reason: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface OperationItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  cost_price?: number;
  location: string;
}

export interface MovementHistory {
  id?: string;
  product_name: string;
  sku: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  quantity: number;
  from_location: string | null;
  to_location: string | null;
  reference: string;
  notes: string;
  user_name: string;
  user_id: string;
  user_role: string;
  timestamp: Timestamp;
}

// Authentication service
export const authService = {
  // Create new user with Firebase Auth and store profile in Firestore
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    location?: string;
    phone?: string;
  }) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile: User = {
        uid: firebaseUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role as any,
        department: userData.department,
        location: userData.location || null,
        phone: userData.phone || null,
        status: 'active',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        created_by: auth.currentUser?.uid || 'admin'
      };
      
      // Store user profile in Firestore with UID as document ID
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      return {
        success: true,
        user: firebaseUser,
        profile: userProfile
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get current user profile from Firestore
  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData) {
          return { id: userDoc.id, ...userData } as User;
        }
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Check if user profile exists in Firestore
  async checkUserProfile(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error checking user profile:', error);
      return null;
    }
  },

  // Update user profile in Firestore
  async updateUserProfile(uid: string, updates: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updated_at: Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

// User management service
export const userService = {
  // Get all users from Firestore
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data()
      })) as User[];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by UID
  async getUserByUid(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }
};

// Product management service
export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Create new product
  async createProduct(productData: Omit<Product, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updated_at: Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete product
  async deleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, 'products', id));
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

// Operations service for receipts, deliveries, transfers, adjustments
export const operationsService = {
  // Receipt operations
  async createReceipt(receiptData: Omit<Receipt, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'receipts'), {
        ...receiptData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      // Create movement history for each item
      for (const item of receiptData.items) {
        await this.createMovementHistory({
          product_name: item.product_name,
          sku: item.sku,
          type: 'receipt',
          quantity: item.quantity,
          from_location: null,
          to_location: item.location,
          reference: receiptData.receipt_id,
          notes: `Receipt from ${receiptData.supplier}`,
          user_name: auth.currentUser?.displayName || 'Unknown User',
          user_id: receiptData.created_by,
          user_role: 'Unknown',
          timestamp: Timestamp.now()
        });
      }
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getAllReceipts(): Promise<Receipt[]> {
    try {
      const q = query(collection(db, 'receipts'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Receipt[];
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      return [];
    }
  },

  // Delivery operations
  async createDelivery(deliveryData: Omit<Delivery, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'deliveries'), {
        ...deliveryData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      // Create movement history
      await this.createMovementHistory({
        product_name: deliveryData.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'delivery',
        quantity: -deliveryData.quantity, // Negative for outgoing
        from_location: 'Warehouse',
        to_location: deliveryData.to_location,
        reference: deliveryData.delivery_id,
        notes: `Delivery to ${deliveryData.customer}`,
        user_name: auth.currentUser?.displayName || 'Unknown User',
        user_id: deliveryData.created_by,
        user_role: 'Unknown',
        timestamp: Timestamp.now()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getAllDeliveries(): Promise<Delivery[]> {
    try {
      const q = query(collection(db, 'deliveries'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Delivery[];
    } catch (error: any) {
      console.error('Error fetching deliveries:', error);
      return [];
    }
  },

  // Transfer operations
  async createTransfer(transferData: Omit<Transfer, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'transfers'), {
        ...transferData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      // Create movement history
      await this.createMovementHistory({
        product_name: transferData.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'transfer',
        quantity: transferData.quantity,
        from_location: transferData.from_location,
        to_location: transferData.to_location,
        reference: transferData.transfer_id,
        notes: `Transfer from ${transferData.from_location} to ${transferData.to_location}`,
        user_name: auth.currentUser?.displayName || 'Unknown User',
        user_id: transferData.created_by,
        user_role: 'Unknown',
        timestamp: Timestamp.now()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getAllTransfers(): Promise<Transfer[]> {
    try {
      const q = query(collection(db, 'transfers'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transfer[];
    } catch (error: any) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  },

  // Adjustment operations
  async createAdjustment(adjustmentData: Omit<Adjustment, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'adjustments'), {
        ...adjustmentData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      // Create movement history
      await this.createMovementHistory({
        product_name: adjustmentData.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'adjustment',
        quantity: adjustmentData.quantity,
        from_location: adjustmentData.location,
        to_location: adjustmentData.location,
        reference: adjustmentData.adjustment_id,
        notes: `Adjustment: ${adjustmentData.reason}`,
        user_name: auth.currentUser?.displayName || 'Unknown User',
        user_id: adjustmentData.created_by,
        user_role: 'Unknown',
        timestamp: Timestamp.now()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getAllAdjustments(): Promise<Adjustment[]> {
    try {
      const q = query(collection(db, 'adjustments'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Adjustment[];
    } catch (error: any) {
      console.error('Error fetching adjustments:', error);
      return [];
    }
  },

  // Movement history
  async createMovementHistory(historyData: Omit<MovementHistory, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'movements'), {
        ...historyData,
        timestamp: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating movement history:', error);
      throw new Error(error.message);
    }
  },

  async getAllMovements(): Promise<MovementHistory[]> {
    try {
      const q = query(collection(db, 'movements'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MovementHistory[];
    } catch (error: any) {
      console.error('Error fetching movements:', error);
      return [];
    }
  }
};

// Role-based access control service
export const rbacService = {
  // Check if user has admin role
  async isAdmin(userEmail: string): Promise<boolean> {
    try {
      const userProfile = await userService.getUserByEmail(userEmail);
      return userProfile?.role === 'admin';
    } catch (error: any) {
      console.error('Error checking admin role:', error);
      return false;
    }
  },

  // Check if user has specific role
  async hasRole(userEmail: string, requiredRole: string): Promise<boolean> {
    try {
      const userProfile = await userService.getUserByEmail(userEmail);
      return userProfile?.role === requiredRole;
    } catch (error: any) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  // Get current user role
  async getCurrentUserRole(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      const userProfile = await userService.getUserByEmail(currentUser.email!);
      return userProfile?.role || null;
    } catch (error: any) {
      console.error('Error getting current user role:', error);
      return null;
    }
  }
};

export default { authService, userService, productService, operationsService, rbacService };