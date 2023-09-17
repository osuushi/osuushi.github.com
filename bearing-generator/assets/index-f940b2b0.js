var H=Object.defineProperty;var V=(a,e,r)=>e in a?H(a,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):a[e]=r;var u=(a,e,r)=>(V(a,typeof e!="symbol"?e+"":e,r),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const h of o.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&t(h)}).observe(document,{childList:!0,subtree:!0});function r(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(n){if(n.ep)return;n.ep=!0;const o=r(n);fetch(n.href,o)}})();class ${constructor(e){u(this,"points");this.points=e.map(r=>r.clone())}}class R{constructor({x:e,y:r,z:t}){u(this,"x");u(this,"y");u(this,"z");this.x=e,this.y=r,this.z=t}clone(){return new R({x:this.x,y:this.y,z:this.z})}}class X{constructor({a:e,b:r,c:t}){u(this,"a");u(this,"b");u(this,"c");this.a=e,this.b=r,this.c=t}computeNormal(){const e=new R({x:this.b.x-this.a.x,y:this.b.y-this.a.y,z:this.b.z-this.a.z}),r=new R({x:this.c.x-this.a.x,y:this.c.y-this.a.y,z:this.c.z-this.a.z}),t=new R({x:e.y*r.z-e.z*r.y,y:e.z*r.x-e.x*r.z,z:e.x*r.y-e.y*r.x}),n=Math.sqrt(t.x*t.x+t.y*t.y+t.z*t.z);return t.x/=n,t.y/=n,t.z/=n,t}flip(){return new X({a:this.a.clone(),b:this.c.clone(),c:this.b.clone()})}}function i(a,e){return new R({x:a,y:0,z:e})}class J{constructor({innerDiameter:e,innerZ:r,outerDiameter:t,outerZ:n,direction:o}){u(this,"innerDiameter");u(this,"innerZ");u(this,"outerDiameter");u(this,"outerZ");u(this,"direction");this.innerDiameter=e,this.innerZ=r,this.outerDiameter=t,this.outerZ=n,this.direction=o}getTriangles(){let e=U(this.innerDiameter,this.innerZ),r=U(this.outerDiameter,this.outerZ);this.direction&&([e,r]=[r,e]);const t=[];for(let n=0;n<B;n++){const o=[e[n],e[(n+1)%B],r[n],r[(n+1)%B]];t.push(new X({a:o[0],b:o[1],c:o[2]})),t.push(new X({a:o[1],b:o[3],c:o[2]}))}return t}}const B=300,j=[];for(let a=0;a<B;a++){const e=a*2*Math.PI/B;j.push(new R({x:Math.cos(e),y:Math.sin(e),z:0}))}function U(a,e){return j.map(r=>new R({x:r.x*a/2,y:r.y*a/2,z:e}))}function N(a){let e=[];for(let t=0;t<a.points.length;t++){const n=a.points[t],o=a.points[(t+1)%a.points.length];e.push(new J({innerDiameter:n.x*2,innerZ:n.z,outerDiameter:o.x*2,outerZ:o.z,direction:!1}))}let r=[];for(let t=0;t<e.length;t++)r=r.concat(e[t].getTriangles());return r}const E=1,T=.5,k=2,K=1.25;class Q{constructor({outerDiameter:e,boreDiameter:r,width:t,clearance:n}){u(this,"outerDiameter");u(this,"boreDiameter");u(this,"width");u(this,"clearance");this.outerDiameter=e,this.boreDiameter=r,this.width=t,this.clearance=n}get gapCenterDiameter(){return this.boreDiameter+(this.outerDiameter-this.boreDiameter)/2-E}getTriangles(){return[...this.getTrianglesForInnerRing(),...this.getTrianglesForOuterRing()]}trianglesWithMirroredBottom(e){const r=e.map(t=>(t=t.flip(),t.a.z=this.width-t.a.z,t.b.z=this.width-t.b.z,t.c.z=this.width-t.c.z,t));return[...e,...r]}getTrianglesForInnerRing(){return N(this.innerRingPolygon)}get innerRingPolygon(){let e=this.boreDiameter/2,r=(this.gapCenterDiameter-this.clearance)/2,t=r+E;return new $([i(e,0),i(r,0),i(r,T),i(t,T+k),i(t,this.width-T-k),i(r,this.width-T),i(r,this.width),i(e,this.width)])}getTrianglesForOuterRing(){return N(this.outerRingPolygon)}get outerRingPolygon(){const e=(this.gapCenterDiameter+this.clearance)/2,r=e+E;return new $([i(this.outerDiameter/2,0),i(this.outerDiameter/2,this.width),i(e,this.width),i(e,this.width-T),i(r,this.width-T-k),i(r,T+k),i(e,T),i(e,0)])}drawPreview(e){let r=this.innerRingPolygon,t=this.outerRingPolygon;const n=[r,t],o=Math.max(...n.map(f=>f.points.reduce((c,l)=>Math.max(c,l.x),-1/0))),h=-o,p=Math.min(...n.map(f=>f.points.reduce((c,l)=>Math.min(c,l.z),1/0))),d=Math.max(...n.map(f=>f.points.reduce((c,l)=>Math.max(c,l.z),-1/0))),b=e.width,x=e.height,z=b/(o-h),C=x/(d-p),D=Math.min(z,C)*.8,S=b/2-(o+h)/2*D,F=x/2-(d+p)/2*D,m=f=>i(f.x*D+S,f.z*D+F),s=e.getContext("2d");s.clearRect(0,0,b,x),s.fillStyle="rgba(0, 0, 0, 1)",s.fillRect(0,0,b,x);const g=m(i(-this.boreDiameter/2,0)),Z=m(i(this.boreDiameter/2,0)),M=s.createLinearGradient(g.x,0,Z.x,0),v="rgba(206, 207, 176, 1)",O="rgba(102, 102, 69, 1)";M.addColorStop(0,O),M.addColorStop(.45,v),M.addColorStop(.55,v),M.addColorStop(1,O),s.fillStyle=M,s.fillRect(m(i(h,p)).x,m(i(h,p)).z,m(i(o,d)).x-m(i(h,p)).x,m(i(o,d)).z-m(i(h,p)).z);const I=m(i(h,p)),q=m(i(o,d)),L=s.createLinearGradient(I.x,I.z,q.x,I.z);L.addColorStop(0,"rgba(255, 200, 90, 1)"),L.addColorStop(.5,"rgba(240, 229, 200, 1)"),L.addColorStop(1,"rgba(226, 194, 100, 1)"),s.fillStyle=L;for(const f of n){const c=f.points.map(m);s.beginPath(),s.moveTo(c[0].x,c[0].z);for(const l of c.slice(1))s.lineTo(l.x,l.z);s.closePath(),s.fill()}for(const f of n){const c=f.points.map(l=>{const w=m(l);return i(b-w.x,w.z)});s.beginPath(),s.moveTo(c[0].x,c[0].z);for(const l of c.slice(1))s.lineTo(l.x,l.z);s.closePath(),s.fill()}}get fileName(){const e=r=>r.toFixed(2).replace(/\.?0*$/,"");return`bearing-2-ring-${e(this.boreDiameter)}-${e(this.outerDiameter)}-${e(this.width)}-${e(this.clearance)}.stl`}validate(){if(this.boreDiameter>=this.gapCenterDiameter-K*2-this.clearance)throw new Error("Bore diameter is too large for the outer diameter")}}const G=1,y=.5,P=2,_=1.25;class ee{constructor({outerDiameter:e,boreDiameter:r,width:t,clearance:n}){u(this,"outerDiameter");u(this,"boreDiameter");u(this,"width");u(this,"clearance");this.outerDiameter=e,this.boreDiameter=r,this.width=t,this.clearance=n}get sliderInnerDiameter(){return this.boreDiameter+(this.outerDiameter-this.boreDiameter)/3}get sliderOuterDiameter(){return this.boreDiameter+2*(this.outerDiameter-this.boreDiameter)/3}getTriangles(){return[...this.getTrianglesForInnerRing(),...this.getTrianglesForSlider(),...this.getTrianglesForOuterRing()]}trianglesWithMirroredBottom(e){const r=e.map(t=>(t=t.flip(),t.a.z=this.width-t.a.z,t.b.z=this.width-t.b.z,t.c.z=this.width-t.c.z,t));return[...e,...r]}getTrianglesForInnerRing(){return N(this.innerRingPolygon)}get innerRingPolygon(){let e=this.boreDiameter/2,r=this.sliderInnerDiameter/2-this.clearance,t=r-G;return new $([i(e,0),i(r,0),i(r,y),i(t,y+P),i(t,this.width-y-P),i(r,this.width-y),i(r,this.width),i(e,this.width)])}getTrianglesForSlider(){return N(this.sliderPolygon)}get sliderPolygon(){const e=this.sliderInnerDiameter/2,r=e-G,t=this.sliderOuterDiameter/2,n=t+G;return new $([i(e,0),i(t,0),i(t,y),i(n,y+P),i(n,this.width-y-P),i(t,this.width-y),i(t,this.width),i(e,this.width),i(e,this.width-y),i(r,this.width-y-P),i(r,y+P),i(e,y)])}getTrianglesForOuterRing(){return N(this.outerRingPolygon)}get outerRingPolygon(){const e=this.sliderOuterDiameter/2+this.clearance,r=e+G;return new $([i(this.outerDiameter/2,0),i(this.outerDiameter/2,this.width),i(e,this.width),i(e,this.width-y),i(r,this.width-y-P),i(r,y+P),i(e,y),i(e,0)])}drawPreview(e){let r=this.innerRingPolygon,t=this.sliderPolygon,n=this.outerRingPolygon;const o=[r,t,n],h=Math.max(...o.map(c=>c.points.reduce((l,w)=>Math.max(l,w.x),-1/0))),p=-h,d=Math.min(...o.map(c=>c.points.reduce((l,w)=>Math.min(l,w.z),1/0))),b=Math.max(...o.map(c=>c.points.reduce((l,w)=>Math.max(l,w.z),-1/0))),x=e.width,z=e.height,C=x/(h-p),D=z/(b-d),S=Math.min(C,D)*.8,F=x/2-(h+p)/2*S,m=z/2-(b+d)/2*S,s=c=>i(c.x*S+F,c.z*S+m),g=e.getContext("2d");g.clearRect(0,0,x,z),g.fillStyle="rgba(0, 0, 0, 1)",g.fillRect(0,0,x,z);const Z=s(i(-this.boreDiameter/2,0)),M=s(i(this.boreDiameter/2,0)),v=g.createLinearGradient(Z.x,0,M.x,0),O="rgba(206, 207, 176, 1)",I="rgba(102, 102, 69, 1)";v.addColorStop(0,I),v.addColorStop(.45,O),v.addColorStop(.55,O),v.addColorStop(1,I),g.fillStyle=v,g.fillRect(s(i(p,d)).x,s(i(p,d)).z,s(i(h,b)).x-s(i(p,d)).x,s(i(h,b)).z-s(i(p,d)).z);const q=s(i(p,d)),L=s(i(h,b)),f=g.createLinearGradient(q.x,q.z,L.x,q.z);f.addColorStop(0,"rgba(255, 200, 90, 1)"),f.addColorStop(.5,"rgba(240, 229, 200, 1)"),f.addColorStop(1,"rgba(226, 194, 100, 1)"),g.fillStyle=f;for(const c of o){const l=c.points.map(s);g.beginPath(),g.moveTo(l[0].x,l[0].z);for(const w of l.slice(1))g.lineTo(w.x,w.z);g.closePath(),g.fill()}for(const c of o){const l=c.points.map(w=>{const A=s(w);return i(x-A.x,A.z)});g.beginPath(),g.moveTo(l[0].x,l[0].z);for(const w of l.slice(1))g.lineTo(w.x,w.z);g.closePath(),g.fill()}}get fileName(){const e=r=>r.toFixed(2).replace(/\.?0*$/,"");return`bearing-3-ring-${e(this.boreDiameter)}-${e(this.outerDiameter)}-${e(this.width)}-${e(this.clearance)}.stl`}validate(){if(this.boreDiameter>=this.sliderInnerDiameter-_*2-this.clearance*2)throw new Error("Bore diameter is too large for the outer diameter")}}function te(a){const n=84+a.length*50,o=new Uint8Array(n),h=new DataView(o.buffer);for(let d=0;d<80;d++)o[d]=0;const p=a.length;h.setInt32(80,p,!0);for(let d=0;d<a.length;d++){const b=a[d],x=b.computeNormal(),z=b.a,C=b.b,D=b.c,S=80+4+d*50,F=[x.x,x.y,x.z,z.x,z.y,z.z,C.x,C.y,C.z,D.x,D.y,D.z];for(let m=0;m<F.length;m++)h.setFloat32(S+m*4,F[m],!0)}return o}function re(){let a=Y(),e=a.getTriangles();const r=te(e);let t=document.createElement("a");t.download=a.fileName;let n=new Blob([r],{type:"application/octet-stream"});t.href=URL.createObjectURL(n),t.click()}function W(){let a=Y(),e=document.querySelector("#preview");a.drawPreview(e)}function ie(){let a=Y();try{a.validate(),document.querySelector("#error").textContent=""}catch(e){e instanceof Error?document.querySelector("#error").textContent=e.message:document.querySelector("#error").textContent="Unknown error"}}function Y(){let a=parseInt(document.querySelector('input[name="number-of-rings"]:checked').value),e=parseFloat(document.querySelector("#outer-diameter").value),r=parseFloat(document.querySelector("#bore-diameter").value),t=parseFloat(document.querySelector("#width").value),n=parseFloat(document.querySelector("#clearance").value);return a===2?new Q({outerDiameter:e,boreDiameter:r,width:t,clearance:n}):new ee({outerDiameter:e,boreDiameter:r,width:t,clearance:n})}const ne=""+new URL("hero-dc47a0e6.jpg",import.meta.url).href;document.querySelector("#app").innerHTML=`
    <header style="margin-bottom:0; padding-bottom:0;">
      <h1> Bearing Generator </h1>
    </header>
    <form>
    <p>
    <img src="${ne}" alt="A 608 bearing printed in place" style="width:30%;float:right;margin-left:10px;border-radius:8px">
    This is an STL generator for simple print-in-place bearings. The bearings are made of
    three interlocked rings which can slide past each other to reduce friction.
    </p><p>
    Fill out the form below and click "Download STL" to download the STL file. The default values give
    a standard 608 (i.e. skateboard) bearing.
    </p>
    <p>
    This design is surprisingly effective, and very fast to print. These bearings aren't terribly strong,
    of course, but for low load applications that don't need super low friction, they're great.
    </p><p>
    There are two bearing designs: one with two rings, and one with three rings.
    </p><p>
    The two ring design is simpler, stronger, and will have less play, since there is only one gap where
    clearance is required for printing. The three ring design may have less friction, since it has two
    gaps where the rings can slide past each other, but it has smaller parts, and requires clearance
    for both gaps, so it has twice as much play.
    </p><p>
    In practice, the difference in friction between the two designs is pretty small, and in most cases,
    the reduced play of the two ring design is a better tradeoff.
    </p>
    <section>
    <table>
      <tr>
        <td>
          <label><input type="radio" id="2-rings" name="number-of-rings" value="2" checked>Two rings</label>
          <label><input type="radio" id="3-rings" name="number-of-rings" value="3">3 rings</label>
        </td>
        <td>
          <label for="outer-diameter">Outer diameter (mm)</label>
          <input type="number" id="outer-diameter" name="outer-diameter" value="22" step="0.1" min="10" max="1000" required>
        </td>
        <td>
          <label for="bore-diameter">Bore diameter (mm)</label>
          <input type="number" id="bore-diameter" name="bore-diameter" value="8" step="0.1" min="1" max="1000" required>
        </td>
        <td>
          <label for="width">Width (mm)</label>
          <input type="number" id="width" name="width" value="7" step="0.1" min="6" max="1000" required>
        </td>
        <td>
          <label for="clearance">Clearance (mm)</label>
          <input type="number" id="clearance" name="clearance" value="0.3" step="0.1" min="0" max=".5" required>
        </td>
      </tr>
    </table>
    </section>
    <br>
    <section>
      <figure>
      <figcaption>Cross section <span id="error" style="color:red;font-weight:bold;"></span></figcaption>
      <canvas id="preview" width="600" height="300" style="max-width: 100%"></canvas>
      </figure>
    </section>
    <section>
    <button type="button" id="generate">Download STL</button>
    </section>
    <article>
      <h2>Other stuff</h2>
      <ul>
        <li>Print these in place in exactly the arrangement that they're saved in. Don't separate the rings before printing, or you won't be able to put them together.</li>
        <li>A clearance of 0.3mm is a good tradeoff between ease of print and smoothness of operation.</li>
        <li>
          For smaller bearings, I recommend printing entirely as vertical walls rather than worrying about infill.
          Just set the walls to "100", for example. This will make the bearing stronger, and it's still very
          fast to print, since every layer will just be made up of circles.
        </li>
        <li>
          These are pretty smooth as printed, but a little grease will help them work even more smoothly.
        </li>
        <li>
          The generator is licensed under the MIT license. I doubt that I have any rights over the generated STLs, but just for clarity,
          I release all rights to them.
        </li>
    </article>
  </form>
`;document.querySelector("#generate").addEventListener("click",()=>{re()});document.querySelectorAll("#app input").forEach(a=>{a.addEventListener("change",()=>{let e=r=>{let t=document.querySelector(r),n=parseFloat(t.min),o=parseFloat(t.max),h=t.valueAsNumber;h<n?t.value=n.toString():h>o&&(t.value=o.toString())};e("#outer-diameter"),e("#bore-diameter"),e("#width"),e("#clearance"),ie(),W()})});W();
