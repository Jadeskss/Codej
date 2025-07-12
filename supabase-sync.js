// Supabase Cloud Sync for Codej
// Easy cloud database with real-time sync across devices

class SupabaseSync {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.isConnected = false;
        this.tableName = 'programs';
        this.realtimeChannel = null;
        this.autoSyncEnabled = true;
        this.heartbeatInterval = null;
        this.pollingInterval = null;
        this.lastSyncTime = Date.now();
    }

    // Initialize connection and create table if needed
    async init() {
        try {
            // Test connection
            const response = await this.makeRequest('GET', '/rest/v1/programs?limit=1');
            this.isConnected = true;
            
            // Setup real-time sync
            await this.setupRealtimeSync();
            
            return true;
        } catch (error) {
            console.error('Supabase connection failed:', error);
            
            // If table doesn't exist, create it
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                await this.createTable();
                this.isConnected = true;
                await this.setupRealtimeSync();
                return true;
            }
            
            this.isConnected = false;
            return false;
        }
    }

    // Create the programs table using Supabase SQL Editor approach
    async createTable() {
        // Since we can't execute SQL directly via API, we'll guide the user to create it manually
        const tableSetupGuide = `
        Please create the table manually in your Supabase dashboard:
        
        1. Go to your Supabase dashboard
        2. Click "SQL Editor" in the left sidebar
        3. Click "New Query"
        4. Paste this SQL and click "Run":
        
        CREATE TABLE IF NOT EXISTS programs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            language TEXT NOT NULL,
            description TEXT,
            code TEXT NOT NULL,
            url TEXT,
            tags JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable all operations for everyone" ON programs
        FOR ALL USING (true) WITH CHECK (true);
        `;
        
        console.log('Table creation guide:', tableSetupGuide);
        
        // Show user-friendly message
        throw new Error(`Table 'programs' doesn't exist. Please create it manually in your Supabase dashboard:

1. Go to your Supabase dashboard
2. Click "SQL Editor" in the left sidebar  
3. Click "New Query"
4. Copy and paste this SQL, then click "Run":

CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    url TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations" ON programs FOR ALL USING (true);

After running this SQL, try connecting again!`);
    }

    // Make HTTP request to Supabase
    async makeRequest(method, endpoint, data = null) {
        const url = `${this.supabaseUrl}${endpoint}`;
        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const options = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase error: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        return responseText ? JSON.parse(responseText) : null;
    }

    // Load all programs from Supabase
    async loadPrograms() {
        if (!this.isConnected) {
            throw new Error('Not connected to Supabase');
        }

        try {
            const response = await this.makeRequest('GET', '/rest/v1/programs?order=created_at.desc');
            return response.map(program => ({
                id: program.id,
                title: program.title,
                language: program.language,
                description: program.description,
                code: program.code,
                url: program.url,
                tags: program.tags || [],
                createdAt: program.created_at,
                updatedAt: program.updated_at
            }));
        } catch (error) {
            console.error('Failed to load programs from Supabase:', error);
            throw error;
        }
    }

    // Save a new program to Supabase
    async saveProgram(programData) {
        if (!this.isConnected) {
            throw new Error('Not connected to Supabase');
        }

        const supabaseData = {
            id: programData.id,
            title: programData.title,
            language: programData.language,
            description: programData.description,
            code: programData.code,
            url: programData.url,
            tags: programData.tags || []
        };

        try {
            const response = await this.makeRequest('POST', '/rest/v1/programs', supabaseData);
            return response[0];
        } catch (error) {
            console.error('Failed to save program to Supabase:', error);
            throw error;
        }
    }

    // Update an existing program in Supabase
    async updateProgram(id, programData) {
        if (!this.isConnected) {
            throw new Error('Not connected to Supabase');
        }

        const supabaseData = {
            title: programData.title,
            language: programData.language,
            description: programData.description,
            code: programData.code,
            url: programData.url,
            tags: programData.tags || [],
            updated_at: new Date().toISOString()
        };

        try {
            const response = await this.makeRequest('PATCH', `/rest/v1/programs?id=eq.${id}`, supabaseData);
            return response[0];
        } catch (error) {
            console.error('Failed to update program in Supabase:', error);
            throw error;
        }
    }

    // Delete a program from Supabase
    async deleteProgram(id) {
        if (!this.isConnected) {
            throw new Error('Not connected to Supabase');
        }

        try {
            await this.makeRequest('DELETE', `/rest/v1/programs?id=eq.${id}`);
            return true;
        } catch (error) {
            console.error('Failed to delete program from Supabase:', error);
            throw error;
        }
    }

    // Sync all local programs to Supabase
    async syncToCloud(localPrograms) {
        if (!this.isConnected) {
            throw new Error('Not connected to Supabase');
        }

        try {
            // Get existing programs from cloud
            const cloudPrograms = await this.loadPrograms();
            const cloudIds = new Set(cloudPrograms.map(p => p.id));

            // Upload new/updated programs
            for (const program of localPrograms) {
                if (cloudIds.has(program.id)) {
                    // Update existing
                    await this.updateProgram(program.id, program);
                } else {
                    // Create new
                    await this.saveProgram(program);
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to sync to cloud:', error);
            throw error;
        }
    }

    // Setup real-time synchronization
    async setupRealtimeSync() {
        if (!this.isConnected) return;

        console.log('🔄 Setting up real-time sync...');
        
        // Method 1: Try WebSocket real-time (preferred)
        try {
            await this.setupWebSocketSync();
        } catch (error) {
            console.warn('WebSocket real-time failed, using polling fallback:', error);
            this.setupPollingSync();
        }
    }

    // WebSocket-based real-time sync
    async setupWebSocketSync() {
        const wsUrl = this.supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime/v1/websocket';
        
        this.realtimeChannel = new WebSocket(wsUrl + `?apikey=${this.supabaseKey}&vsn=1.0.0`);
        
        this.realtimeChannel.onopen = () => {
            console.log('🌐 WebSocket real-time sync connected');
            
            // Join the programs table channel
            const joinMessage = {
                topic: `realtime:public:programs`,
                event: 'phx_join',
                payload: {},
                ref: Date.now().toString()
            };
            
            this.realtimeChannel.send(JSON.stringify(joinMessage));
            
            // Send heartbeat every 30 seconds
            this.heartbeatInterval = setInterval(() => {
                if (this.realtimeChannel.readyState === WebSocket.OPEN) {
                    const heartbeat = {
                        topic: 'phoenix',
                        event: 'heartbeat',
                        payload: {},
                        ref: Date.now().toString()
                    };
                    this.realtimeChannel.send(JSON.stringify(heartbeat));
                }
            }, 30000);
        };
        
        this.realtimeChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleRealtimeEvent(data);
            } catch (error) {
                console.error('Failed to parse real-time message:', error);
            }
        };
        
        this.realtimeChannel.onerror = (error) => {
            console.error('WebSocket real-time sync error:', error);
            // Fallback to polling
            this.setupPollingSync();
        };
        
        this.realtimeChannel.onclose = () => {
            console.log('🔌 WebSocket real-time sync disconnected');
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }
            
            // Try to reconnect after 5 seconds
            setTimeout(() => {
                if (this.isConnected) {
                    console.log('🔄 Attempting to reconnect real-time sync...');
                    this.setupRealtimeSync();
                }
            }, 5000);
        };
    }

    // Polling-based real-time sync (fallback)
    setupPollingSync() {
        console.log('📡 Using polling-based real-time sync (every 10 seconds)');
        
        this.lastSyncTime = Date.now();
        
        this.pollingInterval = setInterval(async () => {
            try {
                // Get programs updated after last sync
                const response = await this.makeRequest('GET', `/rest/v1/programs?updated_at=gt.${new Date(this.lastSyncTime).toISOString()}&order=updated_at.asc`);
                
                if (response && response.length > 0) {
                    console.log(`📥 Polling sync: ${response.length} programs updated`);
                    this.syncFromCloud();
                }
                
                this.lastSyncTime = Date.now();
            } catch (error) {
                console.error('Polling sync failed:', error);
            }
        }, 10000); // Poll every 10 seconds
    }

    // Handle real-time events from Supabase
    handleRealtimeEvent(data) {
        if (data.event === 'postgres_changes') {
            const change = data.payload;
            console.log('📡 Real-time database change:', change.eventType);
            
            // Refresh programs from cloud when changes detected
            this.syncFromCloud();
        } else if (data.event === 'INSERT' || data.event === 'UPDATE' || data.event === 'DELETE') {
            console.log('📡 Real-time update received:', data.event);
            
            // Refresh programs from cloud when changes detected
            this.syncFromCloud();
        }
    }

    // Sync programs from cloud (called by real-time events)
    async syncFromCloud() {
        if (!this.autoSyncEnabled) return;
        
        try {
            const cloudPrograms = await this.loadPrograms();
            
            // Update local programs array (if it exists in global scope)
            if (typeof programs !== 'undefined' && typeof savePrograms === 'function' && typeof renderPrograms === 'function') {
                const beforeCount = programs.length;
                const beforeIds = new Set(programs.map(p => p.id));
                
                // Check for changes before updating
                const afterIds = new Set(cloudPrograms.map(p => p.id));
                const newPrograms = cloudPrograms.filter(p => !beforeIds.has(p.id));
                const removedPrograms = programs.filter(p => !afterIds.has(p.id));
                
                // Update local array
                programs.length = 0; // Clear array
                programs.push(...cloudPrograms); // Add cloud programs
                savePrograms(); // Save to localStorage as backup
                renderPrograms(); // Re-render the UI
                
                // Show notification about meaningful changes
                if (newPrograms.length > 0 && typeof showSuccess === 'function') {
                    showSuccess(`📥 ${newPrograms.length} new program(s) synced from another device`);
                } else if (removedPrograms.length > 0 && typeof showSuccess === 'function') {
                    showSuccess(`📥 ${removedPrograms.length} program(s) removed on another device`);
                } else if (cloudPrograms.length !== beforeCount && typeof showSuccess === 'function') {
                    showSuccess(`📥 Programs updated from another device`);
                }
                
                // Show subtle notification
                this.showSyncNotification('🔄 Synced from cloud');
                console.log(`📥 Real-time sync: Updated to ${cloudPrograms.length} programs`);
            } else {
                console.warn('Main app variables not available for real-time sync');
            }
            
        } catch (error) {
            console.error('Auto-sync from cloud failed:', error);
        }
    }

    // Auto-save program to cloud
    async autoSaveProgram(programData) {
        if (!this.isConnected || !this.autoSyncEnabled) return false;
        
        try {
            await this.saveProgram(programData);
            this.showSyncNotification('☁️ Synced to cloud');
            return true;
        } catch (error) {
            console.error('Auto-save failed:', error);
            return false;
        }
    }

    // Auto-update program in cloud
    async autoUpdateProgram(id, programData) {
        if (!this.isConnected || !this.autoSyncEnabled) return false;
        
        try {
            await this.updateProgram(id, programData);
            this.showSyncNotification('☁️ Updated in cloud');
            return true;
        } catch (error) {
            console.error('Auto-update failed:', error);
            return false;
        }
    }

    // Auto-delete program from cloud
    async autoDeleteProgram(id) {
        if (!this.isConnected || !this.autoSyncEnabled) return false;
        
        try {
            await this.deleteProgram(id);
            this.showSyncNotification('🗑️ Deleted from cloud');
            return true;
        } catch (error) {
            console.error('Auto-delete failed:', error);
            return false;
        }
    }

    // Show subtle sync notification
    showSyncNotification(message) {
        // Create or update sync indicator
        let indicator = document.getElementById('sync-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sync-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 9999;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateX(100%);
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = message;
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateX(0)';
        
        // Hide after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(100%)';
        }, 2000);
    }

    // Disconnect real-time sync
    disconnect() {
        if (this.realtimeChannel) {
            this.realtimeChannel.close();
            this.realtimeChannel = null;
        }
        this.isConnected = false;
    }

    // Cleanup connections
    cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        
        if (this.realtimeChannel) {
            this.realtimeChannel.close();
            this.realtimeChannel = null;
        }
        
        this.isConnected = false;
        
        // Update sync status in UI
        if (typeof showSyncStatus === 'function') {
            showSyncStatus(false);
        }
    }

    // Enable/disable auto sync
    setAutoSync(enabled) {
        this.autoSyncEnabled = enabled;
        console.log('Auto-sync', enabled ? 'enabled' : 'disabled');
    }
}

// Global Supabase instance (declared in main script.js)

// Configuration dialog
function showSupabaseConfig() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Configure Supabase Cloud Sync</h2>
                <button class="close-btn" onclick="closeSupabaseConfig()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 1.5rem;">
                <div class="form-group">
                    <label for="supabaseUrl">Supabase Project URL</label>
                    <input type="url" id="supabaseUrl" placeholder="https://your-project.supabase.co" 
                           value="${localStorage.getItem('supabase_url') || ''}">
                    <small style="color: #64748b; font-size: 0.8rem;">
                        Find this in your Supabase project settings
                    </small>
                </div>
                <div class="form-group">
                    <label for="supabaseKey">Supabase Anon Key</label>
                    <input type="password" id="supabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                           value="${localStorage.getItem('supabase_key') || ''}">
                    <small style="color: #64748b; font-size: 0.8rem;">
                        Your public anon key (safe to use in client-side code)
                    </small>
                </div>
                <div class="form-actions" style="margin-top: 2rem;">
                    <button type="button" class="cancel-btn" onclick="closeSupabaseConfig()">Cancel</button>
                    <button type="button" class="save-btn" onclick="connectSupabase()">
                        <i class="fas fa-cloud"></i>
                        Connect & Test
                    </button>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Quick Setup:</strong><br>
                    1. Go to <a href="https://supabase.com" target="_blank" style="color: #667eea;">supabase.com</a> and create a free account<br>
                    2. Create a new project<br>
                    3. Go to Settings → API<br>
                    4. Copy your Project URL and anon public key<br>
                    5. Click "Connect & Test" - if table doesn't exist, follow the instructions to create it
                </div>
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: #667eea; font-weight: 500;">📋 SQL Table Creation Code (click to expand)</summary>
                    <div style="margin-top: 0.5rem; padding: 1rem; background: #1e293b; color: #e2e8f0; border-radius: 6px; font-family: monospace; font-size: 0.8rem; overflow-x: auto;">
CREATE TABLE programs (<br>
&nbsp;&nbsp;id TEXT PRIMARY KEY,<br>
&nbsp;&nbsp;title TEXT NOT NULL,<br>
&nbsp;&nbsp;language TEXT NOT NULL,<br>
&nbsp;&nbsp;description TEXT,<br>
&nbsp;&nbsp;code TEXT NOT NULL,<br>
&nbsp;&nbsp;url TEXT,<br>
&nbsp;&nbsp;tags JSONB DEFAULT '[]',<br>
&nbsp;&nbsp;created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),<br>
&nbsp;&nbsp;updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()<br>
);<br><br>
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;<br>
CREATE POLICY "Enable all operations" ON programs FOR ALL USING (true);
                    </div>
                </details>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeSupabaseConfig() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

async function connectSupabase() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    
    if (!url || !key) {
        showError('Please enter both Supabase URL and API key');
        return;
    }
    
    try {
        supabaseSync = new SupabaseSync(url, key);
        const connected = await supabaseSync.init();
        
        if (connected) {
            // Save credentials
            localStorage.setItem('supabase_url', url);
            localStorage.setItem('supabase_key', key);
            
            closeSupabaseConfig();
            showSuccess('Connected to Supabase successfully! Real-time sync is now active.');
            
            // Update sync status
            if (typeof showSyncStatus === 'function') {
                showSyncStatus(true);
            }
            
            // Ask if user wants to sync existing data
            if (typeof programs !== 'undefined' && programs.length > 0) {
                if (confirm(`Upload your ${programs.length} existing programs to cloud?`)) {
                    await syncToSupabase();
                }
            }
        } else {
            showError('Failed to connect to Supabase');
            if (typeof showSyncStatus === 'function') {
                showSyncStatus(false);
            }
        }
    } catch (error) {
        console.error('Connection error:', error);
        
        if (typeof showSyncStatus === 'function') {
            showSyncStatus(false);
        }
        
        // Show user-friendly error message with table creation instructions
        if (error.message.includes('Table') || error.message.includes('programs')) {
            // Show table creation modal
            showTableCreationModal();
        } else if (error.message.includes('404') || error.message.includes('relation') || error.message.includes('does not exist')) {
            showTableCreationModal();
        } else {
            showError('Connection failed: ' + error.message);
        }
    }
}

async function syncToSupabase() {
    if (!supabaseSync || !supabaseSync.isConnected) {
        showSupabaseConfig();
        return;
    }
    
    try {
        await supabaseSync.syncToCloud(programs);
        showSuccess('Successfully synced to Supabase!');
    } catch (error) {
        showError('Sync failed: ' + error.message);
    }
}

async function loadFromSupabase() {
    if (!supabaseSync || !supabaseSync.isConnected) {
        showSupabaseConfig();
        return;
    }
    
    try {
        const cloudPrograms = await supabaseSync.loadPrograms();
        
        if (cloudPrograms.length > 0) {
            if (programs.length > 0) {
                if (confirm(`Found ${cloudPrograms.length} programs in cloud. Replace your current ${programs.length} programs?`)) {
                    programs = cloudPrograms;
                    savePrograms(); // Also save to localStorage as backup
                    renderPrograms();
                    showSuccess('Cloud data loaded successfully!');
                }
            } else {
                programs = cloudPrograms;
                savePrograms();
                renderPrograms();
                showSuccess('Cloud data loaded successfully!');
            }
        } else {
            showError('No programs found in cloud');
        }
    } catch (error) {
        showError('Failed to load from cloud: ' + error.message);
    }
}

function showTableCreationModal() {
    closeSupabaseConfig(); // Close the config modal first
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>📋 Create Database Table</h2>
                <button class="close-btn" onclick="closeTableCreationModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: #64748b; margin-bottom: 1rem;">
                        The 'programs' table doesn't exist yet. Please create it in your Supabase dashboard:
                    </p>
                    
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="margin-bottom: 0.5rem; color: #1e293b;">Steps:</h4>
                        <ol style="color: #64748b; padding-left: 1.2rem;">
                            <li>Go to your <strong>Supabase Dashboard</strong></li>
                            <li>Click <strong>"SQL Editor"</strong> in the left sidebar</li>
                            <li>Click <strong>"New Query"</strong></li>
                            <li>Copy the SQL code below and paste it</li>
                            <li>Click <strong>"Run"</strong></li>
                            <li>Come back here and try connecting again</li>
                        </ol>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4>SQL Code to Copy:</h4>
                        <button onclick="copySqlCode()" style="background: #667eea; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-copy"></i> Copy SQL
                        </button>
                    </div>
                    <div id="sqlCode" style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; line-height: 1.4; overflow-x: auto;">CREATE TABLE programs (<br>
&nbsp;&nbsp;id TEXT PRIMARY KEY,<br>
&nbsp;&nbsp;title TEXT NOT NULL,<br>
&nbsp;&nbsp;language TEXT NOT NULL,<br>
&nbsp;&nbsp;description TEXT,<br>
&nbsp;&nbsp;code TEXT NOT NULL,<br>
&nbsp;&nbsp;url TEXT,<br>
&nbsp;&nbsp;tags JSONB DEFAULT '[]',<br>
&nbsp;&nbsp;created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),<br>
&nbsp;&nbsp;updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()<br>
);<br><br>
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;<br>
CREATE POLICY "Enable all operations" ON programs FOR ALL USING (true);</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="cancel-btn" onclick="closeTableCreationModal()">Cancel</button>
                    <a href="https://app.supabase.com" target="_blank" class="save-btn" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-external-link-alt"></i>
                        Open Supabase Dashboard
                    </a>
                </div>
                
                <div style="margin-top: 1rem; padding: 1rem; background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; font-size: 0.9rem;">
                    <strong style="color: #065f46;">💡 Tip:</strong>
                    <span style="color: #047857;">After creating the table, return here and click the "Upload" button again to test the connection!</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeTableCreationModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function copySqlCode() {
    const sqlText = `CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    url TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations" ON programs FOR ALL USING (true);`;

    navigator.clipboard.writeText(sqlText).then(() => {
        showSuccess('SQL code copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = sqlText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('SQL code copied to clipboard!');
    });
}

// Note: Auto-initialization is handled by the main script.js
// This prevents duplicate initialization conflicts

// Add to global scope
window.showSupabaseConfig = showSupabaseConfig;
window.closeSupabaseConfig = closeSupabaseConfig;
window.connectSupabase = connectSupabase;
window.syncToSupabase = syncToSupabase;
window.loadFromSupabase = loadFromSupabase;
window.showTableCreationModal = showTableCreationModal;
window.closeTableCreationModal = closeTableCreationModal;
window.copySqlCode = copySqlCode;
