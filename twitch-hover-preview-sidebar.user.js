// ==UserScript==
// @name         Twitch hover preview (sidebar)
// @description  Shows a live preview when hovering over channel icons in Twitch's sidebar
// @match        https://www.twitch.tv/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace    https://github.com/ab0214/twitch-hover-preview-userscript
// @homepageURL  https://github.com/ab0214/twitch-hover-preview-userscript
// @downloadURL  https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-hover-preview-sidebar.user.js
// @updateURL    https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-hover-preview-sidebar.user.js
// @author       ab0214
// @license      MIT
// @version      1.0
// ==/UserScript==

(function () {
    const PREVIEW_CLASS = 'userscript-sidebar-preview-iframe';
    let iframeUpdateTimeout;
    let lastHoveredChannel = null;
    let currentChannel = null;

    function createIframe(channel) {
        const iframe = document.createElement('iframe');
        iframe.className = PREVIEW_CLASS;
        iframe.src = `https://player.twitch.tv/?channel=${channel}&controls=false&muted=true&parent=twitch.tv&quality=240p30`;
        currentChannel = channel;
        iframe.style.cssText = `
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          border-radius: 6px;
          margin-bottom: 6px;
          background: transparent;
        `;
        return iframe;
    }

    function injectOrUpdatePreview(card) {
        // Get existing preview iframe if it exists
        let iframe = card.querySelector(`.${PREVIEW_CLASS}`);
        // Try to get channel name from last hovered link
        let channel = lastHoveredChannel
        // If no channel name, remove iframe and return
        if (!channel) {
            iframe?.remove();
            return;
        }
        // Inject preview iframe if it doesn't exist yet.
        if (!iframe) {
            const newIframe = createIframe(channel);
            card.prepend(newIframe);
            card.style.width = '325px';
        }
        // Update stream source if preview iframe already exists, with 300ms debounce.
        else {
            if (iframeUpdateTimeout) clearTimeout(iframeUpdateTimeout); // Cancel pending updates.
            if (channel !== currentChannel) { // Prevent reload if changing from one channel to another and back very quickly.
                iframeUpdateTimeout = setTimeout(() => { // Schedule update after 300ms.
                    iframe.src = `https://player.twitch.tv/?channel=${channel}&muted=true&parent=twitch.tv&quality=160p30&controls=false`;
                    currentChannel = channel;
                }, 300);
            }
        }
    }

    // Track hovered links
    document.addEventListener('mouseover', e => {
        const link = e.target.closest('a[href^="/"]');
        let channel = link?.getAttribute('href')?.split('/')[1] || null;
        if (channel === 'directory') channel = null;
        lastHoveredChannel = channel;
    });

    // Observe for new hover cards appearing in the DOM
    const mainObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                const cards = node.querySelectorAll?.('.tw-balloon') || [];
                if (node.classList.contains('tw-balloon')) cards.push(node);
                for (const card of cards) {
                    injectOrUpdatePreview(card);
                    const cardChangeObserver = new MutationObserver(() => injectOrUpdatePreview(card));
                    cardChangeObserver.observe(card, { subtree: true, childList: true, attributes: true, characterData: true });
                }
            }
        }
    });
    mainObserver.observe(document.body, { childList: true, subtree: true });
})();
