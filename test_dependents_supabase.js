import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jjdykydkgtosiymxjpmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZHlreWRrZ3Rvc2l5bXhqcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNjIzODQsImV4cCI6MjAxNDgzODM4NH0.gV2jrgbe8ptcdJ0WoD10l1ycFUgHj9nKrx_tNCJzbjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanUp() {
  await supabase
    .from('Client')
    .update({ dependentsCount: 0, seniorCount: 0, disabledCount: 0, childCount: 0 })
    .eq('id', '5d38e340-bd91-4b13-bb7f-b5512e3ac17a');
  console.log('Restored test client data.');
}

cleanUp();
