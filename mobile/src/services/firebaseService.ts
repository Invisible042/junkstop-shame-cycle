import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { JunkFoodLog } from '../context/DataContext';

export interface FirebaseJunkFoodLog extends Omit<JunkFoodLog, 'id' | 'timestamp'> {
  userId: string;
  timestamp: any; // Firestore Timestamp
  photoUrl: string;
}

class FirebaseService {
  // Authentication
  async signUp(email: string, password: string, displayName?: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Photo Upload
  async uploadPhoto(uri: string, userId: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `junk-food-photos/${userId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error: any) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  // Junk Food Logs
  async addJunkFoodLog(log: Omit<JunkFoodLog, 'id' | 'timestamp'>, userId: string): Promise<string> {
    try {
      // Upload photo first
      const photoUrl = await this.uploadPhoto(log.photoUri, userId);
      
      const logData: FirebaseJunkFoodLog = {
        ...log,
        userId,
        photoUrl,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'junkFoodLogs'), logData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add log: ${error.message}`);
    }
  }

  async getUserLogs(userId: string): Promise<JunkFoodLog[]> {
    try {
      const q = query(
        collection(db, 'junkFoodLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const logs: JunkFoodLog[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseJunkFoodLog;
        logs.push({
          id: doc.id,
          photoUri: data.photoUrl,
          timestamp: data.timestamp?.toMillis() || Date.now(),
          location: data.location,
          guiltRating: data.guiltRating,
          regretRating: data.regretRating,
          estimatedCalories: data.estimatedCalories,
          estimatedCost: data.estimatedCost,
          aiMessage: data.aiMessage,
        });
      });
      
      return logs;
    } catch (error: any) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }
  }

  async deleteUserLog(logId: string, photoUrl: string): Promise<void> {
    try {
      // Delete the document
      await deleteDoc(doc(db, 'junkFoodLogs', logId));
      
      // Delete the photo from storage
      if (photoUrl) {
        const photoRef = ref(storage, photoUrl);
        await deleteObject(photoRef);
      }
    } catch (error: any) {
      throw new Error(`Failed to delete log: ${error.message}`);
    }
  }

  // User Profile
  async updateUserProfile(displayName: string, user: FirebaseUser): Promise<void> {
    try {
      await updateProfile(user, { displayName });
    } catch (error: any) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Community Features
  async addConfession(text: string, userId: string): Promise<string> {
    try {
      const confessionData = {
        text,
        userId,
        timestamp: serverTimestamp(),
        likes: 0,
        replies: 0,
        anonymous: true,
      };

      const docRef = await addDoc(collection(db, 'confessions'), confessionData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add confession: ${error.message}`);
    }
  }

  async getConfessions(limit: number = 20) {
    try {
      const q = query(
        collection(db, 'confessions'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const confessions: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        confessions.push({
          id: doc.id,
          text: data.text,
          timestamp: data.timestamp?.toMillis() || Date.now(),
          likes: data.likes || 0,
          replies: data.replies || 0,
        });
      });
      
      return confessions.slice(0, limit);
    } catch (error: any) {
      throw new Error(`Failed to fetch confessions: ${error.message}`);
    }
  }

  async likeConfession(confessionId: string): Promise<void> {
    try {
      const confessionRef = doc(db, 'confessions', confessionId);
      // In a real app, you'd check if user already liked this
      await updateDoc(confessionRef, {
        likes: (await getDocs(query(collection(db, 'confessions'), where('__name__', '==', confessionId)))).docs[0]?.data()?.likes + 1 || 1
      });
    } catch (error: any) {
      throw new Error(`Failed to like confession: ${error.message}`);
    }
  }
}

export const firebaseService = new FirebaseService();