// ABOUTME: JavaScript for wizard concept in article expansion
// ABOUTME: Handles 3-step guided section wizard with inline compose

let currentWizardStep = 1;
let wizardState = {
    selectedSection: null,
    sources: [],
    insertedSectionPosition: null
};

function openSectionWizard() {
    const wizard = document.getElementById('sectionWizard');
    if (wizard) {
        resetWizardState();
        wizard.style.display = 'block';
        setTimeout(() => {
            wizard.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeSectionWizard() {
    const wizard = document.getElementById('sectionWizard');
    if (wizard) {
        wizard.classList.remove('show');
        setTimeout(() => {
            wizard.style.display = 'none';
            resetWizardState();
        }, 300);
        document.body.style.overflow = '';
    }
}

function resetWizardState() {
    currentWizardStep = 1;
    wizardState = {
        selectedSection: null,
        sources: [],
        insertedSectionPosition: null
    };
    
    showWizardStep(1);
    
    // Clear all card selections
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear sources
    const sourcesList = document.getElementById('sourcesList');
    if (sourcesList) {
        sourcesList.innerHTML = '';
    }
    
    updateWizardButtons();
}

function showWizardStep(stepNumber) {
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.style.display = 'none';
    });
    
    const currentStep = document.getElementById(`step${stepNumber}`);
    if (currentStep) {
        currentStep.style.display = 'block';
    }
    
    document.querySelectorAll('.stepper-item').forEach((item, index) => {
        if (index + 1 === stepNumber) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    currentWizardStep = stepNumber;
    updateWizardButtons();
}

function updateWizardButtons() {
    const backBtn = document.getElementById('wizardBack');
    const skipBtn = document.getElementById('wizardSkip');
    const continueBtn = document.getElementById('wizardContinue');
    const insertBtn = document.getElementById('wizardInsert');
    
    if (backBtn) {
        backBtn.style.display = currentWizardStep > 1 ? 'inline-block' : 'none';
    }
    
    if (skipBtn) {
        skipBtn.style.display = currentWizardStep === 2 ? 'inline-block' : 'none';
    }
    
    if (continueBtn) {
        continueBtn.style.display = currentWizardStep < 3 ? 'inline-block' : 'none';
        
        if (currentWizardStep === 1) {
            continueBtn.disabled = !wizardState.selectedSection;
        } else if (currentWizardStep === 2) {
            continueBtn.disabled = false;
        }
    }
    
    if (insertBtn) {
        insertBtn.style.display = currentWizardStep === 3 ? 'inline-block' : 'none';
        insertBtn.disabled = false;
    }
}

function proceedToNextStep() {
    if (currentWizardStep === 1) {
        const selectedCard = document.querySelector('.section-card.selected');
        if (selectedCard) {
            wizardState.selectedSection = selectedCard.querySelector('.section-card-title').textContent;
        }
        
        // Insert section immediately
        insertSectionIntoArticle();
        
        // Update displays
        document.querySelectorAll('.chosen-section-name').forEach(span => {
            span.textContent = wizardState.selectedSection;
        });
        
        showWizardStep(2);
        
    } else if (currentWizardStep === 2) {
        // Show source palette if we have sources
        if (wizardState.sources.length > 0) {
            showSourcePalette();
        }
        
        runReviewChecks();
        showWizardStep(3);
    }
}

function goBackStep() {
    if (currentWizardStep > 1) {
        showWizardStep(currentWizardStep - 1);
    }
}

function skipStep() {
    if (currentWizardStep === 2) {
        const sourcesNudge = document.getElementById('sourcesNudge');
        if (sourcesNudge && wizardState.sources.length === 0) {
            sourcesNudge.style.display = 'block';
        }
        proceedToNextStep();
    }
}

function insertSectionIntoArticle() {
    const container = document.getElementById('newSectionsContainer') || 
                     document.getElementById('articleBody');
    
    if (!container) return;
    
    const section = document.createElement('section');
    section.className = 'article-section article-section--new';
    section.id = 'new-section-' + Date.now();
    section.style.backgroundColor = '#f8f9fa';
    section.style.border = '2px solid #0645ad';
    section.style.borderRadius = '4px';
    section.style.padding = '16px';
    section.style.margin = '16px 0';
    
    section.innerHTML = `
        <h2 class="article-section__title">${wizardState.selectedSection}</h2>
        <div class="article-section__content">
            <p contenteditable="true" style="min-height: 2em; border: 1px dashed #a2a9b1; padding: 8px; border-radius: 2px;">
                Start writing about ${wizardState.selectedSection}...
            </p>
        </div>
    `;
    
    container.appendChild(section);
    
    // Focus the editable area
    const editableArea = section.querySelector('[contenteditable]');
    if (editableArea) {
        editableArea.focus();
        
        // Select placeholder text
        const range = document.createRange();
        range.selectNodeContents(editableArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    wizardState.insertedSectionPosition = section.id;
}

function addSourceToList() {
    const urlInput = document.getElementById('sourceUrlInput');
    const sourcesList = document.getElementById('sourcesList');
    
    if (!urlInput || !sourcesList || !urlInput.value.trim()) return;
    
    const url = urlInput.value.trim();
    
    const exampleSentences = [
        `${wizardState.selectedSection} has been recognized for significant contributions.`,
        `Recent developments in ${wizardState.selectedSection} have gained attention.`,
        `The impact of ${wizardState.selectedSection} continues to influence research.`
    ];
    
    const sourceItem = document.createElement('div');
    sourceItem.className = 'source-item';
    sourceItem.innerHTML = `
        <div class="source-url">${url}</div>
        <div class="source-statements">
            ${exampleSentences.map(sentence => `
                <div class="example-sentence">
                    ${sentence} <span class="citation-note">(will add a citation)</span>
                </div>
            `).join('')}
        </div>
    `;
    
    sourcesList.appendChild(sourceItem);
    
    wizardState.sources.push({
        url: url,
        sentences: exampleSentences
    });
    
    urlInput.value = '';
    
    const sourcesNudge = document.getElementById('sourcesNudge');
    if (sourcesNudge) {
        sourcesNudge.style.display = 'none';
    }
    
    updateWizardButtons();
}

function showSourcePalette() {
    const palette = document.getElementById('sourcePalette');
    const paletteContent = document.getElementById('sourcePaletteContent');
    
    if (!palette || !paletteContent) return;
    
    let statementsHTML = '';
    wizardState.sources.forEach((source, sourceIndex) => {
        source.sentences.forEach((sentence, sentenceIndex) => {
            statementsHTML += `
                <div class="source-statement-item" data-source="${sourceIndex}" data-sentence="${sentenceIndex}">
                    <div class="source-statement-text">${sentence}</div>
                    <div class="source-statement-citation">[${sourceIndex + 1}]</div>
                </div>
            `;
        });
    });
    
    paletteContent.innerHTML = statementsHTML;
    palette.style.display = 'block';
    setTimeout(() => {
        palette.classList.add('show');
    }, 10);
}

function hideSourcePalette() {
    const palette = document.getElementById('sourcePalette');
    if (!palette) return;
    
    palette.classList.remove('show');
    setTimeout(() => {
        palette.style.display = 'none';
    }, 300);
}

function runReviewChecks() {
    const reviewChecks = document.getElementById('reviewChecks');
    
    if (!reviewChecks) return;
    
    let warnings = [];
    
    if (wizardState.sources.length === 0) {
        warnings.push({
            icon: '📚',
            title: 'No sources provided',
            text: 'Consider adding reliable sources to support your content.'
        });
    }
    
    let warningsHTML = '';
    warnings.forEach(warning => {
        warningsHTML += `
            <div class="review-issue">
                <div class="review-issue-icon">${warning.icon}</div>
                <div class="review-issue-content">
                    <div class="review-issue-title">${warning.title}</div>
                    <div class="review-issue-text">${warning.text}</div>
                </div>
            </div>
        `;
    });
    
    reviewChecks.innerHTML = warnings.length > 0 ? warningsHTML : 
        '<p style="color: #00af89; font-weight: 500;">✓ No issues found. Ready to finish!</p>';
}

function finishSection() {
    showSuccessFeedback(`Section "${wizardState.selectedSection}" added successfully!`);
    hideSourcePalette();
    closeSectionWizard();
}

function insertTextAtCursor(text) {
    const editableSection = document.getElementById(wizardState.insertedSectionPosition);
    if (editableSection) {
        const editableArea = editableSection.querySelector('[contenteditable]');
        if (editableArea) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text + ' '));
                range.collapse(false);
            } else {
                editableArea.textContent += text + ' ';
            }
        }
    }
}

function showSuccessFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';
    feedback.textContent = `✓ ${message}`;
    feedback.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        background: #00af89;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
        z-index: 1000;
        animation: fadeInOut 3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Widget trigger
    const smartWidget = document.getElementById('smartWidget');
    if (smartWidget) {
        smartWidget.addEventListener('click', openSectionWizard);
    }
    
    // Wizard close buttons
    const wizardClose = document.getElementById('wizardClose');
    if (wizardClose) {
        wizardClose.addEventListener('click', closeSectionWizard);
    }
    
    const wizardCancel = document.getElementById('wizardCancel');
    if (wizardCancel) {
        wizardCancel.addEventListener('click', closeSectionWizard);
    }
    
    // Wizard navigation
    const wizardContinue = document.getElementById('wizardContinue');
    if (wizardContinue) {
        wizardContinue.addEventListener('click', proceedToNextStep);
    }
    
    const wizardBack = document.getElementById('wizardBack');
    if (wizardBack) {
        wizardBack.addEventListener('click', goBackStep);
    }
    
    const wizardSkip = document.getElementById('wizardSkip');
    if (wizardSkip) {
        wizardSkip.addEventListener('click', skipStep);
    }
    
    const wizardInsert = document.getElementById('wizardInsert');
    if (wizardInsert) {
        wizardInsert.addEventListener('click', finishSection);
    }
    
    // Source palette close
    const sourcePaletteClose = document.getElementById('sourcePaletteClose');
    if (sourcePaletteClose) {
        sourcePaletteClose.addEventListener('click', hideSourcePalette);
    }
    
    // Section card selection
    document.addEventListener('click', (e) => {
        if (e.target.closest('.section-card')) {
            const card = e.target.closest('.section-card');
            
            document.querySelectorAll('.section-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            wizardState.selectedSection = card.querySelector('.section-card-title').textContent;
            updateWizardButtons();
        }
        
        if (e.target.id === 'addSourceBtn') {
            addSourceToList();
        }
        
        if (e.target.closest('.source-statement-item')) {
            const item = e.target.closest('.source-statement-item');
            const text = item.querySelector('.source-statement-text').textContent;
            insertTextAtCursor(text);
        }
    });
    
    // Source URL input enter key
    document.addEventListener('keydown', (e) => {
        if (e.target.id === 'sourceUrlInput' && e.key === 'Enter') {
            e.preventDefault();
            addSourceToList();
        }
        
        if (e.key === 'Escape') {
            const wizard = document.getElementById('sectionWizard');
            if (wizard && wizard.classList.contains('show')) {
                closeSectionWizard();
            }
        }
    });
    
    // Backdrop click
    const wizardBackdrop = document.querySelector('.wizard-backdrop');
    if (wizardBackdrop) {
        wizardBackdrop.addEventListener('click', closeSectionWizard);
    }
});

// Make functions globally available
window.openSectionWizard = openSectionWizard;
window.closeSectionWizard = closeSectionWizard;