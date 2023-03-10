var B=Object.defineProperty;var G=(o,e,r)=>e in o?B(o,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[e]=r;var c=(o,e,r)=>(G(o,typeof e!="symbol"?e+"":e,r),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();class R{constructor(e){c(this,"points");this.points=e.map(r=>r.clone())}}class y{constructor({x:e,y:r,z:t}){c(this,"x");c(this,"y");c(this,"z");this.x=e,this.y=r,this.z=t}clone(){return new y({x:this.x,y:this.y,z:this.z})}}class P{constructor({a:e,b:r,c:t}){c(this,"a");c(this,"b");c(this,"c");this.a=e,this.b=r,this.c=t}computeNormal(){const e=new y({x:this.b.x-this.a.x,y:this.b.y-this.a.y,z:this.b.z-this.a.z}),r=new y({x:this.c.x-this.a.x,y:this.c.y-this.a.y,z:this.c.z-this.a.z}),t=new y({x:e.y*r.z-e.z*r.y,y:e.z*r.x-e.x*r.z,z:e.x*r.y-e.y*r.x}),i=Math.sqrt(t.x*t.x+t.y*t.y+t.z*t.z);return t.x/=i,t.y/=i,t.z/=i,t}flip(){return new P({a:this.a.clone(),b:this.c.clone(),c:this.b.clone()})}}function n(o,e){return new y({x:o,y:0,z:e})}class X{constructor({innerDiameter:e,innerZ:r,outerDiameter:t,outerZ:i,direction:a}){c(this,"innerDiameter");c(this,"innerZ");c(this,"outerDiameter");c(this,"outerZ");c(this,"direction");this.innerDiameter=e,this.innerZ=r,this.outerDiameter=t,this.outerZ=i,this.direction=a}getTriangles(){let e=L(this.innerDiameter,this.innerZ),r=L(this.outerDiameter,this.outerZ);this.direction&&([e,r]=[r,e]);const t=[];for(let i=0;i<v;i++){const a=[e[i],e[(i+1)%v],r[i],r[(i+1)%v]];t.push(new P({a:a[0],b:a[1],c:a[2]})),t.push(new P({a:a[1],b:a[3],c:a[2]}))}return t}}const v=300,O=[];for(let o=0;o<v;o++){const e=o*2*Math.PI/v;O.push(new y({x:Math.cos(e),y:Math.sin(e),z:0}))}function L(o,e){return O.map(r=>new y({x:r.x*o/2,y:r.y*o/2,z:e}))}function q(o){let e=[];for(let t=0;t<o.points.length;t++){const i=o.points[t],a=o.points[(t+1)%o.points.length];e.push(new X({innerDiameter:i.x*2,innerZ:i.z,outerDiameter:a.x*2,outerZ:a.z,direction:!1}))}let r=[];for(let t=0;t<e.length;t++)r=r.concat(e[t].getTriangles());return r}const T=1,h=.5,b=2,Y=1.25;class j{constructor({outerDiameter:e,boreDiameter:r,width:t,clearance:i}){c(this,"outerDiameter");c(this,"boreDiameter");c(this,"width");c(this,"clearance");this.outerDiameter=e,this.boreDiameter=r,this.width=t,this.clearance=i}get sliderInnerDiameter(){return this.boreDiameter+(this.outerDiameter-this.boreDiameter)/3}get sliderOuterDiameter(){return this.boreDiameter+2*(this.outerDiameter-this.boreDiameter)/3}getTriangles(){return[...this.getTrianglesForInnerRing(),...this.getTrianglesForSlider(),...this.getTrianglesForOuterRing()]}trianglesWithMirroredBottom(e){const r=e.map(t=>(t=t.flip(),t.a.z=this.width-t.a.z,t.b.z=this.width-t.b.z,t.c.z=this.width-t.c.z,t));return[...e,...r]}getTrianglesForInnerRing(){return q(this.innerRingPolygon)}get innerRingPolygon(){let e=this.boreDiameter/2,r=this.sliderInnerDiameter/2-this.clearance,t=r-T;return new R([n(e,0),n(r,0),n(r,h),n(t,h+b),n(t,this.width-h-b),n(r,this.width-h),n(r,this.width),n(e,this.width)])}getTrianglesForSlider(){return q(this.sliderPolygon)}get sliderPolygon(){const e=this.sliderInnerDiameter/2,r=e-T,t=this.sliderOuterDiameter/2,i=t+T;return new R([n(e,0),n(t,0),n(t,h),n(i,h+b),n(i,this.width-h-b),n(t,this.width-h),n(t,this.width),n(e,this.width),n(e,this.width-h),n(r,this.width-h-b),n(r,h+b),n(e,h)])}getTrianglesForOuterRing(){return q(this.outerRingPolygon)}get outerRingPolygon(){const e=this.sliderOuterDiameter/2+this.clearance,r=e+T;return new R([n(this.outerDiameter/2,0),n(this.outerDiameter/2,this.width),n(e,this.width),n(e,this.width-h),n(r,this.width-h-b),n(r,h+b),n(e,h),n(e,0)])}drawPreview(e){let r=this.innerRingPolygon,t=this.sliderPolygon,i=this.outerRingPolygon;const a=[r,t,i],s=Math.max(...a.map(p=>p.points.reduce((d,u)=>Math.max(d,u.x),-1/0))),m=-s,g=Math.min(...a.map(p=>p.points.reduce((d,u)=>Math.min(d,u.z),1/0))),w=Math.max(...a.map(p=>p.points.reduce((d,u)=>Math.max(d,u.z),-1/0)));console.log({minX:m,maxX:s,minY:g,maxY:w});const x=e.width,D=e.height,Z=x/(s-m),E=D/(w-g),z=Math.min(Z,E)*.8;console.log({scale:z});const k=x/2-(s+m)/2*z,A=D/2-(w+g)/2*z,f=p=>n(p.x*z+k,p.z*z+A);console.log(f(n(11,8)));const l=e.getContext("2d");l.clearRect(0,0,x,D),l.fillStyle="rgba(0, 0, 0, 1)",l.fillRect(0,0,x,D);const M=f(n(m,g)),F=f(n(s,w)),$=l.createLinearGradient(M.x,0,F.x,0);$.addColorStop(0,"rgba(130, 147, 212, 1)"),$.addColorStop(1,"rgba(39, 72, 198, 1)"),l.fillStyle=$,l.fillRect(f(n(m,g)).x,f(n(m,g)).z,f(n(s,w)).x-f(n(m,g)).x,f(n(s,w)).z-f(n(m,g)).z);const S=l.createLinearGradient(M.x,M.z,F.x,F.z);S.addColorStop(0,"rgba(253, 203, 128, 1)"),S.addColorStop(.5,"rgba(255, 166, 0, 1)"),S.addColorStop(1,"rgba(183, 119, 0, 1)"),l.fillStyle=S;for(const p of a){const d=p.points.map(f);l.beginPath(),l.moveTo(d[0].x,d[0].z);for(const u of d.slice(1))l.lineTo(u.x,u.z);l.closePath(),l.fill()}for(const p of a){const d=p.points.map(u=>{const I=f(u);return n(x-I.x,I.z)});l.beginPath(),l.moveTo(d[0].x,d[0].z);for(const u of d.slice(1))l.lineTo(u.x,u.z);l.closePath(),l.fill()}}get fileName(){const e=r=>r.toFixed(2).replace(/\.?0*$/,"");return`bearing-${e(this.boreDiameter)}-${e(this.outerDiameter)}-${e(this.width)}-${e(this.clearance)}.stl`}validate(){if(this.boreDiameter>=this.sliderInnerDiameter-Y*2-this.clearance*2)throw new Error("Bore diameter is too large for the outer diameter")}}function W(o){const e="solid bearing",r="endsolid bearing",t=o.map(i=>{const a=i.computeNormal(),s=i.a,m=i.b,g=i.c;return`facet normal ${a.x} ${a.y} ${a.z}
  outer loop
    vertex ${s.x} ${s.y} ${s.z}
    vertex ${m.x} ${m.y} ${m.z}
    vertex ${g.x} ${g.y} ${g.z}
  endloop
endfacet`}).join(`
`);return`${e}
${t}
${r}`}function H(){let o=C(),e=o.getTriangles();const r=W(e);let t=document.createElement("a");t.download=o.fileName,t.href="data:application/octet-stream,"+encodeURIComponent(r),t.click()}function N(){let o=C(),e=document.querySelector("#preview");o.drawPreview(e)}function U(){let o=C();try{o.validate(),document.querySelector("#error").textContent=""}catch(e){e instanceof Error?document.querySelector("#error").textContent=e.message:document.querySelector("#error").textContent="Unknown error"}}function C(){let o=parseFloat(document.querySelector("#outer-diameter").value),e=parseFloat(document.querySelector("#bore-diameter").value),r=parseFloat(document.querySelector("#width").value),t=parseFloat(document.querySelector("#clearance").value);return new j({outerDiameter:o,boreDiameter:e,width:r,clearance:t})}document.querySelector("#app").innerHTML=`
    <header style="margin-bottom:0; padding-bottom:0;">
      <h1> Bearing Generator </h1>
    </header>
    <form>
    <p> 
    This is an STL generator for simple print-in-place bearings. The bearings are made of
    three interlocked rings which can slide past each other to reduce friction.
    </p><p>
    Fill out the form below and click "Generate" to download the STL file.
    For example, the defaults produce a standard 608 (i.e. skateboard) bearing.
    </p>
    <p>
    This design is surprisingly effective, and very fast to print. These bearings aren't terribly strong,
    of course, but for low load applications that don't need super low friction, they're great.
    </p>
    <section>
    <table>
      <tr>
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
`;document.querySelector("#generate").addEventListener("click",()=>{H()});document.querySelectorAll("#app input").forEach(o=>{o.addEventListener("change",()=>{let e=r=>{let t=document.querySelector(r),i=parseFloat(t.min),a=parseFloat(t.max),s=t.valueAsNumber;s<i?t.value=i.toString():s>a&&(t.value=a.toString())};e("#outer-diameter"),e("#bore-diameter"),e("#width"),e("#clearance"),U(),N()})});N();
