var G=Object.defineProperty;var U=(n,e,r)=>e in n?G(n,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):n[e]=r;var h=(n,e,r)=>(U(n,typeof e!="symbol"?e+"":e,r),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&t(l)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();class O{constructor(e){h(this,"points");this.points=e.map(r=>r.clone())}}class z{constructor({x:e,y:r,z:t}){h(this,"x");h(this,"y");h(this,"z");this.x=e,this.y=r,this.z=t}clone(){return new z({x:this.x,y:this.y,z:this.z})}}class C{constructor({a:e,b:r,c:t}){h(this,"a");h(this,"b");h(this,"c");this.a=e,this.b=r,this.c=t}computeNormal(){const e=new z({x:this.b.x-this.a.x,y:this.b.y-this.a.y,z:this.b.z-this.a.z}),r=new z({x:this.c.x-this.a.x,y:this.c.y-this.a.y,z:this.c.z-this.a.z}),t=new z({x:e.y*r.z-e.z*r.y,y:e.z*r.x-e.x*r.z,z:e.x*r.y-e.y*r.x}),i=Math.sqrt(t.x*t.x+t.y*t.y+t.z*t.z);return t.x/=i,t.y/=i,t.z/=i,t}flip(){return new C({a:this.a.clone(),b:this.c.clone(),c:this.b.clone()})}}function o(n,e){return new z({x:n,y:0,z:e})}class ${constructor({innerDiameter:e,innerZ:r,outerDiameter:t,outerZ:i,direction:a}){h(this,"innerDiameter");h(this,"innerZ");h(this,"outerDiameter");h(this,"outerZ");h(this,"direction");this.innerDiameter=e,this.innerZ=r,this.outerDiameter=t,this.outerZ=i,this.direction=a}getTriangles(){let e=A(this.innerDiameter,this.innerZ),r=A(this.outerDiameter,this.outerZ);this.direction&&([e,r]=[r,e]);const t=[];for(let i=0;i<P;i++){const a=[e[i],e[(i+1)%P],r[i],r[(i+1)%P]];t.push(new C({a:a[0],b:a[1],c:a[2]})),t.push(new C({a:a[1],b:a[3],c:a[2]}))}return t}}const P=300,E=[];for(let n=0;n<P;n++){const e=n*2*Math.PI/P;E.push(new z({x:Math.cos(e),y:Math.sin(e),z:0}))}function A(n,e){return E.map(r=>new z({x:r.x*n/2,y:r.y*n/2,z:e}))}function N(n){let e=[];for(let t=0;t<n.points.length;t++){const i=n.points[t],a=n.points[(t+1)%n.points.length];e.push(new $({innerDiameter:i.x*2,innerZ:i.z,outerDiameter:a.x*2,outerZ:a.z,direction:!1}))}let r=[];for(let t=0;t<e.length;t++)r=r.concat(e[t].getTriangles());return r}const R=1,u=.5,x=2,j=1.25;class X{constructor({outerDiameter:e,boreDiameter:r,width:t,clearance:i}){h(this,"outerDiameter");h(this,"boreDiameter");h(this,"width");h(this,"clearance");this.outerDiameter=e,this.boreDiameter=r,this.width=t,this.clearance=i}get sliderInnerDiameter(){return this.boreDiameter+(this.outerDiameter-this.boreDiameter)/3}get sliderOuterDiameter(){return this.boreDiameter+2*(this.outerDiameter-this.boreDiameter)/3}getTriangles(){return[...this.getTrianglesForInnerRing(),...this.getTrianglesForSlider(),...this.getTrianglesForOuterRing()]}trianglesWithMirroredBottom(e){const r=e.map(t=>(t=t.flip(),t.a.z=this.width-t.a.z,t.b.z=this.width-t.b.z,t.c.z=this.width-t.c.z,t));return[...e,...r]}getTrianglesForInnerRing(){return N(this.innerRingPolygon)}get innerRingPolygon(){let e=this.boreDiameter/2,r=this.sliderInnerDiameter/2-this.clearance,t=r-R;return new O([o(e,0),o(r,0),o(r,u),o(t,u+x),o(t,this.width-u-x),o(r,this.width-u),o(r,this.width),o(e,this.width)])}getTrianglesForSlider(){return N(this.sliderPolygon)}get sliderPolygon(){const e=this.sliderInnerDiameter/2,r=e-R,t=this.sliderOuterDiameter/2,i=t+R;return new O([o(e,0),o(t,0),o(t,u),o(i,u+x),o(i,this.width-u-x),o(t,this.width-u),o(t,this.width),o(e,this.width),o(e,this.width-u),o(r,this.width-u-x),o(r,u+x),o(e,u)])}getTrianglesForOuterRing(){return N(this.outerRingPolygon)}get outerRingPolygon(){const e=this.sliderOuterDiameter/2+this.clearance,r=e+R;return new O([o(this.outerDiameter/2,0),o(this.outerDiameter/2,this.width),o(e,this.width),o(e,this.width-u),o(r,this.width-u-x),o(r,u+x),o(e,u),o(e,0)])}drawPreview(e){let r=this.innerRingPolygon,t=this.sliderPolygon,i=this.outerRingPolygon;const a=[r,t,i],l=Math.max(...a.map(g=>g.points.reduce((d,m)=>Math.max(d,m.x),-1/0))),b=-l,c=Math.min(...a.map(g=>g.points.reduce((d,m)=>Math.min(d,m.z),1/0))),p=Math.max(...a.map(g=>g.points.reduce((d,m)=>Math.max(d,m.z),-1/0)));console.log({minX:b,maxX:l,minY:c,maxY:p});const y=e.width,w=e.height,D=y/(l-b),T=w/(p-c),S=Math.min(D,T)*.8;console.log({scale:S});const M=y/2-(l+b)/2*S,v=w/2-(p+c)/2*S,f=g=>o(g.x*S+M,g.z*S+v);console.log(f(o(11,8)));const s=e.getContext("2d");s.clearRect(0,0,y,w),s.fillStyle="rgba(0, 0, 0, 1)",s.fillRect(0,0,y,w);const L=f(o(b,c)),q=f(o(l,p)),I=s.createLinearGradient(L.x,0,q.x,0);I.addColorStop(0,"rgba(130, 147, 212, 1)"),I.addColorStop(1,"rgba(39, 72, 198, 1)"),s.fillStyle=I,s.fillRect(f(o(b,c)).x,f(o(b,c)).z,f(o(l,p)).x-f(o(b,c)).x,f(o(l,p)).z-f(o(b,c)).z);const F=s.createLinearGradient(L.x,L.z,q.x,q.z);F.addColorStop(0,"rgba(253, 203, 128, 1)"),F.addColorStop(.5,"rgba(255, 166, 0, 1)"),F.addColorStop(1,"rgba(183, 119, 0, 1)"),s.fillStyle=F;for(const g of a){const d=g.points.map(f);s.beginPath(),s.moveTo(d[0].x,d[0].z);for(const m of d.slice(1))s.lineTo(m.x,m.z);s.closePath(),s.fill()}for(const g of a){const d=g.points.map(m=>{const B=f(m);return o(y-B.x,B.z)});s.beginPath(),s.moveTo(d[0].x,d[0].z);for(const m of d.slice(1))s.lineTo(m.x,m.z);s.closePath(),s.fill()}}get fileName(){const e=r=>r.toFixed(2).replace(/\.?0*$/,"");return`bearing-${e(this.boreDiameter)}-${e(this.outerDiameter)}-${e(this.width)}-${e(this.clearance)}.stl`}validate(){if(this.boreDiameter>=this.sliderInnerDiameter-j*2-this.clearance*2)throw new Error("Bore diameter is too large for the outer diameter")}}function Y(n){const i=84+n.length*50,a=new Uint8Array(i),l=new DataView(a.buffer);for(let c=0;c<80;c++)a[c]=0;const b=n.length;l.setInt32(80,b,!0);for(let c=0;c<n.length;c++){const p=n[c],y=p.computeNormal(),w=p.a,D=p.b,T=p.c,S=80+4+c*50,M=[y.x,y.y,y.z,w.x,w.y,w.z,D.x,D.y,D.z,T.x,T.y,T.z];for(let v=0;v<M.length;v++)l.setFloat32(S+v*4,M[v],!0)}return a}function W(){let n=Z(),e=n.getTriangles();const r=Y(e);let t=document.createElement("a");t.download=n.fileName;let i=new Blob([r],{type:"application/octet-stream"});t.href=URL.createObjectURL(i),t.click()}function k(){let n=Z(),e=document.querySelector("#preview");n.drawPreview(e)}function H(){let n=Z();try{n.validate(),document.querySelector("#error").textContent=""}catch(e){e instanceof Error?document.querySelector("#error").textContent=e.message:document.querySelector("#error").textContent="Unknown error"}}function Z(){let n=parseFloat(document.querySelector("#outer-diameter").value),e=parseFloat(document.querySelector("#bore-diameter").value),r=parseFloat(document.querySelector("#width").value),t=parseFloat(document.querySelector("#clearance").value);return new X({outerDiameter:n,boreDiameter:e,width:r,clearance:t})}const V=""+new URL("hero-a236bb3a.jpg",import.meta.url).href;document.querySelector("#app").innerHTML=`
    <header style="margin-bottom:0; padding-bottom:0;">
      <h1> Bearing Generator </h1>
    </header>
    <form>
    <p>
    <img src="${V}" alt="A 608 bearing printed in place" style="width:30%;float:right;margin-left:10px;border-radius:8px">
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
`;document.querySelector("#generate").addEventListener("click",()=>{W()});document.querySelectorAll("#app input").forEach(n=>{n.addEventListener("change",()=>{let e=r=>{let t=document.querySelector(r),i=parseFloat(t.min),a=parseFloat(t.max),l=t.valueAsNumber;l<i?t.value=i.toString():l>a&&(t.value=a.toString())};e("#outer-diameter"),e("#bore-diameter"),e("#width"),e("#clearance"),H(),k()})});k();
