import"./modulepreload-polyfill-B5Qt9EMX.js";function m(){const e=document.getElementById("editTab");document.getElementById("editTabVE");const t=document.getElementById("readingContent"),o=document.getElementById("veInterface");e&&e.addEventListener("click",()=>{t&&(t.style.display="none"),o&&(o.style.display="block"),g()}),document.querySelectorAll(".action-tab:first-child").forEach(i=>{i.textContent.trim()==="Read"&&i.addEventListener("click",()=>{o&&(o.style.display="none"),t&&(t.style.display="block")})}),y()}function g(){const e=document.getElementById("editor");if(!e||e.hasAttribute("data-initialized"))return;e.setAttribute("data-initialized","true");const t=new Quill("#editor",{theme:"snow",modules:{toolbar:!1},placeholder:"Start editing the article..."});t.root.innerHTML=`
    <p><strong>Katherine Louise "Katie" Bouman</strong> is an American computer scientist working in the field of computational imaging. She is known for her work on the Event Horizon Telescope project, which resulted in the first direct image of a black hole.</p>
    
    <p>Bouman was born in 1989 in West Lafayette, Indiana. She received her undergraduate degree from the University of Michigan in 2011, where she studied electrical engineering and computer science.</p>
    
    <p>During her graduate studies at MIT, Bouman developed computational methods for radio interferometry, with applications to the Event Horizon Telescope.</p>
  `,f(t)}function f(e){var n,i,a;(n=document.getElementById("undo"))==null||n.addEventListener("click",()=>{e.history.undo()}),(i=document.getElementById("undo-desktop"))==null||i.addEventListener("click",()=>{e.history.undo()}),(a=document.getElementById("redo"))==null||a.addEventListener("click",()=>{e.history.redo()}),document.querySelectorAll("[data-style]").forEach(s=>{s.addEventListener("click",c=>{c.preventDefault();const r=s.getAttribute("data-style"),h=e.getSelection();h&&(r==="bold"&&e.format("bold",!0),r==="italic"&&e.format("italic",!0),r==="underline"&&e.format("underline",!0),r==="clean"&&e.removeFormat(h.index,h.length))})}),document.querySelectorAll("[data-cmd]").forEach(s=>{s.addEventListener("click",c=>{c.preventDefault();const r=s.getAttribute("data-cmd");r==="ol"&&e.format("list","ordered"),r==="ul"&&e.format("list","bullet")})})}function y(){const e=document.querySelectorAll(".dropdown");e.forEach(t=>{const o=t.querySelector(".menu");o&&(t.addEventListener("click",n=>{n.preventDefault(),e.forEach(i=>{if(i!==t){const a=i.querySelector(".menu");a&&(a.style.display="none")}}),o.style.display=o.style.display==="block"?"none":"block"}),document.addEventListener("click",n=>{t.contains(n.target)||(o.style.display="none")}))})}function b(){const e=document.getElementById("publish");e&&e.addEventListener("click",()=>{e.textContent="Publishing...",e.disabled=!0,setTimeout(()=>{e.textContent="Published ✓",setTimeout(()=>{e.textContent="Publish",e.disabled=!1},2e3)},1e3)})}document.addEventListener("DOMContentLoaded",()=>{m(),b()});const d={"katie-bouman":{title:"Katie Bouman",type:"Biography",facts:[{id:"mit-phd",icon:"🎓",text:"She earned her PhD from MIT in electrical engineering and computer science in 2017.",why:"Educational background provides important context for her expertise in computational imaging."},{id:"caltech-postdoc",icon:"🏫",text:"She joined Harvard University as a postdoctoral fellow in 2018.",why:"Career progression shows her rapid advancement in academic research."},{id:"chirp-algorithm",icon:"🔬",text:"She led development of the CHIRP algorithm for black hole imaging.",why:"Her primary technical contribution that enabled the first black hole image."},{id:"ted-talk",icon:"🎤",text:'Her 2016 TEDx talk "How to take a picture of a black hole" gained widespread attention.',why:"Shows her early work in science communication before the discovery."}],sections:[{id:"awards",icon:"🏆",title:"Awards and honors",why:"Recognition section is standard for biography articles and shows impact of her work.",outline:["BBC 100 Women (2019)","Nature's 10 people who shaped science (2019)","Sloan Research Fellowship (2024)"]},{id:"publications",icon:"📄",title:"Selected publications",why:"Academic publications demonstrate her research contributions beyond the famous black hole image.",outline:["Key papers on computational imaging","Event Horizon Telescope publications","Conference presentations"]},{id:"media",icon:"📺",title:"Media appearances",why:"Her public engagement and science communication work is significant for understanding her broader impact.",outline:["Documentary appearances","Podcast interviews","News coverage and profiles"]}]},"john-langford":{title:"John Langford",type:"Biography",facts:[{id:"yahoo-research",icon:"🏢",text:"He worked as a senior researcher at Yahoo Research from 2006 to 2012.",why:"Industry experience complements his academic work and shows practical applications."},{id:"vowpal-wabbit",icon:"⚙️",text:"He created Vowpal Wabbit, an open-source machine learning system.",why:"Major technical contribution that has influenced the ML community worldwide."},{id:"icml-program",icon:"🎓",text:"He served as program chair for ICML (International Conference on Machine Learning) in 2012.",why:"Leadership roles show his standing in the machine learning research community."},{id:"contextual-bandits",icon:"🔬",text:"His research on contextual bandits has applications in personalization and recommendation systems.",why:"Explains practical applications of his theoretical research contributions."}],sections:[{id:"research",icon:"🔬",title:"Research contributions",why:"Academic biography should highlight major research areas and theoretical contributions.",outline:["Online learning theory","Contextual bandit algorithms","Reduction approaches to ML"]},{id:"software",icon:"💻",title:"Software and tools",why:"His open-source contributions have significant impact on the ML community.",outline:["Vowpal Wabbit development","Other ML libraries","Research code and datasets"]},{id:"awards",icon:"🏆",title:"Awards and recognition",why:"Professional recognition helps establish notability and career achievements.",outline:["Academic awards","Industry recognition","Conference honors"]}]},"henri-gouraud":{title:"Henri Gouraud",type:"Biography",facts:[{id:"utah-university",icon:"🏫",text:"He completed his PhD at the University of Utah, a pioneer in computer graphics research.",why:"Utah was the birthplace of many fundamental computer graphics techniques."},{id:"gouraud-shading",icon:"💡",text:"Gouraud shading, named after him, became a standard technique in 3D graphics.",why:"His primary contribution that revolutionized how 3D surfaces are rendered."},{id:"early-3d",icon:"🖥️",text:"His work in the 1970s laid groundwork for modern real-time 3D graphics.",why:"Historical context shows how his early work enabled modern graphics technology."},{id:"french-origins",icon:"🇫🇷",text:"Born in France, he brought European perspective to American computer graphics research.",why:"International background adds context to his unique approach to graphics problems."}],sections:[{id:"technique",icon:"⚙️",title:"Gouraud shading technique",why:"Detailed explanation of his famous technique is essential for a technical biography.",outline:["Mathematical foundation","Implementation details","Comparison to other shading methods"]},{id:"legacy",icon:"🌟",title:"Legacy and impact",why:"Shows how his work influenced later developments in computer graphics.",outline:["Influence on modern GPUs","Applications in gaming","Evolution to advanced shading"]},{id:"publications",icon:"📚",title:"Publications and papers",why:"Academic work beyond the famous shading technique shows broader contributions.",outline:["Thesis work","Conference papers","Technical reports"]}]},"eduardo-caianiello":{title:"Eduardo Caianiello",type:"Biography",facts:[{id:"theoretical-physics",icon:"⚛️",text:"He was a theoretical physicist who made significant contributions to quantum field theory.",why:"His physics background provided the mathematical foundation for his cybernetics work."},{id:"cybernetics-pioneer",icon:"🤖",text:"He pioneered the application of mathematical methods to cybernetics and neural networks.",why:"Bridge between physics and early AI research shows interdisciplinary innovation."},{id:"naples-university",icon:"🏛️",text:"He was a professor at the University of Naples and founded its cybernetics institute.",why:"Academic leadership role shows his institutional impact on the field."},{id:"combinatorial-method",icon:"🔢",text:"He developed combinatorial methods for analyzing neural network behavior.",why:"Technical contribution that influenced early neural network theory."}],sections:[{id:"physics-work",icon:"⚛️",title:"Physics contributions",why:"His work in theoretical physics provides important context for later cybernetics research.",outline:["Quantum field theory work","Mathematical physics papers","Collaboration with physicists"]},{id:"cybernetics",icon:"🧠",title:"Cybernetics research",why:"His primary area of later research that connects to modern AI and neural networks.",outline:["Neural network theory","Mathematical models","Influence on modern AI"]},{id:"legacy",icon:"🌟",title:"Scientific legacy",why:"Shows continuing influence of his interdisciplinary approach to complex systems.",outline:["Impact on AI research","Mathematical contributions","Institutional legacy"]}]},"patrick-mchale":{title:"Patrick McHale",type:"Biography",facts:[{id:"adventure-time",icon:"⚔️",text:"He was a writer and storyboard artist for Adventure Time before creating Over the Garden Wall.",why:"Career progression shows his development as a storyteller in animation."},{id:"emmy-winner",icon:"🏆",text:"Over the Garden Wall won the Emmy Award for Outstanding Animated Program in 2015.",why:"Major recognition demonstrates the critical success of his creative work."},{id:"art-school",icon:"🎨",text:"He studied at California Institute of the Arts, known for training animation professionals.",why:"Educational background at a prestigious animation school explains his technical skills."},{id:"folk-music",icon:"🎵",text:"His work often incorporates folk music and Americana themes.",why:"Artistic influences that distinguish his animation style and storytelling approach."}],sections:[{id:"filmography",icon:"🎬",title:"Filmography and works",why:"Complete list of creative works is essential for entertainment industry biographies.",outline:["Over the Garden Wall","Adventure Time episodes","Other animation projects"]},{id:"style",icon:"🎨",title:"Artistic style and themes",why:"Analysis of creative approach helps readers understand his unique contribution to animation.",outline:["Visual storytelling techniques","Musical integration","Narrative themes"]},{id:"recognition",icon:"🌟",title:"Awards and recognition",why:"Industry recognition demonstrates peer acknowledgment of his creative achievements.",outline:["Emmy Awards","Animation festival recognition","Critical reception"]}]}};function u(){const e=sessionStorage.getItem("selectedArticle");return e&&d[e]?e:(window.location.pathname.includes("sidebar"),"katie-bouman")}function w(){const e=u(),t=d[e];if(!t)return;document.title=`${t.title} — Wikipedia`,document.querySelectorAll("#pageTitle, #articleTitle, #articleTitleVE").forEach(i=>{i&&(i.textContent=t.title)});const n=document.getElementById("articleBody");n&&e==="katie-bouman"&&(n.innerHTML=`
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
    `)}function x(){const e=u(),t=d[e];if(!t)return;const o=document.getElementById("factSuggestions"),n=document.getElementById("sectionSuggestions");o&&(o.innerHTML=t.facts.map(i=>`
      <li class="expand-suggestion">
        <div class="expand-suggestion__card">
          <div class="expand-suggestion__icon">${i.icon}</div>
          <div class="expand-suggestion__content">
            <div class="expand-suggestion__text">${i.text}</div>
            <div class="expand-suggestion__why">
              <strong>Why this helps:</strong> ${i.why}
            </div>
          </div>
          <button class="expand-suggestion__action" data-type="fact" data-id="${i.id}">
            Add
          </button>
        </div>
      </li>
    `).join("")),n&&(n.innerHTML=t.sections.map(i=>`
      <li class="expand-suggestion">
        <div class="expand-suggestion__card">
          <div class="expand-suggestion__icon">${i.icon}</div>
          <div class="expand-suggestion__content">
            <div class="expand-suggestion__title">${i.title}</div>
            <div class="expand-suggestion__why">
              <strong>Why this helps:</strong> ${i.why}
            </div>
            <div class="expand-suggestion__outline">
              <strong>What to include:</strong>
              <ul>
                ${i.outline.map(a=>`<li>${a}</li>`).join("")}
              </ul>
            </div>
          </div>
          <button class="expand-suggestion__action" data-type="section" data-id="${i.id}">
            Add
          </button>
        </div>
      </li>
    `).join(""))}function l(){const e=document.getElementById("expandSidebar");if(!e)return;x(),e.style.display="block";const t=document.getElementById("sidebarClose");t&&t.addEventListener("click",p),document.querySelectorAll(".expand-suggestion__action").forEach(i=>{i.addEventListener("click",v)});const n=document.querySelector(".expand-sidebar");n&&n.addEventListener("click",i=>{i.target===n&&p()})}function p(){const e=document.getElementById("expandSidebar");e&&(e.style.display="none")}function v(e){const t=e.target,o=t.getAttribute("data-type"),n=t.getAttribute("data-id");o==="fact"?k(n):o==="section"&&E(n),_(`Added ${o}: ${n}`),t.textContent="Added ✓",t.disabled=!0,t.style.opacity="0.6",t.style.background="#00af89",t.style.color="white"}function k(e){const t=u(),n=d[t].facts.find(r=>r.id===e);if(!n)return;const i=document.getElementById("articleBody"),a=i==null?void 0:i.querySelector(".article-section .article-section__content");if(!a)return;const s=document.createElement("span");s.className="fact-highlight",s.textContent=` ${n.text}`,s.style.cssText=`
    background: linear-gradient(120deg, #fffacd 0%, #fff9c4 100%);
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #f0e68c;
    animation: highlight-fade 3s ease;
  `;const c=a.querySelector("p:last-child");c&&c.appendChild(s)}function E(e){const t=u(),n=d[t].sections.find(r=>r.id===e);if(!n)return;const i=document.getElementById("newSectionsContainer")||document.getElementById("articleBody");if(!i)return;const a=document.createElement("section");a.className="article-section article-section--new",a.style.cssText=`
    background: linear-gradient(135deg, #f8fffe 0%, #f0f9ff 100%);
    border: 1px solid #3366cc;
    border-radius: 6px;
    padding: 20px;
    margin: 24px 0;
    animation: section-slide-in 0.5s ease;
    position: relative;
  `;let s="";e==="awards"&&t==="katie-bouman"?s=`
      <p>Bouman has received recognition for her contributions to computational imaging and astrophysics:</p>
      <ul>
        <li><strong>BBC 100 Women (2019)</strong> - Named one of 100 inspiring and influential women</li>
        <li><strong>Nature's 10 (2019)</strong> - Listed among ten people who shaped science</li>
        <li><strong>Sloan Research Fellowship (2024)</strong> - Early career recognition in computer science</li>
      </ul>
    `:e==="publications"&&t==="katie-bouman"?s=`
      <p>Key publications in computational imaging and astrophysics:</p>
      <ul>
        <li>"Computational Imaging for VLBI Image Reconstruction" (2016)</li>
        <li>"First M87 Event Horizon Telescope Results" (2019) - Co-author</li>
        <li>"CHIRP: A Population Synthesis Approach to Imaging" (2017)</li>
      </ul>
    `:s=`
      <p>Content for ${n.title} section would include:</p>
      <ul>
        ${n.outline.map(r=>`<li>${r}</li>`).join("")}
      </ul>
    `,a.innerHTML=`
    <div class="section-new-badge">New</div>
    <h2 class="article-section__title">${n.title}</h2>
    <div class="article-section__content">
      ${s}
    </div>
  `;const c=a.querySelector(".section-new-badge");c&&(c.style.cssText=`
      position: absolute;
      top: -8px;
      right: 12px;
      background: #00af89;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    `),i.appendChild(a)}function _(e){const t=document.createElement("div");t.className="success-feedback",t.innerHTML=`
    <div class="success-icon">✓</div>
    <div class="success-text">${e}</div>
  `,t.style.cssText=`
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
  `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="successSlide 0.3s ease reverse",setTimeout(()=>t.remove(),300)},2500)}function B(){document.querySelectorAll("#expandArticleBtn, #expandArticleBtnMobile").forEach(n=>{n.addEventListener("click",i=>{i.preventDefault();const a=window.innerWidth>768;l()})});const t=window.innerWidth>768,o=sessionStorage.getItem("sidebarOpened");t&&!o&&setTimeout(()=>{l(),sessionStorage.setItem("sidebarOpened","true")},1500),window.addEventListener("beforeunload",()=>{sessionStorage.removeItem("sidebarOpened")})}function A(){const e=document.createElement("style");e.textContent=`
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
  `,document.head.appendChild(e)}document.addEventListener("DOMContentLoaded",()=>{w(),B(),A()});window.showExpandSidebar=l;window.hideExpandSidebar=p;
