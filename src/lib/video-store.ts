/**
 * IndexedDB storage for candidate video recordings
 * Handles large media blobs smoothly without hitting localStorage limits.
 */

const DB_NAME = 'InterviewX_Media_DB';
const DB_VERSION = 1;
const STORE_NAME = 'candidate_video_recordings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export async function saveSessionVideo(sessionId: string, blob: Blob): Promise<string> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        sessionId,
        blob,
        savedAt: new Date().toISOString(),
        size: blob.size,
        type: blob.type
      };

      const putReq = store.put(record);

      putReq.onsuccess = () => {
        resolve(`indexeddb://${sessionId}`);
      };

      putReq.onerror = () => {
        reject(putReq.error);
      };
    });
  } catch (err) {
    console.warn('Could not save video to IndexedDB, fallback memory object:', err);
    return '';
  }
}

export async function getSessionVideoBlob(sessionId: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(sessionId);

      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.blob) {
          resolve(getReq.result.blob);
        } else {
          resolve(null);
        }
      };

      getReq.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error reading video from IndexedDB:', err);
    return null;
  }
}

export async function deleteSessionVideo(sessionId: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(sessionId);
      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
