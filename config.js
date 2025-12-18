/**
 * Supabase Configuration
 * CORREÇÃO: Variável renomeada para 'supabaseClient' para evitar conflito com a biblioteca global.
 */

const SUPABASE_CONFIG = {
    // Seu ID de Projeto (peguei dos seus logs anteriores)
    url: 'https://auopipyzbprfrkgajvkr.supabase.co',

    // ⚠️ IMPORTANTE: Cole aqui a sua 'anon public key' do Supabase
    // Você pega ela no Dashboard > Project Settings > API > Project API keys
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3BpcHl6YnByZnJrZ2FqdmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzIwMzQsImV4cCI6MjA4MTY0ODAzNH0.Y2cKVQtlSy4UzsRXh3FM3tjet4e3jvLYYej7wLPJmrQ'
};

// Variável interna renomeada para não brigar com window.supabase
let supabaseClient = null;

function initSupabase() {
    // Verifica se a biblioteca do Supabase (CDN) foi carregada
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            // Cria o cliente usando a nova variável
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Cliente Supabase inicializado com sucesso');
            return true;
        } catch (e) {
            console.error('❌ Erro ao criar cliente Supabase:', e);
            return false;
        }
    } else {
        console.warn('⚠️ SDK do Supabase não carregado. Verifique o script no index.html.');
        return false;
    }
}

// Verifica se a chave foi configurada
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url.includes('auopipyzbprfrkgajvkr') &&
        SUPABASE_CONFIG.anonKey !== 'COLE_SUA_ANON_KEY_AQUI' &&
        SUPABASE_CONFIG.anonKey.length > 10;
}

// Exporta as funções para serem usadas no app.js
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initSupabase = initSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;

// Função para pegar o cliente já inicializado
window.getSupabaseClient = () => supabaseClient;