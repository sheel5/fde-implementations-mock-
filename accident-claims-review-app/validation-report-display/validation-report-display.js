/**
 * Validation Report Display
 * UiPath Apps Custom HTML Component
 *
 * Reads from: App.getVariable("validationReport")  → String (Markdown)
 * Renders the markdown as styled HTML.
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
    variable: "validationReport"
};

// ==================== MAIN APPLICATION ====================

/**
 * Initialize the application when the DOM is ready.
 */
async function initApp() {
    try {
        showLoadingState();
        await loadReport();
    } catch (error) {
        console.error("[ValidationReportDisplay] Init error:", error);
        hideLoadingState();
        renderError(error.message);
    }
}

// ==================== DATA LAYER ====================

/**
 * Retrieve the markdown string from UiPath Apps and render it.
 */
async function loadReport() {
    let markdown = "";

    try {
        const raw = await App.getVariable(CONFIG.variable);
        console.log("[ValidationReportDisplay] Data loaded from App");
        markdown = typeof raw === "string" ? raw : "";
    } catch (e) {
        console.warn("[ValidationReportDisplay] App.getVariable failed:", e);
        markdown = "";
    }

    hideLoadingState();

    if (!markdown.trim()) {
        showEmptyState();
    } else {
        renderReport(markdown);
    }
}

// ==================== MARKDOWN PARSER ====================

/**
 * Convert a markdown string to HTML.
 * Handles: headings, bold, italic, lists, blockquotes, tables, hr, code, links.
 * @param {string} md
 * @returns {string} HTML string
 */
function markdownToHtml(md) {
    // Normalize line endings
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const output = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Blank line
        if (line.trim() === "") {
            i++;
            continue;
        }

        // Horizontal rule: --- or *** or ___ (at least 3)
        if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
            output.push("<hr>");
            i++;
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            output.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
            i++;
            continue;
        }

        // Table: detect by | at start
        if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
                tableLines.push(lines[i]);
                i++;
            }
            output.push(parseTable(tableLines));
            continue;
        }

        // Blockquote
        if (line.trimStart().startsWith("> ") || line.trimStart() === ">") {
            const blockLines = [];
            while (i < lines.length && (lines[i].trimStart().startsWith("> ") || lines[i].trimStart() === ">")) {
                blockLines.push(lines[i].replace(/^\s*>\s?/, ""));
                i++;
            }
            output.push(`<blockquote><p>${inlineFormat(blockLines.join(" "))}</p></blockquote>`);
            continue;
        }

        // Unordered list (- or *)
        if (/^\s*[-*]\s+/.test(line)) {
            const listItems = [];
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
                // Collect continuation lines (indented non-list lines)
                let itemText = lines[i].replace(/^\s*[-*]\s+/, "");
                i++;
                while (i < lines.length && lines[i].match(/^\s{2,}/) && !/^\s*[-*]\s+/.test(lines[i]) && !lines[i].match(/^#{1,6}\s/)) {
                    itemText += " " + lines[i].trim();
                    i++;
                }
                listItems.push(`<li>${inlineFormat(itemText)}</li>`);
            }
            output.push(`<ul>${listItems.join("")}</ul>`);
            continue;
        }

        // Paragraph — collect consecutive non-blank, non-special lines
        const paraLines = [];
        while (i < lines.length && lines[i].trim() !== "" &&
               !lines[i].match(/^#{1,6}\s/) &&
               !lines[i].match(/^(\s*[-*_]\s*){3,}$/) &&
               !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
               !lines[i].trimStart().startsWith("> ") &&
               !/^\s*[-*]\s+/.test(lines[i])) {
            paraLines.push(lines[i]);
            i++;
        }
        if (paraLines.length > 0) {
            output.push(`<p>${inlineFormat(paraLines.join(" "))}</p>`);
        }
    }

    return output.join("\n");
}

/**
 * Apply inline formatting: bold, italic, inline code, links.
 * @param {string} text
 * @returns {string}
 */
function inlineFormat(text) {
    // Escape HTML first
    text = escapeHtml(text);

    // Inline code (backticks) — do this first to avoid formatting inside code
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold + italic (***text*** or ___text___)
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    text = text.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

    // Bold (**text** or __text__)
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic (*text* or _text_ — but not inside words with underscores)
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/(?<!\w)_([^_]+)_(?!\w)/g, "<em>$1</em>");

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return text;
}

/**
 * Parse markdown table lines into an HTML table wrapped in a scrollable div.
 * @param {string[]} tableLines
 * @returns {string}
 */
function parseTable(tableLines) {
    if (tableLines.length < 2) return "";

    const parseRow = (line) =>
        line.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());

    const headers = parseRow(tableLines[0]);

    // Skip separator row (index 1), body starts at index 2
    const bodyRows = [];
    for (let r = 2; r < tableLines.length; r++) {
        bodyRows.push(parseRow(tableLines[r]));
    }

    const thHtml = headers.map(h => `<th>${inlineFormat(h)}</th>`).join("");
    const tbHtml = bodyRows.map(row =>
        `<tr>${row.map(cell => `<td>${inlineFormat(cell)}</td>`).join("")}</tr>`
    ).join("");

    return `<div class="table-wrapper"><table><thead><tr>${thHtml}</tr></thead><tbody>${tbHtml}</tbody></table></div>`;
}

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ==================== RENDER LAYER ====================

/**
 * Render the markdown report into the container.
 * @param {string} markdown
 */
function renderReport(markdown) {
    const container = document.getElementById("reportContainer");
    container.innerHTML = markdownToHtml(markdown);
    container.style.display = "block";
    document.getElementById("emptyState").style.display = "none";
}

// ==================== UI STATE ====================

function showLoadingState() {
    document.getElementById("reportContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("loadingState").style.display = "block";
}

function hideLoadingState() {
    document.getElementById("loadingState").style.display = "none";
}

function showEmptyState() {
    document.getElementById("reportContainer").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
}

function renderError(message) {
    const container = document.getElementById("reportContainer");
    container.innerHTML = `<p style="color: var(--brand-primary);">Error loading report: ${escapeHtml(message)}</p>`;
    container.style.display = "block";
}

// ==================== INITIALIZATION ====================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Re-load when the variable is updated externally
App.onVariableChange(CONFIG.variable, () => loadReport());

// Expose a refresh hook for UiPath Apps rules
window.ValidationReportDisplay = { refresh: initApp };
