document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    const tableBody = document.getElementById('responsesTableBody');
    const loadingEl = document.getElementById('loadingData');

    // Verifica se o cliente Supabase está disponível (usando a config global)
    const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

    if (!supabase) {
        if (loadingEl) loadingEl.textContent = 'Erro: Configuração do Supabase não encontrada.';
        return;
    }

    try {
        // Busca os dados ordenados pelos mais recentes
        const { data, error } = await supabase
            .from('onboarding_config')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Limpa o loading
        if (loadingEl) loadingEl.style.display = 'none';

        // Renderiza as linhas
        renderTableRows(data, tableBody);

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        if (loadingEl) {
            loadingEl.textContent = 'Erro ao carregar dados. Verifique o console e as políticas RLS.';
            loadingEl.style.color = 'red';
        }
    }
}

function renderTableRows(data, tableBody) {
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhuma resposta encontrada ainda.</td></tr>';
        return;
    }

    tableBody.innerHTML = data.map(row => {
        // Formata a data
        const date = new Date(row.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        // Formata estágios do CRM para exibição
        const crmStages = row.pipeline_stages
            ? row.pipeline_stages.map(s => s.title).join(' → ')
            : '-';

        return `
            <tr>
                <td>${date}</td>
                <td>
                    <strong>${row.whatsapp_notification || '-'}</strong>
                </td>
                <td>
                    <span class="badge">${row.tone_of_voice || 'N/A'}</span>
                </td>
                <td>
                    Intervenção: ${row.manual_intervention ? 'Sim' : 'Não'}<br>
                    Agenda Auto: ${row.auto_scheduling ? 'Sim' : 'Não'}
                </td>
                <td title="${crmStages}">
                    ${crmStages.substring(0, 50)}${crmStages.length > 50 ? '...' : ''}
                </td>
                <td>
                    <button onclick="viewDetails('${row.id}')" class="btn-sm">Ver Detalhes</button>
                </td>
            </tr>
        `;
    }).join('');

    // Salva os dados globalmente para o modal de detalhes usar
    window.dashboardData = data;
}

// Função para ver detalhes (você pode implementar um modal simples depois)
window.viewDetails = function (id) {
    const row = window.dashboardData.find(r => r.id === id);
    if (row) {
        alert(`Detalhes de ${row.whatsapp_notification}:\n\nBairros: ${JSON.stringify(row.neighborhoods)}\nPreço: ${row.price_min} - ${row.price_max}\nGatilhos: ${JSON.stringify(row.triggers)}\nOutros: ${row.other_triggers || '-'}`);
    }
};