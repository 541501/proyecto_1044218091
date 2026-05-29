import 'server-only';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UserRole } from './types';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface Block {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Slot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  order_index: number;
  is_active: boolean;
}

export interface Room {
  id: string;
  block_id: string;
  code: string;
  type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
  capacity: number;
  equipment: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Seed {
  users: User[];
  blocks: Block[];
  slots: Slot[];
  rooms: Room[];
}

let cachedSeed: Seed | null = null;

export async function loadSeed(): Promise<Seed> {
  if (cachedSeed) {
    return cachedSeed;
  }

  const seedPath = path.join(process.cwd(), 'data', 'seed.json');
  const content = await fs.readFile(seedPath, 'utf-8');
  const seedData = JSON.parse(content) as Seed;
  cachedSeed = seedData;
  return seedData;
}

export function clearSeedCache() {
  cachedSeed = null;
}

export async function getUsers(): Promise<User[]> {
  const seed = await loadSeed();
  return seed.users;
}

export async function getBlocks(): Promise<Block[]> {
  const seed = await loadSeed();
  return seed.blocks;
}

export async function getSlots(): Promise<Slot[]> {
  const seed = await loadSeed();
  return seed.slots;
}

export async function getRooms(): Promise<Room[]> {
  const seed = await loadSeed();
  return seed.rooms;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

export async function getBlockByCode(code: string): Promise<Block | null> {
  const blocks = await getBlocks();
  return blocks.find((b) => b.code === code) || null;
}

export async function getRoomsByBlockId(blockId: string): Promise<Room[]> {
  const rooms = await getRooms();
  return rooms.filter((r) => r.block_id === blockId);
}
