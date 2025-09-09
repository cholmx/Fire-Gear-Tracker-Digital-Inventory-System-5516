// PostgreSQL Database Configuration
// This file is kept for compatibility but the app now uses direct PostgreSQL connection

export const createClient = () => {
  console.warn('Supabase client not configured. Using local storage as fallback.');
  
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: new Error('Database not connected') }),
      update: () => Promise.resolve({ data: null, error: new Error('Database not connected') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Database not connected') })
    })
  };
};

export default createClient();