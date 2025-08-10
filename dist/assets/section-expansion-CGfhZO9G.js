var r=Object.defineProperty;var l=(s,e,n)=>e in s?r(s,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):s[e]=n;var c=(s,e,n)=>l(s,typeof e!="symbol"?e+"":e,n);import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */class d{constructor(){c(this,"addedContent",new Set);this.checkForAppliedSuggestions(),this.updateSuggestionCount()}checkForAppliedSuggestions(){const e=sessionStorage.getItem("selectedSuggestions");if(e){const n=JSON.parse(e);this.applySuggestions(n),sessionStorage.removeItem("selectedSuggestions")}}applySuggestions(e){const n=[],o=[];e.forEach(t=>{const[i,a]=t.split("-");i==="fact"?n.push(a):i==="section"&&o.push(a)}),n.forEach(t=>{this.addFact(t)}),o.forEach(t=>{this.addSection(t)}),e.forEach(t=>{this.addedContent.add(t)}),this.updateSuggestionCount(),this.showSuccessFeedback()}addFact(e){const n=document.getElementById("researchCareerContent"),o=n.querySelector("p");if(e==="harvard"){const t=o.innerHTML;o.innerHTML=t.replace("on the Event Horizon Telescope Imaging team",'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>')}else if(e==="caltech"){const t=' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>',i=n.querySelector("p"),a=i.innerHTML;i.innerHTML=a.replace("</sup></p>",'</sup><span class="fact-highlight">'+t+"</span></p>")}}addSection(e){const n=document.getElementById("newSectionsContainer"),o={awards:{title:"Awards",content:`<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
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
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`}};if(o[e]){const t=document.createElement("section");t.className="article-section article-section--new",t.innerHTML=`
                <h2 class="article-section__title">${o[e].title}</h2>
                <div class="article-section__content">
                    ${o[e].content}
                </div>
            `,n.appendChild(t)}}updateSuggestionCount(){const o=6-this.addedContent.size,t=document.getElementById("suggestionCount");if(o>0)t.textContent=`${o} ideas`;else{t.textContent="All done!";const i=document.getElementById("smartWidgetTrigger");i.style.opacity="0.6"}}showSuccessFeedback(){const e=document.createElement("div");e.className="success-feedback",e.textContent="✓ Changes applied successfully!",e.style.cssText=`
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
