// ==UserScript==
// @name         Twitch hover preview (thumbnails)
// @description  Shows a live preview when hovering over livestream thumbnails
// @match        https://www.twitch.tv/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace    https://github.com/ab0214/twitch-hover-preview-userscript
// @homepageURL  https://github.com/ab0214/twitch-hover-preview-userscript
// @downloadURL  https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-hover-preview-thumbnails.user.js
// @updateURL    https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-hover-preview-thumbnails.user.js
// @author       ab0214
// @license      MIT
// @version      1.0
// ==/UserScript==

(function() {
    'use strict';
    const PREVIEW_CLASS = 'userscript-tw-live-preview';

    function getChannelFromContainer(container) {
        const link = container.querySelector('a.preview-card-image-link'); // This should only work for live channels, not VODs etc.
        let channel = link?.getAttribute('href')?.split('/').filter(Boolean)[0] || null;
        return channel;
    }

    function createIframe(channel) {
        const iframe = document.createElement('iframe');
        iframe.className = PREVIEW_CLASS;
        iframe.src = `https://player.twitch.tv/?channel=${channel}&controls=false&muted=true&parent=twitch.tv&quality=240p30`;
        iframe.dataset.channel = channel;
        iframe.style.cssText = `
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          background: transparent;
        `;
        iframe.style.pointerEvents = 'none';
        return iframe;
    }

    function setupHover(container) {
        const img = container.querySelector('img.tw-image');
        if (!img) return;

        let iframe;
        let originalParent = img.parentElement;
        let nextSibling = img.nextSibling;

        container.addEventListener('mouseenter', () => {
            const channel = getChannelFromContainer(container);
            if (!channel) return;
            if (!iframe) iframe = createIframe(channel);
            originalParent.replaceChild(iframe, img);
        });

        container.addEventListener('mouseleave', () => {
            if (iframe && iframe.parentElement === originalParent) {
                originalParent.replaceChild(img, iframe);
            }
        });
    }

    // Initial elements
    document.querySelectorAll('.tw-hover-accent-effect').forEach(setupHover);

    // Watch for dynamically added elements
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('tw-hover-accent-effect')) {
                    setupHover(node);
                }
                node.querySelectorAll?.('.tw-hover-accent-effect').forEach(setupHover);
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
