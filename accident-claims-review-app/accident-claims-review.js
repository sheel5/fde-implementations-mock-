/**
 * Accident Claims Review Application
 * UiPath Apps Custom HTML Component
 *
 * Reads from: App.getVariable("MatchedServices")  → List of Objects
 * Writes to:  App.setVariable("MatchedServices", updatedArray)
 *
 * Expected variable shape (list of objects):
 * [
 *   {
 *     "benefitName": "string",
 *     "serviceDate": "YYYY-MM-DD",
 *     "category": "string",
 *     "confidence": "percentage",
 *     "justification": "string",
 *     "justificationSource": [{ "pageNumber": "string", "fileName": "string" }]
 *   }
 * ]
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
    variable: "MatchedServices"
};

// ==================== MAIN APPLICATION ====================

/** Local clone of the services array — edits happen here before saving back. */
let currentServices = [];

/**
 * Initialize the application when the DOM is ready.
 * Retrieves MatchedServices (async) and renders all service cards.
 */
async function initApp() {
    try {
        showLoadingState();
        await loadServices();
    } catch (error) {
        console.error("[AccidentClaimsReview] Init error:", error);
        hideLoadingState();
        renderError(error.message);
    }
}

// ==================== DATA LAYER ====================

/**
 * Retrieve MatchedServices from UiPath Apps.
 * App.getVariable returns a Promise, so we must await it.
 */
async function loadServices() {
    try {
        const raw = await App.getVariable(CONFIG.variable);
        console.log("[AccidentClaimsReview] Data loaded from App:", raw);

        // Unwrap if data arrives as { MatchedServices: [...] } instead of a plain array
        const data = Array.isArray(raw) ? raw
                   : (raw && Array.isArray(raw.MatchedServices)) ? raw.MatchedServices
                   : null;

        if (data && data.length > 0) {
            // Deep clone to prevent unexpected mutation before saving
            currentServices = JSON.parse(JSON.stringify(data));
        } else {
            console.warn("[AccidentClaimsReview] Variable not available or empty");
            currentServices = [];
        }
    } catch (e) {
        console.warn("[AccidentClaimsReview] App.getVariable failed:", e);
        currentServices = [];
    }

    hideLoadingState();

    if (currentServices.length === 0) {
        showEmptyState();
    } else {
        renderServices(currentServices);
    }
}

/**
 * Persist the full currentServices array back to UiPath Apps.
 */
async function saveServices() {
    try {
        await App.setVariable(CONFIG.variable, currentServices);
        console.log("[AccidentClaimsReview] Saved services to App variable");
    } catch (e) {
        console.error("[AccidentClaimsReview] App.setVariable failed:", e);
    }
}

/**
 * Persist the updated services array back to UiPath Apps after a date edit.
 * @param {number} index   - Index within the services array
 * @param {string} newDate - New date value in YYYY-MM-DD format
 */
async function saveServiceDate(index, newDate) {
    currentServices[index].serviceDate = newDate;
    await saveServices();
}

/**
 * Remove a service by index, re-render, and persist.
 * @param {number} index
 */
async function removeService(index) {
    currentServices.splice(index, 1);
    await saveServices();

    if (currentServices.length === 0) {
        showEmptyState();
    } else {
        renderServices(currentServices);
    }
}

/**
 * Add a draft service card to the UI without persisting.
 * The card includes a Save button that commits it.
 */
function addService() {
    const container = document.getElementById("servicesContainer");
    document.getElementById("emptyState").style.display = "none";
    container.appendChild(buildDraftCard());
}

/**
 * Build a draft card with editable fields and a Save button.
 * Nothing is persisted until the user clicks Save.
 * @returns {HTMLElement}
 */
function buildDraftCard() {
    const card = document.createElement("div");
    card.className = "service-card draft-card";

    card.innerHTML = `
        <div class="service-header">
            <input type="text" class="edit-benefit-name" placeholder="Enter benefit name...">
            <input type="text" class="edit-category" placeholder="Enter category...">
            <button class="btn-remove-service" title="Discard this service">&#10005;</button>
        </div>
        <div class="field-row">
            <label class="field-label">Service Date</label>
            <div class="date-input-wrapper">
                <input type="date" class="date-input draft-date">
                <span class="date-icon">&#128197;</span>
            </div>
        </div>
        <div class="field-row draft-justification-row">
            <label class="field-label">Justification</label>
            <textarea class="edit-justification" placeholder="Enter justification..." rows="3"></textarea>
        </div>
        <div class="draft-actions">
            <button class="btn-save-draft">Save Service</button>
        </div>
    `;

    // Discard draft
    card.querySelector(".btn-remove-service").addEventListener("click", () => card.remove());

    // Save draft → commit to currentServices and re-render
    card.querySelector(".btn-save-draft").addEventListener("click", async () => {
        const benefitName = card.querySelector(".edit-benefit-name").value.trim();
        if (!benefitName) {
            card.querySelector(".edit-benefit-name").focus();
            return;
        }

        currentServices.push({
            benefitName: benefitName,
            serviceDate: card.querySelector(".draft-date").value || "",
            category: card.querySelector(".edit-category").value.trim(),
            confidence: "Manually Added",
            justification: card.querySelector(".edit-justification").value.trim() || "Manually added by reviewer.",
            justificationSource: []
        });

        await saveServices();
        renderServices(currentServices);
    });

    return card;
}

// ==================== RENDER LAYER ====================

/**
 * Render all service cards into the services grid.
 * @param {Array} services
 */
function renderServices(services) {
    const container = document.getElementById("servicesContainer");
    document.getElementById("emptyState").style.display = "none";
    container.innerHTML = "";

    services.forEach((service, index) => {
        container.appendChild(buildServiceCard(service, index));
    });
}

/**
 * Build and return a single service card DOM element.
 * @param {Object} service
 * @param {number} index
 * @returns {HTMLElement}
 */
function buildServiceCard(service, index) {
    const card = document.createElement("div");
    card.className = "service-card";

    const benefitName   = sanitize(service.benefitName   || "Unknown Benefit");
    const category      = sanitize(service.category      || "");
    const serviceDate   = sanitize(service.serviceDate   || "");
    const confidence    = sanitize(service.confidence    || "N/A");
    const justification = sanitize(service.justification || "No justification provided.");
    const sources       = Array.isArray(service.justificationSource) ? service.justificationSource : [];

    card.innerHTML = `
        <!-- Card Header -->
        <div class="service-header">
            <h2 class="benefit-name">${benefitName}</h2>
            ${category ? `<span class="service-category">${category}</span>` : ""}
            <button class="btn-remove-service" data-index="${index}" title="Remove this service">&#10005;</button>
        </div>

        <!-- Service Date (Editable) -->
        <div class="field-row">
            <label class="field-label" for="date-${index}">Service Date</label>
            <div class="date-input-wrapper">
                <input
                    type="date"
                    id="date-${index}"
                    class="date-input"
                    value="${serviceDate}"
                    data-index="${index}"
                    data-original="${serviceDate}"
                    title="Click to edit the service date"
                />
                <span class="date-icon">&#128197;</span>
            </div>
        </div>

        <!-- Confidence -->
        <div class="field-row">
            <span class="field-label">Confidence</span>
            <div class="field-value">
                ${buildConfidenceBadge(confidence)}
            </div>
        </div>

        <!-- Justification + Collapsible Sources -->
        <div class="justification-section">
            <div class="justification-text">${justification}</div>
            ${buildSourcesBlock(sources, index)}
        </div>
    `;

    // Attach date change listener
    card.querySelector(".date-input").addEventListener("change", onDateChange);

    // Attach remove button listener
    card.querySelector(".btn-remove-service").addEventListener("click", () => removeService(index));

    // Attach sources toggle listener (if sources exist)
    const toggle = card.querySelector(".sources-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => toggleSources(index));
    }

    return card;
}

/**
 * Build the confidence badge with color-coded class.
 * Accepts values like "85%", "0.85", "High", "Low", etc.
 * @param {string} confidence
 * @returns {string} HTML string
 */
function buildConfidenceBadge(confidence) {
    const numeric = parseFloat(String(confidence).replace("%", ""));
    let cls = "confidence-medium";

    if (!isNaN(numeric)) {
        if (numeric >= 80) cls = "confidence-high";
        else if (numeric < 50) cls = "confidence-low";
    } else {
        const lower = String(confidence).toLowerCase();
        if (lower.includes("high")) cls = "confidence-high";
        if (lower.includes("low"))  cls = "confidence-low";
    }

    return `<span class="confidence-badge ${cls}">${confidence}</span>`;
}

/**
 * Build the collapsible justification sources block.
 * @param {Array}  sources - Array of { pageNumber, fileName }
 * @param {number} index   - Card index (used for unique DOM IDs)
 * @returns {string} HTML string
 */
function buildSourcesBlock(sources, index) {
    if (!sources || sources.length === 0) return "";

    const count = sources.length;
    const label = count === 1 ? "1 Source" : `${count} Sources`;

    const sourceItems = sources.map(s => `
        <div class="source-item">
            <span class="source-icon">&#128196;</span>
            <span class="source-filename">${sanitize(s.fileName || "Unknown File")}</span>
            <span class="source-page">p. ${sanitize(s.pageNumber || "—")}</span>
        </div>
    `).join("");

    return `
        <div class="sources-container">
            <button class="sources-toggle" data-index="${index}" aria-expanded="false">
                <span class="sources-icon">&#128203;</span>
                ${label}
                <span class="sources-chevron">&#8964;</span>
            </button>
            <div class="sources-list" id="sources-${index}" style="display: none;">
                ${sourceItems}
            </div>
        </div>
    `;
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle service date changes — saves to UiPath Apps and flashes green feedback.
 * @param {Event} event
 */
async function onDateChange(event) {
    const input = event.target;
    const index = parseInt(input.dataset.index, 10);
    const newDate = input.value;

    if (newDate === input.dataset.original) return;

    await saveServiceDate(index, newDate);
    input.dataset.original = newDate;

    input.classList.add("date-saved");
    setTimeout(() => input.classList.remove("date-saved"), 1200);
}

/**
 * Toggle the visibility of a card's sources list.
 * @param {number} index
 */
function toggleSources(index) {
    const list   = document.getElementById(`sources-${index}`);
    const toggle = document.querySelector(`.sources-toggle[data-index="${index}"]`);

    if (!list || !toggle) return;

    const isOpen = list.style.display !== "none";
    list.style.display = isOpen ? "none" : "block";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.classList.toggle("open", !isOpen);
}

// ==================== UTILITY ====================

/**
 * Sanitize a value to safe HTML text to prevent XSS.
 * @param {*} value
 * @returns {string}
 */
function sanitize(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

/** Show the loading state panel. */
function showLoadingState() {
    document.getElementById("servicesContainer").innerHTML = "";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("loadingState").style.display = "block";
}

/** Hide the loading state panel. */
function hideLoadingState() {
    document.getElementById("loadingState").style.display = "none";
}

/** Show the empty state panel. */
function showEmptyState() {
    document.getElementById("servicesContainer").innerHTML = "";
    document.getElementById("emptyState").style.display = "block";
}

/** Render a top-level error message. */
function renderError(message) {
    document.getElementById("servicesContainer").innerHTML = `
        <div class="empty-state">
            <p style="color: var(--brand-primary);">Error loading services: ${sanitize(message)}</p>
        </div>
    `;
}

// ==================== INITIALIZATION ====================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Wire up the Add Service button
document.getElementById("addServiceBtn").addEventListener("click", addService);

// Re-load when the variable is updated externally (e.g. by a UiPath workflow)
App.onVariableChange(CONFIG.variable, () => loadServices());

// Expose a refresh hook for UiPath Apps rules to call if needed
window.AccidentClaimsReview = { refresh: initApp };
