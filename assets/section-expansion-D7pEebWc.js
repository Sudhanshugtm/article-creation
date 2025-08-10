var r=Object.defineProperty;var l=(o,e,s)=>e in o?r(o,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):o[e]=s;var c=(o,e,s)=>l(o,typeof e!="symbol"?e+"":e,s);import"./codex-BYAibwde.js";import{W as d}from"./WikidataEnhancementService-D8EZ4RgJ.js";class g{constructor(){c(this,"addedContent",new Set);c(this,"wikidataService");c(this,"wikidataSuggestions",new Map);this.wikidataService=new d,this.initialize()}async initialize(){await this.loadWikidataSuggestions(),this.checkForAppliedSuggestions(),this.updateSuggestionCount()}async loadWikidataSuggestions(){try{const e=this.getExistingArticleContent();(await this.wikidataService.getEnhancementSuggestions(e)).forEach(n=>{this.wikidataSuggestions.set(n.id,n)})}catch(e){console.error("Error loading Wikidata suggestions:",e)}}getExistingArticleContent(){const e=document.getElementById("researchCareerContent");return(e==null?void 0:e.textContent)||""}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions"),s=sessionStorage.getItem("wikidataSuggestions");if(e){s&&JSON.parse(s).forEach(t=>{this.wikidataSuggestions.set(t.id,t)});const n=JSON.parse(e);this.applySuggestions(n),sessionStorage.removeItem("selectedSuggestions"),sessionStorage.removeItem("wikidataSuggestions")}}applySuggestions(e){const s=[],n=[];e.forEach(i=>{const[t,a]=i.split("-");t==="fact"?s.push(a):t==="section"&&n.push(a)}),s.forEach(i=>{this.addFact(i)}),n.forEach(i=>{this.addSection(i)}),e.forEach(i=>{this.addedContent.add(i)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const n=document.getElementById("researchCareerContent").querySelector("p"),i=this.wikidataSuggestions.get(e);if(i){const t=`<span class="fact-highlight"> ${i.content}</span>`;n.innerHTML+=t;return}if(e==="harvard-fallback"){const t=n.innerHTML;n.innerHTML=t.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>')}else if(e==="caltech-fallback"){const t=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',a=n.innerHTML;n.innerHTML=a.replace("</sup></p>",'</sup><span class="fact-highlight">'+t+"</span></p>")}}addSection(e){const s=document.getElementById("newSectionsContainer"),n=this.wikidataSuggestions.get(e);if(n){const t=document.createElement("section");t.className="article-section article-section--new",t.innerHTML=`
                <h2 class="article-section__title">${n.title}</h2>
                <div class="article-section__content">
                    ${n.content}
                </div>
            `,s.appendChild(t);return}const i={awards:{title:"Awards",content:`<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
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
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`}};if(i[e]){const t=document.createElement("section");t.className="article-section article-section--new",t.innerHTML=`
                <h2 class="article-section__title">${i[e].title}</h2>
                <div class="article-section__content">
                    ${i[e].content}
                </div>
            `,s.appendChild(t)}}updateSuggestionCount(){const n=6-this.addedContent.size,i=document.getElementById("suggestionCount");if(n>0)i.textContent=`${n} ideas`;else{i.textContent="All done!";const t=document.getElementById("smartWidgetTrigger");t.style.opacity="0.6"}}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
