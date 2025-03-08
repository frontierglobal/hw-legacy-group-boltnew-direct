import { supabase } from './supabase';
import { Property, Business, Investment, Document, Transaction } from '../types';

// Properties
export const getProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'published');
  if (error) throw error;
  return data as Property[];
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
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      properties (*),
      businesses (*)
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return data as Investment[];
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
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles!inner(*)')
    .eq('user_id', userId)
    .eq('roles.name', 'admin')
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles!inner(roles!inner(*))');
  if (error) throw error;
  return data;
};

export const updateUserStatus = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
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