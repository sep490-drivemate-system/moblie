import { jwtDecode } from 'jwt-decode';
import { UserRole } from '@/models/enum/UserRole.enum';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  exp: number;
  iss: string;
  aud: string;
}

export const mapRoleStringToEnum = (roleString: string): UserRole => {
  const roleLower = roleString.toLowerCase().replace(/\s+/g, '');

  switch (roleLower) {
    case 'admin':
      return UserRole.Admin;
    case 'instructor':
      return UserRole.Instructor;
    case 'novicedriver':
      return UserRole.NoviceDriver;
    case 'inspector':
      return UserRole.Inspector;
    case 'demo':
      return UserRole.Demo;
    default:
      // Default to NoviceDriver nếu không match
      console.warn(`Unknown role: ${roleString}, defaulting to NoviceDriver`);
      return UserRole.NoviceDriver;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
export const getRoleFromToken = (token: string): UserRole | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const roleString = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  if (!roleString) return null;

  return mapRoleStringToEnum(roleString);
};

export const getUserIdFromToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem(process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token');
  if (!token) return "";
  const decoded = decodeToken(token);
  return decoded?.id || "";
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  return new Date(decoded.exp * 1000);
};
