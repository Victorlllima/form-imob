/**
 * Supabase Configuration
 * Replace these values with your actual Supabase project credentials
 */

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    url: 'https://your-project-id.supabase.co',

    // Your Supabase anon/public key
    anonKey: 'your-anon-key-here'
};

// Initialize Supabase client
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase client initialized');
        return true;
    } else {
        console.warn('⚠️ Supabase SDK not loaded. Running in offline mode.');
        return false;
    }
}

// Check if Supabase is configured (not using placeholder values)
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url !== 'https://your-project-id.supabase.co' &&
        SUPABASE_CONFIG.anonKey !== 'your-anon-key-here';
}

// Export for use in app.js
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initSupabase = initSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseClient = () => supabase;
