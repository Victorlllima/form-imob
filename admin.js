/**
 * Admin Dashboard - JavaScript
 * Fetches and displays onboarding records from Supabase
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // Initialize Supabase
    if (typeof initSupabase === 'function') {
        const success = initSupabase();
        updateConnectionStatus(success && isSupabaseConfigured());
    }

    // Load records
    await loadRecords();
}

function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Conectado ao Supabase';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Supabase não configurado';
    }
}

async function loadRecords() {
    const refreshBtn = document.getElementById('refreshBtn');
    const recordsContainer = document.getElementById('recordsContainer');

    // Show loading state
    refreshBtn.classList.add('loading');
    recordsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⏳</div>
            <p>Carregando registros...</p>
        </div>
    `;

    try {
        // Check if Supabase is configured
        if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
            // Show demo data
            showDemoData();
            return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // Fetch records ordered by created_at descending
        const { data, error } = await supabase
            .from('onboarding_config')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            showEmptyState();
            return;
        }

        // Update stats
        updateStats(data);

        // Render records
        renderRecords(data);

    } catch (error) {
        console.error('Error loading records:', error);
        recordsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p>Erro ao carregar registros: ${error.message}</p>
            </div>
        `;
    } finally {
        refreshBtn.classList.remove('loading');
    }
}

function showDemoData() {
    const demoRecords = [
        {
            id: 'demo-001',
            created_at: new Date().toISOString(),
            tone_of_voice: 'friendly',
            typing_indicator: true,
            read_receipts: true,
            use_emojis: true,
            manual_intervention: true,
            return_command: '/voltar',
            auto_scheduling: true,
            email_agenda: 'corretor@imobiliaria.com',
            whatsapp_notificacao: '11999998888',
            neighborhoods: ['Centro', 'Noroeste', 'Asa Sul'],
            price_min: 300000,
            price_max: 1500000,
            triggers: ['human_request', 'exchange_interest', 'scheduling_request'],
            outros_gatilhos: 'Cliente VIP',
            followup_attempts: 3,
            hot_lead_timing: '15min',
            warm_lead_timing: '1day',
            info_adicional_followup: 'Não enviar mensagens aos domingos',
            pipeline_stages: [
                { order: 1, title: 'Lead Novo', description: 'Entrada via campanha' },
                { order: 2, title: 'Em Qualificação', description: 'IA atuando' },
                { order: 3, title: 'Agendado', description: 'Visita marcada' }
            ],
            auto_pipeline: true,
            data_retention: '6months',
            send_method: 'official',
            meta_verification: 'yes'
        }
    ];

    updateStats(demoRecords);
    renderRecords(demoRecords);

    const statusText = document.getElementById('statusText');
    statusText.textContent = 'Modo Demo (Supabase não configurado)';
}

function showEmptyState() {
    const recordsContainer = document.getElementById('recordsContainer');
    recordsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>Nenhum registro encontrado</p>
        </div>
    `;

    document.getElementById('totalRecords').textContent = '0';
    document.getElementById('todayRecords').textContent = '0';
    document.getElementById('lastUpdate').textContent = '-';
}

function updateStats(records) {
    const total = records.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = records.filter(r => r.created_at && r.created_at.startsWith(today)).length;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    document.getElementById('totalRecords').textContent = total;
    document.getElementById('todayRecords').textContent = todayCount;
    document.getElementById('lastUpdate').textContent = now;
}

function renderRecords(records) {
    const recordsContainer = document.getElementById('recordsContainer');

    recordsContainer.innerHTML = records.map(record => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <span class="record-id">ID: ${record.id || 'N/A'}</span>
                    <div class="record-date">${formatDate(record.created_at)}</div>
                </div>
                <span class="record-badge tone-${record.tone_of_voice || 'formal'}">
                    ${getToneLabel(record.tone_of_voice)}
                </span>
            </div>

            <div class="record-grid">
                <!-- Section: Contact & Notifications -->
                <div class="record-section">
                    <div class="record-section-title">📱 Contato</div>
                    <div class="record-field">
                        <div class="record-field-label">WhatsApp para Notificações</div>
                        <div class="record-field-value phone">${formatPhone(record.whatsapp_notificacao)}</div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">E-mail Agenda</div>
                        <div class="record-field-value">${record.email_agenda || '-'}</div>
                    </div>
                </div>

                <!-- Section: UX Configuration -->
                <div class="record-section">
                    <div class="record-section-title">✨ UX do Agente</div>
                    <div class="record-field">
                        <div class="record-field-label">Recursos Ativos</div>
                        <div class="tag-list">
                            ${record.typing_indicator ? '<span class="mini-tag">Digitando</span>' : ''}
                            ${record.read_receipts ? '<span class="mini-tag">Lido</span>' : ''}
                            ${record.use_emojis ? '<span class="mini-tag">Emojis</span>' : ''}
                            ${record.manual_intervention ? '<span class="mini-tag">Intervenção</span>' : ''}
                            ${record.auto_scheduling ? '<span class="mini-tag">Agendamento</span>' : ''}
                        </div>
                    </div>
                    ${record.return_command ? `
                    <div class="record-field">
                        <div class="record-field-label">Comando de Retomada</div>
                        <div class="record-field-value">/${record.return_command}</div>
                    </div>
                    ` : ''}
                </div>

                <!-- Section: Qualification -->
                <div class="record-section">
                    <div class="record-section-title">🎯 Qualificação</div>
                    <div class="record-field">
                        <div class="record-field-label">Bairros</div>
                        <div class="tag-list">
                            ${(record.neighborhoods || []).map(n => `<span class="mini-tag">${n}</span>`).join('')}
                        </div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">Faixa de Preço</div>
                        <div class="record-field-value">
                            ${formatCurrency(record.price_min)} - ${formatCurrency(record.price_max)}
                        </div>
                    </div>
                </div>

                <!-- Section: Follow-up -->
                <div class="record-section">
                    <div class="record-section-title">🔄 Follow-up</div>
                    <div class="record-field">
                        <div class="record-field-label">Tentativas</div>
                        <div class="record-field-value">${record.followup_attempts || 3}x</div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">Timing</div>
                        <div class="record-field-value">
                            Quentes: ${record.hot_lead_timing || '15min'} | 
                            Indicação: ${record.warm_lead_timing || '1day'}
                        </div>
                    </div>
                </div>

                <!-- Section: Infrastructure -->
                <div class="record-section">
                    <div class="record-section-title">⚙️ Infraestrutura</div>
                    <div class="record-field">
                        <div class="record-field-label">Retenção de Dados</div>
                        <div class="record-field-value">${getRetentionLabel(record.data_retention)}</div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">Método de Envio</div>
                        <div class="record-field-value">${record.send_method === 'official' ? 'API Oficial' : 'Não Oficial'}</div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">Meta Verificado</div>
                        <div class="record-field-value">${getVerificationLabel(record.meta_verification)}</div>
                    </div>
                </div>

                <!-- Section: Pipeline -->
                <div class="record-section">
                    <div class="record-section-title">📊 Pipeline CRM</div>
                    <div class="record-field">
                        <div class="record-field-label">Automação</div>
                        <div class="record-field-value">${record.auto_pipeline ? 'Ativada' : 'Manual'}</div>
                    </div>
                    <div class="record-field">
                        <div class="record-field-label">Estágios</div>
                        <div class="tag-list">
                            ${(record.pipeline_stages || []).map(s => `<span class="mini-tag">${s.title}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPhone(phone) {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
}

function formatCurrency(value) {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0
    }).format(value);
}

function getToneLabel(tone) {
    const labels = {
        'formal': 'Formal',
        'friendly': 'Amigável',
        'casual': 'Descontraído'
    };
    return labels[tone] || 'Não definido';
}

function getRetentionLabel(retention) {
    const labels = {
        '3months': '3 meses',
        '6months': '6 meses',
        '1year': '1 ano',
        'indefinite': 'Indeterminado'
    };
    return labels[retention] || retention;
}

function getVerificationLabel(verification) {
    const labels = {
        'yes': 'Sim',
        'no': 'Não',
        'unknown': 'Não sei'
    };
    return labels[verification] || verification;
}

// Make loadRecords available globally
window.loadRecords = loadRecords;
