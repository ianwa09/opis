(function () {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storageKey = 'opis-theme';
    let preference;

    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'light' || saved === 'dark') preference = saved;
    } catch {
        // The theme can still be changed when browser storage is unavailable.
    }

    function applyTheme() {
        const theme = preference || (systemTheme.matches ? 'dark' : 'light');
        const changed = root.dataset.theme !== theme;
        root.dataset.theme = theme;
        const button = document.getElementById('theme-toggle');
        if (button) button.setAttribute('aria-pressed', String(theme === 'dark'));
        if (changed) document.dispatchEvent(new Event('opis-theme-change'));
    }

    applyTheme();
    systemTheme.addEventListener('change', applyTheme);
    document.addEventListener('DOMContentLoaded', function () {
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        applyTheme();
        button.addEventListener('click', function () {
            preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(storageKey, preference);
            } catch {
                // Keep the choice for this page even if it cannot be saved.
            }
            applyTheme();
        });
    });
})();
