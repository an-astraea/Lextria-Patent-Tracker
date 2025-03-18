
import { supabase } from '@/integrations/supabase/client';

// Export functionality from individual modules
export * from './auth';
export * from './patents';
export * from './employees';
export * from './inventors';
export * from './review';
export * from './timeline';
export * from './drafter';
export * from './filer';
export * from './fer';
export * from './payment';

// Any additional shared functionality can be defined here
