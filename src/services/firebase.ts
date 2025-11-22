import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db, storage } from '../firebase/config';

// Type definitions
export interface Product {
  id?: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  status: string;
  location: string;
  reorder_level: number;
  supplier: string;
  cost_price: number;
  selling_price: number;
  description: string;
  image_url?: string;
  created_by?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface User {
  id?: string;
  firebase_uid: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  phone: string;
  status: string;
  profile_image?: string;
  created_by?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Operation {
  id?: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  description: string;
  status: string;
  date?: Timestamp;
  created_by?: string;
  updated_at?: Timestamp;
  // Type-specific fields
  supplier?: string;
  customer?: string;
  from_location?: string;
  to_location?: string;
  items_count?: number;
  total_value?: number;
  quantity?: number;
  product_id?: string;
  delivery_address?: string;
}

// Helper function to convert Firestore document to object
const docToData = (doc: QueryDocumentSnapshot<DocumentData>) => ({
  id: doc.id,
  ...doc.data(),
  // Convert Firestore timestamps to ISO strings for JSON serialization
  created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
  updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
  date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
});

// Authentication Services
export class AuthService {
  static async register(email: string, password: string, userData: Partial<User>) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      const userDoc = {
        firebase_uid: user.uid,
        name: userData.name || '',
        email: user.email || '',
        role: userData.role || 'user',
        department: userData.department || 'General',
        location: userData.location || 'Main Office',
        phone: userData.phone || '',
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date()
      };

      await addDoc(collection(db, 'users'), userDoc);

      return { success: true, user: userDoc };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getCurrentUser() {
    return auth.currentUser;
  }

  static async getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('firebase_uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return docToData(querySnapshot.docs[0]);
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// Product Services
export class ProductService {
  static async getAll(): Promise<Product[]> {
    try {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Product);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async create(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const newProduct = {
        ...productData,
        created_by: user.uid,
        created_at: new Date(),
        updated_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'products'), newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async update(id: string, productData: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...productData,
        updated_at: new Date()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getByCategory(category: string): Promise<Product[]> {
    try {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Product);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getLowStock(): Promise<Product[]> {
    try {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where('status', '==', 'Low Stock'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Product);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// User Services
export class UserService {
  static async getAll(): Promise<User[]> {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as User);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async create(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const newUser = {
        ...userData,
        created_by: user.uid,
        created_at: new Date(),
        updated_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'users'), newUser);
      return { id: docRef.id, ...newUser };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async update(id: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        ...userData,
        updated_at: new Date()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getByRole(role: string): Promise<User[]> {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as User);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// Operation Services
export class OperationService {
  static async getAll(): Promise<Operation[]> {
    try {
      const operationsCollection = collection(db, 'operations');
      const q = query(operationsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Operation);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async create(operationData: Omit<Operation, 'id'>): Promise<Operation> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const newOperation = {
        ...operationData,
        created_by: user.uid,
        date: new Date(),
        updated_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'operations'), newOperation);
      return { id: docRef.id, ...newOperation };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async update(id: string, operationData: Partial<Operation>): Promise<void> {
    try {
      const operationRef = doc(db, 'operations', id);
      await updateDoc(operationRef, {
        ...operationData,
        updated_at: new Date()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'operations', id));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getByType(type: string): Promise<Operation[]> {
    try {
      const operationsCollection = collection(db, 'operations');
      const q = query(operationsCollection, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Operation);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getRecent(limitNum: number = 10): Promise<Operation[]> {
    try {
      const operationsCollection = collection(db, 'operations');
      const q = query(operationsCollection, orderBy('date', 'desc'), limit(limitNum));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => docToData(doc) as Operation);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// Storage Services
export class StorageService {
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const filename = `${Date.now()}_${file.name}`;
      const imageRef = ref(storage, `${path}/${user.uid}/${filename}`);
      
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async uploadProfileImage(file: File): Promise<string> {
    return this.uploadImage(file, 'profile_images');
  }

  static async uploadProductImage(file: File): Promise<string> {
    return this.uploadImage(file, 'product_images');
  }
}

// Dashboard Services
export class DashboardService {
  static async getStats() {
    try {
      const [products, users, operations] = await Promise.all([
        ProductService.getAll(),
        UserService.getAll(),
        OperationService.getAll()
      ]);

      const productStats = {
        total: products.length,
        in_stock: products.filter(p => p.status === 'In Stock').length,
        low_stock: products.filter(p => p.status === 'Low Stock').length,
        out_of_stock: products.filter(p => p.status === 'Out of Stock').length,
      };

      const operationStats = {
        pending_receipts: operations.filter(o => o.type === 'receipt' && o.status === 'pending').length,
        pending_deliveries: operations.filter(o => o.type === 'delivery' && o.status === 'pending').length,
        internal_transfers: operations.filter(o => o.type === 'transfer').length,
        pending_adjustments: operations.filter(o => o.type === 'adjustment' && o.status === 'pending').length,
      };

      const recentActivity = operations.slice(0, 5);

      return {
        products: {
          ...productStats,
          trend: {
            value: `${productStats.in_stock} items available`,
            is_positive: true
          }
        },
        operations: operationStats,
        activity: {
          products_added_today: 0, // Can be calculated based on today's date
          orders_processed_today: 0,
          stock_movements_week: operations.length
        },
        users: {
          total: users.length,
          active: users.filter(u => u.status === 'Active').length,
          admins: users.filter(u => u.role === 'admin').length
        },
        recent_activity: recentActivity,
        alerts: [] // Can be populated with low stock alerts, etc.
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

// Export all services
export {
  AuthService as auth,
  ProductService as products,
  UserService as users,
  OperationService as operations,
  StorageService as storage,
  DashboardService as dashboard
};