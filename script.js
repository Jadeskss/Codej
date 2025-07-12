// Application State
let programs = [];
let currentEditId = null;
let currentViewId = null;
let currentFilter = 'all';

// DOM Elements
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const addCodeBtn = document.getElementById('addCodeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const codeModal = document.getElementById('codeModal');
const viewModal = document.getElementById('viewModal');
const codeForm = document.getElementById('codeForm');
const programsGrid = document.getElementById('programsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

// Default password - you can change this
const APP_PASSWORD = 'jade123';

// Local Storage Keys
const STORAGE_KEY = 'codej_programs';
const AUTH_KEY = 'codej_authenticated';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadPrograms();
    setupEventListeners();
});

// Authentication Functions
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
    if (isAuthenticated) {
        showMainApp();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    loginPage.classList.remove('hidden');
    mainApp.classList.add('hidden');
    passwordInput.focus();
}

function showMainApp() {
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    renderPrograms();
}

function authenticateUser(password) {
    if (password === APP_PASSWORD) {
        localStorage.setItem(AUTH_KEY, 'true');
        showMainApp();
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    showLoginPage();
    passwordInput.value = '';
}

// Event Listeners Setup
function setupEventListeners() {
    // Login Form
    loginForm.addEventListener('submit', handleLogin);
    
    // Header Actions
    addCodeBtn.addEventListener('click', () => openAddModal());
    logoutBtn.addEventListener('click', logout);
    
    // Code Form
    codeForm.addEventListener('submit', handleCodeSubmit);
    
    // Search and Filter
    searchInput.addEventListener('input', handleSearch);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    
    // Modal Close Events
    window.addEventListener('click', (e) => {
        if (e.target === codeModal) closeModal();
        if (e.target === viewModal) closeViewModal();
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeViewModal();
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const password = passwordInput.value.trim();
    
    if (!password) {
        showError('Please enter a password');
        return;
    }
    
    if (authenticateUser(password)) {
        showSuccess('Login successful!');
    } else {
        showError('Incorrect password');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Program Management Functions
function loadPrograms() {
    const stored = localStorage.getItem(STORAGE_KEY);
    programs = stored ? JSON.parse(stored) : [];
}

function savePrograms() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addProgram(programData) {
    const program = {
        id: generateId(),
        ...programData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    programs.unshift(program);
    savePrograms();
    renderPrograms();
    showSuccess('Code program added successfully!');
}

function updateProgram(id, programData) {
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
        programs[index] = {
            ...programs[index],
            ...programData,
            updatedAt: new Date().toISOString()
        };
        savePrograms();
        renderPrograms();
        showSuccess('Code program updated successfully!');
    }
}

function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        programs = programs.filter(p => p.id !== id);
        savePrograms();
        renderPrograms();
        closeViewModal();
        showSuccess('Code program deleted successfully!');
    }
}

// Modal Functions
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Code Program';
    resetForm();
    codeModal.classList.add('active');
    document.getElementById('programTitle').focus();
}

function openEditModal(id) {
    const program = programs.find(p => p.id === id);
    if (!program) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Code Program';
    
    // Populate form with existing data
    document.getElementById('programTitle').value = program.title;
    document.getElementById('programLanguage').value = program.language;
    document.getElementById('programTags').value = program.tags ? program.tags.join(', ') : '';
    document.getElementById('programDescription').value = program.description || '';
    document.getElementById('programCode').value = program.code;
    document.getElementById('programUrl').value = program.url || '';
    
    codeModal.classList.add('active');
    document.getElementById('programTitle').focus();
}

function closeModal() {
    codeModal.classList.remove('active');
    resetForm();
    currentEditId = null;
}

function resetForm() {
    codeForm.reset();
}

// View Modal Functions
function openViewModal(id) {
    const program = programs.find(p => p.id === id);
    if (!program) return;
    
    currentViewId = id;
    
    // Populate view modal
    document.getElementById('viewTitle').textContent = program.title;
    document.getElementById('viewLanguage').textContent = program.language.charAt(0).toUpperCase() + program.language.slice(1);
    document.getElementById('viewDate').textContent = formatDate(program.createdAt);
    document.getElementById('viewDescription').textContent = program.description || 'No description provided';
    document.getElementById('viewCode').textContent = program.code;
    
    // Handle tags
    const tagsContainer = document.getElementById('viewTags');
    if (program.tags && program.tags.length > 0) {
        tagsContainer.innerHTML = program.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        document.getElementById('viewTagsContainer').style.display = 'flex';
    } else {
        document.getElementById('viewTagsContainer').style.display = 'none';
    }
    
    // Handle URL
    const urlContainer = document.getElementById('viewUrlContainer');
    const urlLink = document.getElementById('viewUrl');
    if (program.url) {
        urlLink.href = program.url;
        urlContainer.style.display = 'block';
    } else {
        urlContainer.style.display = 'none';
    }
    
    viewModal.classList.add('active');
}

function closeViewModal() {
    viewModal.classList.remove('active');
    currentViewId = null;
}

function editProgram(id) {
    closeViewModal();
    openEditModal(id);
}

function copyCode() {
    const codeElement = document.getElementById('viewCode');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Code copied to clipboard!');
    });
}

// Form Handler
function handleCodeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = document.getElementById('programTitle').value.trim();
    const language = document.getElementById('programLanguage').value;
    const tags = document.getElementById('programTags').value.trim();
    const description = document.getElementById('programDescription').value.trim();
    const code = document.getElementById('programCode').value.trim();
    const url = document.getElementById('programUrl').value.trim();
    
    // Validation
    if (!title) {
        showError('Please enter a program title');
        return;
    }
    
    if (!language) {
        showError('Please select a language');
        return;
    }
    
    if (!code) {
        showError('Please enter the code');
        return;
    }
    
    const programData = {
        title,
        language,
        description,
        code,
        url,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    
    if (currentEditId) {
        updateProgram(currentEditId, programData);
    } else {
        addProgram(programData);
    }
    
    closeModal();
}

// Search and Filter Functions
function handleSearch() {
    renderPrograms();
}

function handleFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderPrograms();
}

function filterPrograms(programs) {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filtered = programs;
    
    // Apply language filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(program => program.language === currentFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(program => 
            program.title.toLowerCase().includes(searchTerm) ||
            program.description.toLowerCase().includes(searchTerm) ||
            program.language.toLowerCase().includes(searchTerm) ||
            (program.tags && program.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    return filtered;
}

// Render Functions
function renderPrograms() {
    const filteredPrograms = filterPrograms(programs);
    
    if (filteredPrograms.length === 0) {
        programsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        
        if (programs.length === 0) {
            emptyState.querySelector('h3').textContent = 'No code programs yet';
            emptyState.querySelector('p').textContent = 'Start by adding your first code program';
        } else {
            emptyState.querySelector('h3').textContent = 'No programs found';
            emptyState.querySelector('p').textContent = 'Try adjusting your search or filters';
        }
    } else {
        programsGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        programsGrid.innerHTML = filteredPrograms.map(program => createProgramCard(program)).join('');
    }
}

function createProgramCard(program) {
    const tagsHtml = program.tags && program.tags.length > 0 
        ? `<div class="program-tags">${program.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';
    
    return `
        <div class="program-card" onclick="openViewModal('${program.id}')">
            <div class="program-header">
                <div>
                    <h3 class="program-title">${escapeHtml(program.title)}</h3>
                </div>
                <span class="program-language">${program.language.charAt(0).toUpperCase() + program.language.slice(1)}</span>
            </div>
            
            <p class="program-description">${escapeHtml(program.description || 'No description provided')}</p>
            
            ${tagsHtml}
            
            <div class="program-footer">
                <span>${formatDate(program.createdAt)}</span>
                <div class="program-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="openEditModal('${program.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProgram('${program.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Import/Export Functions
function exportData() {
    const data = {
        programs: programs,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `codej_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.programs && Array.isArray(data.programs)) {
                    if (programs.length > 0) {
                        if (confirm('This will replace all your current programs. Continue?')) {
                            programs = data.programs;
                            savePrograms();
                            renderPrograms();
                            showSuccess('Data imported successfully!');
                        }
                    } else {
                        programs = data.programs;
                        savePrograms();
                        renderPrograms();
                        showSuccess('Data imported successfully!');
                    }
                } else {
                    showError('Invalid backup file format');
                }
            } catch (error) {
                showError('Error reading backup file');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function syncToCloud() {
    if (typeof syncToSupabase !== 'undefined') {
        syncToSupabase();
    } else {
        showSupabaseConfig();
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                border-left: 4px solid;
            }
            
            .notification.success {
                border-left-color: #10b981;
                color: #065f46;
            }
            
            .notification.success i {
                color: #10b981;
            }
            
            .notification.error {
                border-left-color: #ef4444;
                color: #991b1b;
            }
            
            .notification.error i {
                color: #ef4444;
            }
            
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
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Global functions for HTML onclick handlers
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.openViewModal = openViewModal;
window.closeViewModal = closeViewModal;
window.editProgram = editProgram;
window.deleteProgram = deleteProgram;
window.copyCode = copyCode;
window.exportData = exportData;
window.importData = importData;
window.syncToCloud = syncToCloud;
