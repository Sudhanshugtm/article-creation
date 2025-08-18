// ABOUTME: Dynamic sidebar functionality for article expansion system
// ABOUTME: Handles article selection, rich cards, responsive behavior, and suggestion application

// Article database with comprehensive suggestions
const articlesData = {
  'katie-bouman': {
    title: 'Katie Bouman',
    type: 'Biography',
    facts: [
      {
        id: 'mit-phd',
        icon: '🎓',
        text: 'She earned her PhD from MIT in electrical engineering and computer science in 2017.',
        why: 'Educational background provides important context for her expertise in computational imaging.'
      },
      {
        id: 'caltech-postdoc', 
        icon: '🏫',
        text: 'She joined Harvard University as a postdoctoral fellow in 2018.',
        why: 'Career progression shows her rapid advancement in academic research.'
      },
      {
        id: 'chirp-algorithm',
        icon: '🔬',
        text: 'She led development of the CHIRP algorithm for black hole imaging.',
        why: 'Her primary technical contribution that enabled the first black hole image.'
      },
      {
        id: 'ted-talk',
        icon: '🎤',
        text: 'Her 2016 TEDx talk "How to take a picture of a black hole" gained widespread attention.',
        why: 'Shows her early work in science communication before the discovery.'
      }
    ],
    sections: [
      {
        id: 'awards',
        icon: '🏆', 
        title: 'Awards and honors',
        why: 'Recognition section is standard for biography articles and shows impact of her work.',
        outline: ['BBC 100 Women (2019)', 'Nature\'s 10 people who shaped science (2019)', 'Sloan Research Fellowship (2024)']
      },
      {
        id: 'publications',
        icon: '📄',
        title: 'Selected publications', 
        why: 'Academic publications demonstrate her research contributions beyond the famous black hole image.',
        outline: ['Key papers on computational imaging', 'Event Horizon Telescope publications', 'Conference presentations']
      },
      {
        id: 'media',
        icon: '📺',
        title: 'Media appearances',
        why: 'Her public engagement and science communication work is significant for understanding her broader impact.',
        outline: ['Documentary appearances', 'Podcast interviews', 'News coverage and profiles']
      }
    ]
  },
  
  'john-langford': {
    title: 'John Langford',
    type: 'Biography', 
    facts: [
      {
        id: 'yahoo-research',
        icon: '🏢',
        text: 'He worked as a senior researcher at Yahoo Research from 2006 to 2012.',
        why: 'Industry experience complements his academic work and shows practical applications.'
      },
      {
        id: 'vowpal-wabbit',
        icon: '⚙️', 
        text: 'He created Vowpal Wabbit, an open-source machine learning system.',
        why: 'Major technical contribution that has influenced the ML community worldwide.'
      },
      {
        id: 'icml-program',
        icon: '🎓',
        text: 'He served as program chair for ICML (International Conference on Machine Learning) in 2012.',
        why: 'Leadership roles show his standing in the machine learning research community.'
      },
      {
        id: 'contextual-bandits',
        icon: '🔬',
        text: 'His research on contextual bandits has applications in personalization and recommendation systems.',
        why: 'Explains practical applications of his theoretical research contributions.'
      }
    ],
    sections: [
      {
        id: 'research',
        icon: '🔬',
        title: 'Research contributions',
        why: 'Academic biography should highlight major research areas and theoretical contributions.',
        outline: ['Online learning theory', 'Contextual bandit algorithms', 'Reduction approaches to ML']
      },
      {
        id: 'software',
        icon: '💻', 
        title: 'Software and tools',
        why: 'His open-source contributions have significant impact on the ML community.',
        outline: ['Vowpal Wabbit development', 'Other ML libraries', 'Research code and datasets']
      },
      {
        id: 'awards',
        icon: '🏆',
        title: 'Awards and recognition', 
        why: 'Professional recognition helps establish notability and career achievements.',
        outline: ['Academic awards', 'Industry recognition', 'Conference honors']
      }
    ]
  },

  'henri-gouraud': {
    title: 'Henri Gouraud',
    type: 'Biography',
    facts: [
      {
        id: 'utah-university',
        icon: '🏫',
        text: 'He completed his PhD at the University of Utah, a pioneer in computer graphics research.',
        why: 'Utah was the birthplace of many fundamental computer graphics techniques.'
      },
      {
        id: 'gouraud-shading',
        icon: '💡',
        text: 'Gouraud shading, named after him, became a standard technique in 3D graphics.',
        why: 'His primary contribution that revolutionized how 3D surfaces are rendered.'
      },
      {
        id: 'early-3d',
        icon: '🖥️', 
        text: 'His work in the 1970s laid groundwork for modern real-time 3D graphics.',
        why: 'Historical context shows how his early work enabled modern graphics technology.'
      },
      {
        id: 'french-origins',
        icon: '🇫🇷',
        text: 'Born in France, he brought European perspective to American computer graphics research.',
        why: 'International background adds context to his unique approach to graphics problems.'
      }
    ],
    sections: [
      {
        id: 'technique',
        icon: '⚙️',
        title: 'Gouraud shading technique',
        why: 'Detailed explanation of his famous technique is essential for a technical biography.',
        outline: ['Mathematical foundation', 'Implementation details', 'Comparison to other shading methods']
      },
      {
        id: 'legacy', 
        icon: '🌟',
        title: 'Legacy and impact',
        why: 'Shows how his work influenced later developments in computer graphics.',
        outline: ['Influence on modern GPUs', 'Applications in gaming', 'Evolution to advanced shading']
      },
      {
        id: 'publications',
        icon: '📚',
        title: 'Publications and papers',
        why: 'Academic work beyond the famous shading technique shows broader contributions.',
        outline: ['Thesis work', 'Conference papers', 'Technical reports']
      }
    ]
  },

  'eduardo-caianiello': {
    title: 'Eduardo Caianiello', 
    type: 'Biography',
    facts: [
      {
        id: 'theoretical-physics',
        icon: '⚛️',
        text: 'He was a theoretical physicist who made significant contributions to quantum field theory.',
        why: 'His physics background provided the mathematical foundation for his cybernetics work.'
      },
      {
        id: 'cybernetics-pioneer',
        icon: '🤖',
        text: 'He pioneered the application of mathematical methods to cybernetics and neural networks.',
        why: 'Bridge between physics and early AI research shows interdisciplinary innovation.'
      },
      {
        id: 'naples-university',
        icon: '🏛️',
        text: 'He was a professor at the University of Naples and founded its cybernetics institute.',
        why: 'Academic leadership role shows his institutional impact on the field.'
      },
      {
        id: 'combinatorial-method',
        icon: '🔢', 
        text: 'He developed combinatorial methods for analyzing neural network behavior.',
        why: 'Technical contribution that influenced early neural network theory.'
      }
    ],
    sections: [
      {
        id: 'physics-work',
        icon: '⚛️',
        title: 'Physics contributions',
        why: 'His work in theoretical physics provides important context for later cybernetics research.',
        outline: ['Quantum field theory work', 'Mathematical physics papers', 'Collaboration with physicists']
      },
      {
        id: 'cybernetics',
        icon: '🧠',
        title: 'Cybernetics research', 
        why: 'His primary area of later research that connects to modern AI and neural networks.',
        outline: ['Neural network theory', 'Mathematical models', 'Influence on modern AI']
      },
      {
        id: 'legacy',
        icon: '🌟',
        title: 'Scientific legacy',
        why: 'Shows continuing influence of his interdisciplinary approach to complex systems.',
        outline: ['Impact on AI research', 'Mathematical contributions', 'Institutional legacy']
      }
    ]
  },

  'patrick-mchale': {
    title: 'Patrick McHale', 
    type: 'Biography',
    facts: [
      {
        id: 'adventure-time',
        icon: '⚔️',
        text: 'He was a writer and storyboard artist for Adventure Time before creating Over the Garden Wall.',
        why: 'Career progression shows his development as a storyteller in animation.'
      },
      {
        id: 'emmy-winner',
        icon: '🏆',
        text: 'Over the Garden Wall won the Emmy Award for Outstanding Animated Program in 2015.',
        why: 'Major recognition demonstrates the critical success of his creative work.'
      },
      {
        id: 'art-school',
        icon: '🎨',
        text: 'He studied at California Institute of the Arts, known for training animation professionals.',
        why: 'Educational background at a prestigious animation school explains his technical skills.'
      },
      {
        id: 'folk-music',
        icon: '🎵',
        text: 'His work often incorporates folk music and Americana themes.',
        why: 'Artistic influences that distinguish his animation style and storytelling approach.'
      }
    ],
    sections: [
      {
        id: 'filmography',
        icon: '🎬',
        title: 'Filmography and works',
        why: 'Complete list of creative works is essential for entertainment industry biographies.',
        outline: ['Over the Garden Wall', 'Adventure Time episodes', 'Other animation projects']
      },
      {
        id: 'style',
        icon: '🎨',
        title: 'Artistic style and themes',
        why: 'Analysis of creative approach helps readers understand his unique contribution to animation.',
        outline: ['Visual storytelling techniques', 'Musical integration', 'Narrative themes']
      },
      {
        id: 'recognition',
        icon: '🌟',
        title: 'Awards and recognition',
        why: 'Industry recognition demonstrates peer acknowledgment of his creative achievements.',
        outline: ['Emmy Awards', 'Animation festival recognition', 'Critical reception']
      }
    ]
  }
};

// Get current article from session storage or URL
function getCurrentArticle() {
  // First check session storage
  const stored = sessionStorage.getItem('selectedArticle');
  if (stored && articlesData[stored]) {
    return stored;
  }
  
  // Fallback to URL-based detection or default
  const path = window.location.pathname;
  if (path.includes('sidebar')) {
    return 'katie-bouman'; // Default for sidebar concept
  }
  
  return 'katie-bouman';
}

// Populate article content dynamically
function populateArticleContent() {
  const currentArticle = getCurrentArticle();
  const data = articlesData[currentArticle];
  
  if (!data) return;
  
  // Update page title and headings
  document.title = `${data.title} — Wikipedia`;
  const titleElements = document.querySelectorAll('#pageTitle, #articleTitle, #articleTitleVE');
  titleElements.forEach(el => {
    if (el) el.textContent = data.title;
  });
  
  // Update article content
  const articleBody = document.getElementById('articleBody');
  if (articleBody && currentArticle === 'katie-bouman') {
    articleBody.innerHTML = `
      <div class="article-section">
        <div class="article-section__content">
          <p><strong>Katherine Louise "Katie" Bouman</strong> is an American computer scientist working in the field of computational imaging. She is known for her work on the Event Horizon Telescope project, which resulted in the first direct image of a black hole.</p>
          
          <p>Bouman was born in 1989 in West Lafayette, Indiana. She received her undergraduate degree from the University of Michigan in 2011, where she studied electrical engineering and computer science.</p>
          
          <p>During her graduate studies at MIT, Bouman developed computational methods for radio interferometry, with applications to the Event Horizon Telescope. Her PhD thesis, completed in 2017, focused on "Extreme Imaging via Physical Model Inversion."</p>
        </div>
      </div>
      
      <div class="article-section">
        <h2 class="article-section__title">Career</h2>
        <div class="article-section__content">
          <p>After completing her PhD, Bouman became an assistant professor at the California Institute of Technology. Her research focuses on computational imaging, computer vision, and machine learning.</p>
          
          <p>She has been involved in developing new techniques for capturing images from minimal information, with applications ranging from medical imaging to astrophysics.</p>
        </div>
      </div>
      
      <div id="newSectionsContainer"></div>
    `;
  }
}

// Populate sidebar suggestions with rich cards
function populateSidebarSuggestions() {
  const currentArticle = getCurrentArticle();
  const data = articlesData[currentArticle];
  
  if (!data) return;
  
  const factsList = document.getElementById('factSuggestions');
  const sectionsList = document.getElementById('sectionSuggestions');
  
  if (factsList) {
    factsList.innerHTML = data.facts.map(fact => `
      <li class="expand-suggestion">
        <div class="expand-suggestion__card">
          <div class="expand-suggestion__icon">${fact.icon}</div>
          <div class="expand-suggestion__content">
            <div class="expand-suggestion__text">${fact.text}</div>
            <div class="expand-suggestion__why">
              <strong>Why this helps:</strong> ${fact.why}
            </div>
          </div>
          <button class="expand-suggestion__action" data-type="fact" data-id="${fact.id}">
            Add
          </button>
        </div>
      </li>
    `).join('');
  }
  
  if (sectionsList) {
    sectionsList.innerHTML = data.sections.map(section => `
      <li class="expand-suggestion">
        <div class="expand-suggestion__card">
          <div class="expand-suggestion__icon">${section.icon}</div>
          <div class="expand-suggestion__content">
            <div class="expand-suggestion__title">${section.title}</div>
            <div class="expand-suggestion__why">
              <strong>Why this helps:</strong> ${section.why}
            </div>
            <div class="expand-suggestion__outline">
              <strong>What to include:</strong>
              <ul>
                ${section.outline.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
          <button class="expand-suggestion__action" data-type="section" data-id="${section.id}">
            Add
          </button>
        </div>
      </li>
    `).join('');
  }
}

// Show expand sidebar with responsive behavior
function showExpandSidebar() {
  const sidebar = document.getElementById('expandSidebar');
  if (!sidebar) return;
  
  // Populate suggestions for current article
  populateSidebarSuggestions();
  
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
  
  // Add backdrop click to close
  const backdrop = document.querySelector('.expand-sidebar');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        hideExpandSidebar();
      }
    });
  }
}

// Hide expand sidebar
function hideExpandSidebar() {
  const sidebar = document.getElementById('expandSidebar');
  if (sidebar) {
    sidebar.style.display = 'none';
  }
}

// Apply suggestion with visual feedback
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
  
  // Update button state
  button.textContent = 'Added ✓';
  button.disabled = true;
  button.style.opacity = '0.6';
  button.style.background = '#00af89';
  button.style.color = 'white';
}

// Add fact to article with highlighting
function addFact(factId) {
  const currentArticle = getCurrentArticle();
  const data = articlesData[currentArticle];
  const fact = data.facts.find(f => f.id === factId);
  
  if (!fact) return;
  
  const articleBody = document.getElementById('articleBody');
  const firstSection = articleBody?.querySelector('.article-section .article-section__content');
  
  if (!firstSection) return;
  
  const span = document.createElement('span');
  span.className = 'fact-highlight';
  span.textContent = ` ${fact.text}`;
  span.style.cssText = `
    background: linear-gradient(120deg, #fffacd 0%, #fff9c4 100%);
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #f0e68c;
    animation: highlight-fade 3s ease;
  `;
  
  const lastParagraph = firstSection.querySelector('p:last-child');
  if (lastParagraph) {
    lastParagraph.appendChild(span);
  }
}

// Add section to article with formatting
function addSection(sectionId) {
  const currentArticle = getCurrentArticle();
  const data = articlesData[currentArticle];
  const sectionData = data.sections.find(s => s.id === sectionId);
  
  if (!sectionData) return;
  
  const container = document.getElementById('newSectionsContainer') || 
                   document.getElementById('articleBody');
  
  if (!container) return;
  
  const section = document.createElement('section');
  section.className = 'article-section article-section--new';
  section.style.cssText = `
    background: linear-gradient(135deg, #f8fffe 0%, #f0f9ff 100%);
    border: 1px solid #3366cc;
    border-radius: 6px;
    padding: 20px;
    margin: 24px 0;
    animation: section-slide-in 0.5s ease;
    position: relative;
  `;
  
  // Generate section content based on type
  let content = '';
  if (sectionId === 'awards' && currentArticle === 'katie-bouman') {
    content = `
      <p>Bouman has received recognition for her contributions to computational imaging and astrophysics:</p>
      <ul>
        <li><strong>BBC 100 Women (2019)</strong> - Named one of 100 inspiring and influential women</li>
        <li><strong>Nature's 10 (2019)</strong> - Listed among ten people who shaped science</li>
        <li><strong>Sloan Research Fellowship (2024)</strong> - Early career recognition in computer science</li>
      </ul>
    `;
  } else if (sectionId === 'publications' && currentArticle === 'katie-bouman') {
    content = `
      <p>Key publications in computational imaging and astrophysics:</p>
      <ul>
        <li>"Computational Imaging for VLBI Image Reconstruction" (2016)</li>
        <li>"First M87 Event Horizon Telescope Results" (2019) - Co-author</li>
        <li>"CHIRP: A Population Synthesis Approach to Imaging" (2017)</li>
      </ul>
    `;
  } else {
    content = `
      <p>Content for ${sectionData.title} section would include:</p>
      <ul>
        ${sectionData.outline.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }
  
  section.innerHTML = `
    <div class="section-new-badge">New</div>
    <h2 class="article-section__title">${sectionData.title}</h2>
    <div class="article-section__content">
      ${content}
    </div>
  `;
  
  // Add badge styles
  const badge = section.querySelector('.section-new-badge');
  if (badge) {
    badge.style.cssText = `
      position: absolute;
      top: -8px;
      right: 12px;
      background: #00af89;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    `;
  }
  
  container.appendChild(section);
}

// Show success feedback toast
function showSuccessFeedback(message) {
  const feedback = document.createElement('div');
  feedback.className = 'success-feedback';
  feedback.innerHTML = `
    <div class="success-icon">✓</div>
    <div class="success-text">${message}</div>
  `;
  
  feedback.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #00af89 0%, #00956e 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 175, 137, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: successSlide 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'successSlide 0.3s ease reverse';
    setTimeout(() => feedback.remove(), 300);
  }, 2500);
}

// Responsive auto-open behavior
function initResponsiveBehavior() {
  const expandButtons = document.querySelectorAll('#expandArticleBtn, #expandArticleBtnMobile');
  
  expandButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if desktop (>768px) and auto-open
      const isDesktop = window.innerWidth > 768;
      
      if (isDesktop) {
        // Desktop: auto-open sidebar
        showExpandSidebar();
      } else {
        // Mobile: always manual trigger
        showExpandSidebar();
      }
    });
  });
  
  // Auto-open on desktop if not already opened
  const isDesktop = window.innerWidth > 768;
  const hasOpened = sessionStorage.getItem('sidebarOpened');
  
  if (isDesktop && !hasOpened) {
    // Small delay to let page load
    setTimeout(() => {
      showExpandSidebar();
      sessionStorage.setItem('sidebarOpened', 'true');
    }, 1500);
  }
  
  // Reset session storage on page reload
  window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('sidebarOpened');
  });
}

// Add CSS animations
function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes highlight-fade {
      0% { background: #ffeb3b; transform: scale(1.05); }
      50% { background: #fff9c4; }
      100% { background: #fffacd; transform: scale(1); }
    }
    
    @keyframes section-slide-in {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    @keyframes successSlide {
      from { 
        opacity: 0; 
        transform: translate(-50%, 20px); 
      }
      to { 
        opacity: 1; 
        transform: translate(-50%, 0); 
      }
    }
    
    .expand-suggestion__card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid #eaecf0;
      border-radius: 6px;
      margin-bottom: 12px;
      background: #ffffff;
      transition: all 0.2s ease;
    }
    
    .expand-suggestion__card:hover {
      border-color: #3366cc;
      box-shadow: 0 2px 8px rgba(51, 102, 204, 0.1);
    }
    
    .expand-suggestion__icon {
      font-size: 1.25rem;
      margin-top: 2px;
    }
    
    .expand-suggestion__content {
      flex: 1;
    }
    
    .expand-suggestion__text,
    .expand-suggestion__title {
      font-weight: 500;
      color: #202122;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .expand-suggestion__why {
      font-size: 0.875rem;
      color: #54595d;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .expand-suggestion__outline {
      font-size: 0.875rem;
      color: #54595d;
    }
    
    .expand-suggestion__outline ul {
      margin: 4px 0 0 0;
      padding-left: 20px;
    }
    
    .expand-suggestion__outline li {
      margin-bottom: 2px;
    }
    
    .expand-suggestion__action {
      background: #3366cc;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      cursor: pointer;
      transition: background 0.2s ease;
      align-self: flex-start;
      margin-top: 4px;
    }
    
    .expand-suggestion__action:hover:not(:disabled) {
      background: #2a4b8d;
    }
  `;
  document.head.appendChild(style);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  populateArticleContent();
  initResponsiveBehavior();
  addCustomStyles();
});

// Make functions globally available
window.showExpandSidebar = showExpandSidebar;
window.hideExpandSidebar = hideExpandSidebar;