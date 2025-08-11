var r=Object.defineProperty;var l=(s,e,i)=>e in s?r(s,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):s[e]=i;var c=(s,e,i)=>l(s,typeof e!="symbol"?e+"":e,i);import"./modulepreload-polyfill-B5Qt9EMX.js";import{W as g}from"./WikidataEnhancementService-2MvXLlqh.js";class d{constructor(){c(this,"addedContent",new Set);c(this,"wikidataService");c(this,"wikidataSuggestions",new Map);this.wikidataService=new g,this.initialize()}async initialize(){await this.loadWikidataSuggestions(),this.checkForAppliedSuggestions(),this.updateSuggestionCount()}async loadWikidataSuggestions(){try{const e=this.getExistingArticleContent();(await this.wikidataService.getEnhancementSuggestions(e)).forEach(n=>{this.wikidataSuggestions.set(n.id,n)})}catch(e){console.error("Error loading Wikidata suggestions:",e)}}getExistingArticleContent(){const e=document.getElementById("researchCareerContent");return(e==null?void 0:e.textContent)||""}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions"),i=sessionStorage.getItem("wikidataSuggestions");if(console.log("Checking for applied suggestions..."),console.log("Selected suggestions from storage:",e),console.log("Wikidata suggestions from storage:",i),e){if(i){const t=JSON.parse(i);console.log("Loading Wikidata suggestions:",t),t.forEach(o=>{this.wikidataSuggestions.set(o.id,o)})}const n=JSON.parse(e);console.log("Applying suggestions:",n),this.applySuggestions(n),sessionStorage.removeItem("selectedSuggestions"),sessionStorage.removeItem("wikidataSuggestions")}else console.log("No suggestions to apply")}applySuggestions(e){const i=[],n=[];e.forEach(t=>{const[o,a]=t.split("-");o==="fact"?i.push(a):o==="section"&&n.push(a)}),i.forEach(t=>{this.addFact(t)}),n.forEach(t=>{this.addSection(t)}),e.forEach(t=>{this.addedContent.add(t)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const n=document.getElementById("researchCareerContent").querySelector("p");console.log(`Adding fact: ${e}`);const t=this.wikidataSuggestions.get(e);if(t){const o=`<span class="fact-highlight"> ${t.content}</span>`;n.innerHTML+=o,console.log(`Added Wikidata fact: ${t.content}`);return}if(e==="harvard"){const o=n.innerHTML;n.innerHTML=o.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'),console.log("Added Harvard fact")}else if(e==="caltech"){const o=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',a=document.createElement("span");a.className="fact-highlight",a.innerHTML=o,n.appendChild(a),console.log("Added Caltech fact")}}addSection(e){const i=document.getElementById("newSectionsContainer");console.log(`Adding section: ${e}`),console.log("Available Wikidata suggestions:",Array.from(this.wikidataSuggestions.keys()));const n=this.wikidataSuggestions.get(e);if(n){console.log(`Found Wikidata suggestion for ${e}:`,n);const o=document.createElement("section");o.className="article-section article-section--new",o.innerHTML=`
                <h2 class="article-section__title">${n.title}</h2>
                <div class="article-section__content">
                    ${n.content}
                </div>
            `,i.appendChild(o),console.log(`Added Wikidata section: ${n.title}`);return}const t={awards:{title:"Awards",content:`<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
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
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`}};if(t[e]){console.log(`Found hardcoded content for ${e}: ${t[e].title}`);const o=document.createElement("section");o.className="article-section article-section--new",o.innerHTML=`
                <h2 class="article-section__title">${t[e].title}</h2>
                <div class="article-section__content">
                    ${t[e].content}
                </div>
            `,i.appendChild(o),console.log(`Added hardcoded section: ${t[e].title}`)}else console.warn(`No content found for section ID: ${e}`),console.log("Available hardcoded sections:",Object.keys(t))}updateSuggestionCount(){const n=6-this.addedContent.size,t=document.getElementById("suggestionCount");if(n>0)t.textContent=`${n} ideas`;else{t.textContent="All done!";const o=document.getElementById("smartWidgetTrigger");o.style.opacity="0.6"}}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
        `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new d});
