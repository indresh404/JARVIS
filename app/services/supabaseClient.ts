import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdoeuuhmolnscgrtitxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2V1dWhtb2xuc2NncnRpdHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ1NTg4NCwiZXhwIjoyMDkxMDMxODg0fQ.Mkwv3ntb-YX0_NOampGaIddohMCPWnLCJcK4ItUou4w';

export const supabase = createClient(supabaseUrl, supabaseKey);
