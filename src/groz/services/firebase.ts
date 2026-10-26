import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { Product } from '../types';

export const OWNER_EMAIL = 'grozofficial7@gmail.com';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with explicit database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Login / Logout helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
export const watchUser = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

// Data save / load (Firestore)
export const saveData = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });

export const loadData = async (collectionName: string) => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// File upload (Storage)
export const uploadFile = async (path: string, file: File | Blob) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network connectivity delayed.');
    }
  }
}

// Check if currently authenticated user is the designated owner
export function isAuthorizedOwner(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

// Subscribe to products collection in real time
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const productsCol = collection(db, 'products');
  return onSnapshot(
    productsCol,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort: Featured first, then newest
      items.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      onData(items);
    },
    (err) => {
      console.error('Real-time products snapshot failed:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  );
}

// Seed initial products if the Firestore database is empty
export async function seedInitialProductsIfEmpty(initialProducts: Product[]): Promise<void> {
  const productsCol = collection(db, 'products');
  try {
    const existing = await getDocs(productsCol);
    if (!existing.empty) {
      return; // Database already populated
    }
  } catch {
    // If read fails (e.g. initial connection), proceed cautiously
  }

  // Only seed if user is admin or if we can write initial catalog
  if (!auth.currentUser || !isAuthorizedOwner(auth.currentUser)) {
    return;
  }

  try {
    const batch = writeBatch(db);
    for (const p of initialProducts) {
      const docRef = doc(db, 'products', p.id);
      batch.set(docRef, {
        ...p,
        isPublished: p.isPublished !== false,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      });
    }
    await batch.commit();
    console.log('[GROZ] Seeded inaugural collection to Firestore.');
  } catch (err) {
    console.warn('[GROZ] Seeding skipped or restricted by security rules:', err);
  }
}

// Save or Update Product in Firestore
export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(
      docRef,
      {
        ...product,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete Product in Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Get user ID Token for authenticating backend requests
export async function getAdminIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return getIdToken(auth.currentUser, true);
}
