import"./modulepreload-polyfill-B5Qt9EMX.js";import"./ve-reading-script-C64JI2pR.js";let c=1,i={selectedSection:null,sources:[],insertedSectionPosition:null};function w(){const e=document.getElementById("sectionWizard");e&&(S(),e.style.display="block",setTimeout(()=>{e.classList.add("show")},10),document.body.style.overflow="hidden")}function u(){const e=document.getElementById("sectionWizard");e&&(e.classList.remove("show"),setTimeout(()=>{e.style.display="none",S()},300),document.body.style.overflow="")}function S(){c=1,i={selectedSection:null,sources:[],insertedSectionPosition:null},m(1),document.querySelectorAll(".section-card").forEach(t=>{t.classList.remove("selected")});const e=document.getElementById("sourcesList");e&&(e.innerHTML=""),f()}function m(e){document.querySelectorAll(".wizard-step").forEach(n=>{n.style.display="none"});const t=document.getElementById(`step${e}`);t&&(t.style.display="block"),document.querySelectorAll(".stepper-item").forEach((n,s)=>{s+1===e?n.classList.add("active"):n.classList.remove("active")}),c=e,f()}function f(){const e=document.getElementById("wizardBack"),t=document.getElementById("wizardSkip"),n=document.getElementById("wizardContinue"),s=document.getElementById("wizardInsert");e&&(e.style.display=c>1?"inline-block":"none"),t&&(t.style.display=c===2?"inline-block":"none"),n&&(n.style.display=c<3?"inline-block":"none",c===1?n.disabled=!i.selectedSection:c===2&&(n.disabled=!1)),s&&(s.style.display=c===3?"inline-block":"none",s.disabled=!1)}function E(){if(c===1){const e=document.querySelector(".section-card.selected");e&&(i.selectedSection=e.querySelector(".section-card-title").textContent),b(),document.querySelectorAll(".chosen-section-name").forEach(t=>{t.textContent=i.selectedSection}),m(2)}else c===2&&(i.sources.length>0&&z(),I(),m(3))}function k(){c>1&&m(c-1)}function B(){if(c===2){const e=document.getElementById("sourcesNudge");e&&i.sources.length===0&&(e.style.display="block"),E()}}function b(){const e=document.getElementById("newSectionsContainer")||document.getElementById("articleBody");if(!e)return;const t=document.createElement("section");t.className="article-section article-section--new",t.id="new-section-"+Date.now(),t.style.backgroundColor="#f8f9fa",t.style.border="2px solid #0645ad",t.style.borderRadius="4px",t.style.padding="16px",t.style.margin="16px 0",t.innerHTML=`
        <h2 class="article-section__title">${i.selectedSection}</h2>
        <div class="article-section__content">
            <p contenteditable="true" style="min-height: 2em; border: 1px dashed #a2a9b1; padding: 8px; border-radius: 2px;">
                Start writing about ${i.selectedSection}...
            </p>
        </div>
    `,e.appendChild(t);const n=t.querySelector("[contenteditable]");if(n){n.focus();const s=document.createRange();s.selectNodeContents(n);const o=window.getSelection();o.removeAllRanges(),o.addRange(s)}i.insertedSectionPosition=t.id}function v(){const e=document.getElementById("sourceUrlInput"),t=document.getElementById("sourcesList");if(!e||!t||!e.value.trim())return;const n=e.value.trim(),s=[`${i.selectedSection} has been recognized for significant contributions.`,`Recent developments in ${i.selectedSection} have gained attention.`,`The impact of ${i.selectedSection} continues to influence research.`],o=document.createElement("div");o.className="source-item",o.innerHTML=`
        <div class="source-url">${n}</div>
        <div class="source-statements">
            ${s.map(a=>`
                <div class="example-sentence">
                    ${a} <span class="citation-note">(will add a citation)</span>
                </div>
            `).join("")}
        </div>
    `,t.appendChild(o),i.sources.push({url:n,sentences:s}),e.value="";const l=document.getElementById("sourcesNudge");l&&(l.style.display="none"),f()}function z(){const e=document.getElementById("sourcePalette"),t=document.getElementById("sourcePaletteContent");if(!e||!t)return;let n="";i.sources.forEach((s,o)=>{s.sentences.forEach((l,a)=>{n+=`
                <div class="source-statement-item" data-source="${o}" data-sentence="${a}">
                    <div class="source-statement-text">${l}</div>
                    <div class="source-statement-citation">[${o+1}]</div>
                </div>
            `})}),t.innerHTML=n,e.style.display="block",setTimeout(()=>{e.classList.add("show")},10)}function h(){const e=document.getElementById("sourcePalette");e&&(e.classList.remove("show"),setTimeout(()=>{e.style.display="none"},300))}function I(){const e=document.getElementById("reviewChecks");if(!e)return;let t=[];i.sources.length===0&&t.push({icon:"📚",title:"No sources provided",text:"Consider adding reliable sources to support your content."});let n="";t.forEach(s=>{n+=`
            <div class="review-issue">
                <div class="review-issue-icon">${s.icon}</div>
                <div class="review-issue-content">
                    <div class="review-issue-title">${s.title}</div>
                    <div class="review-issue-text">${s.text}</div>
                </div>
            </div>
        `}),e.innerHTML=t.length>0?n:'<p style="color: #00af89; font-weight: 500;">✓ No issues found. Ready to finish!</p>'}function L(){x(`Section "${i.selectedSection}" added successfully!`),h(),u()}function C(e){const t=document.getElementById(i.insertedSectionPosition);if(t){const n=t.querySelector("[contenteditable]");if(n){const s=window.getSelection();if(s.rangeCount>0){const o=s.getRangeAt(0);o.deleteContents(),o.insertNode(document.createTextNode(e+" ")),o.collapse(!1)}else n.textContent+=e+" "}}}function x(e){const t=document.createElement("div");t.className="success-feedback",t.textContent=`✓ ${e}`,t.style.cssText=`
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
    `,document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}document.addEventListener("DOMContentLoaded",function(){const e=document.getElementById("smartWidget");e&&e.addEventListener("click",w);const t=document.getElementById("wizardClose");t&&t.addEventListener("click",u);const n=document.getElementById("wizardCancel");n&&n.addEventListener("click",u);const s=document.getElementById("wizardContinue");s&&s.addEventListener("click",E);const o=document.getElementById("wizardBack");o&&o.addEventListener("click",k);const l=document.getElementById("wizardSkip");l&&l.addEventListener("click",B);const a=document.getElementById("wizardInsert");a&&a.addEventListener("click",L);const p=document.getElementById("sourcePaletteClose");p&&p.addEventListener("click",h),document.addEventListener("click",d=>{if(d.target.closest(".section-card")){const r=d.target.closest(".section-card");document.querySelectorAll(".section-card").forEach(y=>y.classList.remove("selected")),r.classList.add("selected"),i.selectedSection=r.querySelector(".section-card-title").textContent,f()}if(d.target.id==="addSourceBtn"&&v(),d.target.closest(".source-statement-item")){const y=d.target.closest(".source-statement-item").querySelector(".source-statement-text").textContent;C(y)}}),document.addEventListener("keydown",d=>{if(d.target.id==="sourceUrlInput"&&d.key==="Enter"&&(d.preventDefault(),v()),d.key==="Escape"){const r=document.getElementById("sectionWizard");r&&r.classList.contains("show")&&u()}});const g=document.querySelector(".wizard-backdrop");g&&g.addEventListener("click",u)});window.openSectionWizard=w;window.closeSectionWizard=u;
