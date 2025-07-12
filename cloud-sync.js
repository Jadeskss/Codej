// Cloud sync functionality for Codej
// Add this to your existing script.js or replace the storage functions

// Configuration
const USE_CLOUD_SYNC = false; // Set to true to use server API
const API_BASE_URL = 'http://localhost/codej/server/api.php'; // Change to your server URL

// Enhanced storage functions with cloud sync
async function loadPrograms() {
    if (USE_CLOUD_SYNC) {
        try {
            const response = await fetch(API_BASE_URL);
            const result = await response.json();
            
            if (result.success) {
                programs = result.data.map(p => ({
                    ...p,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at
                }));
                
                // Also save to localStorage as backup
                localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to load from server, using local storage:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            programs = stored ? JSON.parse(stored) : [];
        }
    } else {
        // Use localStorage only
        const stored = localStorage.getItem(STORAGE_KEY);
        programs = stored ? JSON.parse(stored) : [];
    }
}

async function savePrograms() {
    // Always save to localStorage first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
    
    if (USE_CLOUD_SYNC) {
        // Also sync to server (you would need to implement bulk sync endpoint)
        try {
            // For now, just log that cloud sync would happen
            console.log('Cloud sync would happen here');
        } catch (error) {
            console.error('Cloud sync failed:', error);
        }
    }
}

async function addProgram(programData) {
    if (USE_CLOUD_SYNC) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                const program = {
                    id: result.id,
                    ...programData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                programs.unshift(program);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
                renderPrograms();
                showSuccess('Code program added successfully!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to save to server:', error);
            showError('Failed to sync to cloud, saved locally only');
            
            // Fallback to local storage
            const program = {
                id: generateId(),
                ...programData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            programs.unshift(program);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
            renderPrograms();
        }
    } else {
        // Original local storage logic
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
}

async function updateProgram(id, programData) {
    if (USE_CLOUD_SYNC) {
        try {
            const response = await fetch(`${API_BASE_URL}?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                const index = programs.findIndex(p => p.id === id);
                if (index !== -1) {
                    programs[index] = {
                        ...programs[index],
                        ...programData,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
                    renderPrograms();
                    showSuccess('Code program updated successfully!');
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to update on server:', error);
            showError('Failed to sync to cloud, updated locally only');
            
            // Fallback to local update
            const index = programs.findIndex(p => p.id === id);
            if (index !== -1) {
                programs[index] = {
                    ...programs[index],
                    ...programData,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
                renderPrograms();
            }
        }
    } else {
        // Original local storage logic
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
}

async function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        if (USE_CLOUD_SYNC) {
            try {
                const response = await fetch(`${API_BASE_URL}?id=${id}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    programs = programs.filter(p => p.id !== id);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
                    renderPrograms();
                    closeViewModal();
                    showSuccess('Code program deleted successfully!');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Failed to delete from server:', error);
                showError('Failed to sync deletion to cloud');
            }
        } else {
            // Original local storage logic
            programs = programs.filter(p => p.id !== id);
            savePrograms();
            renderPrograms();
            closeViewModal();
            showSuccess('Code program deleted successfully!');
        }
    }
}

// Enable/disable cloud sync
function toggleCloudSync() {
    const newState = !USE_CLOUD_SYNC;
    
    if (newState) {
        // Test connection first
        fetch(API_BASE_URL)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    USE_CLOUD_SYNC = true;
                    showSuccess('Cloud sync enabled!');
                    loadPrograms();
                    renderPrograms();
                } else {
                    showError('Failed to connect to cloud server');
                }
            })
            .catch(error => {
                showError('Cloud server not accessible');
                console.error('Cloud sync test failed:', error);
            });
    } else {
        USE_CLOUD_SYNC = false;
        showSuccess('Cloud sync disabled - using local storage only');
    }
}

// Add this function to global scope
window.toggleCloudSync = toggleCloudSync;
