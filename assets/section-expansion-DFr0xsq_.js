var u=Object.defineProperty;var h=(c,e,i)=>e in c?u(c,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):c[e]=i;var l=(c,e,i)=>h(c,typeof e!="symbol"?e+"":e,i);import"./modulepreload-polyfill-B5Qt9EMX.js";import{W as p}from"./WikidataEnhancementService-DbWP4Spv.js";/* empty css              *//* empty css                          */class f{constructor(){l(this,"addedContent",new Set);l(this,"wikidataService");l(this,"wikidataSuggestions",new Map);this.wikidataService=new p,this.initialize()}async initialize(){this.checkForAppliedSuggestions(),this.updateSuggestionCount(),this.loadWikidataSuggestionsWithTimeout(3e3).catch(()=>{})}async loadWikidataSuggestionsWithTimeout(e){const i=new Promise(t=>setTimeout(t,e));try{await Promise.race([this.loadWikidataSuggestions(),i])}catch{}}async loadWikidataSuggestions(){try{const e=this.getExistingArticleContent();(await this.wikidataService.getEnhancementSuggestions(e)).forEach(t=>{this.wikidataSuggestions.set(t.id,t)})}catch(e){console.error("Error loading Wikidata suggestions:",e)}}getExistingArticleContent(){const e=document.querySelectorAll(".article-section .article-section__content");let i="";return e.forEach(t=>{i+=t.textContent+" "}),i.trim()}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions"),i=sessionStorage.getItem("wikidataSuggestions");if(console.log("Checking for applied suggestions..."),console.log("Selected suggestions from storage:",e),console.log("Wikidata suggestions from storage:",i),e){if(i){const n=JSON.parse(i);console.log("Loading Wikidata suggestions:",n),n.forEach(o=>{this.wikidataSuggestions.set(o.id,o)})}const t=JSON.parse(e);console.log("Applying suggestions:",t),this.applySuggestions(t),sessionStorage.removeItem("selectedSuggestions"),sessionStorage.removeItem("wikidataSuggestions")}else console.log("No suggestions to apply")}applySuggestions(e){const i=[],t=[];e.forEach(n=>{const o=n.indexOf("-");if(o===-1)return;const a=n.slice(0,o),s=n.slice(o+1);a==="fact"?i.push(s):a==="section"&&t.push(s)}),i.forEach(n=>{this.addFact(n)}),t.forEach(n=>{this.addSection(n)}),e.forEach(n=>{this.addedContent.add(n)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const t=document.getElementById("researchCareerContent").querySelector("p");console.log(`Adding fact: ${e}`);const n=this.wikidataSuggestions.get(e);if(n){const o=`<span class="fact-highlight"> ${n.content}</span>`;t.innerHTML+=o,console.log(`Added Wikidata fact: ${n.content}`);return}if(e==="harvard"){const o=t.innerHTML;t.innerHTML=o.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'),console.log("Added Harvard fact")}else if(e==="caltech"){const o=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',a=document.createElement("span");a.className="fact-highlight",a.innerHTML=o,t.appendChild(a),console.log("Added Caltech fact")}}addSection(e){const i=document.getElementById("newSectionsContainer");console.log(`Adding section: ${e}`),console.log("Available Wikidata suggestions:",Array.from(this.wikidataSuggestions.keys()));let t=this.wikidataSuggestions.get(e);if(!t&&e.endsWith("-section")){const s=e.replace(/-section$/,"");t=this.wikidataSuggestions.get(s)||this.wikidataSuggestions.get(`${s}-section`)}if(!t){const d=(e.endsWith("-section")?e.replace(/-section$/,""):e).replace(/-/g," ").toLowerCase();for(const r of this.wikidataSuggestions.values())if((r==null?void 0:r.type)==="section"){const g=(r.title||"").toLowerCase();if(g===d||g.includes(d)||d.includes(g)){t=r;break}}}if(t){console.log(`Found Wikidata suggestion for ${e}:`,t);const s=document.createElement("section");s.className="article-section article-section--new",s.innerHTML=`
                <h2 class="article-section__title">${t.title}</h2>
                <div class="article-section__content">
                    ${t.content}
                </div>
            `,i.appendChild(s),console.log(`Added Wikidata section: ${t.title}`);return}const n=this.getSelectedArticleTitle(),o={awards:{title:"Awards",content:`<p>${n} has received recognition for contributions in their field:</p>
                <ul>
                    <li>Year – Award or honor</li>
                    <li>Year – Award or honor</li>
                    <li>Year – Award or honor</li>
                </ul>`},works:{title:"Notable works",content:`<p>Selected works and publications by ${n}:</p>
                <ul>
                    <li>Year – Work title</li>
                    <li>Year – Work title</li>
                    <li>Year – Work title</li>
                </ul>`},education:{title:"Education",content:`<p>Educational background for ${n}:</p>
                <ul>
                    <li>Degree or program – Institution (Year)</li>
                    <li>Degree or program – Institution (Year)</li>
                </ul>`},personal:{title:"Personal life",content:`<p>Personal background and notable life details for ${n}.</p>`},career:{title:"Career",content:`<p>Notable roles, appointments, and positions held by ${n} across academia and industry.</p>`},research:{title:"Research contributions",content:`<p>Key areas of research focus and significant contributions by ${n}.</p>`},legacy:{title:"Legacy",content:`<p>Long-term impact, influence, and recognition of ${n} within their field.</p>`},"early-life":{title:"Early life",content:`<p>Background, upbringing, and formative experiences of ${n} leading to later career and research interests.</p>`}},a=e.endsWith("-section")?e.replace(/-section$/,""):e;if(o[a]){console.log(`Found hardcoded content for ${a}: ${o[a].title}`);const s=document.createElement("section");s.className="article-section article-section--new",s.innerHTML=`
                <h2 class="article-section__title">${o[a].title}</h2>
                <div class="article-section__content">
                    ${o[a].content}
                </div>
            `,i.appendChild(s),console.log(`Added hardcoded section: ${o[a].title}`)}else console.warn(`No content found for section ID: ${e}`),console.log("Available hardcoded sections:",Object.keys(o))}getSelectedArticleTitle(){try{const e=sessionStorage.getItem("selectedArticle");if(!e)return"This topic";const i=JSON.parse(e);return(i==null?void 0:i.title)||"This topic"}catch{return"This topic"}}updateSuggestionCount(){const e=document.getElementById("suggestionCount");e&&e.parentElement&&e.parentElement.removeChild(e)}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
        `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new f});
