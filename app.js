/**
 * Onboarding Form - V2 Interactive JavaScript
 * Handles form navigation, validation, conditional logic, and Supabase integration
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize Supabase
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    // Core functionality
    initNavigation();
    initCardSelect();
    initConditionalFields();
    initFileUpload();
    initTagInput();
    initPriceFormatting();
    initPhoneMask();
    initSlider();
    initKanbanBoard();
    initProgressSteps();
    initFormSubmission();
}

/* ============================================
   Navigation System
   ============================================ */
let currentSection = 1;
const totalSections = 6;

function initNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.addEventListener('click', goToPreviousSection);
    nextBtn.addEventListener('click', goToNextSection);

    updateNavigation();
}

function goToSection(sectionNumber) {
    if (sectionNumber < 1 || sectionNumber > totalSections) return;

    // Hide current section
    const currentEl = document.getElementById(`section${currentSection}`);
    currentEl.classList.remove('active');

    // Show new section
    currentSection = sectionNumber;
    const newEl = document.getElementById(`section${currentSection}`);
    newEl.classList.add('active');

    // Update navigation
    updateNavigation();
    updateProgress();

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPreviousSection() {
    goToSection(currentSection - 1);
}

function goToNextSection() {
    // Basic validation before proceeding
    if (validateCurrentSection()) {
        goToSection(currentSection + 1);
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Previous button
    prevBtn.disabled = currentSection === 1;

    // Next/Submit button
    if (currentSection === totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

function updateProgress() {
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentSection / totalSections) * 100;
    progressFill.style.width = `${percentage}%`;

    // Update step indicators
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum === currentSection) {
            step.classList.add('active');
        } else if (stepNum < currentSection) {
            step.classList.add('completed');
        }
    });
}

function validateCurrentSection() {
    // Add validation logic as needed
    // For now, return true to allow navigation
    return true;
}

function initProgressSteps() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('click', () => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum <= currentSection) {
                goToSection(stepNum);
            }
        });
    });
}

/* ============================================
   Card Select (Single Select)
   ============================================ */
function initCardSelect() {
    const cardSelects = document.querySelectorAll('.card-select');

    cardSelects.forEach(container => {
        // Prevent duplicate initialization
        if (container.dataset.initialized) return;
        container.dataset.initialized = 'true';

        const cards = container.querySelectorAll('.select-card');
        const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');

        cards.forEach(card => {
            card.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log('Card clicked:', this.dataset.value);

                // Remove selection from all cards in this container
                cards.forEach(c => c.classList.remove('selected'));

                // Add selection to clicked card
                this.classList.add('selected');

                // Update hidden input
                if (hiddenInput) {
                    hiddenInput.value = this.dataset.value;
                    // Trigger change event for any listeners
                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                console.log('Card selection updated:', this.dataset.value);
            });
        });
    });
}

/* ============================================
   Conditional Fields Logic
   ============================================ */
function initConditionalFields() {
    // Manual Intervention -> Return Command
    const manualInterventionToggle = document.getElementById('manualIntervention');
    const returnCommandGroup = document.getElementById('returnCommandGroup');

    if (manualInterventionToggle && returnCommandGroup) {
        manualInterventionToggle.addEventListener('change', () => {
            toggleConditionalField(returnCommandGroup, manualInterventionToggle.checked);
        });
    }

    // Auto Scheduling -> Email Agenda
    const autoSchedulingToggle = document.getElementById('autoScheduling');
    const emailAgendaGroup = document.getElementById('emailAgendaGroup');

    if (autoSchedulingToggle && emailAgendaGroup) {
        autoSchedulingToggle.addEventListener('change', () => {
            toggleConditionalField(emailAgendaGroup, autoSchedulingToggle.checked);
        });
    }
}

function toggleConditionalField(element, show) {
    if (show) {
        element.classList.remove('hiding');
        element.style.display = 'block';
        // Trigger reflow for animation
        element.offsetHeight;
    } else {
        element.classList.add('hiding');
        setTimeout(() => {
            if (element.classList.contains('hiding')) {
                element.style.display = 'none';
                element.classList.remove('hiding');
            }
        }, 300);
    }
}

/* ============================================
   File Upload with Drag & Drop
   ============================================ */
function initFileUpload() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

    if (!dropZone || !fileInput) {
        console.error('File upload elements not found');
        return;
    }

    // Prevent duplicate initialization
    if (dropZone.dataset.initialized) return;
    dropZone.dataset.initialized = 'true';

    // Garante que a lista global seja um array
    if (!Array.isArray(window.uploadedFiles)) {
        window.uploadedFiles = [];
    }

    console.log('✅ initFileUpload: Initializing...', { dropZone, fileInput });

    // Click handler for opening dialog
    dropZone.addEventListener('click', function (e) {
        if (e.target.closest('.remove-file')) return;
        console.log('📁 DropZone clicked, opening file dialog...');
        fileInput.click();
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });

    // Handle drop
    dropZone.addEventListener('drop', (e) => {
        const droppedFiles = e.dataTransfer.files;
        handleFiles(droppedFiles);
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleFiles(fileInput.files);
        }
    });

    function handleFiles(newFiles) {
        const maxSize = 10 * 1024 * 1024; // 10MB

        // Use a local let that explicitly refers to the global list to be safe
        let currentList = window.uploadedFiles;
        if (!Array.isArray(currentList)) currentList = [];

        Array.from(newFiles).forEach(file => {
            if (file.size > maxSize) {
                if (typeof showNotification === 'function') {
                    showNotification(`${file.name} excede 10MB`, 'error');
                } else {
                    alert(`${file.name} excede 10MB`);
                }
                return;
            }
            currentList.push(file);
        });

        window.uploadedFiles = currentList;
        renderFiles();
    }

    function renderFiles() {
        if (!uploadedFilesContainer) return;

        const currentList = window.uploadedFiles || [];

        uploadedFilesContainer.innerHTML = currentList.map((file, index) => `
            <div class="file-tag" style="display: inline-flex; align-items: center; gap: 8px; background: #f3f4f6; padding: 4px 12px; border-radius: 16px; margin: 4px; font-size: 0.9em; color: #333; border: 1px solid #ddd;">
                <span>📄 ${file.name}</span>
                <button type="button" class="remove-file" data-index="${index}" style="border:none; background:none; cursor:pointer; font-weight:bold; color: #ff4d4d; padding: 0 4px; font-size: 1.2em;">×</button>
            </div>
        `).join('');

        // Re-adiciona eventos de remover
        uploadedFilesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.index);
                if (window.uploadedFiles[index]) {
                    window.uploadedFiles.splice(index, 1);
                    renderFiles();
                }
            });
        });
    }

    // Initial render in case there are already files
    renderFiles();
}

/* ============================================
   Tag Input (Neighborhoods)
   ============================================ */
let neighborhoodTags = [];

function initTagInput() {
    const container = document.getElementById('neighborhoodTags');
    const input = document.getElementById('neighborhoodInput');

    if (!container || !input) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = input.value.trim();

            if (value && !neighborhoodTags.includes(value)) {
                neighborhoodTags.push(value);
                renderTags();
                input.value = '';
            }
        }

        // Remove last tag on backspace if input is empty
        if (e.key === 'Backspace' && input.value === '' && neighborhoodTags.length > 0) {
            neighborhoodTags.pop();
            renderTags();
        }
    });

    function renderTags() {
        const tagsHtml = neighborhoodTags.map((tag, index) => `
            <span class="tag">
                ${tag}
                <button type="button" class="remove-tag" data-index="${index}">×</button>
            </span>
        `).join('');

        container.querySelector('.tags-wrapper').innerHTML = tagsHtml + `
            <input type="text" class="tag-input" placeholder="${neighborhoodTags.length ? '' : 'Digite e pressione Enter...'}" id="neighborhoodInput">
        `;

        // Re-initialize input reference and events
        const newInput = document.getElementById('neighborhoodInput');
        newInput.focus();

        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = newInput.value.trim();

                if (value && !neighborhoodTags.includes(value)) {
                    neighborhoodTags.push(value);
                    renderTags();
                }
            }

            if (e.key === 'Backspace' && newInput.value === '' && neighborhoodTags.length > 0) {
                neighborhoodTags.pop();
                renderTags();
            }
        });

        // Add remove handlers
        container.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                neighborhoodTags.splice(index, 1);
                renderTags();
            });
        });
    }
}

/* ============================================
   Price Formatting
   ============================================ */
function initPriceFormatting() {
    const priceInputs = document.querySelectorAll('.number-input');

    priceInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = formatCurrency(value);
            e.target.value = value;
        });

        input.addEventListener('blur', (e) => {
            if (e.target.value === '') {
                e.target.value = '';
            }
        });
    });
}

function formatCurrency(value) {
    if (!value) return '';

    // Convert to number and format with dots
    const number = parseInt(value, 10);
    return number.toLocaleString('pt-BR');
}

function parseCurrency(value) {
    if (!value) return null;
    return parseInt(value.replace(/\D/g, ''), 10) || null;
}

/* ============================================
   Phone Mask (XX) XXXXX-XXXX
   ============================================ */
function initPhoneMask() {
    const phoneInput = document.getElementById('whatsappNotificacao');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        // Limit to 11 digits
        value = value.substring(0, 11);

        // Apply mask
        if (value.length > 0) {
            value = '(' + value;
        }
        if (value.length > 3) {
            value = value.substring(0, 3) + ') ' + value.substring(3);
        }
        if (value.length > 10) {
            value = value.substring(0, 10) + '-' + value.substring(10);
        }

        e.target.value = value;
    });

    // Prevent non-numeric input
    phoneInput.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
            e.preventDefault();
        }
    });
}

function parsePhone(value) {
    if (!value) return null;
    return value.replace(/\D/g, '') || null;
}

/* ============================================
   Slider
   ============================================ */
function initSlider() {
    const slider = document.getElementById('followupSlider');
    const valueDisplay = document.getElementById('sliderValue');

    if (!slider || !valueDisplay) return;

    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;

        // Update slider track fill
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, 
            hsl(245, 85%, 60%) 0%, 
            hsl(280, 80%, 60%) ${percentage}%, 
            hsl(240, 10%, 15%) ${percentage}%)`;
    });

    // Initialize on load
    slider.dispatchEvent(new Event('input'));
}

/* ============================================
   Kanban Board (Drag & Drop)
   ============================================ */
function initKanbanBoard() {
    const board = document.getElementById('kanbanBoard');
    const addBtn = document.getElementById('addColumnBtn');

    if (!board || !addBtn) return;

    let columnId = 7; // Start after initial 6 columns

    // Initialize drag and drop for existing columns
    initColumnDragAndDrop();

    // Delete column functionality
    board.addEventListener('click', (e) => {
        if (e.target.classList.contains('column-delete')) {
            const column = e.target.closest('.kanban-column');
            const columns = board.querySelectorAll('.kanban-column');

            if (columns.length <= 2) {
                showNotification('Você precisa ter pelo menos 2 estágios', 'warning');
                return;
            }

            column.style.transform = 'scale(0.9)';
            column.style.opacity = '0';

            setTimeout(() => {
                column.remove();
            }, 200);
        }
    });

    // Add new column
    addBtn.addEventListener('click', () => {
        const newColumn = document.createElement('div');
        newColumn.className = 'kanban-column glass';
        newColumn.dataset.columnId = columnId++;
        newColumn.draggable = true;
        newColumn.innerHTML = `
            <div class="column-header">
                <input type="text" class="column-title" value="Novo Estágio" data-original="Novo Estágio">
                <button type="button" class="column-delete" title="Remover coluna">×</button>
            </div>
            <div class="column-description">Descrição do estágio</div>
            <div class="column-drag-handle">⋮⋮</div>
        `;

        board.insertBefore(newColumn, addBtn);

        // Add animation
        newColumn.style.opacity = '0';
        newColumn.style.transform = 'translateY(-10px)';

        requestAnimationFrame(() => {
            newColumn.style.transition = 'all 0.3s ease';
            newColumn.style.opacity = '1';
            newColumn.style.transform = 'translateY(0)';
        });

        // Focus on the title input
        const titleInput = newColumn.querySelector('.column-title');
        titleInput.select();

        // Reinitialize drag and drop
        initColumnDragAndDrop();
    });

    function initColumnDragAndDrop() {
        const columns = board.querySelectorAll('.kanban-column');

        columns.forEach(column => {
            column.addEventListener('dragstart', handleDragStart);
            column.addEventListener('dragend', handleDragEnd);
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('drop', handleDrop);
            column.addEventListener('dragenter', handleDragEnter);
            column.addEventListener('dragleave', handleDragLeave);
        });
    }

    let draggedColumn = null;

    function handleDragStart(e) {
        draggedColumn = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.columnId);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedColumn = null;

        // Remove all drag-over classes
        board.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (this !== draggedColumn) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();

        if (this !== draggedColumn && draggedColumn) {
            // Get all columns
            const allColumns = [...board.querySelectorAll('.kanban-column')];
            const draggedIdx = allColumns.indexOf(draggedColumn);
            const droppedIdx = allColumns.indexOf(this);

            if (draggedIdx < droppedIdx) {
                this.parentNode.insertBefore(draggedColumn, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedColumn, this);
            }
        }

        this.classList.remove('drag-over');
    }
}

/* ============================================
   Form Submission with Supabase Integration
   ============================================ */
function initFormSubmission() {
    const form = document.getElementById('onboardingForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading
        showLoading(true);
        submitBtn.disabled = true;

        try {
            // Collect all form data
            const formData = collectFormData();
            console.log('Form data to submit:', formData);

            // Check if Supabase is configured
            if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
                // Submit to Supabase
                await submitToSupabase(formData);
            } else {
                // Simulate submission for development
                console.warn('⚠️ Supabase not configured. Running in demo mode.');
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            // Show success
            showLoading(false);
            showSuccessModal();

        } catch (error) {
            console.error('Error submitting form:', error);
            showLoading(false);
            showErrorModal(error.message || 'Erro ao salvar configurações. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

/* ============================================
   Lógica de Upload + Envio ao Banco
   ============================================ */

// Função Auxiliar para subir arquivos
async function uploadFilesToStorage(supabase) {
    const files = window.uploadedFiles || [];
    const uploadedLinks = [];

    if (files.length === 0) return [];

    console.log(`📡 Iniciando upload de ${files.length} arquivos para 'benchmarking-files'...`);

    for (const file of files) {
        try {
            // Limpa o nome do arquivo para evitar erros de URL
            const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `benchmarking/${Date.now()}_${cleanName}`;

            // Upload
            const { data, error } = await supabase.storage
                .from('benchmarking-files')
                .upload(filePath, file);

            if (error) {
                console.warn(`Erro no upload de ${file.name}:`, error.message);
                continue; // Pula para o próximo
            }

            // Pega URL Pública
            const { data: publicData } = supabase.storage
                .from('benchmarking-files')
                .getPublicUrl(filePath);

            if (publicData) {
                uploadedLinks.push({
                    name: file.name,
                    url: publicData.publicUrl,
                    type: file.type
                });
            }

        } catch (err) {
            console.error(`Falha crítica no arquivo ${file.name}:`, err);
        }
    }

    return uploadedLinks;
}

// Função Principal de Envio
async function submitToSupabase(formData) {
    const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    // 1. FAZ O UPLOAD DOS ARQUIVOS PRIMEIRO
    let uploadedFilesData = [];
    try {
        uploadedFilesData = await uploadFilesToStorage(supabase);
    } catch (uploadError) {
        console.error('Erro no processo de upload:', uploadError);
        // Não impedimos o envio do formulário, apenas logamos o erro
    }

    // 2. PREPARA O PAYLOAD (Com os links dos arquivos)
    const payload = {
        // Section 1: Identity & UX
        tone_of_voice: formData.toneOfVoice || null,
        typing_indicator: formData.typingIndicator || false,
        read_receipts: formData.readReceipts || false,
        use_emojis: formData.useEmojis || false,

        // Section 2: Management & Intervention
        manual_intervention: formData.manualIntervention || false,
        return_command: formData.returnCommand || null,
        auto_scheduling: formData.autoScheduling || false,
        email_agenda: formData.emailAgenda || null,
        whatsapp_notification: formData.whatsappNotificacao || null,

        // Section 3: Qualification & Overflow
        neighborhoods: formData.neighborhoods || [],
        price_min: formData.priceMin || null,
        price_max: formData.priceMax || null,
        triggers: formData.triggers || [],
        other_triggers: formData.outrosGatilhos || null,

        // --- NOVO CAMPO DE ARQUIVOS ---
        benchmarking_files: uploadedFilesData,
        // ------------------------------

        // Section 4: Follow-up
        followup_attempts: formData.followupAttempts || 3,
        hot_lead_timing: formData.hotLeadTiming || '15min',
        warm_lead_timing: formData.warmLeadTiming || '1day',
        additional_info_followup: formData.infoAdicionalFollowup || null,

        // Section 5: Pipeline (stored as JSONB to preserve order)
        pipeline_stages: formData.pipelineStages || [],
        auto_pipeline: formData.autoPipeline || false,

        // Section 6: Infrastructure
        data_retention: formData.dataRetention || '6months',
        send_method: formData.sendMethod || 'official',
        meta_verification: formData.metaVerification || 'unknown',

        // Metadata
        created_at: new Date().toISOString()
    };

    console.log('Enviando para o Supabase:', payload);

    const { data, error } = await supabase
        .from('onboarding_config')
        .insert([payload])
        .select();

    if (error) {
        console.error('Erro no Supabase:', error);
        throw new Error(error.message);
    }

    console.log('Salvo com sucesso:', data);
    return data;
}

function collectFormData() {
    const form = document.getElementById('onboardingForm');
    const formData = new FormData(form);
    const data = {};

    // Process FormData
    for (let [key, value] of formData.entries()) {
        // Handle checkbox arrays
        if (key.endsWith('[]')) {
            const cleanKey = key.slice(0, -2);
            if (!data[cleanKey]) {
                data[cleanKey] = [];
            }
            data[cleanKey].push(value);
        } else {
            data[key] = value;
        }
    }

    // Handle checkboxes (unchecked ones won't be in FormData)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.name.endsWith('[]')) {
            // Convert to camelCase for JS object
            const camelKey = checkbox.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            data[camelKey] = checkbox.checked;
        }
    });

    // Card select (tone of voice)
    const selectedCard = document.querySelector('.select-card.selected');
    if (selectedCard) {
        data.toneOfVoice = selectedCard.dataset.value;
    }

    // Tags (neighborhoods) - use the global array
    data.neighborhoods = [...neighborhoodTags];

    // Parse price values
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) data.priceMin = parseCurrency(priceMin.value);
    if (priceMax) data.priceMax = parseCurrency(priceMax.value);

    // Get textarea values
    const outrosGatilhos = form.querySelector('input[name="outrosGatilhos"]');
    if (outrosGatilhos) data.outrosGatilhos = outrosGatilhos.value || null;

    const infoAdicional = form.querySelector('textarea[name="infoAdicionalFollowup"]');
    if (infoAdicional) data.infoAdicionalFollowup = infoAdicional.value || null;

    const emailAgenda = form.querySelector('input[name="emailAgenda"]');
    if (emailAgenda) data.emailAgenda = emailAgenda.value || null;

    // WhatsApp Notification
    const whatsappInput = document.getElementById('whatsappNotificacao');
    if (whatsappInput) data.whatsappNotificacao = parsePhone(whatsappInput.value);

    // Kanban columns order (as JSONB array)
    const columns = document.querySelectorAll('.kanban-column');
    data.pipelineStages = Array.from(columns).map((col, index) => {
        const titleInput = col.querySelector('.column-title');
        const description = col.querySelector('.column-description');
        return {
            order: index + 1,
            title: titleInput ? titleInput.value : '',
            description: description ? description.textContent : ''
        };
    }).filter(stage => stage.title);

    // Get followup attempts from slider
    const slider = document.getElementById('followupSlider');
    if (slider) data.followupAttempts = parseInt(slider.value, 10);

    return data;
}

/* ============================================
   Modal Functions
   ============================================ */
function showSuccessModal() {
    // Hide the main content area and show success page
    const mainContent = document.querySelector('.main-content');
    const successPage = document.getElementById('successPage');
    const progressContainer = document.querySelector('.progress-container');

    if (mainContent) mainContent.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    if (successPage) successPage.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}

function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const messageEl = document.getElementById('errorMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    modal.classList.add('active');
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('active');
}

function showLoading(show, message = 'Salvando configurações...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingMessage = overlay.querySelector('p');

    if (loadingMessage) {
        loadingMessage.textContent = message;
    }

    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Make functions available globally
window.closeModal = closeModal;
window.closeErrorModal = closeErrorModal;

/* ============================================
   Utility Functions
   ============================================ */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">×</button>
    `;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 24px',
        background: type === 'error' ? 'hsl(0, 70%, 55%)' :
            type === 'warning' ? 'hsl(35, 90%, 55%)' :
                'hsl(245, 85%, 60%)',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: '1001',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideIn 0.3s ease'
    });

    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: background 0.2s;
    }
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.4);
    }
`;
document.head.appendChild(style);

/* ============================================
   Keyboard Navigation
   ============================================ */
document.addEventListener('keydown', (e) => {
    // Alt + Arrow keys for section navigation
    if (e.altKey) {
        if (e.key === 'ArrowRight' && currentSection < totalSections) {
            e.preventDefault();
            goToNextSection();
        } else if (e.key === 'ArrowLeft' && currentSection > 1) {
            e.preventDefault();
            goToPreviousSection();
        }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        const successModal = document.getElementById('successModal');
        const errorModal = document.getElementById('errorModal');

        if (successModal.classList.contains('active')) {
            closeModal();
        }
        if (errorModal.classList.contains('active')) {
            closeErrorModal();
        }
    }
});

/* ============================================
   Intersection Observer for Animations
   ============================================ */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe form groups for entrance animations
document.querySelectorAll('.form-group').forEach(group => {
    group.style.opacity = '0';
    group.style.transform = 'translateY(20px)';
    group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(group);
});