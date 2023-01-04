import DOMPurify from "dompurify";
import { marked } from "marked";

export class Utils {

    constructor() {
        DOMPurify.addHook('afterSanitizeElements', function (node) {
            if (!node.tagName) {
                return;
            }

            if (node.tagName.toLowerCase() === 'a') {
                const href = node.getAttribute('href');
                if (href) {
                    if (href.startsWith("http://") || href.startsWith("https://")) {
                        const onclick = `window.Capacitor.Plugins.Browser.open({ url: '${href as string}' });`;
                        node.setAttribute("onclick", onclick);
                    }
                    node.removeAttribute("href");
                }
            }

            return node;
        })
    }

    private ethFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0
    });

    private usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    private numberFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0
    });

    formatPrice(val: number): string {
        return this.ethFormatter.format(val);
    }

    formatUsd(val: number): string {
        return this.usdFormatter.format(val);
    }

    formatNumber(val: number): string {
        return this.numberFormatter.format(val);
    }

    formatVp(val: number): string {
        if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
        }
        else if (val >= 1000) {
            return (val / 1000).toFixed(1) + "K";
        }
        else {
            return val.toString();
        }
    }

    parseMarkdown(val: string): string {
        return DOMPurify.sanitize(marked.parse(val, { async: false }), { ALLOWED_ATTR: ["onclick"] });
    }

    sanitize(val: string): string {
        return DOMPurify.sanitize(val, { ALLOWED_ATTR: ["onclick"] });
    }
}
