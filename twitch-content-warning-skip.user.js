// ==UserScript==
// @name         Twitch content warning skip
// @description  Skips "content is intended for certain audiences" warning in embedded Twitch player
// @match        https://player.twitch.tv/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace    https://github.com/ab0214/twitch-hover-preview-userscript
// @homepageURL  https://github.com/ab0214/twitch-hover-preview-userscript
// @downloadURL  https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-content-warning-skip.user.js
// @updateURL    https://raw.githubusercontent.com/ab0214/twitch-hover-preview-userscript/main/twitch-content-warning-skip.user.js
// @author       ab0214
// @license      MIT
// @version      1.0
// ==/UserScript==

(function() {
    const tryClick = () => {
        const btn = document.querySelector('[data-a-target="content-classification-gate-overlay-start-watching-button"]');
        if (btn) {
            btn.click();
        } else {
            // Retry after a short delay if not yet present
            setTimeout(tryClick, 500);
        }
    };
    tryClick();
})();
