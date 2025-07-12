// GitHub Gist Cloud Sync for Codej
// Simple cloud sync using GitHub Gists (no server needed!)

class GistCloudSync {
    constructor(token = null) {
        this.token = token; // GitHub Personal Access Token
        this.gistId = localStorage.getItem('codej_gist_id');
    }

    async saveToCloud(programs) {
        if (!this.token) {
            throw new Error('GitHub token required for cloud sync');
        }

        const data = {
            programs: programs,
            lastSync: new Date().toISOString(),
            version: '1.0'
        };

        const gistData = {
            description: 'Codej - Code Programs Backup',
            public: false,
            files: {
                'codej-backup.json': {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };

        try {
            let response;
            
            if (this.gistId) {
                // Update existing gist
                response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gistData)
                });
            } else {
                // Create new gist
                response = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gistData)
                });
            }

            if (response.ok) {
                const result = await response.json();
                this.gistId = result.id;
                localStorage.setItem('codej_gist_id', this.gistId);
                return result;
            } else {
                throw new Error(`GitHub API error: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to save to GitHub:', error);
            throw error;
        }
    }

    async loadFromCloud() {
        if (!this.gistId) {
            throw new Error('No cloud backup found');
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
            
            if (response.ok) {
                const gist = await response.json();
                const content = gist.files['codej-backup.json'].content;
                const data = JSON.parse(content);
                return data.programs || [];
            } else {
                throw new Error(`Failed to load from GitHub: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load from GitHub:', error);
            throw error;
        }
    }

    async deleteCloudBackup() {
        if (!this.token || !this.gistId) {
            throw new Error('No token or gist ID');
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem('codej_gist_id');
                this.gistId = null;
                return true;
            } else {
                throw new Error(`Failed to delete gist: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to delete from GitHub:', error);
            throw error;
        }
    }
}

// Enhanced sync functions using GitHub
let cloudSync = new GistCloudSync();

async function syncToCloud() {
    const token = prompt('Enter your GitHub Personal Access Token (create one at https://github.com/settings/tokens):');
    
    if (!token) {
        showError('GitHub token required for cloud sync');
        return;
    }

    cloudSync = new GistCloudSync(token);
    
    try {
        await cloudSync.saveToCloud(programs);
        localStorage.setItem('github_token', token); // Store encrypted in real app
        showSuccess('Successfully synced to GitHub!');
    } catch (error) {
        showError('Failed to sync to cloud: ' + error.message);
    }
}

async function loadFromCloud() {
    const token = localStorage.getItem('github_token') || 
                  prompt('Enter your GitHub Personal Access Token:');
    
    if (!token) {
        showError('GitHub token required');
        return;
    }

    cloudSync = new GistCloudSync(token);
    
    try {
        const cloudPrograms = await cloudSync.loadFromCloud();
        
        if (cloudPrograms.length > 0) {
            if (programs.length > 0) {
                if (confirm(`Found ${cloudPrograms.length} programs in cloud. Replace your current ${programs.length} programs?`)) {
                    programs = cloudPrograms;
                    savePrograms();
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
            showError('No programs found in cloud backup');
        }
    } catch (error) {
        showError('Failed to load from cloud: ' + error.message);
    }
}

// Add to global scope
window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
