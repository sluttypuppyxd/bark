// FemboyWorld - Main Application JavaScript
// This file contains all the core functionality for the FemboyWorld platform

class FemboyWorldApp {
    constructor() {
        // Core data storage
        this.users = [];
        this.posts = [];
        this.comments = [];
        this.notifications = [];
        this.currentUser = null;
        this.nextId = 1;
        
        // Bootstrap modal instances
        this.loginModal = null;
        this.registerModal = null;
        this.uploadModal = null;
        this.editProfileModal = null;
        this.reportModal = null;
        this.helpModal = null;
        this.tosModal = null;
        this.commentModal = null;
        
        // Initialize the application
        this.init();
    }
    
    // Initialize the application
    init() {
        console.log('Initializing FemboyWorld application...');
        
        // Load existing data from localStorage
        this.loadData();
        
        // Initialize Bootstrap modals
        this.initializeModals();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up pronoun handlers
        this.setupPronounsHandlers();
        
        // Set up tab system

        
        // Check if user is already logged in - moved to after modal initialization
        
        // Show home section by default
        this.showHome();
        
        // Update notification count
        this.updateNotificationCount();
        
        console.log('FemboyWorld application initialized successfully');
    }
    
    // Load data from localStorage
    loadData() {
        try {
            const savedUsers = localStorage.getItem('femboyworld_users');
            const savedPosts = localStorage.getItem('femboyworld_posts');
            
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
                console.log(`Loaded ${this.users.length} users from localStorage`);
                
                // Migrate existing users to include TOS field if missing
                let migrationNeeded = false;
                this.users.forEach(user => {
                    if (user.tosAccepted === undefined) {
                        user.tosAccepted = false;
                        user.tosAcceptedAt = null;
                        migrationNeeded = true;
                    }
                    if (user.following === undefined) {
                        user.following = [];
                        user.followers = [];
                        migrationNeeded = true;
                    }
                });
                
                if (migrationNeeded) {
                    console.log('Migrated existing users to include TOS fields and following data');
                    this.saveData(); // Save migrated data
                }
            }
            
            if (savedPosts) {
                this.posts = JSON.parse(savedPosts);
                console.log(`Loaded ${this.posts.length} posts from localStorage`);
            }
            
            // Load comments
            const savedComments = localStorage.getItem('femboyworld_comments');
            if (savedComments) {
                this.comments = JSON.parse(savedComments);
                console.log(`Loaded ${this.comments.length} comments from localStorage`);
            }
            
            // Load notifications
            const savedNotifications = localStorage.getItem('femboyworld_notifications');
            if (savedNotifications) {
                this.notifications = JSON.parse(savedNotifications);
                console.log(`Loaded ${this.notifications.length} notifications from localStorage`);
            }
            
            // Calculate next ID based on existing data
            if (this.users.length > 0 || this.posts.length > 0 || this.comments.length > 0 || (this.notifications && this.notifications.length > 0)) {
                const maxUserId = Math.max(...this.users.map(u => u.id), 0);
                const maxPostId = Math.max(...this.posts.map(p => p.id), 0);
                const maxCommentId = Math.max(...this.comments.map(c => c.id), 0);
                const maxNotificationId = this.notifications ? Math.max(...this.notifications.map(n => n.id), 0) : 0;
                this.nextId = Math.max(maxUserId, maxPostId, maxCommentId, maxNotificationId) + 1;
            }
            
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // Reset data if there's an error
            this.users = [];
            this.posts = [];
            this.comments = [];
            this.nextId = 1;
        }
    }
    
    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem('femboyworld_users', JSON.stringify(this.users));
            localStorage.setItem('femboyworld_posts', JSON.stringify(this.posts));
            localStorage.setItem('femboyworld_comments', JSON.stringify(this.comments));
            
            // Save notifications
            if (this.notifications) {
                localStorage.setItem('femboyworld_notifications', JSON.stringify(this.notifications));
            }
            
            console.log('Data saved to localStorage successfully');
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }
    
    // Initialize Bootstrap modals
    initializeModals() {
        // Wait a bit to ensure Bootstrap is fully loaded
        setTimeout(() => {
            try {
                // Initialize login modal
                this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                
                // Initialize register modal
                this.registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                
                // Initialize upload modal
                this.uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
                
                // Initialize edit profile modal
                this.editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
                
                // Initialize support modals
                this.reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
                this.helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
                
                // Initialize TOS modal
                const tosElement = document.getElementById('tosModal');
                console.log('TOS element found:', tosElement);
                console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
                
                if (tosElement && typeof bootstrap !== 'undefined') {
                    this.tosModal = new bootstrap.Modal(tosElement);
                    console.log('TOS modal initialized:', this.tosModal);
                    console.log('TOS modal element:', tosElement);
                } else {
                    console.error('Failed to initialize TOS modal - element or Bootstrap not available');
                    this.tosModal = null;
                }
                
                // Initialize comment modal
                this.commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
                
                // Initialize notifications modal
                this.notificationsModal = new bootstrap.Modal(document.getElementById('notificationsModal'));
                
                console.log('All Bootstrap modals initialized');
                
                // Now that modals are ready, check auth status
                this.checkAuthStatus();
            } catch (error) {
                console.error('Error initializing modals:', error);
            }
        }, 100);
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Upload form submission
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload();
            });
        }
        
        // Edit profile form submission
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditProfile();
            });
        }
        
        // Search form submission
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
        // Comment form submission
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const commentText = document.getElementById('commentText').value.trim();
                if (commentText && this.currentCommentPostId) {
                    this.addComment(this.currentCommentPostId, commentText);
                    this.commentModal.hide();
                    document.getElementById('commentForm').reset();
                    this.currentCommentPostId = null;
                }
            });
        }
        
        console.log('All event listeners set up successfully');
        
        // Category filter buttons
        const categoryFilters = document.querySelectorAll('[data-category]');
        categoryFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });
        
        // Search filter buttons
        const searchFilters = document.querySelectorAll('[data-filter]');
        searchFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSearchFilter(e.target.dataset.filter);
            });
        });
    }
    

    
    // Handle category filtering
    handleCategoryFilter(category) {
        const filterBtns = document.querySelectorAll('[data-category]');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        this.renderExploreContent(category);
    }
    
    // Handle search filtering
    handleSearchFilter(filter) {
        const filterBtns = document.querySelectorAll('[data-filter]');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.currentSearchFilter = filter;
    }
    
    // Show search suggestions
    showSearchSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.style.display = 'block';
        }
    }
    
    // Search for specific term
    searchFor(term) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = term;
            this.performSearch();
        }
    }
    
    // Handle search input
    handleSearchInput(value) {
        if (value.length > 2) {
            this.showSearchSuggestions();
        } else {
            const suggestions = document.getElementById('searchSuggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        }
    }
    
    // Update statistics
    updateStats() {
        const totalPosts = document.getElementById('totalPosts');
        const totalUsers = document.getElementById('totalUsers');
        const totalLikes = document.getElementById('totalLikes');
        const totalComments = document.getElementById('totalComments');
        
        if (totalPosts) totalPosts.textContent = this.posts.length;
        if (totalUsers) totalUsers.textContent = this.users.length;
        if (totalLikes) totalLikes.textContent = this.posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        if (totalComments) totalComments.textContent = this.comments.length;
    }
    
    // Show login prompt
    showLoginPrompt() {
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-user-lock fa-3x text-muted mb-3"></i>
                    <h4>Please Log In</h4>
                    <p class="text-muted">You need to be logged in to view your profile</p>
                    <button class="btn btn-primary" onclick="window.app ? window.app.showLogin() : alert('Please wait for the page to load...')">
                        <i class="fas fa-sign-in-alt"></i> Log In
                    </button>
                </div>
            `;
        }
    }
    
    // Notification system
    addNotification(type, message, userId = null) {
        if (!this.currentUser) return;
        
        const notification = {
            id: this.nextId++,
            type: type, // 'like', 'comment', 'follow', 'mention'
            message: message,
            userId: userId || this.currentUser.id,
            targetUserId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            read: false
        };
        
        // Add to notifications array
        if (!this.notifications) this.notifications = [];
        this.notifications.push(notification);
        
        // Save data
        this.saveData();
        
        // Update notification count
        this.updateNotificationCount();
        
        console.log(`Notification added: ${type} - ${message}`);
    }
    
    // Update notification count
    updateNotificationCount() {
        if (!this.currentUser) return;
        
        const unreadCount = this.notifications ? 
            this.notifications.filter(n => n.targetUserId === this.currentUser.id && !n.read).length : 0;
        
        const badge = document.getElementById('notificationCount');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    // Show notifications modal
    showNotifications() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        this.renderNotifications();
        
        if (this.notificationsModal) {
            this.notificationsModal.show();
        }
    }
    
    // Render notifications
    renderNotifications() {
        if (!this.currentUser) return;
        
        const notificationsList = document.getElementById('notificationsList');
        const noNotifications = document.getElementById('noNotifications');
        
        if (!notificationsList || !noNotifications) return;
        
        const userNotifications = this.notifications ? 
            this.notifications.filter(n => n.targetUserId === this.currentUser.id) : [];
        
        if (userNotifications.length === 0) {
            notificationsList.style.display = 'none';
            noNotifications.style.display = 'block';
            return;
        }
        
        notificationsList.style.display = 'block';
        noNotifications.style.display = 'none';
        
        // Sort by creation date (newest first)
        userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        notificationsList.innerHTML = userNotifications.map(notification => {
            const icon = this.getNotificationIcon(notification.type);
            const timeAgo = this.getTimeAgo(notification.createdAt);
            
            return `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                     onclick="markNotificationAsRead(${notification.id})">
                    <div class="d-flex align-items-start gap-3">
                        <div class="notification-icon">
                            <i class="${icon}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1">${notification.message}</p>
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                        ${!notification.read ? '<span class="unread-indicator"></span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Get notification icon
    getNotificationIcon(type) {
        switch(type) {
            case 'like': return 'fas fa-heart text-danger';
            case 'comment': return 'fas fa-comment text-info';
            case 'follow': return 'fas fa-user-plus text-success';
            case 'mention': return 'fas fa-at text-warning';
            default: return 'fas fa-bell text-primary';
        }
    }
    
    // Get time ago
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
    
    // Mark notification as read
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveData();
            this.updateNotificationCount();
            this.renderNotifications();
        }
    }
    
    // Clear all notifications
    clearAllNotifications() {
        if (!this.currentUser) return;
        
        const userNotifications = this.notifications.filter(n => n.targetUserId === this.currentUser.id);
        userNotifications.forEach(n => n.read = true);
        
        this.saveData();
        this.updateNotificationCount();
        this.renderNotifications();
        
        console.log('All notifications marked as read');
    }
    
    // Set up pronoun selection handlers
    setupPronounsHandlers() {
        // Register pronouns handler
        const registerPronouns = document.getElementById('registerPronouns');
        if (registerPronouns) {
            registerPronouns.addEventListener('change', (e) => {
                this.handlePronounsChange('register', e.target.value);
            });
        }
        
        // Edit pronouns handler
        const editPronouns = document.getElementById('editPronouns');
        if (editPronouns) {
            editPronouns.addEventListener('change', (e) => {
                this.handlePronounsChange('edit', e.target.value);
            });
        }
        
        console.log('Pronoun handlers set up successfully');
    }
    
    // Handle pronoun selection changes
    handlePronounsChange(type, value) {
        const customDiv = type === 'register' ? 
            document.getElementById('registerCustomPronounsDiv') : 
            document.getElementById('editCustomPronounsDiv');
        
        const customInput = type === 'register' ? 
            document.getElementById('registerCustomPronouns') : 
            document.getElementById('editCustomPronouns');
        
        if (value === 'custom') {
            customDiv.classList.remove('hidden');
            customInput.required = true;
        } else {
            customDiv.classList.add('hidden');
            customInput.required = false;
            customInput.value = '';
        }
    }
    
    // Check authentication status
    checkAuthStatus() {
        const savedUser = localStorage.getItem('femboyworld_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log(`User ${this.currentUser.username} is already logged in`);
                console.log('TOS status:', this.currentUser.tosAccepted);
                console.log('TOS modal instance:', this.tosModal);
                
                // Check if user has agreed to TOS
                if (!this.currentUser.tosAccepted) {
                    console.log('User has not accepted TOS, showing modal...');
                    // Force show TOS modal
                    this.forceShowTOS();
                } else {
                    console.log('User has accepted TOS, proceeding with login...');
                    // Update UI
                    this.updateUIForAuth();
                    
                    // Close modal and show success
                    this.loginModal.hide();
                    document.getElementById('loginForm').reset();
                    
                    // Show home section
                    this.showHome();
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('femboyworld_current_user');
            }
        } else {
            console.log('No saved user found');
        }
    }
    
    // Test TOS modal (for debugging)
    testTOS() {
        console.log('Testing TOS modal...');
        console.log('TOS modal instance:', this.tosModal);
        console.log('TOS modal element:', document.getElementById('tosModal'));
        
        if (this.tosModal) {
            try {
                this.tosModal.show();
                console.log('TOS modal shown successfully in test');
            } catch (error) {
                console.error('Error showing TOS modal in test:', error);
                this.showTOSFallback();
            }
        } else {
            console.error('TOS modal is null in test!');
            this.showTOSFallback();
        }
    }
    
    // Force show TOS modal with fallback
    forceShowTOS() {
        if (this.tosModal) {
            console.log('TOS modal found, attempting to show...');
            try {
                this.tosModal.show();
                console.log('TOS modal shown successfully');
            } catch (error) {
                console.error('Error showing TOS modal:', error);
                this.showTOSFallback();
            }
        } else {
            console.error('TOS modal is null!');
            this.showTOSFallback();
        }
    }
    
    // Fallback TOS display if modal fails
    showTOSFallback() {
        console.log('Using fallback TOS display...');
        // Create a simple alert-based TOS
        const tosText = `Terms of Service for FemboyWorld:
        
1. You must be at least 15 years old to use this platform
2. You agree to follow community guidelines
3. You are responsible for your content
4. We may terminate accounts for violations

Do you accept these terms?`;
        
        if (confirm(tosText)) {
            this.acceptTOS();
        } else {
            this.declineTOS();
        }
    }
    
    // Update UI based on authentication status
    updateUIForAuth() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const currentUsername = document.getElementById('currentUsername');
        if (this.currentUser) {
            // User is logged in
            if (authButtons) authButtons.classList.add('d-none');
            if (userMenu) userMenu.classList.remove('d-none');
            if (currentUsername) currentUsername.textContent = this.currentUser.username;
        } else {
            // User is not logged in
            if (authButtons) authButtons.classList.remove('d-none');
            if (userMenu) userMenu.classList.add('d-none');
        }
    }
    
    // Show home section
    showHome() {
        this.hideAllSections();
        document.getElementById('homeSection').classList.add('active');
        this.renderPosts();
        this.updateStats();
    }
    
    // Show explore section
    showExplore() {
        this.hideAllSections();
        document.getElementById('exploreSection').classList.add('active');
        this.renderExploreContent();
    }
    
    // Show search section
    showSearch() {
        this.hideAllSections();
        document.getElementById('searchSection').classList.add('active');
        const searchQuery = document.getElementById('searchQuery');
        if (searchQuery) searchQuery.focus();
    }
    
    // Show profile section
    showProfile() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        this.hideAllSections();
        document.getElementById('profileSection').classList.add('active');
        this.renderProfile();
    }
    
    // Show support section
    showSupport() {
        this.hideAllSections();
        document.getElementById('supportSection').classList.add('active');
    }
    
    // Hide all sections
    hideAllSections() {
        const sections = ['homeSection', 'exploreSection', 'searchSection', 'profileSection', 'supportSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('active');
            }
        });
    }
    
    // Show login modal
    showLogin() {
        if (this.loginModal) {
            this.loginModal.show();
        }
    }
    
    // Show register modal
    showRegister() {
        if (this.registerModal) {
            this.registerModal.show();
        }
    }
    
    // Show upload modal
    showUpload() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        if (this.uploadModal) {
            this.uploadModal.show();
        }
    }
    
    // Handle login
    handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Find user
        const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            alert('User not found');
            return;
        }
        
        // Simple password check (in real app, use proper hashing)
        if (user.password !== password) {
            alert('Incorrect password');
            return;
        }
        
        // Login successful
        this.currentUser = user;
        localStorage.setItem('femboyworld_current_user', JSON.stringify(user));
        
        // Check if user has agreed to TOS
        if (!user.tosAccepted) {
            console.log('User has not accepted TOS, showing modal...');
            // Force show TOS modal
            this.forceShowTOS();
        } else {
            console.log('User has accepted TOS, proceeding with login...');
            // Update UI
            this.updateUIForAuth();
            
            // Close modal and show success
            this.loginModal.hide();
            document.getElementById('loginForm').reset();
            
            // Show home section
            this.showHome();
        }
        
        console.log(`User ${username} logged in successfully`);
    }
    
    // Handle registration
    handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const pronouns = document.getElementById('registerPronouns').value;
        const customPronouns = document.getElementById('registerCustomPronouns').value.trim();
        const bio = document.getElementById('registerBio').value.trim();
        
        if (!username || !email || !password) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Check if username already exists
        if (this.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            alert('Username already exists');
            return;
        }
        
        // Check if email already exists
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            alert('Email already exists');
            return;
        }
        
        // Determine final pronouns
        let finalPronouns = pronouns;
        if (pronouns === 'custom' && customPronouns) {
            finalPronouns = customPronouns;
        }
        
        // Create new user
        const newUser = {
            id: this.nextId++,
            username: username,
            email: email,
            password: password,
            pronouns: finalPronouns,
            bio: bio,
            avatar: null,
            createdAt: new Date().toISOString(),
            tosAccepted: false,
            posts: [],
            following: [],
            followers: []
        };
        
        // Add user to array
        this.users.push(newUser);
        
        // Save data
        this.saveData();
        
        // Close modal and show success
        this.registerModal.hide();
        document.getElementById('registerForm').reset();
        
        // Auto-login the new user
        this.currentUser = newUser;
        localStorage.setItem('femboyworld_current_user', JSON.stringify(newUser));
        
        // Show TOS modal for new users
        this.forceShowTOS();
        
        console.log(`User ${username} registered and logged in successfully`);
    }
    
    // Handle upload
    handleUpload() {
        const title = document.getElementById('postTitle').value.trim();
        const description = document.getElementById('postDescription').value.trim();
        const tags = document.getElementById('postTags').value.trim();
        const imageFile = document.getElementById('postImage').files[0];
        
        if (!title || !description || !imageFile) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Process image file
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Create new post
            const newPost = {
                id: this.nextId++,
                title: title,
                description: description,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                image: imageData,
                author: this.currentUser.username,
                authorId: this.currentUser.id,
                authorAvatar: this.currentUser.avatar,
                likes: 0,
                likedBy: [],
                createdAt: new Date().toISOString()
            };
            
            // Add post to array
            this.posts.push(newPost);
            
            // Add post to user's posts
            this.currentUser.posts.push(newPost.id);
            
            // Save data
            this.saveData();
            
            // Close modal and show success
            this.uploadModal.hide();
            document.getElementById('uploadForm').reset();
            
            // Refresh posts display
            this.renderPosts();
            
            console.log(`Post "${title}" created successfully by ${this.currentUser.username}`);
        };
        
        reader.readAsDataURL(imageFile);
    }
    
    // Handle edit profile
    handleEditProfile() {
        const username = document.getElementById('editUsername').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const pronouns = document.getElementById('editPronouns').value;
        const customPronouns = document.getElementById('editCustomPronouns').value.trim();
        const bio = document.getElementById('editBio').value.trim();
        const profilePicture = document.getElementById('profilePicture').files[0];
        
        if (!username || !email) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Check if username already exists (excluding current user)
        const existingUser = this.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && u.id !== this.currentUser.id
        );
        if (existingUser) {
            alert('Username already exists');
            return;
        }
        
        // Check if email already exists (excluding current user)
        const existingEmail = this.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.id !== this.currentUser.id
        );
        if (existingEmail) {
            alert('Email already exists');
            return;
        }
        
        // Determine final pronouns
        let finalPronouns = pronouns;
        if (pronouns === 'custom' && customPronouns) {
            finalPronouns = customPronouns;
        }
        
        // Update user data
        this.currentUser.username = username;
        this.currentUser.email = email;
        this.currentUser.pronouns = finalPronouns;
        this.currentUser.bio = bio;
        
        // Handle profile picture if selected
        if (profilePicture) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentUser.avatar = e.target.result;
                this.finalizeProfileUpdate();
            };
            reader.readAsDataURL(profilePicture);
        } else {
            this.finalizeProfileUpdate();
        }
    }
    
    // Finalize profile update
    finalizeProfileUpdate() {
        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.currentUser };
        }
        
        // Save data
        this.saveData();
        
        // Update localStorage
        localStorage.setItem('femboyworld_current_user', JSON.stringify(this.currentUser));
        
        // Close modal and show success
        this.editProfileModal.hide();
        document.getElementById('editProfileForm').reset();
        
        // Update UI
        this.updateUIForAuth();
        
        // Refresh profile if currently viewing
        if (!document.getElementById('profileSection').classList.contains('hidden')) {
            this.renderProfile();
        }
        
        console.log(`Profile updated successfully for ${this.currentUser.username}`);
    }
    
    // Show edit profile modal
    showEditProfileModal() {
        if (!this.currentUser) return;
        
        // Populate form fields
        document.getElementById('editUsername').value = this.currentUser.username;
        document.getElementById('editEmail').value = this.currentUser.email;
        document.getElementById('editBio').value = this.currentUser.bio || '';
        
        // Handle pronouns
        if (this.currentUser.pronouns) {
            if (['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any/all'].includes(this.currentUser.pronouns)) {
                document.getElementById('editPronouns').value = this.currentUser.pronouns;
            } else {
                document.getElementById('editPronouns').value = 'custom';
                document.getElementById('editCustomPronouns').value = this.currentUser.pronouns;
                document.getElementById('editCustomPronounsDiv').classList.remove('hidden');
            }
        }
        
        // Set profile picture preview
        const profilePreview = document.getElementById('profilePreview');
        if (profilePreview) {
            profilePreview.src = this.currentUser.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAxMDBDMjAgODAgMzAgNzAgNjAgNzBDOTAgNzAgMTAwIDgwIDEwMCAxMDBIMjBaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
        }
        
        // Show modal
        if (this.editProfileModal) {
            this.editProfileModal.show();
        }
    }
    
    // Show report modal
    showReportModal() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        if (this.reportModal) {
            this.reportModal.show();
        }
    }
    
    // Show help modal
    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.show();
        }
    }
    
    // Report a post
    reportPost(postId) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        // Set the report target to the post
        document.getElementById('reportType').value = 'post';
        document.getElementById('reportTarget').value = `Post ID: ${postId}`;
        
        this.showReportModal();
    }
    
    // Report a user
    reportUser(username) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        // Set the report target to the user
        document.getElementById('reportType').value = 'user';
        document.getElementById('reportTarget').value = `User: ${username}`;
        
        this.showReportModal();
    }
    
    // Perform search
    performSearch() {
        const query = document.getElementById('searchQuery').value.trim().toLowerCase();
        
        if (!query) {
            document.getElementById('searchResults').innerHTML = '<p class="text-muted text-center">Enter a search term to begin</p>';
            return;
        }
        
        // Search posts
        const matchingPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.description.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query)) ||
            post.author.toLowerCase().includes(query)
        );
        
        // Search users
        const matchingUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.bio.toLowerCase().includes(query)
        );
        
        // Render results
        this.renderSearchResults(matchingPosts, matchingUsers, query);
    }
    
    // Render search results
    renderSearchResults(posts, users, query) {
        const resultsContainer = document.getElementById('searchResults');
        let html = '';
        
        if (posts.length === 0 && users.length === 0) {
            html = `
                <div class="text-center">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No results found</h4>
                    <p class="text-muted">No posts or users match "${query}"</p>
                </div>
            `;
        } else {
            // Show posts
            if (posts.length > 0) {
                html += `
                    <div class="mb-4">
                        <h5><i class="fas fa-images"></i> Posts (${posts.length})</h5>
                        <div class="row">
                `;
                
                posts.forEach(post => {
                    html += this.createPostHTML(post);
                });
                
                html += '</div></div>';
            }
            
            // Show users
            if (users.length > 0) {
                html += `
                    <div class="mb-4">
                        <h5><i class="fas fa-users"></i> Users (${users.length})</h5>
                        <div class="row">
                `;
                
                users.forEach(user => {
                    html += `
                        <div class="col-md-6 mb-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    <img src="${user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMCA0MEMxMCAzMCAxNSAyNSAyNSAyNUMzNSAyNSAzMCAzMCAzMCA0MEgxMFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cg=='}" 
                                         class="post-avatar mb-2" alt="${user.username}">
                                    <h6>${user.username}</h6>
                                    ${user.pronouns ? `<span class="pronouns-badge">${user.pronouns}</span>` : ''}
                                    ${user.bio ? `<p class="text-muted small mt-2">${user.bio}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            }
        }
        
        resultsContainer.innerHTML = html;
    }
    
    // Render posts
    renderPosts() {
        const container = document.getElementById('postsContainer');
        const noPostsMessage = document.getElementById('noPostsMessage');
        
        if (!container) return;
        
        if (this.posts.length === 0) {
            if (noPostsMessage) noPostsMessage.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }
        
        if (noPostsMessage) noPostsMessage.classList.add('hidden');
        
        // Sort posts by creation date (newest first)
        const sortedPosts = [...this.posts].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        let html = '<div class="row">';
        sortedPosts.forEach(post => {
            html += this.createPostHTML(post);
        });
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    // Create post HTML
    createPostHTML(post) {
        const isLiked = this.currentUser && post.likedBy.includes(this.currentUser.id);
        const likeClass = isLiked ? 'like-btn active' : 'like-btn';
        const isFollowing = this.currentUser && this.currentUser.following.includes(post.authorId);
        const followClass = isFollowing ? 'follow-btn following' : 'follow-btn';
        const followText = isFollowing ? 'Unfollow' : 'Follow';
        const isOwner = this.currentUser && post.authorId === this.currentUser.id;
        
        // Get comments for this post
        const postComments = this.comments.filter(c => c.postId === post.id);
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="post-card">
                    <img src="${post.image}" class="post-image" alt="${post.title}">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="${post.authorAvatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMCA0MEMxMCAzMCAxNSAyNSAyNSAyNUMzNSAyNSAzMCAzMCAzMCA0MEgxMFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cg=='}" 
                                 class="post-avatar me-3" alt="${post.author}">
                            <div class="flex-grow-1">
                                <h6 class="mb-0">${post.author}</h6>
                                <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
                            </div>
                            ${!isOwner ? `<button class="${followClass}" onclick="app.toggleFollow(${post.authorId})">${followText}</button>` : ''}
                        </div>
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.description}</p>
                        ${post.tags.length > 0 ? `
                            <div class="mb-3">
                                ${post.tags.map(tag => `<span class="badge tag-badge me-1">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <button class="${likeClass}" onclick="app.likePost(${post.id})">
                                    <i class="fas fa-heart"></i> ${post.likes}
                                </button>
                                <button class="btn btn-outline-secondary btn-sm ms-2" onclick="app.showCommentModal(${post.id})" title="Comment on this post">
                                    <i class="fas fa-comment"></i> ${postComments.length}
                                </button>
                                <button class="btn btn-outline-secondary btn-sm ms-2" onclick="app.reportPost(${post.id})" title="Report this post">
                                    <i class="fas fa-flag"></i>
                                </button>
                                ${isOwner ? `<button class="delete-btn ms-2" onclick="app.deletePost(${post.id})" title="Delete this post">
                                    <i class="fas fa-trash"></i>
                                </button>` : ''}
                            </div>
                            <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
                        </div>
                        
                        <!-- Comments Section -->
                        ${postComments.length > 0 ? `
                            <div class="comment-section">
                                <h6><i class="fas fa-comments"></i> Comments (${postComments.length})</h6>
                                ${postComments.slice(0, 3).map(comment => `
                                    <div class="comment-item">
                                        <div class="comment-author">${comment.author}</div>
                                        <div class="comment-text">${comment.text}</div>
                                        <div class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</div>
                                    </div>
                                `).join('')}
                                ${postComments.length > 3 ? `<small class="text-muted">... and ${postComments.length - 3} more comments</small>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Like/unlike a post
    likePost(postId) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const likeIndex = post.likedBy.indexOf(this.currentUser.id);
        
        if (likeIndex === -1) {
            // Like the post
            post.likedBy.push(this.currentUser.id);
            post.likes++;
            
            // Add notification for post author (if not liking own post)
            if (post.authorId !== this.currentUser.id) {
                const postAuthor = this.users.find(u => u.id === post.authorId);
                if (postAuthor) {
                    this.addNotification('like', `${this.currentUser.username} liked your post`, post.authorId);
                }
            }
        } else {
            // Unlike the post
            post.likedBy.splice(likeIndex, 1);
            post.likes--;
        }
        
        // Save data
        this.saveData();
        
        // Re-render posts to update like count
        this.renderPosts();
        
        console.log(`Post ${postId} ${likeIndex === -1 ? 'liked' : 'unliked'} by ${this.currentUser.username}`);
    }
    
    // Render explore content
    renderExploreContent() {
        const container = document.getElementById('exploreContent');
        if (!container) return;
        
        // Show trending posts
        const trendingPosts = [...this.posts]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 6);
        
        if (trendingPosts.length > 0) {
            let html = `
                <div class="mb-5">
                    <h3 class="text-center mb-4">Trending Posts</h3>
                    <div class="row">
            `;
            
            trendingPosts.forEach(post => {
                html += this.createPostHTML(post);
            });
            
            html += '</div></div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-fire fa-3x text-muted mb-3"></i>
                    <h4>No trending posts yet</h4>
                    <p class="text-muted">Be the first to create something amazing!</p>
                </div>
            `;
        }
    }
    
    // Render profile
    renderProfile() {
        if (!this.currentUser) return;
        
        // Render profile info
        const profileInfo = document.getElementById('profileInfo');
        if (profileInfo) {
            profileInfo.innerHTML = `
                <img src="${this.currentUser.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAxMDBDMjAgODAgMzAgNzAgNjAgNzBDOTAgNzAgMTAwIDgwIDEwMCAxMDBIMjBaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='}" 
                     class="post-avatar mb-3" style="width: 120px; height: 120px;" alt="${this.currentUser.username}">
                <h5>${this.currentUser.username}</h5>
                ${this.currentUser.pronouns ? `<span class="pronouns-badge mb-2">${this.currentUser.pronouns}</span>` : ''}
                ${this.currentUser.bio ? `<p class="text-muted">${this.currentUser.bio}</p>` : ''}
                <div class="row text-center mb-3">
                    <div class="col-6">
                        <div class="text-primary fw-bold">${this.currentUser.following ? this.currentUser.following.length : 0}</div>
                        <small class="text-muted">Following</small>
                    </div>
                    <div class="col-6">
                        <div class="text-primary fw-bold">${this.currentUser.followers ? this.currentUser.followers.length : 0}</div>
                        <small class="text-muted">Followers</small>
                    </div>
                </div>
                <p class="text-muted small">Member since ${new Date(this.currentUser.createdAt).toLocaleDateString()}</p>
                <button class="btn btn-primary btn-sm" onclick="app.showEditProfileModal()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            `;
        }
        
        // Render user posts
        const userPostsContainer = document.getElementById('userPostsContainer');
        if (userPostsContainer) {
            const userPosts = this.posts.filter(post => post.authorId === this.currentUser.id);
            
            if (userPosts.length > 0) {
                let html = '<div class="row">';
                userPosts.forEach(post => {
                    html += this.createPostHTML(post);
                });
                html += '</div>';
                userPostsContainer.innerHTML = html;
            } else {
                userPostsContainer.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-upload fa-3x text-muted mb-3"></i>
                        <h5>No posts yet</h5>
                        <p class="text-muted">Share your first post with the community!</p>
                        <a href="#" onclick="app.showUpload()" class="btn btn-primary">
                            <i class="fas fa-upload"></i> Create Post
                        </a>
                    </div>
                `;
            }
        }
    }
    
    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('femboyworld_current_user');
        
        // Update UI
        this.updateUIForAuth();
        
        // Show home section
        this.showHome();
        
        console.log('User logged out successfully');
    }
    
    // Show FAQ section
    showFAQ() {
        document.getElementById('faqSection').classList.remove('hidden');
        document.getElementById('contactFormSection').classList.add('hidden');
    }
    
    // Show contact form
    showContactForm() {
        document.getElementById('contactFormSection').classList.remove('hidden');
        document.getElementById('faqSection').classList.add('hidden');
    }
    
    // Show TOS modal
    showTOS() {
        if (this.tosModal) {
            try {
                this.tosModal.show();
                console.log('TOS modal shown via showTOS method');
            } catch (error) {
                console.error('Error showing TOS modal via showTOS method:', error);
                this.showTOSFallback();
            }
        } else {
            console.error('TOS modal is null in showTOS method!');
            this.showTOSFallback();
        }
    }
    
    // Accept TOS
    acceptTOS() {
        if (this.currentUser) {
            this.currentUser.tosAccepted = true;
            this.currentUser.tosAcceptedAt = new Date().toISOString();
            
            // Update user in users array
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = this.currentUser;
            }
            
            // Save data
            this.saveData();
            
            // Close TOS modal
            if (this.tosModal) {
                this.tosModal.hide();
            }
            
            // Update UI and show home
            this.updateUIForAuth();
            this.showHome();
            
            console.log('TOS accepted');
        }
    }
    
    // Decline TOS
    declineTOS() {
        // Logout user if they decline TOS
        this.logout();
        
        // Close TOS modal
        if (this.tosModal) {
            this.tosModal.hide();
            
            // Show login modal
            if (this.loginModal) {
                this.loginModal.show();
            }
        }
        
        alert('You must accept the Terms of Service to use FemboyWorld.');
        console.log('TOS declined, user logged out');
    }
    
    // Follow/Unfollow a user
    toggleFollow(userId) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        const targetUser = this.users.find(u => u.id === userId);
        if (!targetUser) return;
        
        const isFollowing = this.currentUser.following.includes(userId);
        
        if (isFollowing) {
            // Unfollow
            this.currentUser.following = this.currentUser.following.filter(id => id !== userId);
            targetUser.followers = targetUser.followers.filter(id => id !== this.currentUser.id);
        } else {
            // Follow
            this.currentUser.following.push(userId);
            targetUser.followers.push(this.currentUser.id);
            
            // Add notification for target user
            this.addNotification('follow', `${this.currentUser.username} started following you`, userId);
        }
        
        // Save data
        this.saveData();
        
        // Update UI
        this.renderPosts();
        if (!document.getElementById('profileSection').classList.contains('hidden')) {
            this.renderProfile();
        }
        
        console.log(`${this.currentUser.username} ${isFollowing ? 'unfollowed' : 'followed'} ${targetUser.username}`);
    }
    
    // Add comment to a post
    addComment(postId, commentText) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        const newComment = {
            id: this.nextId++,
            postId: postId,
            author: this.currentUser.username,
            authorId: this.currentUser.id,
            authorAvatar: this.currentUser.avatar,
            text: commentText,
            createdAt: new Date().toISOString()
        };
        
        this.comments.push(newComment);
        this.saveData();
        
        // Add notification for post author (if not commenting on own post)
        const post = this.posts.find(p => p.id === postId);
        if (post && post.authorId !== this.currentUser.id) {
            this.addNotification('comment', `${this.currentUser.username} commented on your post`, post.authorId);
        }
        
        // Refresh posts display
        this.renderPosts();
        
        console.log(`Comment added to post ${postId} by ${this.currentUser.username}`);
    }
    
    // Show comment modal
    showCommentModal(postId) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        // Store the post ID for the comment form
        this.currentCommentPostId = postId;
        
        if (this.commentModal) {
            this.commentModal.show();
        }
    }
    
    // Delete a post
    deletePost(postId) {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        // Check if user owns the post
        if (post.authorId !== this.currentUser.id) {
            alert('You can only delete your own posts.');
            return;
        }
        
        // Remove post from posts array
        this.posts = this.posts.filter(p => p.id !== postId);
        
        // Remove post from user's posts
        this.currentUser.posts = this.currentUser.posts.filter(id => id !== postId);
        
        // Remove all comments for this post
        this.comments = this.comments.filter(c => c.postId !== postId);
        
        // Save data
        this.saveData();
        
        // Refresh posts display
        this.renderPosts();
        
        // Refresh profile if currently viewing
        if (!document.getElementById('profileSection').classList.contains('hidden')) {
            this.renderProfile();
        }
        
        console.log(`Post ${postId} deleted by ${this.currentUser.username}`);
    }
}



// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing FemboyWorld...');
    window.app = new FemboyWorldApp();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FemboyWorldApp;
}
