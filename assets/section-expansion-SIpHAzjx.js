var r=Object.defineProperty;var l=(s,e,o)=>e in s?r(s,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):s[e]=o;var c=(s,e,o)=>l(s,typeof e!="symbol"?e+"":e,o);import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{W as d}from"./WikidataEnhancementService-D8EZ4RgJ.js";class g{constructor(){c(this,"addedContent",new Set);c(this,"wikidataService");c(this,"wikidataSuggestions",new Map);this.wikidataService=new d,this.checkForAppliedSuggestions(),this.updateSuggestionCount(),this.loadWikidataSuggestions()}async loadWikidataSuggestions(){try{const e=this.getExistingArticleContent();(await this.wikidataService.getEnhancementSuggestions(e)).forEach(t=>{this.wikidataSuggestions.set(t.id,t)})}catch(e){console.error("Error loading Wikidata suggestions:",e)}}getExistingArticleContent(){const e=document.getElementById("researchCareerContent");return(e==null?void 0:e.textContent)||""}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions");if(e){const o=JSON.parse(e);this.applySuggestions(o),sessionStorage.removeItem("selectedSuggestions")}}applySuggestions(e){const o=[],t=[];e.forEach(i=>{const[n,a]=i.split("-");n==="fact"?o.push(a):n==="section"&&t.push(a)}),o.forEach(i=>{this.addFact(i)}),t.forEach(i=>{this.addSection(i)}),e.forEach(i=>{this.addedContent.add(i)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const t=document.getElementById("researchCareerContent").querySelector("p"),i=this.wikidataSuggestions.get(e);if(i){const n=`<span class="fact-highlight"> ${i.content}</span>`;t.innerHTML+=n;return}if(e==="harvard-fallback"){const n=t.innerHTML;t.innerHTML=n.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>')}else if(e==="caltech-fallback"){const n=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',a=t.innerHTML;t.innerHTML=a.replace("</sup></p>",'</sup><span class="fact-highlight">'+n+"</span></p>")}}addSection(e){const o=document.getElementById("newSectionsContainer"),t=this.wikidataSuggestions.get(e);if(t){const n=document.createElement("section");n.className="article-section article-section--new",n.innerHTML=`
                <h2 class="article-section__title">${t.title}</h2>
                <div class="article-section__content">
                    ${t.content}
                </div>
            `,o.appendChild(n);return}const i={awards:{title:"Awards",content:`<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
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
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`}};if(i[e]){const n=document.createElement("section");n.className="article-section article-section--new",n.innerHTML=`
                <h2 class="article-section__title">${i[e].title}</h2>
                <div class="article-section__content">
                    ${i[e].content}
                </div>
            `,o.appendChild(n)}}updateSuggestionCount(){const t=6-this.addedContent.size,i=document.getElementById("suggestionCount");if(t>0)i.textContent=`${t} ideas`;else{i.textContent="All done!";const n=document.getElementById("smartWidgetTrigger");n.style.opacity="0.6"}}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
