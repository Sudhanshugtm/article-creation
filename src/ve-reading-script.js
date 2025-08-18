// ABOUTME: VE reading mode functionality for article content display
// ABOUTME: Handles switching between reading and editing modes in Visual Editor interface

// Initialize VE interface functionality
function initVEInterface() {
  // Handle edit tab clicks
  const editTab = document.getElementById('editTab');
  const editTabVE = document.getElementById('editTabVE');
  const readingContent = document.getElementById('readingContent');
  const veInterface = document.getElementById('veInterface');

  // Switch to edit mode
  if (editTab) {
    editTab.addEventListener('click', () => {
      if (readingContent) readingContent.style.display = 'none';
      if (veInterface) veInterface.style.display = 'block';
      initQuillEditor();
    });
  }

  // Handle back to reading mode (when clicking Read tab in VE)
  const readTabs = document.querySelectorAll('.action-tab:first-child');
  readTabs.forEach(tab => {
    if (tab.textContent.trim() === 'Read') {
      tab.addEventListener('click', () => {
        if (veInterface) veInterface.style.display = 'none';
        if (readingContent) readingContent.style.display = 'block';
      });
    }
  });

  // Initialize dropdown menus
  initDropdownMenus();
}

// Initialize Quill editor for VE mode
function initQuillEditor() {
  const editorContainer = document.getElementById('editor');
  if (!editorContainer) return;

  // Only initialize once
  if (editorContainer.hasAttribute('data-initialized')) return;
  editorContainer.setAttribute('data-initialized', 'true');

  // Sample content for the editor
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: false // We use our custom toolbar
    },
    placeholder: 'Start editing the article...'
  });

  // Set some default content
  quill.root.innerHTML = `
    <p><strong>Katherine Louise "Katie" Bouman</strong> is an American computer scientist working in the field of computational imaging. She is known for her work on the Event Horizon Telescope project, which resulted in the first direct image of a black hole.</p>
    
    <p>Bouman was born in 1989 in West Lafayette, Indiana. She received her undergraduate degree from the University of Michigan in 2011, where she studied electrical engineering and computer science.</p>
    
    <p>During her graduate studies at MIT, Bouman developed computational methods for radio interferometry, with applications to the Event Horizon Telescope.</p>
  `;

  // Handle toolbar buttons
  handleToolbarButtons(quill);
}

// Handle VE toolbar button interactions
function handleToolbarButtons(quill) {
  // Undo/Redo
  document.getElementById('undo')?.addEventListener('click', () => {
    quill.history.undo();
  });
  
  document.getElementById('undo-desktop')?.addEventListener('click', () => {
    quill.history.undo();
  });

  document.getElementById('redo')?.addEventListener('click', () => {
    quill.history.redo();
  });

  // Text formatting
  const formatButtons = document.querySelectorAll('[data-style]');
  formatButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const format = button.getAttribute('data-style');
      const range = quill.getSelection();
      
      if (range) {
        if (format === 'bold') quill.format('bold', true);
        if (format === 'italic') quill.format('italic', true);
        if (format === 'underline') quill.format('underline', true);
        if (format === 'clean') quill.removeFormat(range.index, range.length);
      }
    });
  });

  // List buttons
  const listButtons = document.querySelectorAll('[data-cmd]');
  listButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = button.getAttribute('data-cmd');
      
      if (cmd === 'ol') quill.format('list', 'ordered');
      if (cmd === 'ul') quill.format('list', 'bullet');
    });
  });
}

// Initialize dropdown menus
function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.menu');
    if (!menu) return;

    dropdown.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Close other dropdowns
      dropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
          const otherMenu = otherDropdown.querySelector('.menu');
          if (otherMenu) otherMenu.style.display = 'none';
        }
      });

      // Toggle current dropdown
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  });
}

// Handle publish button
function initPublishButton() {
  const publishBtn = document.getElementById('publish');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      // Mock publish functionality
      publishBtn.textContent = 'Publishing...';
      publishBtn.disabled = true;
      
      setTimeout(() => {
        publishBtn.textContent = 'Published ✓';
        setTimeout(() => {
          publishBtn.textContent = 'Publish';
          publishBtn.disabled = false;
        }, 2000);
      }, 1000);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initVEInterface();
  initPublishButton();
});