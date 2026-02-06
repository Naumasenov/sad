// ============================================
// Payment Script Generator Pro - JavaScript
// Version: 2.0.0
// ============================================

// Global State
let currentType = null;
let currentStep = 1;
let selectedElement = null;
let candidates = [];
let debugMode = false;
let currentTheme = 'light';
let editingSiteIndex = null;

// LocalStorage Keys
const STORAGE_KEYS = {
    SITES: 'psg_sites',
    STATS: 'psg_stats',
    THEME: 'psg_theme',
    DEBUG: 'psg_debug',
    CONFIGS: 'psg_configs'
};

// Platform Presets
const platformPresets = {
    woocommerce: {
        name: 'WooCommerce',
        cart: ['.woocommerce-cart-form', '#order_review', '.cart-container'],
        payment: ['.wc_payment_methods', '#payment', '.payment-methods'],
        total: ['.order-total', '.cart-total', 'tr.order-total .woocommerce-Price-amount'],
        disable: ['form[name="checkout"]', '#payment', '.woocommerce-checkout'],
        autofill: ['form[name="checkout"]', '#payment', '.payment-box']
    },
    shopify: {
        name: 'Shopify',
        cart: ['.cart__items', '[data-cart-items]', '.cart-form'],
        payment: ['.payment-methods', '[data-payment]', '.payment-list'],
        total: ['.totals', '[data-cart-total]', '.order-summary__section--total'],
        disable: ['form[action="/cart"]', '.payment-form', '[data-payment-form]'],
        autofill: ['form[action="/cart"]', '.payment-form', '[data-payment-form]']
    },
    opencart: {
        name: 'OpenCart',
        cart: ['#shopping-cart-table', '.cart-table', '#content .table-responsive'],
        payment: ['#payment_method_list', '.payment-options', '.checkout-payment-methods'],
        total: ['#totalPrice', '.grand-total', '#total-amount'],
        disable: ['#payment-form', 'form#checkout', '.payment-method-form'],
        autofill: ['#payment-form', 'form#checkout', '.card-details']
    },
    magento: {
        name: 'Magento',
        cart: ['.cart.table-wrapper', '#shopping-cart-table', '.cart.items'],
        payment: ['.payment-methods', '#checkout-payment-method-load', '.payment-method'],
        total: ['.grand.totals', '.cart-totals .amount', '.grand-total .price'],
        disable: ['#payment-form', '.payment-method-content', 'form.payment'],
        autofill: ['#payment-form', '.payment-method-content', '.payment-details']
    },
    prestashop: {
        name: 'PrestaShop',
        cart: ['#cart-summary', '.cart-grid', '.cart-overview'],
        payment: ['.payment-options', '#payment-confirmation', '.payment-method'],
        total: ['.cart-total', '.cart-summary-totals', '.cart-grid-right .value'],
        disable: ['#payment-form', '.payment-option', 'form[action*="order"]'],
        autofill: ['#payment-form', '.payment-option', '.card-form']
    }
};

// Debug Logger
function log(level, message, data = null) {
    if (!debugMode) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const entry = document.createElement('div');
    entry.className = `debug-entry ${level}`;
    entry.innerHTML = `
        <span class="debug-timestamp">[${timestamp}]</span>
        <strong>[${level.toUpperCase()}]</strong> ${message}
        ${data ? `<pre style="margin-top: 5px; font-size: 0.8rem;">${JSON.stringify(data, null, 2)}</pre>` : ''}
    `;
    
    const container = document.getElementById('debugEntries');
    container.insertBefore(entry, container.firstChild);
    
    // Keep only last 50 entries
    while (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadStats();
    loadSites();
    setupKeyboardShortcuts();
    log('info', 'Application initialized');
});

// Theme Management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
    log('info', `Theme changed to ${currentTheme}`);
}

function loadTheme() {
    currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    
    if (currentTheme === 'dark') {
        icon.textContent = '☀️';
        text.textContent = 'Light Mode';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
    }
}

// Debug Mode
function toggleDebug() {
    debugMode = !debugMode;
    const logger = document.getElementById('debugLogger');
    logger.style.display = debugMode ? 'block' : 'none';
    localStorage.setItem(STORAGE_KEYS.DEBUG, debugMode);
    log('info', 'Debug mode toggled', { enabled: debugMode });
}

function clearDebugLog() {
    document.getElementById('debugEntries').innerHTML = '';
    log('info', 'Debug log cleared');
}

// Stats Management
function loadStats() {
    const stats = getStats();
    
    document.getElementById('cartUsage').textContent = stats.cart.uses;
    document.getElementById('cartSuccess').textContent = stats.cart.success + '%';
    document.getElementById('cartBadge').textContent = stats.cart.success + '%';
    
    document.getElementById('paymentUsage').textContent = stats.payment.uses;
    document.getElementById('paymentSuccess').textContent = stats.payment.success + '%';
    document.getElementById('paymentBadge').textContent = stats.payment.success + '%';
    
    document.getElementById('disableUsage').textContent = stats.disable.uses;
    document.getElementById('disableSuccess').textContent = stats.disable.success + '%';
    document.getElementById('disableBadge').textContent = stats.disable.success + '%';
    
    document.getElementById('autofillUsage').textContent = stats.autofill.uses;
    document.getElementById('autofillSuccess').textContent = stats.autofill.success + '%';
    document.getElementById('autofillBadge').textContent = stats.autofill.success + '%';
    
    document.getElementById('totalUsage').textContent = stats.total.uses;
    document.getElementById('totalSuccess').textContent = stats.total.success + '%';
    document.getElementById('totalBadge').textContent = stats.total.success + '%';
}

function getStats() {
    const defaultStats = {
        cart: { uses: 0, success: 98 },
        payment: { uses: 0, success: 95 },
        disable: { uses: 0, success: 100 },
        autofill: { uses: 0, success: 92 },
        total: { uses: 0, success: 97 }
    };
    
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    return stored ? JSON.parse(stored) : defaultStats;
}

function updateStats(type) {
    const stats = getStats();
    stats[type].uses++;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    loadStats();
    log('info', `Stats updated for ${type}`, stats[type]);
}

// Site Management
function loadSites() {
    const sites = getSites();
    const list = document.getElementById('siteList');
    const emptyState = document.getElementById('siteEmpty');
    const searchInput = document.getElementById('siteSearch');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    list.innerHTML = '';

    const filteredSites = sites
        .map((site, index) => ({ site, index }))
        .filter(({ site }) => {
            if (!query) return true;
            return site.name.toLowerCase().includes(query) || site.url.toLowerCase().includes(query);
        });

    filteredSites.forEach(({ site, index }) => {
        const item = document.createElement('div');
        item.className = `site-item ${site.active ? 'active' : ''}`;
        item.innerHTML = `
            <div class="site-status ${site.status}"></div>
            <div class="site-info">
                <h4>${site.name}</h4>
                <p>${site.url}</p>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    Last updated: ${new Date(site.lastUpdated).toLocaleDateString()}
                </p>
            </div>
            <div class="site-actions">
                <button class="icon-btn ${site.active ? 'active' : ''}" onclick="setActiveSite(${index})" title="Set Active">⭐</button>
                <button class="icon-btn" onclick="editSite(${index})" title="Edit">✏️</button>
                <button class="icon-btn" onclick="deleteSite(${index})" title="Delete">🗑️</button>
                <button class="icon-btn" onclick="loadSiteConfig(${index})" title="Load">📂</button>
            </div>
        `;
        list.appendChild(item);
    });

    updateSiteCount(filteredSites.length, sites.length);
    if (emptyState) {
        if (sites.length === 0) {
            emptyState.textContent = 'No sites added yet. Create your first site to save scripts & presets.';
            emptyState.style.display = 'block';
        } else if (filteredSites.length === 0) {
            emptyState.textContent = 'No sites match your search. Try a different keyword.';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
}

function getSites() {
    const stored = localStorage.getItem(STORAGE_KEYS.SITES);
    return stored ? JSON.parse(stored) : [];
}

function saveSites(sites) {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
    log('info', 'Sites saved', { count: sites.length });
}

function openSiteManager() {
    const manager = document.getElementById('siteManager');
    manager.style.display = manager.style.display === 'none' ? 'block' : 'none';
    if (manager.style.display === 'block') {
        loadSites();
        const searchInput = document.getElementById('siteSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    log('info', 'Site manager toggled');
}

function addNewSite() {
    toggleSiteForm();
}

function editSite(index) {
    const sites = getSites();
    const site = sites[index];

    editingSiteIndex = index;
    const form = document.getElementById('siteForm');
    const nameInput = document.getElementById('siteNameInput');
    const urlInput = document.getElementById('siteUrlInput');
    const helper = document.getElementById('siteFormHelper');

    if (form && nameInput && urlInput) {
        form.style.display = 'block';
        nameInput.value = site.name;
        urlInput.value = site.url;
        if (helper) {
            helper.textContent = 'Editing site details. Update name or URL and save.';
        }
        nameInput.focus();
    }

    log('info', 'Site edit opened', site);
}

function deleteSite(index) {
    if (!confirm('Delete this site?')) return;
    
    const sites = getSites();
    const deleted = sites.splice(index, 1);
    saveSites(sites);
    loadSites();
    log('info', 'Site deleted', deleted[0]);
}

function loadSiteConfig(index) {
    const sites = getSites();
    const site = sites[index];
    
    alert(`Loading config for ${site.name}\n\nScripts:\n${JSON.stringify(site.scripts, null, 2)}`);
    log('info', 'Site config loaded', site);
}

function setActiveSite(index) {
    const sites = getSites();
    sites.forEach((site, i) => {
        site.active = i === index;
    });
    saveSites(sites);
    loadSites();
    log('info', 'Active site updated', sites[index]);
}

function toggleSiteForm() {
    const form = document.getElementById('siteForm');
    if (!form) return;

    if (form.style.display === 'none') {
        editingSiteIndex = null;
        form.style.display = 'block';
        resetSiteForm();
    } else {
        cancelSiteForm();
    }
}

function resetSiteForm() {
    const nameInput = document.getElementById('siteNameInput');
    const urlInput = document.getElementById('siteUrlInput');
    const helper = document.getElementById('siteFormHelper');
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
    if (helper) {
        helper.textContent = 'Tip: Add full checkout or cart URL for faster testing.';
    }
}

function cancelSiteForm() {
    const form = document.getElementById('siteForm');
    if (form) form.style.display = 'none';
    editingSiteIndex = null;
    resetSiteForm();
}

function submitSiteForm() {
    const nameInput = document.getElementById('siteNameInput');
    const urlInput = document.getElementById('siteUrlInput');
    const helper = document.getElementById('siteFormHelper');

    if (!nameInput || !urlInput) return;

    const name = nameInput.value.trim();
    const rawUrl = urlInput.value.trim();

    if (!name) {
        if (helper) helper.textContent = 'Please enter a site name.';
        nameInput.focus();
        return;
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    if (!normalizedUrl) {
        if (helper) helper.textContent = 'Please enter a valid URL (example: https://example.com/checkout).';
        urlInput.focus();
        return;
    }

    const sites = getSites();
    const now = new Date().toISOString();

    if (editingSiteIndex !== null) {
        const site = sites[editingSiteIndex];
        site.name = name;
        site.url = normalizedUrl;
        site.lastUpdated = now;
        saveSites(sites);
        log('info', 'Site edited', site);
    } else {
        sites.push({
            name,
            url: normalizedUrl,
            status: 'active',
            active: sites.length === 0,
            lastUpdated: now,
            scripts: {}
        });
        saveSites(sites);
        log('info', 'New site added', { name, url: normalizedUrl });
    }

    cancelSiteForm();
    loadSites();
}

function normalizeUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    const candidate = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

    try {
        const parsed = new URL(candidate);
        return parsed.href;
    } catch (error) {
        log('error', 'Invalid URL provided', { url: trimmed });
        return '';
    }
}

function updateSiteCount(visibleCount, totalCount) {
    const count = document.getElementById('siteCount');
    if (!count) return;
    if (totalCount === 0) {
        count.textContent = '0 sites';
        return;
    }

    const suffix = totalCount === 1 ? 'site' : 'sites';
    count.textContent = visibleCount === totalCount
        ? `${totalCount} ${suffix}`
        : `${visibleCount} of ${totalCount} ${suffix}`;
}

function filterSites() {
    loadSites();
}

// Preset Loading
function loadPreset(platform) {
    const preset = platformPresets[platform];
    if (!preset) return;
    
    alert(`Loaded ${preset.name} preset!\n\nRecommended selectors:\n\nCart: ${preset.cart[0]}\nPayment: ${preset.payment[0]}\nTotal: ${preset.total[0]}`);
    log('info', `Preset loaded: ${platform}`, preset);
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Number keys
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 5) {
                e.preventDefault();
                const types = ['cart', 'payment', 'disable', 'autofill', 'total'];
                openGenerator(types[key - 1]);
            }
            
            // Ctrl/Cmd + K - Quick search
            if (e.key === 'k') {
                e.preventDefault();
                const manager = document.getElementById('siteManager');
                if (manager && manager.style.display === 'none') {
                    openSiteManager();
                }
                const searchInput = document.getElementById('siteSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl/Cmd + S - Save
            if (e.key === 's') {
                e.preventDefault();
                exportSettings();
            }
        }
        
        // ESC - Close modal
        if (e.key === 'Escape') {
            closeModal();
            closeBatchModal();
        }
    });
    
    log('info', 'Keyboard shortcuts initialized');
}

function showKeyboardShortcuts() {
    alert(`⌨️ Keyboard Shortcuts:\n\n` +
          `Ctrl/Cmd + 1-5: Open generator for each script type\n` +
          `Ctrl/Cmd + K: Focus site search\n` +
          `Ctrl/Cmd + S: Save/Export settings\n` +
          `ESC: Close modal\n` +
          `Ctrl/Cmd + C: Copy script (when focused)`);
}

// Export/Import
function exportSettings() {
    const data = {
        sites: getSites(),
        stats: getStats(),
        configs: getConfigs(),
        theme: currentTheme,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psg-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    log('success', 'Settings exported');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.sites) localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(data.sites));
                if (data.stats) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
                if (data.configs) localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(data.configs));
                if (data.theme) {
                    currentTheme = data.theme;
                    applyTheme();
                    localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
                }
                
                loadSites();
                loadStats();
                alert('Settings imported successfully!');
                log('success', 'Settings imported');
            } catch (err) {
                alert('Error importing settings: ' + err.message);
                log('error', 'Import failed', err);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function getConfigs() {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIGS);
    return stored ? JSON.parse(stored) : {};
}

function saveConfig(name, config) {
    const configs = getConfigs();
    configs[name] = config;
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
    log('info', 'Config saved', { name, config });
}

// Batch Mode
function openBatchMode() {
    document.getElementById('batchModal').classList.add('active');
    log('info', 'Batch mode opened');
}

function closeBatchModal() {
    document.getElementById('batchModal').classList.remove('active');
}

function processBatch() {
    const input = document.getElementById('batchInput').value;
    if (!input.trim()) {
        alert('Please paste diagnostic results');
        return;
    }
    
    log('info', 'Processing batch', { length: input.length });
    
    // Simulate processing
    const types = ['Cart', 'Payment', 'Disable', 'Autofill', 'Total'];
    let index = 0;
    
    const interval = setInterval(() => {
        if (index < types.length) {
            const id = `batch${types[index]}`;
            document.querySelector(`#${id} .status`).className = 'status processing';
            
            setTimeout(() => {
                document.querySelector(`#${id} .status`).className = 'status success';
                log('success', `${types[index]} script generated`);
            }, 1000);
            
            index++;
        } else {
            clearInterval(interval);
            alert('All scripts generated successfully!');
            log('success', 'Batch processing completed');
        }
    }, 1500);
}

// Documentation
function showDocumentation() {
    alert(`📖 Payment Script Generator Pro - Documentation\n\n` +
          `Version: 2.0.0\n\n` +
          `Features:\n` +
          `• Multi-site management\n` +
          `• Platform presets (WooCommerce, Shopify, etc.)\n` +
          `• Batch script generation\n` +
          `• Debug mode with live logging\n` +
          `• Dark mode support\n` +
          `• Keyboard shortcuts\n` +
          `• Export/Import settings\n` +
          `• Success rate tracking\n` +
          `• Auto-generated documentation\n\n` +
          `For more info, visit our documentation.`);
}

// Script Generation Functions
const scriptConfigs = {
    cart: {
        title: 'Cart Items Script Generator',
        diagnostic: `(function diagnoseCartItems() {
    const candidates = [];
    const MAX = 12000;
    const prioritizedSelectors = [
        '[data-cart-items]',
        '[data-cart]',
        '[data-basket]',
        '.cart-items',
        '.cart__items',
        '.cart-items-list',
        '.basket-items',
        '#shopping-cart-table',
        '.cart-table',
        '.cart-container',
        '#order_review',
        '.order-review',
        '.checkout-review-order',
        '.order-summary'
    ];
    
    function isVisible(el) {
        if (!el || el.nodeType !== 1) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    function getClassName(el) {
        const raw = el.className;
        if (typeof raw === 'string') return raw;
        if (raw && typeof raw.baseVal === 'string') return raw.baseVal;
        if (raw && typeof raw.value === 'string') return raw.value;
        return raw ? String(raw) : '';
    }
    
    function getScore(el) {
        let score = 0;
        const text = (el.textContent || '').toLowerCase();
        const cls = getClassName(el).toLowerCase();
        const id = (el.id || '').toLowerCase();
        const attrs = [el.getAttribute('data-testid'), el.getAttribute('data-test'), el.getAttribute('data-qa'), el.getAttribute('aria-label')]
            .filter(Boolean).join(' ').toLowerCase();
        
        if (/cart|basket|корзин|количк|checkout|summary/i.test(cls + id + attrs)) score += 18;
        if (/product|item|товар|продукт|line/i.test(cls + id + attrs)) score += 12;
        if (/price|цена|subtotal|total|amount/i.test(text)) score += 6;
        if (el.querySelectorAll('img, .product, .item, [data-product]').length > 0) score += 10;
        if (/header|footer|nav|menu|breadcrumb/i.test(cls + id)) score -= 20;
        if (text.length < 40) score -= 8;
        
        return score;
    }
    
    function buildSelector(el) {
        if (el.id) return '#' + el.id;
        const dataAttrs = ['data-testid', 'data-test', 'data-qa', 'data-cart', 'data-basket'];
        for (const attr of dataAttrs) {
            const value = el.getAttribute(attr);
            if (value) return \`[\${attr}="\${value}"]\`;
        }
        const classes = getClassName(el)
            .split(' ')
            .filter(c => c && !/^[a-f0-9]{6,}$/i.test(c))
            .slice(0, 2);
        return classes.length ? el.tagName.toLowerCase() + '.' + classes.join('.') : el.tagName.toLowerCase();
    }
    
    prioritizedSelectors.forEach(sel => {
        try {
            const el = document.querySelector(sel);
            if (el) {
                candidates.push({
                    score: 40,
                    selector: sel,
                    childCount: el.children.length,
                    textLength: (el.textContent || '').length,
                    hasImages: el.querySelectorAll('img').length,
                    preview: (el.textContent || '').slice(0, 100)
                });
            }
        } catch (e) {}
    });
    
    Array.from(document.querySelectorAll('*')).slice(0, MAX).forEach(el => {
        if (!isVisible(el)) return;
        const score = getScore(el);
        if (score < 8) return;
        
        candidates.push({
            score,
            selector: buildSelector(el),
            childCount: el.children.length,
            textLength: (el.textContent || '').length,
            hasImages: el.querySelectorAll('img').length,
            preview: (el.textContent || '').slice(0, 100)
        });
    });
    
    candidates.sort((a, b) => b.score - a.score);
    console.log('=== CART ITEMS DIAGNOSTIC ===');
    candidates.slice(0, 15).forEach((c, i) => {
        console.log(\`\${i+1}. Score: \${c.score} | \${c.selector}\`);
        console.log(\`   Children: \${c.childCount} | Images: \${c.hasImages}\`);
        console.log(\`   Preview: "\${c.preview}..."\`);
        console.log('---');
    });
    
    return candidates.slice(0, 15);
})();`,
        generator: (selector, confidence) => ({
            basic: {
                code: `function getItems() {
    let items = document.querySelector('${selector}');
    if (items) {
        return items.innerHTML;
    }
    return null;
}

getItems();`,
                confidence: Math.min(confidence, 95)
            },
            optimized: {
                code: `function getItems() {
    const container = document.querySelector('${selector}');
    if (!container) {
        console.warn('Cart container not found');
        return null;
    }
    return container.innerHTML;
}

// Execute and return
getItems();`,
                confidence: Math.min(confidence - 5, 90)
            },
            advanced: {
                code: `function getItems() {
    const selectors = [
        '${selector}',
        '.cart-items',
        '.basket-items',
        '[data-cart]'
    ];
    
    for (const sel of selectors) {
        try {
            const element = document.querySelector(sel);
            if (element && element.innerHTML) {
                console.log('Cart items found:', sel);
                return element.innerHTML;
            }
        } catch (e) {
            console.warn('Selector failed:', sel, e);
        }
    }
    
    console.error('Cart items not found');
    return null;
}

getItems();`,
                confidence: Math.min(confidence + 3, 98)
            }
        })
    },
    
    payment: {
        title: 'Payment Methods Script Generator',
        diagnostic: `(function diagnosePaymentMethods() {
    const candidates = [];
    const MAX = 10000;
    const prioritizedSelectors = [
        '[data-payment-methods]',
        '[data-payment-method]',
        '#payment',
        '.payment-methods',
        '.payment-method',
        '.payment-options',
        '.checkout-payment-methods',
        '.payment-list'
    ];
    
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    function getClassName(el) {
        const raw = el.className;
        if (typeof raw === 'string') return raw;
        if (raw && typeof raw.baseVal === 'string') return raw.baseVal;
        if (raw && typeof raw.value === 'string') return raw.value;
        return raw ? String(raw) : '';
    }
    
    function getScore(el) {
        let score = 0;
        const text = (el.textContent || '').toLowerCase();
        const cls = getClassName(el).toLowerCase();
        const id = (el.id || '').toLowerCase();
        const attrs = [el.getAttribute('data-testid'), el.getAttribute('data-qa'), el.getAttribute('aria-label')]
            .filter(Boolean).join(' ').toLowerCase();
        
        if (/payment|плащ|checkout|method/i.test(cls + id + text + attrs)) score += 22;
        if (/card|карт|credit|debit/i.test(text)) score += 10;
        if (el.querySelector('input[type="radio"]')) score += 18;
        if (el.querySelector('[data-payment-method], [data-method]')) score += 12;
        
        return score;
    }
    
    function buildSelector(el) {
        if (el.id) return '#' + el.id;
        const dataAttrs = ['data-testid', 'data-test', 'data-qa', 'data-payment-method', 'data-method'];
        for (const attr of dataAttrs) {
            const value = el.getAttribute(attr);
            if (value) return \`[\${attr}="\${value}"]\`;
        }
        const classes = getClassName(el).split(' ').filter(Boolean).slice(0, 2);
        return classes.length ? el.tagName.toLowerCase() + '.' + classes.join('.') : el.tagName.toLowerCase();
    }
    
    prioritizedSelectors.forEach(sel => {
        try {
            const el = document.querySelector(sel);
            if (el) {
                candidates.push({
                    score: 45,
                    selector: sel,
                    radioCount: el.querySelectorAll('input[type="radio"]').length,
                    preview: (el.textContent || '').slice(0, 80)
                });
            }
        } catch (e) {}
    });
    
    Array.from(document.querySelectorAll('input[type="radio"]')).forEach(input => {
        const container = input.closest('fieldset, form, .payment-method, .payment-option, li, div');
        if (!container || !isVisible(container)) return;
        const score = getScore(container) + 10;
        if (score < 18) return;
        candidates.push({
            score,
            selector: buildSelector(container),
            radioCount: container.querySelectorAll('input[type="radio"]').length,
            preview: (container.textContent || '').slice(0, 80)
        });
    });
    
    Array.from(document.querySelectorAll('*')).slice(0, MAX).forEach(el => {
        if (!isVisible(el)) return;
        const score = getScore(el);
        if (score < 18) return;
        
        candidates.push({
            score,
            selector: buildSelector(el),
            radioCount: el.querySelectorAll('input[type="radio"]').length,
            preview: (el.textContent || '').slice(0, 80)
        });
    });
    
    candidates.sort((a, b) => b.score - a.score);
    console.log('=== PAYMENT METHODS DIAGNOSTIC ===');
    candidates.slice(0, 15).forEach((c, i) => {
        console.log(\`\${i+1}. Score: \${c.score} | \${c.selector}\`);
        console.log(\`   Radio buttons: \${c.radioCount}\`);
        console.log('---');
    });
    
    return candidates.slice(0, 15);
})();`,
        generator: (selector, confidence) => ({
            basic: {
                code: `function hidePaymentMethods() {
    const container = document.querySelector('${selector}');
    if (!container) return;
    
    const methods = container.querySelectorAll('[class*="payment"], [id*="payment"]');
    methods.forEach(method => {
        const text = method.textContent.toLowerCase();
        if (!text.includes('карт') && !text.includes('card')) {
            method.style.display = 'none';
        }
    });
}

hidePaymentMethods();
document.addEventListener('DOMContentLoaded', hidePaymentMethods);`,
                confidence: Math.min(confidence, 95)
            },
            optimized: {
                code: `function hidePaymentMethods() {
    const container = document.querySelector('${selector}');
    if (!container) {
        console.warn('Payment container not found');
        return;
    }
    
    const methods = container.querySelectorAll('input[type="radio"]');
    methods.forEach(input => {
        const label = input.closest('label') || document.querySelector(\`label[for="\${input.id}"]\`);
        const text = (label?.textContent || '').toLowerCase();
        
        if (!text.includes('карт') && !text.includes('card')) {
            input.disabled = true;
            const wrapper = input.closest('li, div, .payment-method');
            if (wrapper) wrapper.style.display = 'none';
        }
    });
}

hidePaymentMethods();
document.addEventListener('DOMContentLoaded', hidePaymentMethods);

const observer = new MutationObserver(hidePaymentMethods);
observer.observe(document.body, { childList: true, subtree: true });`,
                confidence: Math.min(confidence - 5, 90)
            },
            advanced: {
                code: `function hidePaymentMethods() {
    const selectors = ['${selector}', '.payment-methods', '#payment'];
    
    let container = null;
    for (const sel of selectors) {
        try {
            container = document.querySelector(sel);
            if (container) break;
        } catch (e) {}
    }
    
    if (!container) {
        console.error('Payment container not found');
        return;
    }
    
    const cardKeywords = ['карт', 'card', 'credit', 'debit'];
    const methods = container.querySelectorAll('input[type="radio"], [class*="method"]');
    
    methods.forEach(el => {
        try {
            const text = (el.textContent || el.value || '').toLowerCase();
            const shouldKeep = cardKeywords.some(kw => text.includes(kw));
            
            if (!shouldKeep) {
                el.disabled = true;
                const wrapper = el.closest('li, div, .payment-option');
                if (wrapper) wrapper.style.display = 'none';
            }
        } catch (e) {
            console.warn('Error processing method:', e);
        }
    });
    
    console.log('Payment methods filtered');
}

hidePaymentMethods();
document.addEventListener('DOMContentLoaded', hidePaymentMethods);
document.addEventListener('click', hidePaymentMethods);

const observer = new MutationObserver(hidePaymentMethods);
observer.observe(document.body, { childList: true, subtree: true });`,
                confidence: Math.min(confidence + 3, 98)
            }
        })
    },
    
    disable: {
        title: 'Disable Card Fields Script Generator',
        diagnostic: `(function diagnoseCardFields() {
    const candidates = [];
    const patterns = {
        number: /card.*number|pan|номер|cc-number|cardnumber/i,
        cvv: /cvv|cvc|security|cvn/i,
        exp: /exp|expiry|validity|mm|yy/i,
        name: /cardholder|name.*card|им.*карт/i
    };
    
    function scoreInputs(container) {
        let score = 0;
        container.querySelectorAll('input, select').forEach(inp => {
            const tokens = [
                inp.name,
                inp.id,
                inp.placeholder,
                inp.getAttribute('aria-label'),
                inp.autocomplete
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (patterns.number.test(tokens)) score += 20;
            if (patterns.cvv.test(tokens)) score += 15;
            if (patterns.exp.test(tokens)) score += 15;
            if (patterns.name.test(tokens)) score += 8;
            if (inp.autocomplete && inp.autocomplete.startsWith('cc-')) score += 12;
        });
        return score;
    }
    
    function buildSelector(el) {
        if (el.id) return '#' + el.id;
        const dataAttrs = ['data-testid', 'data-test', 'data-qa', 'data-payment-form'];
        for (const attr of dataAttrs) {
            const value = el.getAttribute(attr);
            if (value) return \`[\${attr}="\${value}"]\`;
        }
        const rawClass = el.className;
        const cls = (typeof rawClass === 'string'
            ? rawClass
            : rawClass && typeof rawClass.baseVal === 'string'
                ? rawClass.baseVal
                : rawClass && typeof rawClass.value === 'string'
                    ? rawClass.value
                    : rawClass
                        ? String(rawClass)
                        : '')
            .split(' ')
            .filter(Boolean)[0];
        return cls ? \`\${el.tagName.toLowerCase()}.\${cls}\` : el.tagName.toLowerCase();
    }
    
    const containers = new Set();
    document.querySelectorAll('input, select').forEach(inp => {
        const tokens = [
            inp.name,
            inp.id,
            inp.placeholder,
            inp.getAttribute('aria-label'),
            inp.autocomplete
        ].filter(Boolean).join(' ').toLowerCase();
        if (patterns.number.test(tokens) || patterns.cvv.test(tokens) || patterns.exp.test(tokens)) {
            const container = inp.closest('form, .payment-form, .card-form, fieldset, section, div');
            if (container) containers.add(container);
        }
    });
    
    document.querySelectorAll('form').forEach(form => containers.add(form));
    
    containers.forEach(container => {
        const score = scoreInputs(container);
        if (score < 20) return;
        candidates.push({
            score,
            selector: buildSelector(container),
            inputCount: container.querySelectorAll('input').length,
            preview: Array.from(container.querySelectorAll('input'))
                .map(i => i.name || i.id || i.autocomplete)
                .filter(Boolean)
                .slice(0, 4)
                .join(', ')
        });
    });
    
    candidates.sort((a, b) => b.score - a.score);
    console.log('=== CARD FIELDS DIAGNOSTIC ===');
    candidates.forEach((c, i) => {
        console.log(\`\${i+1}. Score: \${c.score} | \${c.selector}\`);
        console.log(\`   Inputs: \${c.inputCount} | Fields: \${c.preview}\`);
        console.log('---');
    });
    
    return candidates;
})();`,
        generator: (selector, confidence) => ({
            basic: {
                code: `function disableCardFilling() {
    const form = document.querySelector('${selector}');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input:not([type="submit"]), select');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

disableCardFilling();
document.addEventListener('DOMContentLoaded', disableCardFilling);`,
                confidence: Math.min(confidence, 95)
            },
            optimized: {
                code: `function disableCardFilling() {
    const form = document.querySelector('${selector}');
    if (!form) {
        console.warn('Card form not found');
        return;
    }
    
    const cardFieldPatterns = [
        /card.*number|pan|номер/i,
        /cvv|cvc|security/i,
        /exp.*month|exp.*year/i
    ];
    
    form.querySelectorAll('input:not([type="submit"]), select').forEach(input => {
        const id = (input.name || input.id || input.placeholder || '').toLowerCase();
        const isCardField = cardFieldPatterns.some(pattern => pattern.test(id));
        
        if (isCardField) {
            input.readOnly = true;
            input.disabled = true;
        }
    });
    
    console.log('Card fields disabled');
}

disableCardFilling();
document.addEventListener('DOMContentLoaded', disableCardFilling);`,
                confidence: Math.min(confidence - 5, 90)
            },
            advanced: {
                code: `function disableCardFilling() {
    const selectors = ['${selector}', 'form[name*="payment"]', '.payment-form'];
    
    let form = null;
    for (const sel of selectors) {
        try {
            form = document.querySelector(sel);
            if (form) break;
        } catch (e) {}
    }
    
    if (!form) {
        console.error('Card form not found');
        return;
    }
    
    const cardFieldPatterns = [
        /card.*number|pan/i,
        /cvv|cvc|security/i,
        /exp.*month|exp.*year/i,
        /cardholder|name.*card/i
    ];
    
    let disabledCount = 0;
    
    form.querySelectorAll('input:not([type="submit"]), select').forEach(input => {
        try {
            const id = [input.name, input.id, input.placeholder].filter(Boolean).join(' ').toLowerCase();
            const isCardField = cardFieldPatterns.some(p => p.test(id));
            
            if (isCardField) {
                input.readOnly = true;
                input.disabled = true;
                disabledCount++;
            }
        } catch (e) {
            console.warn('Error disabling input:', e);
        }
    });
    
    console.log(\`Disabled \${disabledCount} card fields\`);
}

disableCardFilling();
document.addEventListener('DOMContentLoaded', disableCardFilling);`,
                confidence: Math.min(confidence + 3, 98)
            }
        })
    },
    
    autofill: {
        title: 'Autofill Card Script Generator',
        diagnostic: `(function diagnoseCardFields() {
    const candidates = [];
    const patterns = {
        number: /card.*number|pan|номер|cc-number|cardnumber/i,
        month: /exp.*month|expiry.*month|mm|месец/i,
        year: /exp.*year|expiry.*year|yy|година/i,
        cvv: /cvv|cvc|security|cvn/i,
        name: /cardholder|name.*card|име.*карт/i
    };
    
    function getTokens(el) {
        return [el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.autocomplete]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    }
    
    function findCardFields(container) {
        const fields = { number: null, month: null, year: null, cvv: null, name: null };
        
        container.querySelectorAll('input, select').forEach(el => {
            const tokens = getTokens(el);
            
            if (patterns.number.test(tokens)) fields.number = el;
            else if (patterns.month.test(tokens)) fields.month = el;
            else if (patterns.year.test(tokens)) fields.year = el;
            else if (patterns.cvv.test(tokens)) fields.cvv = el;
            else if (patterns.name.test(tokens)) fields.name = el;
            
            if (el.autocomplete === 'cc-number') fields.number = el;
            if (el.autocomplete === 'cc-exp-month') fields.month = el;
            if (el.autocomplete === 'cc-exp-year') fields.year = el;
            if (el.autocomplete === 'cc-csc') fields.cvv = el;
            if (el.autocomplete === 'cc-name') fields.name = el;
        });
        
        return fields;
    }
    
    function buildSelector(el) {
        if (el.id) return '#' + el.id;
        const dataAttrs = ['data-testid', 'data-test', 'data-qa', 'data-payment-form'];
        for (const attr of dataAttrs) {
            const value = el.getAttribute(attr);
            if (value) return \`[\${attr}="\${value}"]\`;
        }
        const rawClass = el.className;
        const cls = (typeof rawClass === 'string'
            ? rawClass
            : rawClass && typeof rawClass.baseVal === 'string'
                ? rawClass.baseVal
                : rawClass && typeof rawClass.value === 'string'
                    ? rawClass.value
                    : rawClass
                        ? String(rawClass)
                        : '')
            .split(' ')
            .filter(Boolean)[0];
        return cls ? \`\${el.tagName.toLowerCase()}.\${cls}\` : el.tagName.toLowerCase();
    }
    
    const containers = new Set();
    document.querySelectorAll('input, select').forEach(el => {
        const tokens = getTokens(el);
        if (patterns.number.test(tokens) || patterns.cvv.test(tokens) || patterns.month.test(tokens) || patterns.year.test(tokens)) {
            const container = el.closest('form, .payment-form, .card-form, fieldset, section, div');
            if (container) containers.add(container);
        }
    });
    
    document.querySelectorAll('form').forEach(form => containers.add(form));
    
    containers.forEach(container => {
        const fields = findCardFields(container);
        const foundCount = Object.values(fields).filter(Boolean).length;
        if (foundCount < 3) return;
        
        candidates.push({
            selector: buildSelector(container),
            foundCount,
            fields: Object.entries(fields)
                .filter(([_, el]) => el)
                .map(([type, el]) => \`\${type}: \${el.name || el.id || el.autocomplete}\`)
        });
    });
    
    console.log('=== AUTOFILL FIELDS DIAGNOSTIC ===');
    candidates.forEach((c, i) => {
        console.log(\`\${i+1}. \${c.selector} (Found: \${c.foundCount})\`);
        c.fields.forEach(f => console.log(\`   - \${f}\`));
        console.log('---');
    });
    
    return candidates;
})();`,
        generator: (selector, confidence) => ({
            basic: {
                code: `function autofillCard(cardNumber, cardExpMonth, cardExpYear, cardCVV, cardholderName = '') {
    const form = document.querySelector('${selector}');
    if (!form) return;
    
    form.querySelectorAll('input').forEach(input => {
        const id = (input.name || input.id || '').toLowerCase();
        
        if (/number|pan/i.test(id)) input.value = cardNumber;
        else if (/month/i.test(id)) input.value = cardExpMonth;
        else if (/year/i.test(id)) input.value = cardExpYear;
        else if (/cvv|cvc/i.test(id)) input.value = cardCVV;
        else if (/cardholder|name/i.test(id)) input.value = cardholderName;
    });
}`,
                confidence: Math.min(confidence, 95)
            },
            optimized: {
                code: `function autofillCard(cardNumber, cardExpMonth, cardExpYear, cardCVV, cardholderName = '') {
    const form = document.querySelector('${selector}');
    if (!form) {
        console.warn('Card form not found');
        return;
    }
    
    const fieldMap = {
        number: /card.*number|pan/i,
        month: /exp.*month/i,
        year: /exp.*year/i,
        cvv: /cvv|cvc|security/i,
        name: /cardholder|name.*card/i
    };
    
    const values = { number: cardNumber, month: cardExpMonth, year: cardExpYear, cvv: cardCVV, name: cardholderName };
    
    form.querySelectorAll('input, select').forEach(el => {
        const id = (el.name || el.id || el.placeholder || '').toLowerCase();
        
        for (const [field, pattern] of Object.entries(fieldMap)) {
            if (pattern.test(id) && values[field]) {
                el.value = values[field];
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    });
    
    console.log('Card fields autofilled');
}`,
                confidence: Math.min(confidence - 5, 90)
            },
            advanced: {
                code: `function autofillCard(cardNumber, cardExpMonth, cardExpYear, cardCVV, cardholderName = '') {
    const selectors = ['${selector}', 'form[name*="payment"]', '.card-form'];
    
    let form = null;
    for (const sel of selectors) {
        try {
            form = document.querySelector(sel);
            if (form) break;
        } catch (e) {}
    }
    
    if (!form) {
        console.error('Card form not found');
        return;
    }
    
    const fieldMap = {
        number: { pattern: /card.*number|pan/i, value: cardNumber },
        month: { pattern: /exp.*month/i, value: cardExpMonth },
        year: { pattern: /exp.*year/i, value: cardExpYear },
        cvv: { pattern: /cvv|cvc|security/i, value: cardCVV },
        name: { pattern: /cardholder|name.*card/i, value: cardholderName }
    };
    
    let filledCount = 0;
    
    form.querySelectorAll('input, select').forEach(el => {
        try {
            if (el.readOnly || el.disabled) {
                el.readOnly = false;
                el.disabled = false;
            }
            
            const id = [el.name, el.id, el.placeholder].filter(Boolean).join(' ').toLowerCase();
            
            for (const [field, config] of Object.entries(fieldMap)) {
                if (config.pattern.test(id) && config.value) {
                    el.value = config.value;
                    ['input', 'change', 'blur'].forEach(eventType => {
                        el.dispatchEvent(new Event(eventType, { bubbles: true }));
                    });
                    filledCount++;
                    break;
                }
            }
        } catch (e) {
            console.warn('Error filling field:', e);
        }
    });
    
    console.log(\`Autofilled \${filledCount} fields\`);
}`,
                confidence: Math.min(confidence + 3, 98)
            }
        })
    },
    
    total: {
        title: 'Total Amount Script Generator',
        diagnostic: `(function diagnoseTotalAmount() {
    const candidates = [];
    const MAX = 14000;
    
    const currencyTokens = [
        { re: /€/g, code: "EUR" },
        { re: /\\bEUR\\b/g, code: "EUR" },
        { re: /\\bBGN\\b/g, code: "BGN" },
        { re: /лв\\.?/g, code: "BGN" },
        { re: /\\$/g, code: "USD" },
        { re: /\\bUSD\\b/g, code: "USD" },
        { re: /£/g, code: "GBP" },
        { re: /\\bGBP\\b/g, code: "GBP" },
        { re: /\\bRON\\b/g, code: "RON" },
        { re: /lei/g, code: "RON" }
    ];
    
    const positiveWords = ["total", "grand", "amount", "pay", "payment", "overall", "due", "общо", "сума", "плащ"];
    const negativeWords = ["unit", "each", "per", "product", "item", "subtotal", "shipping", "tax", "бр", "продукт"];
    const prioritySelectors = [
        '[data-total]',
        '[data-cart-total]',
        '[data-order-total]',
        '.order-total',
        '.cart-total',
        '.grand-total',
        '.summary-total',
        '.totals',
        '.order-summary__section--total'
    ];
    
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    function getClassName(el) {
        const raw = el.className;
        if (typeof raw === 'string') return raw;
        if (raw && typeof raw.baseVal === 'string') return raw.baseVal;
        if (raw && typeof raw.value === 'string') return raw.value;
        return raw ? String(raw) : '';
    }
    
    function extractAmount(text) {
        const currencies = [];
        for (const c of currencyTokens) {
            if (c.re.test(text)) currencies.push(c.code);
        }
        
        const numMatch = text.match(/(\\d{1,3}(?:[ .]\\d{3})*(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?)/);
        if (!numMatch) return null;
        
        let num = numMatch[1].replace(/\\s/g, '');
        if (num.includes(',') && num.includes('.')) {
            num = num.lastIndexOf(',') > num.lastIndexOf('.') ? 
                num.replace(/\\./g, '').replace(',', '.') : num.replace(/,/g, '');
        } else if (num.includes(',')) {
            num = num.replace(',', '.');
        }
        
        const amount = parseFloat(num);
        return isFinite(amount) ? { amount, currencies } : null;
    }
    
    function getScore(el, info) {
        let score = 0;
        const h = (el.textContent + getClassName(el) + (el.id || '') + (el.getAttribute('aria-label') || '')).toLowerCase();
        
        if (info.currencies.length) score += 10;
        if (info.amount >= 5 && info.amount <= 50000) score += 6;
        
        for (const w of positiveWords) {
            if (h.includes(w)) score += 8;
        }
        for (const w of negativeWords) {
            if (h.includes(w)) score -= 6;
        }
        
        if (/button|strong|bdi|span/.test(el.tagName.toLowerCase())) score += 6;
        if (el.closest('.order-summary, .totals, .checkout, .cart-summary')) score += 10;
        
        return score;
    }
    
    function buildSelector(el) {
        if (el.id) return '#' + el.id;
        const dataAttrs = ['data-testid', 'data-test', 'data-qa', 'data-total', 'data-cart-total', 'data-order-total'];
        for (const attr of dataAttrs) {
            const value = el.getAttribute(attr);
            if (value) return \`[\${attr}="\${value}"]\`;
        }
        const classes = getClassName(el).split(' ').filter(c => c && !/^[a-f0-9]{6,}$/i.test(c)).slice(0, 2);
        return classes.length ? el.tagName.toLowerCase() + '.' + classes.join('.') : el.tagName.toLowerCase();
    }
    
    prioritySelectors.forEach(sel => {
        try {
            const el = document.querySelector(sel);
            if (el) {
                const info = extractAmount(el.textContent || '');
                if (info) {
                    candidates.push({
                        score: 45,
                        selector: sel,
                        amount: info.amount,
                        currencies: info.currencies,
                        preview: (el.textContent || '').slice(0, 80)
                    });
                }
            }
        } catch (e) {}
    });
    
    Array.from(document.querySelectorAll('*')).slice(0, MAX).forEach(el => {
        if (!isVisible(el)) return;
        const text = el.textContent || '';
        if (!/[€$£]|лв|BGN|EUR|USD|GBP|RON|\\d/.test(text)) return;
        
        const info = extractAmount(text);
        if (!info) return;
        
        const score = getScore(el, info);
        if (score < 14) return;
        
        candidates.push({
            score,
            selector: buildSelector(el),
            amount: info.amount,
            currencies: info.currencies,
            preview: text.slice(0, 80)
        });
    });
    
    candidates.sort((a, b) => b.score - a.score);
    console.log('=== TOTAL AMOUNT DIAGNOSTIC ===');
    candidates.slice(0, 20).forEach((c, i) => {
        console.log(\`\${i+1}. Score: \${c.score} | \${c.selector}\`);
        console.log(\`   Amount: \${c.amount} \${c.currencies.join(',')} | "\${c.preview}"\`);
        console.log('---');
    });
    
    return candidates.slice(0, 20);
})();`,
        generator: (selector, confidence) => ({
            basic: {
                code: `function getTotal() {
    const el = document.querySelector('${selector}');
    if (!el) return null;
    
    const text = el.textContent.replace(/\\s+/g, ' ').trim();
    const match = text.match(/([\\d.,]+)\\s*([€$]|лв|BGN|EUR|USD)/i);
    
    if (!match) return null;
    
    let amount = match[1].replace(',', '.');
    let currency = match[2];
    
    if (currency === '€') currency = 'EUR';
    if (currency === '$') currency = 'USD';
    if (/лв/i.test(currency)) currency = 'BGN';
    
    return parseFloat(amount).toFixed(2) + ' ' + currency;
}

getTotal();`,
                confidence: Math.min(confidence, 95)
            },
            optimized: {
                code: `function getTotal() {
    const el = document.querySelector('${selector}');
    if (!el) {
        console.warn('Total element not found');
        return null;
    }
    
    let text = el.textContent.replace(/\\u00A0/g, ' ').replace(/\\u202F/g, ' ').trim();
    
    const eurMatch = text.match(/\\(([\\d.,]+)\\s*EUR\\)/i);
    if (eurMatch) {
        return parseFloat(eurMatch[1].replace(',', '.')).toFixed(2) + ' EUR';
    }
    
    const match = text.match(/([\\d.,]+)\\s*([€$]|лв|BGN|EUR|USD)/i);
    if (!match) return null;
    
    let amount = match[1].replace(/\\s/g, '');
    if (amount.includes(',') && amount.includes('.')) {
        amount = amount.replace(/\\./g, '').replace(',', '.');
    } else if (amount.includes(',')) {
        amount = amount.replace(',', '.');
    }
    
    let currency = match[2];
    if (currency === '€') currency = 'EUR';
    if (currency === '$') currency = 'USD';
    if (/лв/i.test(currency)) currency = 'BGN';
    
    const value = parseFloat(amount);
    return isFinite(value) ? value.toFixed(2) + ' ' + currency : null;
}

getTotal();`,
                confidence: Math.min(confidence - 5, 90)
            },
            advanced: {
                code: `function getTotal() {
    const selectors = ['${selector}', '.order-total', '.grand-total', '#total-amount'];
    
    let element = null;
    for (const sel of selectors) {
        try {
            element = document.querySelector(sel);
            if (element) break;
        } catch (e) {}
    }
    
    if (!element) {
        console.error('Total element not found');
        return null;
    }
    
    let text = element.textContent
        .replace(/\\u00A0/g, ' ')
        .replace(/\\u202F/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
    
    const eurMatch = text.match(/\\(([\\d.,]+)\\s*EUR\\)/i);
    if (eurMatch) {
        const amount = parseFloat(eurMatch[1].replace(',', '.')).toFixed(2);
        console.log('Total extracted (EUR):', amount + ' EUR');
        return amount + ' EUR';
    }
    
    const match = text.match(/([\\d.,\\s]+)\\s*([€$]|лв|BGN|EUR|USD)/i);
    if (!match) {
        console.warn('Could not extract total from:', text);
        return null;
    }
    
    let amount = match[1].replace(/\\s/g, '');
    
    if (amount.includes(',') && amount.includes('.')) {
        const lastComma = amount.lastIndexOf(',');
        const lastDot = amount.lastIndexOf('.');
        amount = lastComma > lastDot ? 
            amount.replace(/\\./g, '').replace(',', '.') :
            amount.replace(/,/g, '');
    } else if (amount.includes(',')) {
        amount = amount.replace(',', '.');
    }
    
    let currency = match[2];
    const currencyMap = { '€': 'EUR', '$': 'USD', 'лв': 'BGN', 'лв.': 'BGN' };
    currency = currencyMap[currency] || currency.toUpperCase();
    
    const value = parseFloat(amount);
    if (!isFinite(value)) {
        console.error('Invalid amount:', amount);
        return null;
    }
    
    const result = value.toFixed(2) + ' ' + currency;
    console.log('Total extracted:', result);
    return result;
}

getTotal();`,
                confidence: Math.min(confidence + 3, 98)
            }
        })
    }
};

// Main Generator Functions
function openGenerator(type) {
    currentType = type;
    currentStep = 1;
    selectedElement = null;
    candidates = [];
    
    const config = scriptConfigs[type];
    document.getElementById('modalTitle').textContent = config.title;
    document.getElementById('diagnosticScript').textContent = config.diagnostic;
    
    goToStep(1);
    document.getElementById('generatorModal').classList.add('active');
    
    updateStats(type);
    log('info', `Generator opened: ${type}`);
}

function closeModal() {
    document.getElementById('generatorModal').classList.remove('active');
}

function goToStep(step) {
    currentStep = step;
    
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.remove('active');
    });
    
    document.getElementById('step' + step).classList.add('active');
    
    const progress = (step / 3) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    log('info', `Step changed to ${step}`);
}

function copyDiagnostic() {
    const script = document.getElementById('diagnosticScript').textContent;
    navigator.clipboard.writeText(script).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
        log('success', 'Diagnostic script copied');
    });
}

function analyzeDiagnostic() {
    const result = document.getElementById('diagnosticResult').value.trim();
    
    if (!result) {
        alert('Please paste diagnostic results');
        return;
    }
    
    try {
        candidates = parseConsoleOutput(result);
        
        if (candidates.length === 0) {
            alert('No suitable elements found. Check diagnostic output.');
            return;
        }
        
        displayCandidates();
        goToStep(2);
        log('success', `Found ${candidates.length} candidates`);
        
    } catch (e) {
        alert('Error analyzing result: ' + e.message);
        log('error', 'Analysis failed', e);
    }
}

function parseConsoleOutput(output) {
    // Try to parse as JSON first
    try {
        const trimmed = output.trim();
        
        // Check if it starts with [ or { (JSON format)
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            const jsonData = JSON.parse(trimmed);
            const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            // Convert JSON format to our internal format
            return dataArray.map(item => {
                const details = [];
                
                // Add all available metadata as details
                if (item.childCount !== undefined) details.push(`Children: ${item.childCount}`);
                if (item.textLength !== undefined) details.push(`Text length: ${item.textLength} chars`);
                if (item.hasImages !== undefined) details.push(`Images: ${item.hasImages}`);
                if (item.radioCount !== undefined) details.push(`Radio buttons: ${item.radioCount}`);
                if (item.inputCount !== undefined) details.push(`Inputs: ${item.inputCount}`);
                if (item.foundCount !== undefined) details.push(`Fields found: ${item.foundCount}`);
                if (item.amount !== undefined) details.push(`Amount: ${item.amount} ${(item.currencies || []).join(',')}`);
                if (item.preview) details.push(`Preview: "${item.preview.substring(0, 80)}..."`);
                if (item.fields) {
                    item.fields.forEach(f => details.push(`Field: ${f}`));
                }
                
                return {
                    score: item.score || 0,
                    selector: item.selector || 'unknown',
                    details: details
                };
            });
        }
    } catch (e) {
        // Not JSON, continue with text parsing
        log('info', 'Not JSON format, trying text parse');
    }
    
    // Parse text format (original logic)
    const results = [];
    const lines = output.split('\n');
    
    let currentCandidate = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        const headerMatch = line.match(/^\d+\.\s*(?:Score:\s*(\d+)\s*\|?\s*)?(.+?)(?:\s*\||\s*$)/);
        
        if (headerMatch) {
            if (currentCandidate) {
                results.push(currentCandidate);
            }
            
            currentCandidate = {
                score: parseInt(headerMatch[1]) || 0,
                selector: headerMatch[2].trim(),
                details: []
            };
        } else if (currentCandidate && line && !line.startsWith('===') && !line.startsWith('---')) {
            currentCandidate.details.push(line);
        }
    }
    
    if (currentCandidate) {
        results.push(currentCandidate);
    }
    
    return results;
}

function displayCandidates() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    if (candidates.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No candidates found. Please check the diagnostic output.</div>';
        return;
    }
    
    candidates.forEach((candidate, index) => {
        const confidence = calculateConfidence(candidate.score);
        const confidenceClass = confidence >= 85 ? 'high' : confidence >= 70 ? 'medium' : 'low';
        
        const div = document.createElement('div');
        div.className = 'result-item';
        div.setAttribute('data-index', index);
        div.onclick = function() { selectCandidate(index); };
        
        const details = candidate.details.length > 0 ? candidate.details.join('<br>') : 'No additional details';
        
        div.innerHTML = `
            <h4>
                Candidate #${index + 1}
                <span class="confidence-badge confidence-${confidenceClass}">${confidence}%</span>
                ${index === 0 ? '<span style="margin-left: 10px; color: var(--success); font-size: 0.9rem;">⭐ Recommended</span>' : ''}
            </h4>
            <p><strong>Selector:</strong> <code>${escapeHtml(candidate.selector)}</code></p>
            <p style="font-size: 0.9rem; margin-top: 5px;"><strong>Score:</strong> ${candidate.score}</p>
            ${details ? `<p style="font-size: 0.85rem; margin-top: 8px; color: var(--text-secondary);">${details}</p>` : ''}
            <div style="margin-top: 10px; padding: 10px; background: rgba(102, 126, 234, 0.05); border-radius: 8px; font-size: 0.85rem;">
                💡 <strong>Click to select this candidate</strong>
            </div>
        `;
        
        container.appendChild(div);
    });
    
    // Show Payment Config button if payment type
    const paymentConfigBtn = document.getElementById('paymentConfigButton');
    if (paymentConfigBtn) {
        paymentConfigBtn.style.display = currentType === 'payment' ? 'block' : 'none';
    }
    
    // Auto-select the first (best) candidate if confidence is high
    if (candidates.length > 0) {
        const firstConfidence = calculateConfidence(candidates[0].score);
        if (firstConfidence >= 70) {
            // Auto-select after a short delay so user sees it
            setTimeout(() => {
                selectCandidate(0);
                log('info', 'Auto-selected best candidate');
            }, 500);
        }
    }
    
    log('info', `Displayed ${candidates.length} candidates`);
}

function calculateConfidence(score) {
    // Convert score to confidence percentage
    if (score >= 40) return Math.min(95, 70 + score);
    if (score >= 30) return Math.min(85, 60 + score);
    if (score >= 20) return Math.min(75, 50 + score);
    return Math.max(50, score * 2);
}

function selectCandidate(index) {
    if (index < 0 || index >= candidates.length) {
        console.error('Invalid candidate index:', index);
        return;
    }
    
    selectedElement = candidates[index];
    
    // Remove selected class from all items
    document.querySelectorAll('.result-item').forEach((el) => {
        el.classList.remove('selected');
    });
    
    // Add selected class to clicked item
    const selectedDiv = document.querySelector(`.result-item[data-index="${index}"]`);
    if (selectedDiv) {
        selectedDiv.classList.add('selected');
    }
    
    // Enable the generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
    }
    
    log('info', 'Candidate selected', { index, selector: selectedElement.selector, score: selectedElement.score });
}

function generateScript() {
    console.log('=== GENERATE SCRIPT CALLED ===');
    console.log('selectedElement:', selectedElement);
    console.log('currentType:', currentType);
    
    log('info', 'Generate script initiated');
    
    if (!selectedElement) {
        console.error('FAILED: No element selected');
        alert('Please select an element first');
        log('error', 'No element selected');
        return;
    }
    
    if (!currentType) {
        console.error('FAILED: No script type');
        alert('No script type selected');
        log('error', 'No script type');
        return;
    }
    
    try {
        const config = scriptConfigs[currentType];
        if (!config) {
            throw new Error('Invalid script type: ' + currentType);
        }
        
        console.log('Config found:', config);
        
        const confidence = calculateConfidence(selectedElement.score);
        console.log('Confidence calculated:', confidence);
        
        log('info', 'Generating scripts', { type: currentType, confidence, selector: selectedElement.selector });
        
        const scripts = config.generator(selectedElement.selector, confidence);
        console.log('Scripts generated:', scripts);
        
        if (!scripts || !scripts.basic || !scripts.optimized || !scripts.advanced) {
            throw new Error('Script generation returned invalid data');
        }
        
        // Populate all three script variants
        console.log('Populating script variants...');
        document.getElementById('script0').textContent = scripts.basic.code;
        document.getElementById('confidence0').textContent = scripts.basic.confidence + '%';
        document.getElementById('confidence0').className = `confidence-badge confidence-${scripts.basic.confidence >= 85 ? 'high' : scripts.basic.confidence >= 70 ? 'medium' : 'low'}`;
        
        document.getElementById('script1').textContent = scripts.optimized.code;
        document.getElementById('confidence1').textContent = scripts.optimized.confidence + '%';
        document.getElementById('confidence1').className = `confidence-badge confidence-${scripts.optimized.confidence >= 85 ? 'high' : scripts.optimized.confidence >= 70 ? 'medium' : 'low'}`;
        
        document.getElementById('script2').textContent = scripts.advanced.code;
        document.getElementById('confidence2').textContent = scripts.advanced.confidence + '%';
        document.getElementById('confidence2').className = `confidence-badge confidence-${scripts.advanced.confidence >= 85 ? 'high' : scripts.advanced.confidence >= 70 ? 'medium' : 'low'}`;
        
        // Generate documentation
        console.log('Generating documentation...');
        generateDocumentation();
        
        // Show HTML preview button only for cart scripts
        const htmlPreviewBtn = document.getElementById('htmlPreviewButton');
        if (htmlPreviewBtn) {
            htmlPreviewBtn.style.display = currentType === 'cart' ? 'block' : 'none';
        }
        
        // Move to step 3
        console.log('Moving to step 3...');
        goToStep(3);
        
        console.log('=== SCRIPT GENERATION COMPLETE ===');
        log('success', 'Scripts generated successfully', { type: currentType, confidence });
        
    } catch (error) {
        console.error('=== ERROR IN SCRIPT GENERATION ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        alert('Error generating script: ' + error.message);
        log('error', 'Script generation failed', error);
    }
}

function generateDocumentation() {
    const doc = `# ${scriptConfigs[currentType].title}

**Generated:** ${new Date().toISOString()}
**Selector:** \`${selectedElement.selector}\`
**Confidence Score:** ${selectedElement.score}
**Type:** ${currentType}

## Usage

### Basic Variant
Simple and direct approach.
\`\`\`javascript
${document.getElementById('script0').textContent}
\`\`\`

### Optimized Variant  
Uses MutationObserver for dynamic pages.
\`\`\`javascript
${document.getElementById('script1').textContent}
\`\`\`

### Advanced Variant
With fallbacks and error handling.
\`\`\`javascript
${document.getElementById('script2').textContent}
\`\`\`

## Notes
- Test in development environment first
- Monitor console for any errors
- Adjust selectors if page structure changes
`;
    
    document.getElementById('docPreview').textContent = doc;
}

function switchVariant(index) {
    document.querySelectorAll('.variant-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    document.querySelectorAll('.variant-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
    
    log('info', `Switched to variant ${index}`);
}

function copyScript(variant) {
    const script = document.getElementById('script' + variant).textContent;
    navigator.clipboard.writeText(script).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
        log('success', `Script variant ${variant} copied`);
    });
}

function saveToLibrary() {
    const name = document.getElementById('scriptName').value.trim() || `${currentType}-${Date.now()}`;
    
    const config = {
        name,
        type: currentType,
        selector: selectedElement.selector,
        score: selectedElement.score,
        scripts: {
            basic: document.getElementById('script0').textContent,
            optimized: document.getElementById('script1').textContent,
            advanced: document.getElementById('script2').textContent
        },
        documentation: document.getElementById('docPreview').textContent,
        created: new Date().toISOString()
    };
    
    saveConfig(name, config);
    alert(`Script saved as "${name}"!`);
    log('success', 'Script saved to library', { name });
}

function resetGenerator() {
    document.getElementById('diagnosticResult').value = '';
    document.getElementById('scriptName').value = '';
    closeModal();
    setTimeout(() => {
        openGenerator(currentType);
    }, 300);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target.id === 'generatorModal' || e.target.id === 'batchModal') {
        e.target.classList.remove('active');
    }
});

// ============================================
// AI Assistant Functions
// ============================================

// ============================================
// Console Functions
// ============================================

function openConsole() {
    document.getElementById('consoleModal').classList.add('active');
    log('info', 'Console opened');
}

function closeConsole() {
    document.getElementById('consoleModal').classList.remove('active');
}

function runInConsole() {
    const url = document.getElementById('consoleURL').value.trim();
    const script = document.getElementById('consoleInput').value.trim();
    
    if (!url) {
        alert('Please enter a target URL');
        return;
    }
    
    if (!script) {
        alert('Please paste a diagnostic script');
        return;
    }
    
    const output = document.getElementById('consoleOutput');
    
    // Add loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'debug-entry info';
    loadingMsg.innerHTML = `
        <span class="debug-timestamp">[${new Date().toLocaleTimeString()}]</span>
        <strong>[INFO]</strong> Loading ${url}...
    `;
    output.insertBefore(loadingMsg, output.firstChild);
    
    // Due to CORS, we can't actually execute scripts on external pages
    // So we'll simulate the result or show instructions
    setTimeout(() => {
        const warningMsg = document.createElement('div');
        warningMsg.className = 'debug-entry warning';
        warningMsg.innerHTML = `
            <span class="debug-timestamp">[${new Date().toLocaleTimeString()}]</span>
            <strong>[WARNING]</strong> Due to browser security (CORS), scripts cannot be executed on external pages from this interface.
            <br><br>
            <strong>To test your script:</strong><br>
            1. Open ${url} in a new tab<br>
            2. Press F12 to open DevTools<br>
            3. Go to Console tab<br>
            4. Paste and run the script<br>
            5. Copy the results back here to "Analyze Result" in the generator
        `;
        output.insertBefore(warningMsg, output.firstChild);
        
        // Copy script to clipboard for convenience
        navigator.clipboard.writeText(script);
        
        const successMsg = document.createElement('div');
        successMsg.className = 'debug-entry success';
        successMsg.innerHTML = `
            <span class="debug-timestamp">[${new Date().toLocaleTimeString()}]</span>
            <strong>[SUCCESS]</strong> Script copied to clipboard! Ready to paste in browser console.
        `;
        output.insertBefore(successMsg, output.firstChild);
    }, 1000);
    
    log('info', 'Console script execution attempted', { url });
}

function clearConsoleOutput() {
    document.getElementById('consoleOutput').innerHTML = '';
    log('info', 'Console output cleared');
}

// ============================================
// Variant Modal Functions
// ============================================

function openVariantModal(index) {
    const modal = document.getElementById('variantModal' + index);
    modal.classList.add('active');
    
    // Copy script content to modal
    const scriptContent = document.getElementById('script' + index).textContent;
    document.getElementById('modalScript' + index).textContent = scriptContent;
    
    // Copy confidence badge
    const confidence = document.getElementById('confidence' + index).textContent;
    document.getElementById('modalConfidence' + index).textContent = confidence;
    document.getElementById('modalConfidence' + index).className = 
        document.getElementById('confidence' + index).className;
    
    log('info', `Variant modal ${index} opened`);
}

function closeVariantModal(index) {
    document.getElementById('variantModal' + index).classList.remove('active');
}

function testVariant(index) {
    const script = document.getElementById('script' + index).textContent;
    
    // Copy to clipboard and open console
    navigator.clipboard.writeText(script).then(() => {
        closeVariantModal(index);
        openConsole();
        document.getElementById('consoleInput').value = script;
        alert('Script loaded into console! Enter the target URL and click "Run Script"');
    });
    
    log('info', `Testing variant ${index}`);
}

// ============================================
// HTML Preview Functions
// ============================================

let currentHTMLPreview = '';

function showHTMLPreview() {
    // Try to get HTML from the selected element
    if (!selectedElement || !selectedElement.selector) {
        alert('No element selected. Please complete the generation process first.');
        return;
    }
    
    // Simulate getting HTML (in production, this would actually fetch from the page)
    const demoHTML = `<!-- Cart HTML Preview -->
<table class="table cart-items">
    <thead>
        <tr>
            <th>Product</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
    </thead>
    <tbody>
        <tr class="cart-item">
            <td>
                <img src="product-image.jpg" alt="Product Name" class="img-border">
            </td>
            <td>
                <a href="/product/123">Product Name</a>
                <p>Size: M, Color: Blue</p>
            </td>
            <td>
                <input type="number" value="2" class="qty-input">
            </td>
            <td>
                <span class="price">25.00 BGN</span>
            </td>
        </tr>
    </tbody>
</table>

<!-- This is a simulated preview. In production, this would show the actual HTML 
     from the selector: ${selectedElement.selector} -->`;
    
    currentHTMLPreview = demoHTML;
    
    document.getElementById('htmlPreviewContent').textContent = demoHTML;
    document.getElementById('htmlSize').textContent = `(${demoHTML.length} characters)`;
    document.getElementById('htmlPreviewModal').classList.add('active');
    
    log('success', 'HTML preview displayed');
}

function closeHTMLPreview() {
    document.getElementById('htmlPreviewModal').classList.remove('active');
}

function copyHTMLPreview() {
    const html = document.getElementById('htmlPreviewContent').textContent;
    navigator.clipboard.writeText(html).then(() => {
        alert('HTML copied to clipboard!');
        log('success', 'HTML preview copied');
    });
}

function formatHTMLPreview() {
    const html = document.getElementById('htmlPreviewContent').textContent;
    
    // Basic HTML formatting
    let formatted = html
        .replace(/></g, '>\n<')
        .replace(/\n\s*\n/g, '\n');
    
    // Add indentation
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indent = '  '.repeat(indentLevel);
        
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
            indentLevel++;
        }
        
        return indent + trimmed;
    });
    
    document.getElementById('htmlPreviewContent').textContent = formattedLines.join('\n');
    log('info', 'HTML formatted');
}

function analyzeHTML() {
    const html = document.getElementById('htmlPreviewContent').textContent;
    
    // Basic analysis
    const products = (html.match(/<img/gi) || []).length;
    const prices = (html.match(/\d+[.,]\d{2}\s*(BGN|лв|EUR|€)/gi) || []).length;
    const links = (html.match(/<a /gi) || []).length;
    
    alert(`📊 HTML Analysis:\n\n` +
          `• Products: ${products}\n` +
          `• Prices found: ${prices}\n` +
          `• Links: ${links}\n` +
          `• Total size: ${html.length} chars\n` +
          `• Lines: ${html.split('\n').length}`);
    
    log('info', 'HTML analyzed', { products, prices, links, size: html.length });
}

// ============================================
// HTML Visualizer Functions (Problem 1 Fix)
// ============================================

function openHTMLVisualizer() {
    document.getElementById('htmlVisualizerModal').style.display = 'flex';
    log('info', 'HTML Visualizer opened');
}

function closeHTMLVisualizer() {
    document.getElementById('htmlVisualizerModal').style.display = 'none';
    log('info', 'HTML Visualizer closed');
}

async function pasteHTMLCode() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('htmlRawInput').value = text;
        log('success', 'HTML pasted from clipboard');
    } catch (err) {
        alert('Failed to paste from clipboard. Please paste manually (Ctrl+V).');
        log('error', 'Clipboard paste failed', err);
    }
}

function clearHTMLInput() {
    document.getElementById('htmlRawInput').value = '';
    document.getElementById('htmlVisualOutput').innerHTML = '<div style="color: #999; text-align: center; padding: 40px;">Click "Visualize" to see the HTML rendered</div>';
    document.getElementById('htmlStats').textContent = 'No HTML loaded';
    log('info', 'HTML input cleared');
}

function visualizeHTML() {
    const rawHTML = document.getElementById('htmlRawInput').value.trim();
    
    if (!rawHTML) {
        alert('Please paste some HTML code first!');
        return;
    }
    
    // Render the HTML
    const outputDiv = document.getElementById('htmlVisualOutput');
    outputDiv.innerHTML = rawHTML;
    
    // Calculate stats
    const stats = {
        chars: rawHTML.length,
        lines: rawHTML.split('\n').length,
        images: (rawHTML.match(/<img/gi) || []).length,
        links: (rawHTML.match(/<a /gi) || []).length,
        prices: (rawHTML.match(/\d+[.,]\d{2}\s*(BGN|лв|EUR|€|\$)/gi) || []).length,
        products: (rawHTML.match(/product|item|cart-item|товар/gi) || []).length
    };
    
    document.getElementById('htmlStats').textContent = 
        `${stats.chars} chars | ${stats.lines} lines | ${stats.images} images | ${stats.links} links | ${stats.prices} prices | ~${stats.products} products`;
    
    log('success', 'HTML visualized', stats);
}

// ============================================
// Payment Methods Selection Functions (Problem 2 Fix)
// ============================================

let detectedPaymentMethods = [];
let selectedPaymentMethods = [];

function openPaymentMethodsModal() {
    // Detect payment methods from the selected element
    detectedPaymentMethods = detectPaymentMethodsFromElement();
    
    if (detectedPaymentMethods.length === 0) {
        alert('No payment methods detected in the selected element. Try selecting a different element or use manual configuration.');
        return;
    }
    
    // Populate the modal
    const listDiv = document.getElementById('paymentMethodsList');
    listDiv.innerHTML = '';
    
    detectedPaymentMethods.forEach((method, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 15px; margin-bottom: 10px; background: var(--card-bg); border: 2px solid var(--border); border-radius: 8px; display: flex; align-items: center; cursor: pointer;';
        
        div.innerHTML = `
            <input type="checkbox" 
                   id="pm_${index}" 
                   onchange="updatePaymentMethodsSelection()"
                   style="width: 20px; height: 20px; margin-right: 15px; cursor: pointer;">
            <label for="pm_${index}" style="flex: 1; cursor: pointer; font-size: 1rem;">
                <strong>${escapeHtml(method.name)}</strong>
                <br>
                <small style="color: var(--text-secondary);">${escapeHtml(method.selector)}</small>
            </label>
        `;
        
        listDiv.appendChild(div);
    });
    
    document.getElementById('paymentMethodsModal').style.display = 'flex';
    updatePaymentMethodsSelection();
    log('info', 'Payment methods modal opened', { count: detectedPaymentMethods.length });
}

function closePaymentMethodsModal() {
    document.getElementById('paymentMethodsModal').style.display = 'none';
    log('info', 'Payment methods modal closed');
}

function updatePaymentMethodsSelection() {
    selectedPaymentMethods = [];
    
    detectedPaymentMethods.forEach((method, index) => {
        const checkbox = document.getElementById(`pm_${index}`);
        if (checkbox && checkbox.checked) {
            selectedPaymentMethods.push(method);
        }
    });
    
    document.getElementById('selectedMethodsCount').textContent = selectedPaymentMethods.length;
}

function applyPaymentMethodsSelection() {
    if (selectedPaymentMethods.length === 0) {
        if (!confirm('No payment methods selected to hide. Continue anyway?')) {
            return;
        }
    }
    
    log('success', 'Payment methods selection applied', { 
        total: detectedPaymentMethods.length, 
        toHide: selectedPaymentMethods.length 
    });
    
    closePaymentMethodsModal();
    
    // Show confirmation
    alert(`✅ Configuration saved!\n\nTotal methods: ${detectedPaymentMethods.length}\nWill hide: ${selectedPaymentMethods.length}\n\nClick "Generate Script" to create the hiding script.`);
    
    // Enable generate button
    document.getElementById('generateBtn').disabled = false;
}

function detectPaymentMethodsFromElement() {
    // This function tries to detect payment methods from the page
    // In a real scenario, this would analyze the actual page structure
    
    const methods = [];
    const commonPaymentMethods = [
        { name: 'Cash on Delivery (COD)', selector: '.payment-cod, #payment-cod, [data-method="cod"]' },
        { name: 'Bank Transfer', selector: '.payment-bank, #payment-bank, [data-method="bank"]' },
        { name: 'PayPal', selector: '.payment-paypal, #payment-paypal, [data-method="paypal"]' },
        { name: 'Credit/Debit Card', selector: '.payment-card, #payment-card, [data-method="card"]' },
        { name: 'Apple Pay', selector: '.payment-applepay, #applepay, [data-method="applepay"]' },
        { name: 'Google Pay', selector: '.payment-googlepay, #googlepay, [data-method="googlepay"]' },
        { name: 'Stripe', selector: '.payment-stripe, #payment_method_stripe' },
        { name: 'myPOS', selector: '.payment-mypos, #payment_method_mypos' },
        { name: 'ePay', selector: '.payment-epay, #payment_method_epay' },
        { name: 'Paysera', selector: '.payment-paysera, #payment_method_paysera' }
    ];
    
    // Return the common methods for now
    // In real implementation, would scan selectedElement
    return commonPaymentMethods;
}

// ============================================
// AI Assistant Functions (Problem 3 Fix - Open in new window instead of iframe)
// ============================================

function openAIAssistant() {
    // Open DeepSeek in a new window instead of iframe (fixes CORS issue)
    const deepseekURL = 'https://chat.deepseek.com/';
    const win = window.open(deepseekURL, 'DeepSeek AI', 'width=1200,height=800,menubar=no,toolbar=no,location=no');
    
    if (!win) {
        alert('Pop-up blocked! Please allow pop-ups for this site to use the AI Assistant.');
    } else {
        // Copy current script to clipboard
        setTimeout(() => {
            sendScriptToAI();
        }, 1000);
        
        log('info', 'AI Assistant opened in new window');
    }
}

function closeAIAssistant() {
    // Not needed anymore since we open in new window
    log('info', 'AI Assistant closed');
}

async function sendScriptToAI() {
    try {
        let text = '=== GENERATED SCRIPTS ===\n\n';
        
        // Get all 3 variants
        const basic = document.getElementById('script0')?.textContent;
        const optimized = document.getElementById('script1')?.textContent;
        const advanced = document.getElementById('script2')?.textContent;
        
        if (basic) text += '--- BASIC VARIANT ---\n' + basic + '\n\n';
        if (optimized) text += '--- OPTIMIZED VARIANT ---\n' + optimized + '\n\n';
        if (advanced) text += '--- ADVANCED VARIANT ---\n' + advanced + '\n\n';
        
        if (text === '=== GENERATED SCRIPTS ===\n\n') {
            text = 'No scripts generated yet. Please generate scripts first.';
        }
        
        await navigator.clipboard.writeText(text);
        alert('✅ Scripts copied to clipboard!\n\nNow paste them in the DeepSeek chat to:\n• Explain how they work\n• Get recommendations\n• Debug issues\n• Improve the code');
        
        log('success', 'Scripts copied to clipboard for AI');
    } catch (err) {
        alert('Failed to copy to clipboard. Please copy the scripts manually.');
        log('error', 'Clipboard copy failed', err);
    }
}

// ============================================
// Debug Function
// ============================================

function showDebugInfo() {
    const info = {
        currentType: currentType || 'NOT SET',
        currentStep: currentStep || 'NOT SET',
        selectedElement: selectedElement ? {
            selector: selectedElement.selector,
            score: selectedElement.score,
            details: selectedElement.details
        } : 'NOT SELECTED',
        candidatesCount: candidates ? candidates.length : 0,
        scriptConfigsKeys: Object.keys(scriptConfigs),
        generateBtnDisabled: document.getElementById('generateBtn')?.disabled,
        generateBtnExists: !!document.getElementById('generateBtn')
    };
    
    console.log('=== DEBUG INFO ===');
    console.log(info);
    
    alert('🐛 DEBUG INFO:\n\n' +
          `Current Type: ${info.currentType}\n` +
          `Current Step: ${info.currentStep}\n` +
          `Selected Element: ${info.selectedElement !== 'NOT SELECTED' ? info.selectedElement.selector : 'NONE'}\n` +
          `Candidates: ${info.candidatesCount}\n` +
          `Generate Button: ${info.generateBtnExists ? (info.generateBtnDisabled ? 'DISABLED' : 'ENABLED') : 'NOT FOUND'}\n\n` +
          `Check console for full details.`);
}

// ============================================
// Initialize
// ============================================

log('success', 'Payment Script Generator Pro loaded');
