import { put, get, del } from '@vercel/blob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Lazy-loaded token for Vercel Blob.
 * NEVER as module-level const — fails at build time when env vars don't exist.
 */
function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  }
  return token;
}

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO 8601, America/Bogota
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  action:
    | 'create_reservation'
    | 'cancel_reservation'
    | 'deactivate_room'
    | 'create_room'
    | 'update_room'
    | 'create_user'
    | 'toggle_user'
    | 'login'
    | 'logout'
    | 'bootstrap';
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * In-memory lock for serializing writes to the same audit file.
 * Prevents corruption from concurrent writes within the same instance.
 */
const fileLocks = new Map<string, Promise<void>>();

/**
 * Helper: serialize read-modify-write operations on the same file.
 */
async function withFileLock<T>(fileKey: string, operation: () => Promise<T>): Promise<T> {
  const currentLock = fileLocks.get(fileKey) || Promise.resolve();

  const newLock = currentLock
    .then(() => operation())
    .catch((err) => {
      console.error(`[blobAudit] Lock operation failed for ${fileKey}:`, err);
      throw err;
    });

  fileLocks.set(fileKey, newLock.then(() => {}));

  return newLock;
}

/**
 * Append an audit entry to the monthly audit file.
 * Uses get() from SDK (not fetch) for private blobs.
 */
export async function appendAudit(entry: AuditEntry): Promise<void> {
  const yyyymm = entry.timestamp.slice(0, 7).replace(/-/g, ''); // "202405"
  const blobPath = `audit/${yyyymm}.json`;

  try {
    await withFileLock(blobPath, async () => {
      let entries: AuditEntry[] = [];

      // Try to read existing file using SDK get()
      try {
        const result = await get(blobPath, { token: getBlobToken() });
        if (result) {
          const text = await result.blob?.text() || '';
          if (text) {
            entries = JSON.parse(text);
          }
        }
      } catch (err) {
        // File doesn't exist yet or read error — start fresh
        if (!(err instanceof Error && err.message.includes('404'))) {
          console.warn(`[blobAudit] Could not read ${blobPath}:`, err);
        }
        entries = [];
      }

      // Append new entry
      entries.push(entry);

      // Write back
      const content = JSON.stringify(entries, null, 2);
      await put(blobPath, new Blob([content]), {
        token: getBlobToken(),
        access: 'private',
      });
    });
  } catch (err) {
    console.error(`[blobAudit] Failed to append to ${blobPath}:`, err);
    throw err;
  }
}

/**
 * Read audit entries for a specific month (YYYYMM format).
 */
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  const blobPath = `audit/${yyyymm}.json`;

  try {
    const result = await get(blobPath, { token: getBlobToken() });
    if (!result) {
      return [];
    }

    const text = await result.blob?.text() || '';
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      return [];
    }
    console.error(`[blobAudit] Failed to read ${blobPath}:`, err);
    throw err;
  }
}
