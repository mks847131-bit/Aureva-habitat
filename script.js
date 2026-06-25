// ============================================================
// AUREVA HABITAT — Main Application Script
// ============================================================

'use strict';

// ── TOAST SYSTEM ──────────────────────────────────────────
const Toast = {
  container: null,
  init() { this.container = document.getElementById('toast-container'); },
  show(message, type = 'info', duration = 4000) {
    const icons = { success: '✓', error: '✕', info: '◆' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── NAVBAR ────────────────────────────────────────────────
const Navbar = {
  init() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    // Mobile menu
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');
    hamburger?.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }
};

// ── SCROLL ANIMATIONS ─────────────────────────────────────
const ScrollAnimator = {
  init() {
    const els = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => observer.observe(el));
  }
};

// ── SETTINGS / SITE CONTENT ──────────────────────────────
const SiteContent = {
  settings: {},

  async load() {
    try {
      const doc = await db.collection('settings').doc('site').get();
      if (doc.exists) {
        this.settings = doc.data();
        this.render();
      }
    } catch (e) {
      console.log('Settings load error:', e.message);
    }
  },

  render() {
    const s = this.settings;
    if (s.tagline) {
      const el = document.getElementById('hero-tagline');
      if (el) el.textContent = s.tagline;
    }
    if (s.heroSubtitle) {
      const el = document.getElementById('hero-subtitle');
      if (el) el.textContent = s.heroSubtitle;
    }
    if (s.aboutTitle) {
      const el = document.getElementById('about-title');
      if (el) el.textContent = s.aboutTitle;
    }
    if (s.aboutDescription) {
      const el = document.getElementById('about-description');
      if (el) el.textContent = s.aboutDescription;
    }
    if (s.founderName) {
      const el = document.getElementById('founder-name');
      if (el) el.textContent = s.founderName;
    }
    if (s.founderTitle) {
      const el = document.getElementById('founder-title');
      if (el) el.textContent = s.founderTitle;
    }
    if (s.founderBio) {
      const el = document.getElementById('founder-bio');
      if (el) el.textContent = s.founderBio;
    }
  }
};

// ── SERVICES ──────────────────────────────────────────────
const Services = {
  async load() {
    try {
      const snap = await db.collection('services').orderBy('order', 'asc').get();
      const grid = document.getElementById('services-grid');
      if (!grid) return;
      if (snap.empty) return;
      grid.innerHTML = '';
      snap.forEach(doc => {
        const s = doc.data();
        grid.innerHTML += `
          <div class="service-card fade-in">
            <div class="service-icon">${s.icon || '✦'}</div>
            <div class="service-title">${s.title}</div>
            <div class="service-desc">${s.description}</div>
          </div>`;
      });
      ScrollAnimator.init();
    } catch (e) {
      console.log('Services load error:', e.message);
    }
  }
};

// ── PORTFOLIO ─────────────────────────────────────────────
const Portfolio = {
  activeFilter: 'all',

  load() {
    // Static portfolio — items are already in the HTML
    this.bindClicks();
    ScrollAnimator.init();
  },

  bindClicks() {
    document.querySelectorAll('.portfolio-item').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        const title = el.querySelector('.p-title')?.textContent || el.dataset.title || '';
        Lightbox.open(url, title);
      });
    });
  },

  setFilter(cat) {
    this.activeFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
    document.querySelectorAll('.portfolio-item').forEach(item => {
      const itemCat = item.dataset.category;
      if (cat === 'all' || itemCat === cat) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
};

// ── LIGHTBOX ──────────────────────────────────────────────
const Lightbox = {
  init() {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-close')?.addEventListener('click', () => lb.classList.remove('open'));
    lb?.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb?.classList.remove('open'); });
  },
  open(url, title = '') {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-caption').textContent = title;
    lb.classList.add('open');
  }
};

// ── CONTACT FORM ──────────────────────────────────────────
const ContactForm = {
  init() {
    const form = document.getElementById('contact-form');
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (!data.name || !data.phone) {
        Toast.show('Please fill in required fields.', 'error');
        btn.textContent = 'Send Enquiry';
        btn.disabled = false;
        return;
      }
      try {
        await db.collection('leads').add(data);
        Toast.show('Your enquiry has been sent. We will contact you shortly.', 'success');
        form.reset();
      } catch (err) {
        Toast.show('Failed to send. Please call us directly.', 'error');
      }
      btn.textContent = 'Send Enquiry';
      btn.disabled = false;
    });
  }
};

// ── QUERY FORM ────────────────────────────────────────────
const QueryForm = {
  init() {
    const form = document.getElementById('query-form');
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Submitting...';
      btn.disabled = true;
      const data = {
        name: form.q_name.value.trim(),
        contact: form.q_contact.value.trim(),
        category: form.q_category.value,
        message: form.q_message.value.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      try {
        await db.collection('queries').add(data);
        Toast.show('Query submitted successfully!', 'success');
        form.reset();
      } catch (err) {
        Toast.show('Submission failed. Please try again.', 'error');
      }
      btn.textContent = 'Submit Query';
      btn.disabled = false;
    });
  }
};

// ── ADMIN ─────────────────────────────────────────────────
const Admin = {
  currentUser: null,

  init() {
    // Check URL for admin route
    const isAdmin = window.location.hash === '#admin' || window.location.pathname.includes('/admin');
    auth.onAuthStateChanged(user => {
      this.currentUser = user;
      if (user) {
        document.getElementById('admin-login-screen').classList.remove('active');
        document.getElementById('admin-panel').classList.add('active');
        document.getElementById('admin-user-email').textContent = user.email;
        this.loadDashboard();
      } else if (isAdmin) {
        document.getElementById('admin-login-screen').classList.add('active');
      }
    });

    // Login form
    document.getElementById('admin-login-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;
      try {
        await auth.signInWithEmailAndPassword(email, password);
        Toast.show('Welcome to Aureva Admin', 'success');
      } catch (err) {
        Toast.show('Invalid credentials. Please try again.', 'error');
      }
    });

    // Logout
    document.getElementById('admin-logout')?.addEventListener('click', async () => {
      await auth.signOut();
      document.getElementById('admin-panel').classList.remove('active');
      window.location.hash = '';
      Toast.show('Logged out successfully', 'info');
    });

    // Admin trigger
    document.getElementById('admin-trigger')?.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = 'admin';
      document.getElementById('admin-login-screen').classList.add('active');
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;
        document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
        document.getElementById(`admin-${page}`)?.classList.add('active');
        this.loadPage(page);
      });
    });
  },

  loadPage(page) {
    switch (page) {
      case 'dashboard': this.loadDashboard(); break;
      case 'portfolio': this.loadPortfolioAdmin(); break;
      case 'leads': this.loadLeads(); break;
      case 'queries': this.loadQueries(); break;
      case 'services': this.loadServicesAdmin(); break;
      case 'settings': this.loadSettingsAdmin(); break;
    }
  },

  async loadDashboard() {
    try {
      const [leadsSnap, queriesSnap, portfolioSnap] = await Promise.all([
        db.collection('leads').get(),
        db.collection('queries').get(),
        db.collection('portfolio').get()
      ]);
      document.getElementById('dash-leads').textContent = leadsSnap.size;
      document.getElementById('dash-queries').textContent = queriesSnap.size;
      document.getElementById('dash-portfolio').textContent = portfolioSnap.size;
      document.getElementById('dash-services').textContent = (await db.collection('services').get()).size;
    } catch (e) { console.log(e); }
  },

  // ── PORTFOLIO ADMIN ──────────────────────────────────────
  async loadPortfolioAdmin() {
    const grid = document.getElementById('admin-portfolio-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-spinner" style="margin:2rem auto"></div>';
    try {
      const snap = await db.collection('portfolio').orderBy('timestamp', 'desc').get();
      if (snap.empty) { grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:1rem">No portfolio items yet.</p>'; return; }
      grid.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `
          <div class="portfolio-admin-item">
            <img src="${d.imageUrl}" alt="${d.title}" loading="lazy">
            <div class="portfolio-admin-overlay">
              <div class="p-title">${d.title}</div>
              <div class="p-cat">${d.category}</div>
              <button class="delete-btn" data-id="${doc.id}" data-url="${d.imageUrl}">Delete</button>
            </div>
          </div>`;
      }).join('');
      grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => this.deletePortfolioItem(btn.dataset.id, btn.dataset.url));
      });
    } catch (e) { grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:1rem">Error loading portfolio.</p>'; }

    // Upload form
    this.initUploadForm();
  },

  initUploadForm() {
    const form = document.getElementById('portfolio-upload-form');
    if (!form || form.dataset.init) return;
    form.dataset.init = 'true';
    const fileInput = document.getElementById('portfolio-file');
    const progressBar = document.getElementById('upload-progress-fill');
    const progressWrap = document.getElementById('upload-progress-wrap');
    const uploadZone = document.getElementById('upload-zone');

    // Drag & drop
    uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone?.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) { fileInput.files = e.dataTransfer.files; document.getElementById('upload-file-name').textContent = e.dataTransfer.files[0].name; } });
    fileInput?.addEventListener('change', () => { document.getElementById('upload-file-name').textContent = fileInput.files[0]?.name || ''; });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const file = fileInput.files[0];
      const title = document.getElementById('upload-title').value.trim();
      const category = document.getElementById('upload-category').value;
      if (!file || !title) { Toast.show('Please select an image and add a title.', 'error'); return; }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Uploading...';
      submitBtn.disabled = true;
      progressWrap.style.display = 'block';

      try {
        const fileName = `portfolio/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const ref = storage.ref(fileName);
        const uploadTask = ref.put(file);

        uploadTask.on('state_changed',
          snap => {
            const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
            progressBar.style.width = pct + '%';
          },
          err => { Toast.show('Upload failed: ' + err.message, 'error'); },
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            await db.collection('portfolio').add({
              title, category, imageUrl: url,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            Toast.show('Portfolio image uploaded!', 'success');
            form.reset();
            document.getElementById('upload-file-name').textContent = '';
            progressBar.style.width = '0';
            progressWrap.style.display = 'none';
            this.loadPortfolioAdmin();
            Portfolio.load(); // refresh public grid
          }
        );
      } catch (err) {
        Toast.show('Upload error: ' + err.message, 'error');
      }
      submitBtn.textContent = 'Upload Image';
      submitBtn.disabled = false;
    });
  },

  async deletePortfolioItem(id, imageUrl) {
    if (!confirm('Delete this portfolio item permanently?')) return;
    try {
      await db.collection('portfolio').doc(id).delete();
      if (imageUrl) {
        try { await storage.refFromURL(imageUrl).delete(); } catch (e) {}
      }
      Toast.show('Portfolio item deleted.', 'success');
      this.loadPortfolioAdmin();
      Portfolio.load();
    } catch (e) { Toast.show('Delete failed.', 'error'); }
  },

  // ── LEADS ────────────────────────────────────────────────
  async loadLeads() {
    const tbody = document.getElementById('leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty"><div class="loading-spinner" style="margin:0 auto"></div></td></tr>';
    try {
      const snap = await db.collection('leads').orderBy('timestamp', 'desc').get();
      if (snap.empty) { tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No leads yet.</td></tr>'; return; }
      tbody.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        const date = d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString('en-IN') : '—';
        return `<tr>
          <td>${d.name || '—'}</td>
          <td>${d.phone || '—'}</td>
          <td>${d.email || '—'}</td>
          <td style="max-width:200px;white-space:pre-wrap;font-size:0.78rem">${d.message || '—'}</td>
          <td style="color:var(--text-muted)">${date}</td>
        </tr>`;
      }).join('');
    } catch (e) { tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Error loading leads.</td></tr>'; }
  },

  // ── QUERIES ───────────────────────────────────────────────
  async loadQueries() {
    const tbody = document.getElementById('queries-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty"><div class="loading-spinner" style="margin:0 auto"></div></td></tr>';
    try {
      const snap = await db.collection('queries').orderBy('timestamp', 'desc').get();
      if (snap.empty) { tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No queries yet.</td></tr>'; return; }
      tbody.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        const date = d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString('en-IN') : '—';
        return `<tr>
          <td>${d.name || '—'}</td>
          <td>${d.contact || '—'}</td>
          <td><span style="color:var(--gold)">${d.category || '—'}</span></td>
          <td style="max-width:200px;white-space:pre-wrap;font-size:0.78rem">${d.message || '—'}</td>
          <td style="color:var(--text-muted)">${date}</td>
        </tr>`;
      }).join('');
    } catch (e) { tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Error loading queries.</td></tr>'; }
  },

  // ── SERVICES ADMIN ────────────────────────────────────────
  async loadServicesAdmin() {
    const list = document.getElementById('services-list-admin');
    if (!list) return;
    list.innerHTML = '<div class="loading-spinner" style="margin:2rem auto"></div>';
    try {
      const snap = await db.collection('services').orderBy('order', 'asc').get();
      if (snap.empty) { list.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem">No services.</p>'; return; }
      list.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `
          <div class="service-admin-item">
            <div>
              <div class="svc-name">${d.icon || ''} ${d.title}</div>
              <div class="svc-desc">${d.description}</div>
            </div>
            <div class="svc-actions">
              <button class="admin-btn danger svc-delete" data-id="${doc.id}">Delete</button>
            </div>
          </div>`;
      }).join('');
      list.querySelectorAll('.svc-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this service?')) return;
          await db.collection('services').doc(btn.dataset.id).delete();
          Toast.show('Service deleted.', 'success');
          this.loadServicesAdmin();
          Services.load();
        });
      });
    } catch (e) {}

    // Add service form
    const addForm = document.getElementById('add-service-form');
    if (addForm && !addForm.dataset.init) {
      addForm.dataset.init = 'true';
      addForm.addEventListener('submit', async e => {
        e.preventDefault();
        const title = document.getElementById('svc-title').value.trim();
        const desc = document.getElementById('svc-desc').value.trim();
        const icon = document.getElementById('svc-icon').value.trim() || '✦';
        if (!title) { Toast.show('Service title is required.', 'error'); return; }
        try {
          const snap = await db.collection('services').orderBy('order', 'desc').limit(1).get();
          const lastOrder = snap.empty ? 0 : (snap.docs[0].data().order || 0);
          await db.collection('services').add({ title, description: desc, icon, order: lastOrder + 1 });
          Toast.show('Service added!', 'success');
          addForm.reset();
          this.loadServicesAdmin();
          Services.load();
        } catch (e) { Toast.show('Failed to add service.', 'error'); }
      });
    }
  },

  // ── SETTINGS ADMIN ────────────────────────────────────────
  async loadSettingsAdmin() {
    try {
      const doc = await db.collection('settings').doc('site').get();
      if (!doc.exists) return;
      const s = doc.data();
      const fields = ['tagline','heroSubtitle','aboutTitle','aboutDescription','founderName','founderTitle','founderBio','phone','email'];
      fields.forEach(f => {
        const el = document.getElementById(`setting-${f}`);
        if (el) el.value = s[f] || '';
      });
    } catch (e) {}

    const form = document.getElementById('settings-form');
    if (form && !form.dataset.init) {
      form.dataset.init = 'true';
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {};
        ['tagline','heroSubtitle','aboutTitle','aboutDescription','founderName','founderTitle','founderBio','phone','email'].forEach(f => {
          const el = document.getElementById(`setting-${f}`);
          if (el) data[f] = el.value.trim();
        });
        try {
          await db.collection('settings').doc('site').set(data, { merge: true });
          Toast.show('Settings saved successfully!', 'success');
          SiteContent.load();
        } catch (e) { Toast.show('Failed to save settings.', 'error'); }
      });
    }
  }
};

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Navbar.init();
  ScrollAnimator.init();
  Lightbox.init();
  SiteContent.load();
  Services.load();
  Portfolio.load();
  ContactForm.init();
  QueryForm.init();
  Admin.init();

  // Portfolio filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => Portfolio.setFilter(btn.dataset.filter));
  });

  // WhatsApp button
  document.querySelectorAll('.whatsapp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open('https://wa.me/918595489361?text=Hi%20Aureva%20Habitat%2C%20I%20want%20interior%20design%20consultation.', '_blank');
    });
  });
});
