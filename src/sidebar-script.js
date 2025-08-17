// ABOUTME: JavaScript for sidebar concept in article expansion
// ABOUTME: Handles sidebar show/hide and suggestion application

function showExpandSidebar() {
    const sidebar = document.getElementById('expandSidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
        
        // Add event listeners
        const closeBtn = document.getElementById('sidebarClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideExpandSidebar);
        }
        
        // Add suggestion action listeners
        const actionButtons = document.querySelectorAll('.expand-suggestion__action');
        actionButtons.forEach(button => {
            button.addEventListener('click', applySuggestion);
        });
    }
}

function hideExpandSidebar() {
    const sidebar = document.getElementById('expandSidebar');
    if (sidebar) {
        sidebar.style.display = 'none';
    }
}

function applySuggestion(event) {
    const button = event.target;
    const type = button.getAttribute('data-type');
    const id = button.getAttribute('data-id');
    
    if (type === 'fact') {
        addFact(id);
    } else if (type === 'section') {
        addSection(id);
    }
    
    // Show success feedback
    showSuccessFeedback(`Added ${type}: ${id}`);
    
    // Disable the button
    button.textContent = 'Added';
    button.disabled = true;
    button.style.opacity = '0.6';
}

function addFact(factId) {
    const articleBody = document.getElementById('articleBody');
    const firstSection = articleBody.querySelector('.article-section .article-section__content');
    
    if (!firstSection) return;
    
    let factText = '';
    switch (factId) {
        case 'harvard':
            factText = ' She joined Harvard University as a postdoctoral fellow in 2018.';
            break;
        case 'caltech':
            factText = ' In 2019, she became an assistant professor at the California Institute of Technology.';
            break;
    }
    
    if (factText) {
        const span = document.createElement('span');
        span.className = 'fact-highlight';
        span.textContent = factText;
        span.style.backgroundColor = '#fffacd';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '2px';
        
        const lastParagraph = firstSection.querySelector('p:last-child');
        if (lastParagraph) {
            lastParagraph.appendChild(span);
        }
    }
}

function addSection(sectionId) {
    const container = document.getElementById('newSectionsContainer') || 
                     document.getElementById('articleBody');
    
    if (!container) return;
    
    let sectionData = {};
    switch (sectionId) {
        case 'awards':
            sectionData = {
                title: 'Awards and honors',
                content: '<p>Recognition and achievements in the field of computer science and imaging:</p><ul><li>BBC 100 Women (2019)</li><li>Sloan Research Fellowship (2024)</li></ul>'
            };
            break;
        case 'works':
            sectionData = {
                title: 'Notable works',
                content: '<p>Key publications and contributions:</p><ul><li>CHIRP algorithm for black hole imaging</li><li>Event Horizon Telescope project contributions</li></ul>'
            };
            break;
    }
    
    if (sectionData.title) {
        const section = document.createElement('section');
        section.className = 'article-section article-section--new';
        section.style.backgroundColor = '#f8f9fa';
        section.style.border = '1px solid #a2a9b1';
        section.style.borderRadius = '4px';
        section.style.padding = '16px';
        section.style.margin = '16px 0';
        
        section.innerHTML = `
            <h2 class="article-section__title">${sectionData.title}</h2>
            <div class="article-section__content">
                ${sectionData.content}
            </div>
        `;
        
        container.appendChild(section);
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

// Make functions globally available
window.showExpandSidebar = showExpandSidebar;
window.hideExpandSidebar = hideExpandSidebar;