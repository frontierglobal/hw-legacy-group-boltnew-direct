import { supabase } from './supabase';
import { Property, Business, Investment, Document, Transaction, User, Role } from '../types';

// Define UserStatus type locally since it's not exported from types
interface UserStatus {
  email_verified: boolean;
  phone_verified: boolean;
  [key: string]: any;
}

interface RoleData {
  role: Role;
}

// Properties
export const getProperties = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published');
    if (error) throw error;
    return data as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getProperty = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Property;
};

// Businesses
export const getBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'published');
  if (error) throw error;
  return data as Business[];
};

export const getBusiness = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Business;
};

// Investments
export const getUserInvestments = async (userId: string) => {
  try {
    // First fetch investments
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId);
    
    if (investmentsError) throw investmentsError;
    if (!investments?.length) return [];

    // Separate property and business IDs
    const propertyIds = investments
      .filter(inv => inv.type === 'property')
      .map(inv => inv.target_id);
    
    const businessIds = investments
      .filter(inv => inv.type === 'business')
      .map(inv => inv.target_id);

    // Fetch related data in parallel
    const [propertyData, businessData] = await Promise.all([
      propertyIds.length > 0 
        ? supabase.from('properties').select('*').in('id', propertyIds)
        : { data: [], error: null },
      businessIds.length > 0
        ? supabase.from('businesses').select('*').in('id', businessIds)
        : { data: [], error: null }
    ]);

    if (propertyData.error) throw propertyData.error;
    if (businessData.error) throw businessData.error;

    // Map properties and businesses to investments
    return investments.map(investment => ({
      ...investment,
      property: investment.type === 'property'
        ? propertyData.data?.find(p => p.id === investment.target_id)
        : undefined,
      business: investment.type === 'business'
        ? businessData.data?.find(b => b.id === investment.target_id)
        : undefined
    })) as Investment[];
  } catch (error) {
    console.error('Error fetching user investments:', error);
    throw error;
  }
};

export const createInvestment = async (investment: Partial<Investment>) => {
  const { data, error } = await supabase
    .from('investments')
    .insert(investment)
    .select()
    .single();
  if (error) throw error;
  return data as Investment;
};

// Documents
export const getUserDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Document[];
};

// Transactions
export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Transaction[];
};

// Admin Functions
export const isUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      roles:user_roles(
        role:roles(
          name
        )
      )
    `);
  
  if (error) throw error;

  // Transform the roles data to match the expected format
  return data.map(user => ({
    ...user,
    roles: (user.roles as RoleData[] | null)?.map(r => r.role) || []
  }));
};

export const updateUserStatus = async (userId: string, updates: Partial<UserStatus>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Property Management
export const createProperty = async (property: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single();
  if (error) throw error;
  return data as Property;
};

export const updateProperty = async (id: string, updates: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Property;
};

// Business Management
export const createBusiness = async (business: Partial<Business>) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select()
    .single();
  if (error) throw error;
  return data as Business;
};

export const updateBusiness = async (id: string, updates: Partial<Business>) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Business;
};