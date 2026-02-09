import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

export type FamilyRelationship = 
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "uncle"
  | "aunt"
  | "grandfather"
  | "grandmother"
  | "cousin"
  | "friend";

export interface FamilyProfile {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  relationship: FamilyRelationship;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface FamilyProfileInput {
  name: string;
  birthDate: string;
  relationship: FamilyRelationship;
  password: string;
}

/**
 * Real Garnett family data
 * Kelly (Dad) and Mom are administrators with full override authority
 */
const GARNETT_FAMILY: FamilyProfile[] = [
  {
    id: 1,
    name: "Kelly",
    birthDate: "1970-05-15",
    relationship: "father",
    passwordHash: "", // Will be set during first login
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Mom",
    birthDate: "1972-08-22",
    relationship: "mother",
    passwordHash: "",
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Katie",
    birthDate: "1995-03-10",
    relationship: "daughter",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Ashton",
    birthDate: "1998-07-20",
    relationship: "son",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Gavin",
    birthDate: "2001-11-05",
    relationship: "son",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Halo",
    birthDate: "2003-02-14",
    relationship: "daughter",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    name: "Sophia",
    birthDate: "2005-09-30",
    relationship: "daughter",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    name: "Killian",
    birthDate: "2007-12-25",
    relationship: "son",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    name: "Shavez",
    birthDate: "2009-06-18",
    relationship: "son",
    passwordHash: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Hash a password using SHA-256
 */
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Get all family profiles
 */
export async function getAllFamilyProfiles(): Promise<FamilyProfile[]> {
  try {
    const stored = await SecureStore.getItemAsync("family_profiles");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to retrieve family profiles:", error);
  }
  return GARNETT_FAMILY;
}

/**
 * Get a specific family profile by ID
 */
export async function getFamilyProfile(id: number): Promise<FamilyProfile | null> {
  const profiles = await getAllFamilyProfiles();
  return profiles.find((p) => p.id === id) || null;
}

/**
 * Get a family profile by name
 */
export async function getFamilyProfileByName(name: string): Promise<FamilyProfile | null> {
  const profiles = await getAllFamilyProfiles();
  return profiles.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Authenticate a family member
 */
export async function authenticateFamilyMember(
  name: string,
  password: string
): Promise<FamilyProfile | null> {
  const profile = await getFamilyProfileByName(name);
  if (!profile) {
    return null;
  }

  if (!profile.passwordHash) {
    // First login - set password
    profile.passwordHash = await hashPassword(password);
    await saveFamilyProfiles([...(await getAllFamilyProfiles()).filter((p) => p.id !== profile.id), profile]);
    profile.lastLogin = new Date().toISOString();
    return profile;
  }

  // Verify password
  const isValid = await verifyPassword(password, profile.passwordHash);
  if (isValid) {
    profile.lastLogin = new Date().toISOString();
    return profile;
  }

  return null;
}

/**
 * Create a new family profile
 */
export async function createFamilyProfile(input: FamilyProfileInput): Promise<FamilyProfile> {
  const profiles = await getAllFamilyProfiles();
  const maxId = Math.max(...profiles.map((p) => p.id), 0);

  const newProfile: FamilyProfile = {
    id: maxId + 1,
    name: input.name,
    birthDate: input.birthDate,
    relationship: input.relationship,
    passwordHash: await hashPassword(input.password),
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  profiles.push(newProfile);
  await saveFamilyProfiles(profiles);

  return newProfile;
}

/**
 * Save family profiles to secure storage
 */
async function saveFamilyProfiles(profiles: FamilyProfile[]): Promise<void> {
  try {
    await SecureStore.setItemAsync("family_profiles", JSON.stringify(profiles));
  } catch (error) {
    console.error("Failed to save family profiles:", error);
  }
}

/**
 * Update a family profile
 */
export async function updateFamilyProfile(id: number, updates: Partial<FamilyProfile>): Promise<FamilyProfile | null> {
  const profiles = await getAllFamilyProfiles();
  const index = profiles.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  const updated = { ...profiles[index], ...updates, id };
  profiles[index] = updated;
  await saveFamilyProfiles(profiles);

  return updated;
}

/**
 * Delete a family profile
 */
export async function deleteFamilyProfile(id: number): Promise<boolean> {
  const profiles = await getAllFamilyProfiles();
  const filtered = profiles.filter((p) => p.id !== id);

  if (filtered.length === profiles.length) {
    return false; // Profile not found
  }

  await saveFamilyProfiles(filtered);
  return true;
}

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(profileId: number): Promise<boolean> {
  const profile = await getFamilyProfile(profileId);
  return profile?.isAdmin || false;
}

/**
 * Get relationship display text
 */
export function getRelationshipDisplay(relationship: FamilyRelationship): string {
  const displays: Record<FamilyRelationship, string> = {
    father: "Father",
    mother: "Mother",
    son: "Son",
    daughter: "Daughter",
    brother: "Brother",
    sister: "Sister",
    uncle: "Uncle",
    aunt: "Aunt",
    grandfather: "Grandfather",
    grandmother: "Grandmother",
    cousin: "Cousin",
    friend: "Friend",
  };
  return displays[relationship];
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
