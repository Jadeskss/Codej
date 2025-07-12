// Check script loading
console.log('🔄 Loading Codej main script...');
console.log('SupabaseSync available:', typeof SupabaseSync !== 'undefined');

// Application State
let programs = [];
let currentEditId = null;
let currentViewId = null;
let currentFilter = 'all';
let supabaseSync = null; // Global Supabase sync instance

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

// Initialize these after DOM is ready
let searchInput = null;
let filterBtns = null;

// App initialization flag
let appInitialized = false;

// Default password - you can change this
const APP_PASSWORD = 'jade123';

// Local Storage Keys
const STORAGE_KEY = 'codej_programs';
const AUTH_KEY = 'codej_authenticated';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing Codej...');
    
    try {
        checkAuthentication();
        loadPrograms();
        setupEventListeners();
        initializeHamburgerMenu(); // Initialize hamburger menu
        
        appInitialized = true;
        console.log('✅ Core app initialized successfully');
        
        // Delay Supabase initialization to ensure all scripts are loaded
        setTimeout(() => {
            initializeSupabaseSync();
        }, 100);
    } catch (error) {
        console.error('❌ Error during app initialization:', error);
        showError('App initialization failed. Please refresh the page.');
    }
});

// Alternative initialization if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // Document is still loading, wait for DOMContentLoaded
} else {
    // Document has already loaded, run initialization
    setTimeout(() => {
        if (typeof checkAuthentication === 'function') {
            checkAuthentication();
            loadPrograms();
            setupEventListeners();
            initializeSupabaseSync();
        }
    }, 100);
}

// Fallback initialization for different loading scenarios
window.addEventListener('load', function() {
    console.log('🔄 Window load event triggered');
    
    // Double-check initialization after window load
    setTimeout(() => {
        if (!appInitialized) {
            console.log('⚠️ App not initialized yet, trying fallback...');
            try {
                if (document.getElementById('loginPage') && document.getElementById('mainApp')) {
                    checkAuthentication();
                    loadPrograms();
                    setupEventListeners();
                    appInitialized = true;
                    console.log('✅ Fallback initialization successful');
                }
            } catch (error) {
                console.error('❌ Fallback initialization failed:', error);
            }
        }
    }, 500);
});

// Initialize Supabase sync if credentials exist
async function initializeSupabaseSync() {
    console.log('🔄 Initializing Supabase sync...');
    
    // Check if SupabaseSync is available
    if (typeof SupabaseSync === 'undefined') {
        console.error('❌ SupabaseSync class not found. Script loading issue detected.');
        showError('Cloud sync not available. Please refresh the page and try again.');
        return;
    }
    
    console.log('✅ SupabaseSync class loaded successfully');
    
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    
    if (url && key) {
        try {
            console.log('🔑 Found stored credentials, attempting auto-connection...');
            supabaseSync = new SupabaseSync(url, key);
            const connected = await supabaseSync.init();
            
            if (connected) {
                console.log('🌟 Auto-connected to Supabase - Real-time sync enabled!');
                showSuccess('Cloud sync enabled! Changes will sync across devices automatically.');
                showSyncStatus(true);
                
                // Load latest programs from cloud
                try {
                    const cloudPrograms = await supabaseSync.loadPrograms();
                    if (cloudPrograms.length > 0) {
                        programs = cloudPrograms;
                        savePrograms(); // Save to localStorage as backup
                        renderPrograms();
                        console.log(`📥 Loaded ${cloudPrograms.length} programs from cloud`);
                    }
                } catch (error) {
                    console.log('📭 No programs found in cloud database, starting fresh');
                }
            }
        } catch (error) {
            console.log('⚠️ Cloud sync not available:', error.message);
            showSyncStatus(false);
        }
    } else {
        console.log('🔧 No Supabase credentials found. Cloud sync available but not configured.');
    }
}

// Show/hide sync status indicator
function showSyncStatus(connected) {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        if (connected) {
            syncStatus.style.display = 'flex';
            syncStatus.className = 'sync-status';
            syncStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Real-time sync active</span>';
        } else {
            syncStatus.style.display = 'flex';
            syncStatus.className = 'sync-status disconnected';
            syncStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Offline mode</span>';
        }
    }
}

// Hide sync status
function hideSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.style.display = 'none';
    }
}

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
    // Cleanup Supabase connection before logout
    if (supabaseSync && supabaseSync.cleanup) {
        supabaseSync.cleanup();
        console.log('🔌 Disconnected from cloud sync');
    }
    
    localStorage.removeItem(AUTH_KEY);
    showLoginPage();
    passwordInput.value = '';
    hideSyncStatus();
}

// Event Listeners Setup
function setupEventListeners() {
    // Initialize DOM elements that might not exist yet
    searchInput = document.getElementById('searchInput');
    filterBtns = document.querySelectorAll('.filter-btn');
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Header Actions
    if (addCodeBtn) {
        addCodeBtn.addEventListener('click', () => openAddModal());
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Code Form
    if (codeForm) {
        codeForm.addEventListener('submit', handleCodeSubmit);
    }
    
    // Search and Filter
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
        });
    }
    
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
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
    
    // Initialize hamburger menu
    initializeHamburgerMenu();
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt...');
    
    if (!passwordInput) {
        console.error('❌ Password input element not found');
        showError('Login form error. Please refresh the page.');
        return;
    }
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        showError('Please enter a password');
        return;
    }
    
    console.log('🔑 Password entered, checking...');
    
    if (authenticateUser(password)) {
        console.log('✅ Login successful');
        showSuccess('Login successful!');
    } else {
        console.log('❌ Login failed - incorrect password');
        showError('Incorrect password. Try: jade123');
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
    
    // Auto-sync to cloud if connected
    if (supabaseSync && supabaseSync.isConnected) {
        supabaseSync.autoSaveProgram(program).catch(error => {
            console.error('Cloud sync failed:', error);
            showError('Added locally, but cloud sync failed. Will retry automatically.');
        });
    }
}

function updateProgram(id, programData) {
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
        const updatedProgram = {
            ...programs[index],
            ...programData,
            updatedAt: new Date().toISOString()
        };
        
        programs[index] = updatedProgram;
        savePrograms();
        renderPrograms();
        showSuccess('Code program updated successfully!');
        
        // Auto-sync to cloud if connected
        if (supabaseSync && supabaseSync.isConnected) {
            supabaseSync.autoUpdateProgram(id, updatedProgram).catch(error => {
                console.error('Cloud sync failed:', error);
                showError('Updated locally, but cloud sync failed. Will retry automatically.');
            });
        }
    }
}

function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        programs = programs.filter(p => p.id !== id);
        savePrograms();
        renderPrograms();
        closeViewModal();
        showSuccess('Code program deleted successfully!');
        
        // Auto-sync to cloud if connected
        if (supabaseSync && supabaseSync.isConnected) {
            supabaseSync.autoDeleteProgram(id).catch(error => {
                console.error('Cloud sync failed:', error);
                showError('Deleted locally, but cloud sync failed. Will retry automatically.');
            });
        }
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
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
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
    console.log('🌩️ Sync to cloud requested...');
    console.log('SupabaseSync available:', typeof SupabaseSync !== 'undefined');
    console.log('supabaseSync instance:', !!supabaseSync);
    console.log('supabaseSync connected:', supabaseSync ? supabaseSync.isConnected : 'N/A');
    
    // Check if SupabaseSync class is available
    if (typeof SupabaseSync === 'undefined') {
        console.error('❌ SupabaseSync class not found');
        showError('⚠️ Cloud sync module not loaded. Please refresh the page and try again.');
        return;
    }
    
    if (supabaseSync && supabaseSync.isConnected) {
        console.log('✅ Syncing to cloud...');
        // Sync all local programs to cloud
        supabaseSync.syncToCloud(programs).then(() => {
            showSuccess('All programs synced to cloud successfully!');
        }).catch(error => {
            console.error('Sync failed:', error);
            showError('Sync failed: ' + error.message);
        });
    } else {
        console.log('🔧 No active connection, showing config...');
        // Show configuration dialog
        if (typeof showSupabaseConfig === 'function') {
            showSupabaseConfig();
        } else {
            console.error('❌ showSupabaseConfig function not found');
            showError('⚠️ Cloud sync configuration not available. Please refresh the page and try again.');
        }
    }
}

// Wrapper function for cloud download
function downloadFromCloud() {
    if (!testSyncAvailability()) {
        return;
    }
    
    if (typeof loadFromSupabase === 'function') {
        loadFromSupabase();
    } else {
        showError('Cloud download function not available. Please refresh the page.');
    }
}

// Debug function to check if all required functions are available
function checkScriptLoading() {
    const requiredFunctions = [
        'SupabaseSync',
        'showSupabaseConfig',
        'connectSupabase',
        'syncToSupabase',
        'loadFromSupabase'
    ];
    
    const missing = requiredFunctions.filter(func => typeof window[func] === 'undefined');
    
    if (missing.length > 0) {
        console.error('Missing functions:', missing);
        console.error('Supabase sync may not be working properly. Please refresh the page.');
        return false;
    }
    
    console.log('✅ All Supabase sync functions loaded successfully');
    return true;
}

// Test sync availability
function testSyncAvailability() {
    if (typeof SupabaseSync === 'undefined') {
        showError('⚠️ Supabase sync not available. Please refresh the page and try again.');
        return false;
    }
    
    if (typeof showSupabaseConfig !== 'function') {
        showError('⚠️ Supabase configuration not available. Please refresh the page.');
        return false;
    }
    
    return true;
}

// Hamburger Menu Functionality
function initializeHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const headerRight = document.getElementById('headerRight');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (!hamburgerMenu || !headerRight || !mobileOverlay) {
        console.log('Hamburger menu elements not found, skipping initialization');
        return;
    }
    
    // Toggle menu
    function toggleMenu() {
        const isActive = headerRight.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Open menu
    function openMenu() {
        hamburgerMenu.classList.add('active');
        headerRight.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    // Close menu
    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        headerRight.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
    
    // Event listeners
    hamburgerMenu.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on a menu item
    const menuItems = headerRight.querySelectorAll('button');
    menuItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    
    // Close menu on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    console.log('✅ Hamburger menu initialized');
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
window.checkScriptLoading = checkScriptLoading;
window.testSyncAvailability = testSyncAvailability;
