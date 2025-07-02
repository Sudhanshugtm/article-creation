// SnippetModal.ts
import { LeadTemplateEngine } from './LeadTemplateEngine';
import { WikidataTopic } from './WikidataService';
import { ArticleCategory } from './CategoryMapper';

export class SnippetModal {
  private modal: HTMLElement;
  private leadEngine: LeadTemplateEngine;
  private selectedLead: string = '';
  
  constructor(leadEngine: LeadTemplateEngine) {
    this.leadEngine = leadEngine;
    this.modal = document.getElementById('snippetModal')!;
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    const cancelBtn = document.getElementById('snippetCancelBtn');
    cancelBtn?.addEventListener('click', () => this.hide());
    
    // Close on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }
  
  async show(topic: WikidataTopic, category: ArticleCategory): Promise<string> {
    return new Promise(async (resolve) => {
      // Set title
      const titleElement = document.getElementById('snippetTitle');
      if (titleElement) {
        titleElement.textContent = topic.title;
      }
      
      // Generate lead variations
      const leads = await this.leadEngine.generateLeadVariations(topic, category);
      
      // Display cards
      const cardsContainer = document.getElementById('snippetSuggestionCards');
      if (cardsContainer) {
        cardsContainer.innerHTML = this.createLeadCards(leads);
        
        // Add click handlers to cards
        const cards = cardsContainer.querySelectorAll('.snippet-card');
        cards.forEach((card, index) => {
          card.addEventListener('click', () => {
            // Remove previous selection
            cards.forEach(c => c.classList.remove('selected'));
            // Add selection to clicked card
            card.classList.add('selected');
            
            // Get the lead text
            const leadTypes = ['formal', 'concise', 'detailed'];
            this.selectedLead = leads[leadTypes[index] as keyof typeof leads];
            
            // Auto-insert after selection
            setTimeout(() => {
              this.hide();
              resolve(this.selectedLead);
            }, 300);
          });
        });
      }
      
      // Show modal
      this.modal.style.display = 'flex';
    });
  }
  
  private createLeadCards(leads: { formal: string; concise: string; detailed: string }): string {
    return `
      <div class="snippet-card">
        <h3 class="snippet-card__title">
          <svg class="snippet-card__icon" width="20" height="20" viewBox="0 0 20 20">
            <path d="M7 1a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H7zm0 2h6v1H7V3zM4 6h12v1H4V6zm1 5v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5H5z"/>
          </svg>
          Professional
        </h3>
        <p class="snippet-card__content">${this.truncateText(leads.formal, 150)}</p>
        <div class="snippet-card__footer">
          <span class="snippet-card__length">${leads.formal.split(' ').length} words</span>
          <span class="snippet-card__label">Formal tone</span>
        </div>
      </div>
      
      <div class="snippet-card">
        <h3 class="snippet-card__title">
          <svg class="snippet-card__icon" width="20" height="20" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm2 2v10h12V5H4zm2 2h8v2H6V7zm0 4h5v2H6v-2z"/>
          </svg>
          Concise
        </h3>
        <p class="snippet-card__content">${leads.concise}</p>
        <div class="snippet-card__footer">
          <span class="snippet-card__length">${leads.concise.split(' ').length} words</span>
          <span class="snippet-card__label">Brief & clear</span>
        </div>
      </div>
      
      <div class="snippet-card">
        <h3 class="snippet-card__title">
          <svg class="snippet-card__icon" width="20" height="20" viewBox="0 0 20 20">
            <path d="M5 1a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H5zm0 3h10v12H5V4zm2 2v2h6V6H7zm0 4v2h6v-2H7zm0 4v2h4v-2H7z"/>
          </svg>
          Comprehensive
        </h3>
        <p class="snippet-card__content">${this.truncateText(leads.detailed, 150)}</p>
        <div class="snippet-card__footer">
          <span class="snippet-card__length">${leads.detailed.split(' ').length} words</span>
          <span class="snippet-card__label">Detailed coverage</span>
        </div>
      </div>
    `;
  }
  
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  hide() {
    this.modal.style.display = 'none';
    this.selectedLead = '';
  }
}
