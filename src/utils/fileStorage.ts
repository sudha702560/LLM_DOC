// File storage utilities for handling file operations
export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
  checksum: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export class FileStorageManager {
  private static instance: FileStorageManager;
  private storageKey = 'docintel_files';

  private constructor() {}

  public static getInstance(): FileStorageManager {
    if (!FileStorageManager.instance) {
      FileStorageManager.instance = new FileStorageManager();
    }
    return FileStorageManager.instance;
  }

  // Convert File to base64 string
  public async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Generate SHA-256 checksum for file integrity
  public async generateChecksum(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256-${hashHex}`;
    } catch (error) {
      console.error('Error generating checksum:', error);
      return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Store file in localStorage (for demo purposes)
  public async storeFile(file: File, metadata?: Record<string, any>): Promise<StoredFile> {
    try {
      const [data, checksum] = await Promise.all([
        this.fileToBase64(file),
        this.generateChecksum(file)
      ]);

      const storedFile: StoredFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        data,
        checksum,
        uploadedAt: new Date().toISOString(),
        metadata
      };

      // Get existing files
      const existingFiles = this.getAllFiles();
      
      // Add new file
      existingFiles.push(storedFile);
      
      // Store back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(existingFiles));
      
      return storedFile;
    } catch (error) {
      console.error('Error storing file:', error);
      throw new Error('Failed to store file');
    }
  }

  // Retrieve all stored files
  public getAllFiles(): StoredFile[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving files:', error);
      return [];
    }
  }

  // Retrieve specific file by ID
  public getFile(id: string): StoredFile | null {
    const files = this.getAllFiles();
    return files.find(file => file.id === id) || null;
  }

  // Delete file by ID
  public deleteFile(id: string): boolean {
    try {
      const files = this.getAllFiles();
      const filteredFiles = files.filter(file => file.id !== id);
      
      if (filteredFiles.length === files.length) {
        return false; // File not found
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredFiles));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Delete multiple files by IDs
  public deleteFiles(ids: string[]): number {
    try {
      const files = this.getAllFiles();
      const filteredFiles = files.filter(file => !ids.includes(file.id));
      const deletedCount = files.length - filteredFiles.length;
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredFiles));
      return deletedCount;
    } catch (error) {
      console.error('Error deleting files:', error);
      return 0;
    }
  }

  // Update file metadata
  public updateFile(id: string, updates: Partial<StoredFile>): boolean {
    try {
      const files = this.getAllFiles();
      const fileIndex = files.findIndex(file => file.id === id);
      
      if (fileIndex === -1) {
        return false; // File not found
      }
      
      files[fileIndex] = { ...files[fileIndex], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(files));
      return true;
    } catch (error) {
      console.error('Error updating file:', error);
      return false;
    }
  }

  // Get storage statistics
  public getStorageStats(): {
    totalFiles: number;
    totalSize: number;
    storageUsed: number;
    storageLimit: number;
  } {
    const files = this.getAllFiles();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    
    // Estimate localStorage usage (rough calculation)
    const storageUsed = new Blob([localStorage.getItem(this.storageKey) || '']).size;
    const storageLimit = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      totalFiles: files.length,
      totalSize,
      storageUsed,
      storageLimit
    };
  }

  // Clean up old or corrupted files
  public cleanup(): {
    removedFiles: number;
    freedSpace: number;
  } {
    try {
      const files = this.getAllFiles();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      let removedFiles = 0;
      let freedSpace = 0;
      
      // Remove files older than 30 days or with invalid data
      const validFiles = files.filter(file => {
        const uploadDate = new Date(file.uploadedAt);
        const isOld = uploadDate < thirtyDaysAgo;
        const isInvalid = !file.data || !file.checksum;
        
        if (isOld || isInvalid) {
          removedFiles++;
          freedSpace += file.size;
          return false;
        }
        
        return true;
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(validFiles));
      
      return { removedFiles, freedSpace };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return { removedFiles: 0, freedSpace: 0 };
    }
  }

  // Verify file integrity
  public async verifyFile(id: string): Promise<boolean> {
    try {
      const file = this.getFile(id);
      if (!file) return false;
      
      // Convert base64 back to blob and verify checksum
      const response = await fetch(file.data);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const computedChecksum = `sha256-${hashHex}`;
      
      return computedChecksum === file.checksum;
    } catch (error) {
      console.error('Error verifying file:', error);
      return false;
    }
  }

  // Export file data (for download)
  public exportFile(id: string): { blob: Blob; filename: string } | null {
    try {
      const file = this.getFile(id);
      if (!file) return null;
      
      // Convert base64 to blob
      const byteCharacters = atob(file.data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      
      return { blob, filename: file.name };
    } catch (error) {
      console.error('Error exporting file:', error);
      return null;
    }
  }

  // Clear all stored files
  public clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
}