import{I as r}from"./WikidataEnhancementService-2MvXLlqh-CZaRwsxB.js";var l=Object.defineProperty,d=(s,e,t)=>e in s?l(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,a=(s,e,t)=>d(s,typeof e!="symbol"?e+"":e,t);class g{constructor(){a(this,"addedContent",new Set),a(this,"wikidataService"),a(this,"wikidataSuggestions",new Map),this.wikidataService=new r,this.initialize()}async initialize(){await this.loadWikidataSuggestions(),this.checkForAppliedSuggestions(),this.updateSuggestionCount()}async loadWikidataSuggestions(){try{const e=this.getExistingArticleContent();(await this.wikidataService.getEnhancementSuggestions(e)).forEach(t=>{this.wikidataSuggestions.set(t.id,t)})}catch(e){console.error("Error loading Wikidata suggestions:",e)}}getExistingArticleContent(){const e=document.getElementById("researchCareerContent");return(e==null?void 0:e.textContent)||""}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions"),t=sessionStorage.getItem("wikidataSuggestions");if(console.log("Checking for applied suggestions..."),console.log("Selected suggestions from storage:",e),console.log("Wikidata suggestions from storage:",t),e){if(t){const n=JSON.parse(t);console.log("Loading Wikidata suggestions:",n),n.forEach(i=>{this.wikidataSuggestions.set(i.id,i)})}const o=JSON.parse(e);console.log("Applying suggestions:",o),this.applySuggestions(o),sessionStorage.removeItem("selectedSuggestions"),sessionStorage.removeItem("wikidataSuggestions")}else console.log("No suggestions to apply")}applySuggestions(e){const t=[],o=[];e.forEach(n=>{const[i,c]=n.split("-");i==="fact"?t.push(c):i==="section"&&o.push(c)}),t.forEach(n=>{this.addFact(n)}),o.forEach(n=>{this.addSection(n)}),e.forEach(n=>{this.addedContent.add(n)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const t=document.getElementById("researchCareerContent").querySelector("p");console.log(`Adding fact: ${e}`);const o=this.wikidataSuggestions.get(e);if(o){const n=`<span class="fact-highlight"> ${o.content}</span>`;t.innerHTML+=n,console.log(`Added Wikidata fact: ${o.content}`);return}if(e==="harvard"){const n=t.innerHTML;t.innerHTML=n.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'),console.log("Added Harvard fact")}else if(e==="caltech"){const n=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',i=document.createElement("span");i.className="fact-highlight",i.innerHTML=n,t.appendChild(i),console.log("Added Caltech fact")}}addSection(e){const t=document.getElementById("newSectionsContainer");console.log(`Adding section: ${e}`),console.log("Available Wikidata suggestions:",Array.from(this.wikidataSuggestions.keys()));const o=this.wikidataSuggestions.get(e);if(o){console.log(`Found Wikidata suggestion for ${e}:`,o);const i=document.createElement("section");i.className="article-section article-section--new",i.innerHTML=`
                <h2 class="article-section__title">${o.title}</h2>
                <div class="article-section__content">
                    ${o.content}
                </div>
            `,t.appendChild(i),console.log(`Added Wikidata section: ${o.title}`);return}const n={awards:{title:"Awards",content:`<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
                <ul>
                    <li>2019 - Breakthrough Prize in Fundamental Physics (shared with EHT collaboration)</li>
                    <li>2020 - Diamond Achievement Award from Purdue University</li>
                    <li>2021 - Royal Photographic Society Progress Medal</li>
                    <li>2022 - Named to MIT Technology Review's Innovators Under 35</li>
                </ul>`},works:{title:"Notable Works",content:`<p>Bouman has published extensively in the fields of computational imaging and black hole visualization:</p>
                <ul>
                    <li>"Computational Imaging for VLBI Image Reconstruction" (2016) - PhD thesis</li>
                    <li>"CHIRP: Continuous High-resolution Image Reconstruction using Patch priors" (2016)</li>
                    <li>"First M87 Event Horizon Telescope Results" (2019) - series of papers with EHT collaboration</li>
                    <li>"Reconstructing Video from Interferometric Measurements of Time-Varying Sources" (2019)</li>
                </ul>`},education:{title:"Education",content:`<p>Bouman completed her education at prestigious institutions:</p>
                <ul>
                    <li>B.S. in Electrical Engineering - University of Michigan (2011)</li>
                    <li>M.S. in Electrical Engineering - Massachusetts Institute of Technology (2013)</li>
                    <li>Ph.D. in Electrical Engineering and Computer Science - Massachusetts Institute of Technology (2017)</li>
                </ul>
                <p>Her doctoral advisor was William T. Freeman, and her thesis focused on "Computational Imaging for VLBI Image Reconstruction".</p>`},personal:{title:"Personal life",content:`<p>Katie Bouman was born in 1989 in West Lafayette, Indiana. She grew up in an academic environment, with her father being a professor of electrical and computer engineering at Purdue University.</p>
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`}};if(n[e]){console.log(`Found hardcoded content for ${e}: ${n[e].title}`);const i=document.createElement("section");i.className="article-section article-section--new",i.innerHTML=`
                <h2 class="article-section__title">${n[e].title}</h2>
                <div class="article-section__content">
                    ${n[e].content}
                </div>
            `,t.appendChild(i),console.log(`Added hardcoded section: ${n[e].title}`)}else console.warn(`No content found for section ID: ${e}`),console.log("Available hardcoded sections:",Object.keys(n))}updateSuggestionCount(){const e=6-this.addedContent.size,t=document.getElementById("suggestionCount");if(e>0)t.textContent=`${e} ideas`;else{t.textContent="All done!";const o=document.getElementById("smartWidgetTrigger");o.style.opacity="0.6"}}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
        `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new g});
