// Enhanced program management with Supabase auto-sync
// Add this to your script.js or include as separate file

// Enhanced addProgram with cloud sync
async function addProgramWithSync(programData) {
    const program = {
        id: generateId(),
        ...programData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to local array first
    programs.unshift(program);
    savePrograms(); // Save to localStorage
    renderPrograms();
    
    // Try to sync to cloud if connected
    if (supabaseSync && supabaseSync.isConnected) {
        try {
            await supabaseSync.saveProgram(program);
            showSuccess('Code program added and synced to cloud!');
        } catch (error) {
            console.error('Cloud sync failed:', error);
            showSuccess('Code program added locally (cloud sync failed)');
        }
    } else {
        showSuccess('Code program added successfully!');
    }
}

// Enhanced updateProgram with cloud sync
async function updateProgramWithSync(id, programData) {
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
        programs[index] = {
            ...programs[index],
            ...programData,
            updatedAt: new Date().toISOString()
        };
        
        savePrograms(); // Save to localStorage
        renderPrograms();
        
        // Try to sync to cloud if connected
        if (supabaseSync && supabaseSync.isConnected) {
            try {
                await supabaseSync.updateProgram(id, programs[index]);
                showSuccess('Code program updated and synced to cloud!');
            } catch (error) {
                console.error('Cloud sync failed:', error);
                showSuccess('Code program updated locally (cloud sync failed)');
            }
        } else {
            showSuccess('Code program updated successfully!');
        }
    }
}

// Enhanced deleteProgram with cloud sync
async function deleteProgramWithSync(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        // Remove from local array
        programs = programs.filter(p => p.id !== id);
        savePrograms();
        renderPrograms();
        closeViewModal();
        
        // Try to sync to cloud if connected
        if (supabaseSync && supabaseSync.isConnected) {
            try {
                await supabaseSync.deleteProgram(id);
                showSuccess('Code program deleted and synced to cloud!');
            } catch (error) {
                console.error('Cloud sync failed:', error);
                showSuccess('Code program deleted locally (cloud sync failed)');
            }
        } else {
            showSuccess('Code program deleted successfully!');
        }
    }
}

// Enhanced loadPrograms with cloud sync option
async function loadProgramsWithSync() {
    // Always load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    const localPrograms = stored ? JSON.parse(stored) : [];
    
    // Try to load from cloud if connected and enabled
    if (supabaseSync && supabaseSync.isConnected) {
        try {
            const cloudPrograms = await supabaseSync.loadPrograms();
            
            if (cloudPrograms.length > 0) {
                // Merge cloud and local data (cloud takes precedence for newer updates)
                const mergedPrograms = mergePrograms(localPrograms, cloudPrograms);
                programs = mergedPrograms;
                savePrograms(); // Update localStorage with merged data
                console.log('Programs loaded from cloud and merged with local data');
            } else {
                programs = localPrograms;
                console.log('No cloud data found, using local programs');
            }
        } catch (error) {
            console.error('Failed to load from cloud, using local data:', error);
            programs = localPrograms;
        }
    } else {
        programs = localPrograms;
    }
}

// Merge local and cloud programs, keeping the most recent version
function mergePrograms(localPrograms, cloudPrograms) {
    const merged = new Map();
    
    // Add local programs first
    localPrograms.forEach(program => {
        merged.set(program.id, program);
    });
    
    // Add/update with cloud programs (cloud data takes precedence if newer)
    cloudPrograms.forEach(cloudProgram => {
        const localProgram = merged.get(cloudProgram.id);
        
        if (!localProgram || new Date(cloudProgram.updatedAt) > new Date(localProgram.updatedAt)) {
            merged.set(cloudProgram.id, cloudProgram);
        }
    });
    
    return Array.from(merged.values()).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
}

// Auto-sync toggle
let autoSyncEnabled = localStorage.getItem('auto_sync_enabled') === 'true';

function toggleAutoSync() {
    autoSyncEnabled = !autoSyncEnabled;
    localStorage.setItem('auto_sync_enabled', autoSyncEnabled.toString());
    
    if (autoSyncEnabled) {
        showSuccess('Auto-sync enabled - changes will sync to cloud automatically');
    } else {
        showSuccess('Auto-sync disabled - manual sync required');
    }
}

// Add auto-sync toggle to global scope
window.toggleAutoSync = toggleAutoSync;

// Function to enable/disable enhanced sync functions
function enableCloudSync() {
    if (supabaseSync && supabaseSync.isConnected) {
        // Replace original functions with sync versions
        window.addProgram = addProgramWithSync;
        window.updateProgram = updateProgramWithSync;
        window.deleteProgram = deleteProgramWithSync;
        window.loadPrograms = loadProgramsWithSync;
        
        console.log('Cloud sync functions enabled');
        return true;
    }
    return false;
}

// Function to disable cloud sync (fallback to local only)
function disableCloudSync() {
    // Restore original functions (they're already defined in script.js)
    console.log('Cloud sync functions disabled, using local storage only');
}

// Add to global scope
window.enableCloudSync = enableCloudSync;
window.disableCloudSync = disableCloudSync;
