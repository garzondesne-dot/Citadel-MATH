import{Filter as et,GpuProgram as ot,GlProgram as st,Color as wt,deprecation as gt,RenderTexture as vt,Sprite as rt,Container as Q,Assets as kt,Texture as xt,Rectangle as Mt,Graphics as Tt}from"./lib-BPLSXaji.js";import{O as $}from"./obj-BnYhVjvJ.js";import{aH as at,b5 as yt}from"./index-DdtSqVnh.js";var nt=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`,it=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}`,St=`precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uStrength;
uniform vec3 uColor;
uniform float uKnockout;
uniform float uAlpha;

uniform vec4 uInputSize;
uniform vec4 uInputClamp;

const float PI = 3.14159265358979323846264;

// Hard-assignment of DIST and ANGLE_STEP_SIZE instead of using uDistance and uQuality to allow them to be use on GLSL loop conditions
const float DIST = __DIST__;
const float ANGLE_STEP_SIZE = min(__ANGLE_STEP_SIZE__, PI * 2.);
const float ANGLE_STEP_NUM = ceil(PI * 2. / ANGLE_STEP_SIZE);
const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.) / 2.;

void main(void) {
    vec2 px = vec2(1.) / uInputSize.xy;

    float totalAlpha = 0.;

    vec2 direction;
    vec2 displaced;
    vec4 curColor;

    for (float angle = 0.; angle < PI * 2.; angle += ANGLE_STEP_SIZE) {
      direction = vec2(cos(angle), sin(angle)) * px;

      for (float curDistance = 0.; curDistance < DIST; curDistance++) {
          displaced = clamp(vTextureCoord + direction * (curDistance + 1.), uInputClamp.xy, uInputClamp.zw);
          curColor = texture(uTexture, displaced);
          totalAlpha += (DIST - curDistance) * curColor.a;
      }
    }
    
    curColor = texture(uTexture, vTextureCoord);

    vec4 glowColor = vec4(uColor, uAlpha);
    bool knockout = uKnockout > .5;
    float innerStrength = uStrength[0];
    float outerStrength = uStrength[1];

    float alphaRatio = totalAlpha / MAX_TOTAL_ALPHA;
    float innerGlowAlpha = (1. - alphaRatio) * innerStrength * curColor.a * uAlpha;
    float innerGlowStrength = min(1., innerGlowAlpha);
    
    vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);
    float outerGlowAlpha = alphaRatio * outerStrength * (1. - curColor.a) * uAlpha;
    float outerGlowStrength = min(1. - innerColor.a, outerGlowAlpha);
    vec4 outerGlowColor = outerGlowStrength * glowColor.rgba;

    if (knockout) {
      float resultAlpha = outerGlowAlpha + innerGlowAlpha;
      finalColor = vec4(glowColor.rgb * resultAlpha, resultAlpha);
    }
    else {
      finalColor = innerColor + outerGlowColor;
    }
}
`,Ct=`struct GlowUniforms {
  uDistance: f32,
  uStrength: vec2<f32>,
  uColor: vec3<f32>,
  uAlpha: f32,
  uQuality: f32,
  uKnockout: f32,
};

struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> glowUniforms : GlowUniforms;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  let quality = glowUniforms.uQuality;
  let distance = glowUniforms.uDistance;

  let dist: f32 = glowUniforms.uDistance;
  let angleStepSize: f32 = min(1. / quality / distance, PI * 2.0);
  let angleStepNum: f32 = ceil(PI * 2.0 / angleStepSize);

  let px: vec2<f32> = vec2<f32>(1.0 / gfu.uInputSize.xy);

  var totalAlpha: f32 = 0.0;

  var direction: vec2<f32>;
  var displaced: vec2<f32>;
  var curColor: vec4<f32>;

  for (var angle = 0.0; angle < PI * 2.0; angle += angleStepSize) {
    direction = vec2<f32>(cos(angle), sin(angle)) * px;
    for (var curDistance = 0.0; curDistance < dist; curDistance+=1) {
      displaced = vec2<f32>(clamp(uv + direction * (curDistance + 1.0), gfu.uInputClamp.xy, gfu.uInputClamp.zw));
      curColor = textureSample(uTexture, uSampler, displaced);
      totalAlpha += (dist - curDistance) * curColor.a;
    }
  }
    
  curColor = textureSample(uTexture, uSampler, uv);

  let glowColorRGB = glowUniforms.uColor;
  let glowAlpha = glowUniforms.uAlpha;
  let glowColor = vec4<f32>(glowColorRGB, glowAlpha);
  let knockout: bool = glowUniforms.uKnockout > 0.5;
  let innerStrength = glowUniforms.uStrength[0];
  let outerStrength = glowUniforms.uStrength[1];

  let alphaRatio: f32 = (totalAlpha / (angleStepNum * dist * (dist + 1.0) / 2.0));
  let innerGlowAlpha: f32 = (1.0 - alphaRatio) * innerStrength * curColor.a * glowAlpha;
  let innerGlowStrength: f32 = min(1.0, innerGlowAlpha);
  
  let innerColor: vec4<f32> = mix(curColor, glowColor, innerGlowStrength);
  let outerGlowAlpha: f32 = alphaRatio * outerStrength * (1. - curColor.a) * glowAlpha;
  let outerGlowStrength: f32 = min(1.0 - innerColor.a, outerGlowAlpha);
  let outerGlowColor: vec4<f32> = outerGlowStrength * glowColor.rgba;
  
  if (knockout) {
    let resultAlpha: f32 = outerGlowAlpha + innerGlowAlpha;
    return vec4<f32>(glowColor.rgb * resultAlpha, resultAlpha);
  }
  else {
    return innerColor + outerGlowColor;
  }
}

const PI: f32 = 3.14159265358979323846264;`,It=Object.defineProperty,Pt=(D,t,i)=>t in D?It(D,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):D[t]=i,Z=(D,t,i)=>(Pt(D,typeof t!="symbol"?t+"":t,i),i);const lt=class ht extends et{constructor(t){t={...ht.DEFAULT_OPTIONS,...t};const i=t.distance??10,p=t.quality??.1,l=ot.from({vertex:{source:it,entryPoint:"mainVertex"},fragment:{source:Ct,entryPoint:"mainFragment"}}),r=st.from({vertex:nt,fragment:St.replace(/__ANGLE_STEP_SIZE__/gi,`${(1/p/i).toFixed(7)}`).replace(/__DIST__/gi,`${i.toFixed(0)}.0`),name:"glow-filter"});super({gpuProgram:l,glProgram:r,resources:{glowUniforms:{uDistance:{value:i,type:"f32"},uStrength:{value:[t.innerStrength,t.outerStrength],type:"vec2<f32>"},uColor:{value:new Float32Array(3),type:"vec3<f32>"},uAlpha:{value:t.alpha,type:"f32"},uQuality:{value:p,type:"f32"},uKnockout:{value:t?.knockout??!1?1:0,type:"f32"}}},padding:i}),Z(this,"uniforms"),Z(this,"_color"),this.uniforms=this.resources.glowUniforms.uniforms,this._color=new wt,this.color=t.color??16777215}get distance(){return this.uniforms.uDistance}set distance(t){this.uniforms.uDistance=this.padding=t}get innerStrength(){return this.uniforms.uStrength[0]}set innerStrength(t){this.uniforms.uStrength[0]=t}get outerStrength(){return this.uniforms.uStrength[1]}set outerStrength(t){this.uniforms.uStrength[1]=t}get color(){return this._color.value}set color(t){this._color.setValue(t);const[i,p,l]=this._color.toArray();this.uniforms.uColor[0]=i,this.uniforms.uColor[1]=p,this.uniforms.uColor[2]=l}get alpha(){return this.uniforms.uAlpha}set alpha(t){this.uniforms.uAlpha=t}get quality(){return this.uniforms.uQuality}set quality(t){this.uniforms.uQuality=t}get knockout(){return this.uniforms.uKnockout===1}set knockout(t){this.uniforms.uKnockout=t?1:0}};Z(lt,"DEFAULT_OPTIONS",{distance:10,outerStrength:4,innerStrength:0,color:16777215,alpha:1,quality:.1,knockout:!1});let bt=lt;var At=`
precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uCenter;
uniform float uTime;
uniform float uSpeed;
uniform vec4 uWave;

uniform vec4 uInputSize;
uniform vec4 uInputClamp;

const float PI = 3.14159;

void main()
{
    float uAmplitude = uWave[0];
    float uWavelength = uWave[1];
    float uBrightness = uWave[2];
    float uRadius = uWave[3];

    float halfWavelength = uWavelength * 0.5 / uInputSize.x;
    float maxRadius = uRadius / uInputSize.x;
    float currentRadius = uTime * uSpeed / uInputSize.x;

    float fade = 1.0;

    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            finalColor = texture(uTexture, vTextureCoord);
            return;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }

    vec2 dir = vec2(vTextureCoord - uCenter / uInputSize.xy);
    dir.y *= uInputSize.y / uInputSize.x;
    float dist = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        finalColor = texture(uTexture, vTextureCoord);
        return;
    }

    vec2 diffUV = normalize(dir);

    float diff = (dist - currentRadius) / halfWavelength;

    float p = 1.0 - pow(abs(diff), 2.0);

    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );
    float powDiff = 1.25 * sin(diff * PI) * p * ( uAmplitude * fade );

    vec2 offset = diffUV * powDiff / uInputSize.xy;

    // Do clamp :
    vec2 coord = vTextureCoord + offset;
    vec2 clampedCoord = clamp(coord, uInputClamp.xy, uInputClamp.zw);
    vec4 color = texture(uTexture, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    // No clamp :
    // finalColor = texture(uTexture, vTextureCoord + offset);

    color.rgb *= 1.0 + (uBrightness - 1.0) * p * fade;

    finalColor = color;
}
`,_t=`
struct ShockWaveUniforms {
    uTime: f32,
    uOffset: vec2<f32>,
    uSpeed: f32,
    uWave: vec4<f32>,
};

struct GlobalFilterUniforms {
    uInputSize:vec4<f32>,
    uInputPixel:vec4<f32>,
    uInputClamp:vec4<f32>,
    uOutputFrame:vec4<f32>,
    uGlobalFrame:vec4<f32>,
    uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> shockwaveUniforms : ShockWaveUniforms;

@fragment
fn mainFragment(
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {

    let uTime = shockwaveUniforms.uTime;
    let uOffset = shockwaveUniforms.uOffset;
    let uSpeed = shockwaveUniforms.uSpeed;
    let uAmplitude = shockwaveUniforms.uWave[0];
    let uWavelength = shockwaveUniforms.uWave[1];
    let uBrightness = shockwaveUniforms.uWave[2];
    let uRadius = shockwaveUniforms.uWave[3];
    let halfWavelength: f32 = uWavelength * 0.5 / gfu.uInputSize.x;
    let maxRadius: f32 = uRadius / gfu.uInputSize.x;
    let currentRadius: f32 = uTime * uSpeed / gfu.uInputSize.x;
    var fade: f32 = 1.0;
    var returnColorOnly: bool = false;
    
    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            returnColorOnly = true;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }
    var dir: vec2<f32> = vec2<f32>(uv - uOffset / gfu.uInputSize.xy);
    dir.y *= gfu.uInputSize.y / gfu.uInputSize.x;

    let dist:f32 = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        returnColorOnly = true;
    }

    let diffUV: vec2<f32> = normalize(dir);
    let diff: f32 = (dist - currentRadius) / halfWavelength;
    let p: f32 = 1.0 - pow(abs(diff), 2.0);
    let powDiff: f32 = 1.25 * sin(diff * PI) * p * ( uAmplitude * fade );
    let offset: vec2<f32> = diffUV * powDiff / gfu.uInputSize.xy;
    // Do clamp :
    let coord: vec2<f32> = uv + offset;
    let clampedCoord: vec2<f32> = clamp(coord, gfu.uInputClamp.xy, gfu.uInputClamp.zw);

    var clampedColor: vec4<f32> = textureSample(uTexture, uSampler, clampedCoord);
    
    if (boolVec2(coord, clampedCoord)) 
    {
        clampedColor *= max(0.0, 1.0 - length(coord - clampedCoord));
    }
    // No clamp :
    var finalColor = clampedColor;

    return select(finalColor, textureSample(uTexture, uSampler, uv), returnColorOnly);
}

fn boolVec2(x: vec2<f32>, y: vec2<f32>) -> bool
{
    if (x.x == y.x && x.y == y.y)
    {
        return true;
    }
    
    return false;
}

const PI: f32 = 3.14159265358979323846264;
`,qt=Object.defineProperty,Ot=(D,t,i)=>t in D?qt(D,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):D[t]=i,Y=(D,t,i)=>(Ot(D,typeof t!="symbol"?t+"":t,i),i);const ct=class ut extends et{constructor(...t){let i=t[0]??{};(Array.isArray(i)||"x"in i&&"y"in i)&&(gt("6.0.0","ShockwaveFilter constructor params are now options object. See params: { center, speed, amplitude, wavelength, brightness, radius, time }"),i={center:i,...t[1]},t[2]!==void 0&&(i.time=t[2])),i={...ut.DEFAULT_OPTIONS,...i};const p=ot.from({vertex:{source:it,entryPoint:"mainVertex"},fragment:{source:_t,entryPoint:"mainFragment"}}),l=st.from({vertex:nt,fragment:At,name:"shockwave-filter"});super({gpuProgram:p,glProgram:l,resources:{shockwaveUniforms:{uTime:{value:i.time,type:"f32"},uCenter:{value:i.center,type:"vec2<f32>"},uSpeed:{value:i.speed,type:"f32"},uWave:{value:new Float32Array(4),type:"vec4<f32>"}}}}),Y(this,"uniforms"),Y(this,"time"),this.time=0,this.uniforms=this.resources.shockwaveUniforms.uniforms,Object.assign(this,i)}apply(t,i,p,l){this.uniforms.uTime=this.time,t.applyFilter(this,i,p,l)}get center(){return this.uniforms.uCenter}set center(t){Array.isArray(t)&&(t={x:t[0],y:t[1]}),this.uniforms.uCenter=t}get centerX(){return this.uniforms.uCenter.x}set centerX(t){this.uniforms.uCenter.x=t}get centerY(){return this.uniforms.uCenter.y}set centerY(t){this.uniforms.uCenter.y=t}get speed(){return this.uniforms.uSpeed}set speed(t){this.uniforms.uSpeed=t}get amplitude(){return this.uniforms.uWave[0]}set amplitude(t){this.uniforms.uWave[0]=t}get wavelength(){return this.uniforms.uWave[1]}set wavelength(t){this.uniforms.uWave[1]=t}get brightness(){return this.uniforms.uWave[2]}set brightness(t){this.uniforms.uWave[2]=t}get radius(){return this.uniforms.uWave[3]}set radius(t){this.uniforms.uWave[3]=t}};Y(ct,"DEFAULT_OPTIONS",{center:{x:0,y:0},speed:500,amplitude:30,wavelength:160,brightness:1,radius:-1});let Ft=ct;const R={PIXEL:3,MAX_LIVE:6,WAIT_MAX:600,BLUR_MAX:.3,FILTER_MAX:2,FPS_LOW:50,FPS_OK:57,tiers:[{name:"Ⅰ",dur:.35,arcs:1,cross:!1,len:1,thick:.22,ghosts:0,flash:0,sparks:0,hitstop:0,shock:!1,shake:0,glow:!1},{name:"Ⅱ",dur:.45,arcs:1,cross:!1,len:1.12,thick:.26,ghosts:2,flash:.55,sparks:0,hitstop:0,shock:!1,shake:0,glow:!1},{name:"Ⅲ",dur:.6,arcs:3,cross:!1,len:1.18,thick:.24,ghosts:2,flash:.75,sparks:16,hitstop:.06,shock:!1,shake:1,glow:!1},{name:"Ⅳ",dur:.9,arcs:2,cross:!0,len:1.45,thick:.3,ghosts:3,flash:1,sparks:26,hitstop:.08,shock:!0,shake:3,glow:!0}],shake:[0,2,4,7]},J={cut:{shape:"crescent",colors:[737144,3117024,11068159],hi:16777215,spark:"square",sound:"cut"},smash:{shape:"crescent",colors:[6957576,15233050,16765066],hi:16774368,spark:"square",sound:"smash"},sweep:{shape:"crescent",colors:[743988,3131514,11861976],hi:16777215,spark:"shard",sound:"cut"},wind:{shape:"crescent",colors:[744026,4184264,13172724],hi:16777215,spark:"shard",sound:"cut"},light:{shape:"crescent",colors:[8014342,16103498,16773808],hi:16777215,spark:"square",sound:"cut"},dark:{shape:"crescent",colors:[1706032,8008920,14204159],hi:16051455,spark:"shard",sound:"cut"},mech:{shape:"crescent",colors:[3817288,10135220,15659766],hi:16760906,spark:"square",sound:"smash"},water:{shape:"crescent",colors:[735850,3120096,12577535],hi:16777215,spark:"square",sound:"cut"},arcane:{shape:"crescent",colors:[2755162,9063679,15127807],hi:16777215,spark:"shard",sound:"cut"},star:{shape:"crescent",colors:[8016384,16767050,16775368],hi:16777215,spark:"square",sound:"cut"},frost:{shape:"crescent",colors:[739962,7128831,15268095],hi:16777215,spark:"shard",sound:"cut"}},ft={slash:{fam:"cut",tier:2,slit:1.1,dur:.62,cuts:[{at:0,phi:.78,rad:.62,len:1.45,sweep:.95,thick:.34,oy:-.12,ghosts:2},{at:.08,phi:1.22,rad:.62,len:1.45,sweep:.95,thick:.34,oy:.04,ghosts:2},{at:.16,phi:.56,rad:.7,len:1.5,sweep:.9,thick:.3,oy:.18,ghosts:2}],sparks:20,flash:.8,hitstop:.06,shake:1},hammer:{fam:"smash",tier:2,dur:.66,cuts:[{at:0,phi:.92,rad:.75,sweep:.85,thick:.5,len:1.45,ghosts:2}],sparks:18,flash:.9,hitstop:.09,shake:2,extra:"crack"},quake:{fam:"smash",tier:3,dur:.95,cuts:[{at:0,phi:.95,rad:.82,sweep:.9,thick:.55,len:1.65,ghosts:3}],sparks:30,flash:1,hitstop:.1,shake:3,shock:!0,extra:"quake"},spin:{fam:"sweep",tier:2,slit:1.2,dur:.6,cuts:[{at:0,phi:.5,rad:.8,len:1.35,sweep:.85,thick:.26,oy:-.24,ghosts:2},{at:.07,phi:.5,rad:.85,len:1.4,sweep:.9,thick:.3,oy:0,ghosts:2},{at:.14,phi:.5,rad:.8,len:1.35,sweep:.85,thick:.26,oy:.24,ghosts:2}],sparks:18,flash:.75,hitstop:.06,shake:1,extra:"gust"},reap:{fam:"sweep",tier:3,slit:1.5,dur:.9,cuts:[{at:0,phi:.7,rad:.62,sweep:1.15,thick:.2,len:1.6,ghosts:3},{at:.13,phi:1.3,rad:.62,sweep:1.1,thick:.18,len:1.5,ghosts:2}],sparks:28,flash:1,hitstop:.08,shake:3,shock:!0,glow:!0},wblade:{fam:"wind",tier:0,slit:1,dur:.5,cuts:[{at:0,phi:.62,rad:.62,len:1.35,sweep:.8,thick:.32,ghosts:2}],sparks:12,flash:.6,extra:"fly"},shade:{fam:"dark",tier:0,slit:1.1,dur:.5,cuts:[{at:0,phi:.8,rad:.64,len:1.35,sweep:.85,thick:.32,ghosts:2}],sparks:12,flash:.6},claw:{fam:"dark",tier:1,slit:.9,dur:.55,cuts:[-.22,0,.22].map((D,t)=>({at:t*.035,phi:.8,rad:.7,len:1.25,sweep:.7,thick:.16,ox:D*.7,oy:-D*.7,ghosts:1})),sparks:16,flash:.7,hitstop:.04,shake:1},phantom:{fam:"dark",tier:2,slit:1.1,dur:.66,cuts:[{at:0,phi:.75,rad:.62,len:1.4,sweep:.9,thick:.28,ghosts:3},{at:.06,phi:1.25,rad:.62,len:1.4,sweep:.9,thick:.28,ghosts:3},{at:.12,phi:.5,rad:.75,len:1.45,sweep:.85,thick:.26,ghosts:3}],sparks:22,flash:.85,hitstop:.06,shake:1,extra:"ghost"},eclipse:{fam:"dark",tier:3,slit:1.5,dur:.95,cuts:[{at:0,phi:.78,rad:.62,len:1.7,sweep:1.05,thick:.38,ghosts:3},{at:.08,phi:1.22,rad:.62,len:1.7,sweep:1.05,thick:.38,ghosts:3}],sparks:40,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"eclipse"},bulwark:{fam:"light",tier:1,dur:.7,cuts:[],sparks:20,flash:.9,hitstop:.09,shake:2,extra:"shield"},holysword:{fam:"light",tier:2,dur:.75,cuts:[],sparks:24,flash:1,hitstop:.08,shake:2,extra:"sword"},skylance:{fam:"light",tier:3,dur:.95,cuts:[],sparks:36,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"lance"},wrench:{fam:"mech",tier:0,dur:.5,cuts:[{at:0,phi:.85,rad:.7,len:1.2,sweep:.7,thick:.45,ghosts:1}],sparks:14,flash:.8,hitstop:.05,shake:1,extra:"clang"},cog:{fam:"mech",tier:1,dur:.75,cuts:[],sparks:22,flash:.8,hitstop:.06,shake:1,extra:"cog"},piston:{fam:"mech",tier:2,dur:.8,cuts:[],sparks:20,flash:.9,hitstop:.09,shake:2,extra:"piston"},drill:{fam:"mech",tier:3,dur:.95,cuts:[],sparks:40,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"drill"},aqua:{fam:"water",tier:0,slit:1.1,dur:.5,cuts:[{at:0,phi:.72,rad:.64,len:1.35,sweep:.85,thick:.32,ghosts:2}],sparks:16,flash:.6},wave:{fam:"water",tier:1,dur:.7,cuts:[],sparks:18,flash:.7,hitstop:.05,shake:1,extra:"wave"},anchor:{fam:"water",tier:2,dur:.8,cuts:[],sparks:22,flash:.9,hitstop:.09,shake:2,extra:"anchor"},tsunami:{fam:"water",tier:3,slit:1.4,dur:1,cuts:[{at:0,phi:.78,rad:.62,len:1.65,sweep:1,thick:.38,ghosts:3},{at:.08,phi:1.22,rad:.62,len:1.65,sweep:1,thick:.38,ghosts:3}],sparks:36,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"tsunami"},vortex:{fam:"arcane",tier:2,dur:.85,cuts:[],sparks:30,flash:1,hitstop:.08,shake:2,extra:"vortex"},twinkle:{fam:"star",tier:0,dur:.6,cuts:[],sparks:16,flash:.9,hitstop:.05,shake:1,extra:"star"},void:{fam:"arcane",tier:3,dur:1,cuts:[],sparks:40,flash:1,hitstop:.1,shake:3,shock:!0,glow:!0,extra:"void"},ice:{fam:"frost",tier:2,dur:.8,cuts:[],sparks:26,flash:.9,hitstop:.08,shake:2,extra:"shatter"},spikes:{fam:"frost",tier:1,dur:.75,cuts:[],sparks:18,flash:.8,hitstop:.06,shake:1,extra:"spikes"},radiant:{fam:"light",tier:0,slit:1.2,dur:.5,cuts:[{at:0,phi:.75,rad:.66,len:1.4,sweep:.85,thick:.34,ghosts:2}],sparks:16,flash:.8,extra:"holy"}},pt={a:{},b:{rad:.5,len:1.4,thick:.34,ghosts:2,sparks:46,stagger:.07,bigFlash:1,shards:!0,sweep:1.05},c:{rad:.56,len:1.5,thick:.5,ghosts:6,ghostGap:.07,ghostAlpha:.5,sparks:30,dur:1,sweep:1},d:{rad:.62,len:1.7,thick:.4,ghosts:3,ghostGap:.1,ghostAlpha:.32,sparks:54,stagger:.08,bigFlash:1,shards:!0,sweep:1.05,dur:1,flash:1}};function Gt(D){let t=D>>>0||1;return()=>(t^=t<<13,t^=t>>>17,t^=t<<5,(t>>>0)%1e5/1e5)}const E=D=>1-(1-D)*(1-D),C=(D,t=0,i=1)=>Math.max(t,Math.min(i,D)),j={};let zt=null;function dt(D=typeof import.meta<"u"?"./":"/"){return zt??=Promise.all(Object.keys($).filter(t=>t!=="dragon").map(async t=>{const i=$[t],p=await kt.load(`${D}art/${i.src}`).catch(()=>null);p&&(p.source.scaleMode="linear",j[t]=Array.from({length:i.n},(l,r)=>new xt({source:p.source,frame:new Mt(r*i.w,0,i.w,i.h)})))})).then(()=>{})}const Lt={hammer:"hammer",quake:"hammer",wrench:"wrench",cog:"cog",piston:"piston",drill:"drill",anchor:"anchor",holysword:"holysword",skylance:"skylance",bulwark:"shield"};class mt{constructor(t,i=0){this.o=t;const p=t.skill?ft[t.skill]??null:null;this.S=p;const l=R.tiers[C(p?p.tier:t.tier,0,3)];this.T=p?{...l,dur:p.dur,sparks:p.sparks??l.sparks,flash:p.flash??l.flash,hitstop:p.hitstop??l.hitstop,shake:p.shake??l.shake,shock:p.shock??l.shock,glow:p.glow??l.glow}:t.tier>=3?{...l,...pt[t.v??at()]}:l,this.C=J[p?p.fam:t.fam||"cut"]??J.cut,this.r=Gt(t.seed??7),this.level=i,this.makeSparks(),this.c.addChild(this.objC,this.g);const r=this.o.skill?Lt[this.o.skill]:void 0;r&&j[r]?.length&&(r!=="hammer"||j.crack?.length||this.o.skill==="hammer")&&(this.obj=r)}o;g=new Tt;t=0;done=!1;impacted=!1;level=0;c=new Q;objC=new Q;objs=[];obj=null;T;C;sparks=[];r;S=null;get impactT(){return this.T.dur*.32}makeSparks(){const t=Math.round(this.T.sparks*(this.level>=1?.5:1));this.sparks=[];const i=this.T.shards?2.6:1.6,p=this.T.shards?1.5:1;for(let l=0;l<t;l++){const r=(this.r()-.5)*i+(this.o.dir>0?0:Math.PI),m=(30+this.r()*70)*p;this.sparks.push({x:0,y:0,vx:Math.cos(r)*m,vy:Math.sin(r)*m-25,life:.25+this.r()*.3,size:this.r()<(this.T.shards?.6:.3)?2:1,col:this.r()<.4?this.C.hi:this.C.colors[2]})}}crescent(t,i,p,l,r,m,O,k,n){if(m<=O||n<=.02)return;const f=this.g,F=18,[w,S,b]=this.C.colors,M=(_,v,z,U)=>{const G=[];for(let q=0;q<=F;q++){const P=O+(m-O)*(q/F),x=l+(r-l)*P,V=Math.sin(Math.PI*((P-O)/Math.max(.001,m-O)))**.6;G.push(t+Math.cos(x)*(p-(p-v)*V),i+Math.sin(x)*(p-(p-v)*V))}for(let q=F;q>=0;q--){const P=O+(m-O)*(q/F),x=l+(r-l)*P;G.push(t+Math.cos(x)*_,i+Math.sin(x)*_)}f.poly(G).fill({color:z,alpha:U})};M(p,p-k*p,w,n*.9),M(p*(1-k*.15),p-k*p*.75,S,n),M(p*(1-k*.2),p-k*p*.38,b,n);const I=[],T=Math.max(O,m-.35);for(let _=0;_<=10;_++){const v=T+(m-T)*(_/10),z=l+(r-l)*v;I.push(t+Math.cos(z)*p*(1-k*.22),i+Math.sin(z)*p*(1-k*.22))}f.moveTo(I[0],I[1]);for(let _=2;_<I.length;_+=2)f.lineTo(I[_],I[_+1]);f.stroke({width:1,color:this.C.hi,alpha:n})}draw(t,i=!0,p=!1){if(this.S){this.drawSkill(t,i,p);return}const l=this.g,r=this.o,m=i?this.T:R.tiers[0],O=this.T.dur;l.clear();const k=r.x,n=r.y,f=Math.max(r.w,r.h)*.85*m.len*(this.T.rad??1),F=r.dir,w=this.level>=3?Math.min(1,m.arcs):m.arcs;for(let M=0;M<w;M++){const I=m.cross?M*(this.T.stagger??0):M*.12*O,T=t-I;if(T<0)continue;const _=m.dur*.75,v=C(T/_),z=E(C(v/.55)),U=C((v-.2)/.8)**1.4,G=1-C((v-.7)/.3),q=m.cross&&M===1?-1:1,P=F>0?q>0?Math.PI*.78:Math.PI*1.22:q>0?Math.PI*.22:-Math.PI*.22,x=f*(1-(m.cross?0:M*.07)),V=k+(m.cross?0:(M-(w-1)/2)*r.w*.16*F),H=n+(m.cross?0:(M-(w-1)/2)*r.h*.1),o=V-Math.cos(P)*x,s=H-Math.sin(P)*x,h=(this.T.sweep??.78)*Math.min(1.2,m.len),e=(F>0?1:-1)*q,a=P+h*e,c=P-h*e,u=this.T.ghostGap??.14,d=this.T.ghostAlpha??.22;if(i&&this.level<3)for(let g=m.ghosts;g>=1;g--)this.crescent(o,s,x,a+u*g*e,c+u*g*e,z,U,m.thick,G*(d/(d>.3?Math.sqrt(g):g)));this.crescent(o,s,x,a,c,z,U,m.thick,G)}const S=this.impactT;if(i&&m.flash&&!p&&this.level<3&&t>=S&&t<S+.1){const M=(t-S)/.1,I=Math.max(r.w,r.h)*(.35+.25*M)*m.len,T=Math.max(1,3*(1-M)),_=m.flash*(1-M);for(const[v,z]of[[1,0],[0,1],[.7,.7],[.7,-.7]]){const U=v&&z?I*.55:I;l.poly([k-v*U,n-z*U,k+z*T,n-v*T,k+v*U,n+z*U,k-z*T,n+v*T]).fill({color:this.C.hi,alpha:_})}l.circle(k,n,Math.max(2,Math.max(r.w,r.h)*.08*(1-M))).fill({color:this.C.hi,alpha:_})}const b=this.T.bigFlash??0;if(i&&b&&!p&&this.level<3&&t>=S&&t<S+.14){const M=(t-S)/.14,I=Math.max(r.w,r.h)*(.25+.55*M)*m.len;l.circle(k,n,I).fill({color:16777215,alpha:b*.85*(1-M)**1.5}),l.circle(k,n,I*.55).fill({color:this.C.colors[2],alpha:b*.6*(1-M)});const T=I*1.6,_=Math.max(1,4*(1-M));for(const[v,z]of[[.7,.7],[.7,-.7]])l.poly([k-v*T,n-z*T,k+z*_,n-v*_,k+v*T,n+z*T,k-z*_,n+v*_]).fill({color:16777215,alpha:b*(1-M)})}if(i&&t>=S){const M=t-S,I=!!this.T.shards;for(const T of this.sparks){if(M>T.life)continue;const _=k+T.vx*M,v=n+T.vy*M+60*M*M,z=1-M/T.life;if(I&&T.size>1){const U=T.vy+120*M,G=Math.hypot(T.vx,U)||1,q=4;l.moveTo(Math.round(_),Math.round(v)).lineTo(Math.round(_-T.vx/G*q),Math.round(v-U/G*q)).stroke({width:1,color:T.col,alpha:z})}else l.rect(Math.round(_),Math.round(v),T.size,T.size).fill({color:T.col,alpha:z})}}t>=S&&!this.impacted&&(this.impacted=!0,r.onImpact?.()),t>=this.T.dur+(i?.35:0)&&(this.done=!0)}spr(t,i,p,l,r,m){let O=this.objs[t];O||(O=new rt,this.objs[t]=O,this.objC.addChild(O));const k=j[i];O.texture=k[Math.min(p,k.length-1)],O.anchor.set(r,m),O.visible=!0,O.alpha=1,O.rotation=0;const n=l/$[i].h;return O.scale.set(n,n),O}drawObj(t){const i=this.o,p=this.obj,l=i.x,r=i.y,m=i.dir||1,O=this.impactT,k=t-O,n=this.g,f=r+i.h*.48;for(const S of this.objs)S&&(S.visible=!1);const F=S=>E(C(S)**1.6),w=(S,b=.2)=>k<S?1:1-C((k-S)/b);if(p==="hammer"){const S=this.o.skill==="quake",b=i.h*(S?1.5:1.1),M=k<0?F(t/O):1,I=k>=0&&k<.1?-Math.sin(k/.1*Math.PI)*i.h*.08:0,T=this.spr(0,"hammer",0,b,.5,1);T.x=l,T.y=r+i.h*.15-i.h*2.6*(1-M)+I,T.rotation=-m*.5*(1-M),T.alpha=w(.3)}if(p==="wrench"){const S=i.h*1.15,b=k<0?E(C(t/O)):1,M=k>=0?Math.sin(C(k/.18)*Math.PI)*.25:0,I=this.spr(0,"wrench",0,S,.5,.95);I.x=l-m*i.w*.75,I.y=r+i.h*.5,I.rotation=m*(-1.3+2.25*b-M),I.alpha=w(.25)}if(p==="cog"){const S=i.w*.34;let b=l,M=r,I=1;if(k<0)b=l-m*(i.w*2.4*(1-E(C(t/O)))+S*.4);else if(k<.12)b=l-m*S*.4;else{const _=(k-.12)/.35;b=l-m*(S*.4+i.w*.8*_),M=r-i.h*1.2*_,I=1-C(_)}const T=this.spr(0,"cog",0,S*2,.5,.5);T.x=b,T.y=M,T.rotation=t*18*m,T.alpha=I}if(p==="piston"){const S=i.h*1.25,b=k<0?F(t/O):1,M=this.spr(0,"piston",k<0?0:1,S,.5,1);M.x=l,M.y=r+i.h*.2-i.h*1.8*(1-b)+(k>=0&&k<.08?2:0),M.alpha=w(.3)}if(p==="drill"){const S=i.w*1.45,b=k<0?E(C(t/O)):1,M=l+m*i.w*.2-m*i.w*2.2*(1-b)+(k>=0&&k<.25?m*Math.sin(k*90)*1.5:0),I=this.spr(0,"drill",Math.floor(t/.05)%2,S*$.drill.h/$.drill.w,1,.5);I.scale.x*=m,I.x=M,I.y=r,I.alpha=w(.28)}if(p==="anchor"){const S=i.h*1.15,b=k<0?F(t/O):1,M=r+i.h*.45-i.h*2.6*(1-b),I=w(.3,.25);n.moveTo(l,M-S*.95).lineTo(l,M-S-i.h*2).stroke({width:2,color:4871522,alpha:I});const T=this.spr(0,"anchor",0,S,.5,1);T.x=l,T.y=M,T.alpha=I}if(p==="holysword"){const S=i.h*1.35,b=k<0?F(t/O):1,M=w(.3,.25);if(k>=0&&k<.45){const T=k/.45,_=i.w*(.5-.35*T);n.rect(l-_,r-i.h*3,_*2,i.h*3.5).fill({color:this.C.colors[2],alpha:.45*(1-T)}),n.rect(l-_*.4,r-i.h*3,_*.8,i.h*3.5).fill({color:16777215,alpha:.6*(1-T)})}const I=this.spr(0,"holysword",0,S,.5,1);I.x=l,I.y=r+i.h*.5-i.h*2.8*(1-b),I.alpha=M}if(p==="skylance"){const S=i.h*1.3,b=[-.12,0,.09],M=[-.42,0,.42];for(let I=0;I<3;I++){const T=O+b[I],_=t-T,v=_<0?F(t/T):1,z=l+M[I]*i.w*m,U=_<.3?1:1-C((_-.3)/.2);if(_>=0&&_<.35){const q=_/.35,P=i.w*(.22-.16*q);n.rect(z-P,r-i.h*3,P*2,i.h*3.5).fill({color:this.C.colors[2],alpha:.5*(1-q)})}const G=this.spr(I,"skylance",0,S,.5,1);G.x=z,G.y=r+i.h*(.45+I%2*.05)-i.h*2.8*(1-v),G.alpha=U}}if(p==="shield"){const S=i.h*.95,b=k<0?0:k<.12?1:2,M=k<0?E(C(t/O)):1,I=l-m*(i.w*2.2*(1-M)+i.w*.45),T=this.spr(0,"shield",b,S*(b===2?1+C((k-.12)/.4)*.25:1),.5,.5);T.x=I,T.y=r,T.alpha=b===2?1-C((k-.12)/.4):1}if((p==="hammer"||p==="piston")&&j.crack?.length&&k>=0){const S=this.o.skill==="quake",b=this.spr(4,"crack",Math.min(2,Math.floor(k/.07)),i.h*(S?.85:.6),.5,.5);b.x=l,b.y=f,b.alpha=1-C((k-.45)/.35),this.objC.setChildIndex(b,0)}}drawSkill(t,i,p){const l=this.g,r=this.o,m=this.S,O=this.T,k=O.dur;l.clear();const n=r.x,f=r.y,F=Math.max(r.w,r.h)*.85,w=r.dir||1,S=k*.62,b=!!this.obj,M=b&&!!j.crack?.length&&this.obj!=="anchor",I=b?[]:i?m.cuts:m.cuts.slice(0,1);b&&this.drawObj(t);const T=m.extra==="fly"?C(t/(S*.45)):1,_=(1-E(T))*-2.4*r.w*w;for(const o of I){const s=t-o.at;if(s<0)continue;const h=C(s/S),e=E(C(h/.5)),a=C((h-.18)/.82)**1.4,c=1-C((h-.7)/.3),u=F*(o.len??1)*(o.rad??1),d=Math.PI*(w>0?o.phi:1-o.phi),g=(o.sweep??.85)*Math.min(1.2,o.len??1),y=n+(o.ox??0)*r.w*w+_,A=f+(o.oy??0)*r.h,L=y-Math.cos(d)*u,W=A-Math.sin(d)*u;let X=d+g,N=d-g;Math.cos(X)>Math.cos(N)==w>0&&([X,N]=[N,X]);const B=Math.sign(N-X)||1,tt=o.thick??.28;if(i&&this.level<3)for(let K=o.ghosts??1;K>=1;K--)this.crescent(L,W,u,X-.14*K*B,N-.14*K*B,e,a,tt,c*(.22/K));this.crescent(L,W,u,X,N,e,a,tt,c)}if(m.extra==="fly"&&i&&T<1)for(let o=0;o<4;o++){const s=f+(o-1.5)*r.h*.14,h=n+_-w*r.w*(.4+o*.15);l.moveTo(Math.round(h),Math.round(s)).lineTo(Math.round(h-w*r.w*(.6+.2*o)),Math.round(s)).stroke({width:1,color:this.C.colors[2],alpha:.7*(1-T)})}if(m.slit&&i&&!p&&this.level<3)for(const o of I){const s=o.at+S*.22,h=(t-s)/.16;if(h<0||h>1)continue;const e=Math.PI*(w>0?o.phi:1-o.phi),a=e+Math.PI/2,c=Math.cos(a),u=Math.sin(a),d=-u,g=c,y=n+(o.ox??0)*r.w*w,A=f+(o.oy??0)*r.h,L=F*.75*m.slit*(.6+.4*E(C(h*3))),W=Math.max(.6,2.4*m.slit*Math.sin(Math.PI*Math.min(1,h*1.4))),X=1-h*h;l.poly([y-c*L,A-u*L,y+d*W,A+g*W,y+c*L,A+u*L,y-d*W,A-g*W]).fill({color:this.C.colors[2],alpha:X*.8}),l.poly([y-c*L*.8,A-u*L*.8,y+d*W*.45,A+g*W*.45,y+c*L*.8,A+u*L*.8,y-d*W*.45,A-g*W*.45]).fill({color:16777215,alpha:X})}const v=this.impactT;if(m.extra==="holy"&&i&&!p&&t>=v&&t<v+.22){const o=(t-v)/.22,s=1-o,h=F*(.7+.5*E(o)),e=h*.55,a=Math.max(1.5,5*(1-o));for(const[c,u]of[[this.C.colors[1],1],[16777215,.5]])l.poly([n,f-h*u,n+a*u,f,n,f+h*.6*u,n-a*u,f]).fill({color:c,alpha:s}),l.poly([n-e*u,f,n,f-a*u,n+e*u,f,n,f+a*u]).fill({color:c,alpha:s})}const z=this.C.hi,[U,G,q]=this.C.colors,P=(o,s,h)=>{h>.01&&l.poly(o).fill({color:s,alpha:Math.min(1,h)})};if(m.extra==="ghost"&&i&&t<S)for(let o=0;o<3;o++){const s=C((t-o*.06)/(S*.5));if(s<=0||s>=1)continue;const h=f+(o-1)*r.h*.3,e=n-w*r.w*(1.6-1.6*E(s));l.moveTo(Math.round(e),Math.round(h)).lineTo(Math.round(e-w*r.w*.9),Math.round(h)).stroke({width:2,color:G,alpha:.7*(1-s)})}if(m.extra==="eclipse"&&i&&t>=v&&t<v+.45){const o=(t-v)/.45,s=F*(.35+.55*E(o)),h=1-o;l.circle(n,f,s).stroke({width:Math.max(1,4*(1-o)),color:656404,alpha:h}),l.circle(n,f,s+2).stroke({width:1,color:16765802,alpha:h});for(let e=0;e<12;e++){const a=e/12*Math.PI*2+o*.6,c=s*(e%2?.35:.6);l.moveTo(n+Math.cos(a)*(s+2),f+Math.sin(a)*(s+2)).lineTo(n+Math.cos(a)*(s+2+c),f+Math.sin(a)*(s+2+c)).stroke({width:1,color:16771496,alpha:h*.9})}}if(m.extra==="shield"&&!b){const o=r.w*.36,s=r.h*.62,h=(e,a,c)=>[e-o*c,a-s*.5*c,e+o*c,a-s*.5*c,e+o*c,a+s*.05*c,e,a+s*.5*c,e-o*c,a+s*.05*c];if(t<v){const e=E(C(t/v)),a=n-w*(r.w*2.2*(1-e)+r.w*.45);if(P(h(a,f,1),U,1),P(h(a,f,.8),G,1),P(h(a,f,.45),q,1),l.moveTo(a,f-s*.4).lineTo(a,f+s*.4).stroke({width:1,color:z,alpha:.9}),i)for(let c=0;c<3;c++){const u=f+(c-1)*s*.3;l.moveTo(Math.round(a-w*o),Math.round(u)).lineTo(Math.round(a-w*(o+r.w*.8*(1-e))),Math.round(u)).stroke({width:1,color:q,alpha:.7})}}else{const e=t-v,a=n-w*r.w*.45;if(e<.06){P(h(a,f,1),U,1),P(h(a,f,.8),G,1);for(const[c,u]of[[.6,-.4],[-.5,.3],[.2,.45],[-.3,-.45]])l.moveTo(a,f).lineTo(a+c*o,f+u*s).stroke({width:1,color:16777215,alpha:1})}else for(let c=0;c<8;c++){const u=c/8*Math.PI*2+.3,d=r.w*(1.6+c%3*.5),g=e-.06,y=a+Math.cos(u)*d*g-w*r.w*.4*g,A=f+Math.sin(u)*d*g+90*g*g,L=1-C(g/.45),W=Math.max(2,o*.32),X=u+g*9;P([y+Math.cos(X)*W,A+Math.sin(X)*W,y+Math.cos(X+2.2)*W*.8,A+Math.sin(X+2.2)*W*.8,y+Math.cos(X+4.1)*W*.6,A+Math.sin(X+4.1)*W*.6],c%2?G:q,L)}}}if(m.extra==="sword"){const o=r.h*.95,s=r.w*.17,h=E(C(t/v)**1.6),e=f-r.h*2.4*(1-h)+r.h*.15,a=t<v?1:1-C((t-v-.25)/.25);if(b||(P([n,e,n+s,e-o*.12,n+s*.8,e-o,n-s*.8,e-o,n-s,e-o*.12],G,a),P([n,e,n+s*.4,e-o*.12,n+s*.3,e-o,n-s*.3,e-o,n-s*.4,e-o*.12],q,a),P([n-s*1.9,e-o+s*.2,n+s*1.9,e-o+s*.2,n+s*1.6,e-o-s*1.1,n-s*1.6,e-o-s*1.1],G,a),P([n-s*1.6,e-o-s*.2,n+s*1.6,e-o-s*.2,n+s*1.4,e-o-s*.7,n-s*1.4,e-o-s*.7],q,a),P([n-s*.7,e-o-s*1.2,n+s*.7,e-o-s*1.2,n+s*.7,e-o-s*4,n-s*.7,e-o-s*4],U,a),i&&t<v&&l.moveTo(n,e-o-s*4).lineTo(n,e-o-s*4-r.h*.8*(1-h)).stroke({width:2,color:q,alpha:.6})),t>=v&&t<v+.4){const c=(t-v)/.4,u=f+r.h*.48;l.ellipse(n,u,r.w*(.3+1.3*c),r.h*(.06+.1*c)).stroke({width:1,color:q,alpha:1-c})}}if(m.extra==="lance"&&!b){const o=n-w*r.w*2.6,s=n+w*r.w*1.6,h=C(t/(v*1.15)),e=o+(s-o)*E(h),a=t<v?1.5:Math.max(.5,7*Math.sin(Math.PI*C((t-v)/.4)));if((t<v+.4||!1)&&(P([o,f-a,e,f-a*.6,e,f+a*.6,o,f+a],G,.85),P([o,f-a*.45,e,f-a*.25,e,f+a*.25,o,f+a*.45],16777215,1)),h<1){const u=r.w*.75,d=r.h*.2;P([e+w*u,f,e,f-d,e-w*u*.3,f,e,f+d],q,1),P([e+w*u*.8,f,e,f-d*.4,e,f+d*.4],16777215,1)}}const x=t-v,V=(o,s,h,e)=>o.map((a,c)=>c%2?e+(o[c-1]*Math.sin(s)+a*Math.cos(s)):h+(a*Math.cos(s)-o[c+1]*Math.sin(s)));if(m.extra==="clang"&&i&&x>=0&&x<.2){const o=x/.2;for(let s=0;s<6;s++){const h=-Math.PI/2+(s-2.5)*.45+(w>0?.3:-.3),e=F*.15+F*.6*o,a=e+F*.25*(1-o);l.moveTo(n+Math.cos(h)*e,f+Math.sin(h)*e).lineTo(n+Math.cos(h)*a,f+Math.sin(h)*a).stroke({width:1,color:z,alpha:1-o})}}if(m.extra==="cog"){const o=r.w*.3,s=10,h=[];for(let d=0;d<s*2;d++){const g=d/(s*2)*Math.PI*2,y=d%2?o*.78:o;h.push(Math.cos(g)*y,Math.sin(g)*y)}let e=n,a=f,c=1;if(x<0){const d=E(C(t/v));e=n-w*(r.w*2.4*(1-d)+o*.4)}else if(x<.12)e=n-w*o*.4;else{const d=(x-.12)/.35;e=n-w*(o*.4+r.w*.8*d),a=f-r.h*1.2*d+60*d*d*0,c=1-C(d)}const u=t*18*w;if(c>.02&&!b&&(P(V(h,u,e,a),U,c),P(V(h.map(d=>d*.82),u,e,a),G,c),l.circle(e,a,o*.28).fill({color:U,alpha:c}),l.circle(e,a,o*.12).fill({color:q,alpha:c})),i&&x>=0&&x<.3)for(let d=0;d<8;d++){const g=x/.3,y=-Math.PI*.5-w*.6+(d-3.5)*.22,A=o*.6+F*.7*g;l.moveTo(e+Math.cos(y)*A,a+Math.sin(y)*A+40*g*g).lineTo(e+Math.cos(y)*(A+5),a+Math.sin(y)*(A+5)+40*g*g).stroke({width:1,color:z,alpha:1-g})}}if(m.extra==="piston"){const o=r.w*.45,s=r.h*.32,h=x<0?E(C(t/v)**1.5):1,e=f+r.h*.02-s-r.h*1.8*(1-h)+(x>=0&&x<.08?3:0),a=x<.3?1:1-C((x-.3)/.2);if(b||(P([n-r.w*.08,e-r.h*2,n+r.w*.08,e-r.h*2,n+r.w*.08,e,n-r.w*.08,e],U,a),P([n-o,e,n+o,e,n+o,e+s,n-o,e+s],U,a),P([n-o*.9,e+2,n+o*.9,e+2,n+o*.9,e+s-2,n-o*.9,e+s-2],G,a),P([n-o*.9,e+2,n+o*.9,e+2,n+o*.9,e+4,n-o*.9,e+4],q,a)),i&&x>=0&&x<.55)for(const c of[-1,1])for(let u=0;u<3;u++){const d=C((x-u*.05)/.5);d<=0||d>=1||l.circle(n+c*(o+r.w*.9*d+u*4),e+s*.6-r.h*.2*d,Math.max(1.5,r.w*(.08+.12*d))).fill({color:15265522,alpha:.7*(1-d)})}}if(m.extra==="drill"){const o=r.w*1.1,s=r.h*.28,h=x<0?E(C(t/v)):1,e=n+w*r.w*.15-w*r.w*2.2*(1-h)+(x>=0&&x<.25?w*Math.sin(x*90)*1.5:0),a=e-w*o,c=x<.28?1:1-C((x-.28)/.2);if(!b){P([e,f,a,f-s,a,f+s],U,c),P([e,f,a,f-s*.75,a,f+s*.75],G,c);for(let u=0;u<5;u++){const d=(u/5+t*6)%1,g=a+(e-a)*d,y=s*(1-d)*.85;l.moveTo(g,f-y).lineTo(g+w*3,f+y).stroke({width:1,color:q,alpha:c*.9})}P([a,f-s*1.1,a-w*r.w*.25,f-s*1.1,a-w*r.w*.25,f+s*1.1,a,f+s*1.1],U,c)}if(i&&x>=0&&x<.3)for(let u=0;u<10;u++){const d=x/.3,g=Math.PI*(w>0?1:0)+(u-4.5)*.3,y=r.w*.2+F*.8*d;l.rect(Math.round(n+Math.cos(g)*y),Math.round(f+Math.sin(g)*y+50*d*d),2,2).fill({color:u%2?z:9075304,alpha:1-d})}}if(m.extra==="wave"||m.extra==="tsunami"){const o=m.extra==="tsunami",s=o?v*.6:0,h=o?k*.7:k*.75,e=C((t-s)/h);if(e>0&&e<1){const a=n-w*r.w*(o?2.2:1.8)+w*r.w*(o?4:3.4)*E(e),c=r.h*(o?1.15:.8),u=f+r.h*.5,d=1-C((e-.75)/.25),g=r.w*(o?1.6:1.2);if(P([a-w*g,u,a-w*g*.6,u-c*.75,a-w*r.w*.15,u-c,a+w*r.w*.25,u-c*.8,a+w*r.w*.1,u-c*.55,a+w*r.w*.18,u],U,d*.9),P([a-w*g*.8,u,a-w*g*.5,u-c*.62,a-w*r.w*.12,u-c*.85,a+w*r.w*.15,u-c*.7,a+w*r.w*.02,u-c*.45,a+w*r.w*.05,u],G,d*.9),l.moveTo(a-w*g*.5,u-c*.62).lineTo(a-w*r.w*.12,u-c*.85).lineTo(a+w*r.w*.15,u-c*.7).stroke({width:2,color:q,alpha:d}),i)for(let y=0;y<6;y++){const A=a+w*r.w*(.05+y%3*.12),L=u-c*(.85-y*.08)-Math.sin(t*30+y)*2;l.circle(A,L,1.5).fill({color:16777215,alpha:d})}}}if(m.extra==="anchor"){const o=x<0?E(C(t/v)**1.6):1,s=f+r.h*.25-r.h*2.4*(1-o),h=x<.3?1:1-C((x-.3)/.25),e=r.w*.5,a=r.h*.9,c=4871522,u=12109008;if(!b){l.moveTo(n,s-a).lineTo(n,s-a-r.h*2).stroke({width:2,color:c,alpha:h}),P([n-e*.09,s-a,n+e*.09,s-a,n+e*.09,s,n-e*.09,s],c,h),P([n-e*.45,s-a*.75,n+e*.45,s-a*.75,n+e*.45,s-a*.66,n-e*.45,s-a*.66],c,h);const d=s-a*.35;l.moveTo(n+Math.cos(.15*Math.PI)*e,d+Math.sin(.15*Math.PI)*e).arc(n,d,e,.15*Math.PI,.85*Math.PI).stroke({width:3,color:c,alpha:h}),l.moveTo(n+Math.cos(.2*Math.PI)*(e-1),d+Math.sin(.2*Math.PI)*(e-1)).arc(n,d,e-1,.2*Math.PI,.8*Math.PI).stroke({width:1,color:u,alpha:h});for(const g of[-1,1])P([n+g*e*.98,s-a*.35+e*.42,n+g*e*1.18,s-a*.35+e*.12,n+g*e*.8,s-a*.35+e*.3],c,h);l.circle(n,s-a-e*.12,e*.13).stroke({width:2,color:c,alpha:h})}if(x>=0&&x<.5){const d=x/.5,g=f+r.h*.48;if(l.ellipse(n,g,r.w*(.4+1.4*d),r.h*(.08+.12*d)).stroke({width:2,color:q,alpha:1-d}),i)for(let y=0;y<9;y++){const A=-Math.PI*(.15+.7*(y/8)),L=r.w*(1.4+y%3*.4);l.circle(n+Math.cos(A)*L*d,g+Math.sin(A)*L*d+120*d*d,1.5).fill({color:y%2?q:G,alpha:1-d})}}}if(m.extra==="vortex"){if(x<0){const o=C(t/v);for(let s=0;s<3;s++){const h=[];for(let e=0;e<=16;e++){const a=e/16,c=F*(1.3-1.1*o)*(1-a*.85),u=s*(Math.PI*2/3)+a*4.2+o*7*w;h.push(n+Math.cos(u)*c,f+Math.sin(u)*c*.8)}l.moveTo(h[0],h[1]);for(let e=2;e<h.length;e+=2)l.lineTo(h[e],h[e+1]);l.stroke({width:2,color:s%2?G:q,alpha:.4+.6*o})}l.circle(n,f,Math.max(1,F*.12*(1-o))).fill({color:U,alpha:.9})}else if(x<.06)l.circle(n,f,2).fill({color:16777215,alpha:1});else if(x<.45){const o=(x-.06)/.39,s=1-o;for(let h=0;h<12;h++){const e=h/12*Math.PI*2,a=F*.2*o,c=F*(.4+.9*E(o))*(h%2?.7:1);l.moveTo(n+Math.cos(e)*a,f+Math.sin(e)*a).lineTo(n+Math.cos(e)*c,f+Math.sin(e)*c).stroke({width:h%2?1:2,color:h%3?q:16777215,alpha:s})}l.circle(n,f,F*(.25+.8*E(o))).stroke({width:Math.max(1,3*s),color:G,alpha:s})}}const H=(o,s,h,e)=>{const a=[];for(let c=0;c<10;c++){const u=c%2?h*.45:h,d=e+c/10*Math.PI*2-Math.PI/2;a.push(o+Math.cos(d)*u,s+Math.sin(d)*u)}return a};if(m.extra==="star"){if(x<0){const o=E(C(t/v)),s=n-w*r.w*2.2*(1-o),h=f-r.h*.5*Math.sin(Math.PI*o),e=r.w*.28;if(P(H(s,h,e,t*10),U,1),P(H(s,h,e*.75,t*10),G,1),P(H(s,h,e*.4,t*10),q,1),i)for(let a=1;a<=3;a++){const c=Math.max(0,o-a*.08),u=n-w*r.w*2.2*(1-c),d=f-r.h*.5*Math.sin(Math.PI*c);l.circle(u,d,Math.max(1,3-a*.7)).fill({color:q,alpha:.6/a})}}else if(x<.5){const o=x/.5,s=1-o;l.circle(n,f,F*(.2+.6*E(o))).stroke({width:Math.max(1,3*s),color:G,alpha:s});for(let h=0;h<8;h++){const e=h/8*Math.PI*2+.2,a=F*(.15+1*E(o));P(H(n+Math.cos(e)*a,f+Math.sin(e)*a+40*o*o,Math.max(3,r.w*.17*(1-o*.5)),o*8),h%2?G:q,s)}}}if(m.extra==="void"){if(x<0){const o=C(t/v),s=F*(.08+.32*o);for(let h=0;h<18;h++){const e=(h/18+o*1.6)%1,a=h*2.4+e*5*w,c=F*1.5*(1-e)+s;l.rect(Math.round(n+Math.cos(a)*c),Math.round(f+Math.sin(a)*c*.8),2,2).fill({color:h%3?q:16777215,alpha:.4+.6*e})}l.circle(n,f,s*1.25).stroke({width:2,color:G,alpha:.9}),l.circle(n,f,s).fill({color:328200,alpha:1})}else if(x<.05)l.circle(n,f,2).fill({color:16777215,alpha:1});else if(x<.55){const o=(x-.05)/.5,s=1-o;for(const[h,e]of[[0,1],[1,.65]])l.circle(n,f,F*(.3+1.3*E(C(o-h*.12)))*e).stroke({width:Math.max(1,4*s),color:h?q:G,alpha:s});for(let h=0;h<16;h++){const e=h/16*Math.PI*2,a=F*(.5+1.1*E(o))*(h%2?.6:1);l.moveTo(n,f).lineTo(n+Math.cos(e)*a,f+Math.sin(e)*a).stroke({width:h%2?1:2,color:h%4?q:16777215,alpha:s})}}}if(m.extra==="shatter"||m.extra==="spikes"){const o=(e,a,c,u,d,g)=>{const y=Math.cos(d),A=Math.sin(d),L=-A,W=y;P([e-L*u,a-W*u,e+y*c,a+A*c,e+L*u,a+W*u],U,g),P([e-L*u*.55,a-W*u*.55,e+y*c*.92,a+A*c*.92,e+L*u*.2,a+W*u*.2],G,g),l.moveTo(e,a).lineTo(e+y*c*.85,a+A*c*.85).stroke({width:1,color:q,alpha:g})},s=f+r.h*.48;if((m.extra==="shatter"?[0,1,2,3,4,5].map(e=>{const a=-Math.PI/2+(e-2.5)*.55;return[n+Math.cos(a+Math.PI)*r.w*.15,f+r.h*.25,a,r.h*(.7+e%2*.25)]}):[0,1,2,3,4].map(e=>[n-w*r.w*(1.6-e*.4),s,-Math.PI/2+w*.15*(e-2),r.h*(.3+e*.16)])).forEach(([e,a,c,u],d)=>{const g=m.extra==="shatter"?d*.03:d*(v/5),y=C((t-g)/.12);if(!(y<=0)){if(x<.04||m.extra==="spikes"&&x<0)o(e,a,u*E(y),Math.max(3,r.w*(m.extra==="shatter"?.15:.13)),c,1);else if(x>=.04||m.extra==="spikes"){const A=C((x-.04)/.45);if(A>=1)return;for(let L=0;L<3;L++){const W=c+(L-1)*.9,X=F*(.9+L*.3),N=e+Math.cos(c)*u*.5+Math.cos(W)*X*A,B=a+Math.sin(c)*u*.5+Math.sin(W)*X*A+90*A*A;P([N,B-4,N+3.5,B+1,N-3.5,B+3],L%2?G:q,1-A)}}}}),x>=0&&x<.06)for(const[e,a]of[[.5,-.5],[-.45,.2],[.15,.5],[-.25,-.45]])l.moveTo(n,f).lineTo(n+e*r.w,f+a*r.h).stroke({width:1,color:16777215,alpha:1})}if((m.extra==="sword"||m.extra==="lance")&&i&&!p&&t>=v&&t<v+.22){const o=(t-v)/.22,s=1-o,h=F*(.8+.6*E(o)),e=h*.6,a=Math.max(1.5,5*(1-o));for(const[c,u]of[[G,1],[16777215,.5]])l.poly([n,f-h*u,n+a*u,f,n,f+h*.6*u,n-a*u,f]).fill({color:c,alpha:s}),l.poly([n-e*u,f,n,f-a*u,n+e*u,f,n,f+a*u]).fill({color:c,alpha:s})}if(m.extra==="gust"&&i&&t<S){const o=t/S;for(let s=0;s<4;s++){const h=f+(s-1.5)*r.h*.22,e=n+w*r.w*(-1.2+2.4*o+s*.1);l.moveTo(Math.round(e),Math.round(h)).lineTo(Math.round(e-w*r.w*.5),Math.round(h)).stroke({width:1,color:this.C.colors[2],alpha:.6*(1-o)})}}if((m.extra==="crack"||m.extra==="quake"||m.extra==="piston"||m.extra==="anchor")&&t>=v){const o=t-v,s=m.extra==="quake",h=f+r.h*.48,e=1-C((o-.35)/.4),a=C(o/.18);if(this.r,!M)for(const c of[-1,1]){let u=n,d=h;const g=r.w*(s?1.5:.8)*a,y=s?7:5;l.moveTo(Math.round(u),Math.round(d));for(let A=1;A<=y;A++)u=n+c*(g*A)/y,d=h+(A*37%5-2)*.8,l.lineTo(Math.round(u),Math.round(d));l.stroke({width:2,color:1707781,alpha:e}),l.moveTo(Math.round(n),Math.round(h-1));for(let A=1;A<=y;A++)l.lineTo(Math.round(n+c*(g*A)/y),Math.round(h-1+(A*37%5-2)*.8));l.stroke({width:1,color:this.C.colors[2],alpha:e*.7})}if(s&&o<.45)for(let c=0;c<2;c++){const u=C((o-c*.1)/.35);u<=0||u>=1||l.ellipse(n,h,r.w*(.4+1.4*u),r.h*(.08+.12*u)).stroke({width:1,color:this.C.colors[2],alpha:1-u})}if(s&&i)for(let c=0;c<5;c++){const u=n+(c-2)*r.w*.32,d=r.h*(.3+c*13%4*.09)*Math.sin(Math.PI*C(o/.5));if(d<=.5)continue;const g=Math.max(3,r.w*.09);l.poly([u-g,h,u-g*.3,h-d,u+g*.4,h-d*.85,u+g,h]).fill({color:5917242,alpha:e}),l.poly([u-g*.3,h-d,u+g*.4,h-d*.85,u+g*.1,h-d*.5]).fill({color:12363914,alpha:e})}if(i&&o<.5)for(let c=0;c<(s?8:5);c++){const u=o/.5,d=n+(c-(s?3.5:2))*r.w*.22*(.6+u),g=h-r.h*.12*u;l.circle(Math.round(d),Math.round(g),Math.max(1,r.w*.06*(.5+u))).fill({color:9075304,alpha:.5*(1-u)})}}if(i&&O.flash&&!p&&this.level<3&&t>=v&&t<v+.1){const o=(t-v)/.1,s=Math.max(r.w,r.h)*(.35+.25*o)*(1+m.tier*.12),h=Math.max(1,3*(1-o)),e=O.flash*(1-o);for(const[a,c]of[[1,0],[0,1],[.7,.7],[.7,-.7]]){const u=a&&c?s*.55:s;l.poly([n-a*u,f-c*u,n+c*h,f-a*h,n+a*u,f+c*u,n-c*h,f+a*h]).fill({color:this.C.hi,alpha:e})}l.circle(n,f,Math.max(2,Math.max(r.w,r.h)*.08*(1-o))).fill({color:this.C.hi,alpha:e})}if(i&&t>=v){const o=t-v;for(const s of this.sparks){if(o>s.life)continue;const h=n+s.vx*o,e=f+s.vy*o+60*o*o,a=1-o/s.life;l.rect(Math.round(h),Math.round(e),s.size,s.size).fill({color:s.col,alpha:a})}}t>=v&&!this.impacted&&(this.impacted=!0,r.onImpact?.()),t>=k+(i?.35:0)&&(this.done=!0)}}class Et{constructor(t,i,p,l,r){this.app=t,this.host=i,this.scene=p,this.rt=vt.create({width:Math.ceil(l/R.PIXEL),height:Math.ceil(r/R.PIXEL),scaleMode:"nearest",antialias:!1,resolution:1}),this.out=new rt(this.rt),this.out.scale.set(R.PIXEL),this.out.visible=!1,i.addChild(this.out),this.reduce=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches,t.ticker.add(this.tick),dt()}app;host;scene;draw=new Q;rt;out;live=[];queue=[];level=0;fps=60;lowT=0;okT=0;filters=0;fancy=!0;reduce=!1;forceLevel=null;shakeT=0;shakeAmp=0;resize(t,i){this.rt.resize(Math.ceil(t/R.PIXEL),Math.ceil(i/R.PIXEL))}add(t,i){const p=R.PIXEL,l={...t,x:t.x/p,y:t.y/p,w:t.w/p,h:t.h/p};return this.level>=4?!1:this.live.length>=(this.level>=2?3:R.MAX_LIVE)?(this.queue.push({o:l,at:performance.now(),fall:i}),!0):(this.start(l),!0)}start(t){const i=this.fancy?t.tier:0,p=new mt({...t,tier:i},this.level);this.live.push(p),this.draw.addChild(p.c);const l=R.tiers[C(i,0,3)],r=t.onImpact;p.o.onImpact=()=>{r?.(),this.fancy&&(l.shake&&!this.reduce&&(this.shakeAmp=Math.max(this.shakeAmp,R.shake[l.shake]??0),this.shakeT=.25),l.hitstop&&(p.t-=l.hitstop),l.shock&&this.level<2&&this.filters<R.FILTER_MAX&&this.shock(t.x*R.PIXEL,t.y*R.PIXEL,Math.max(t.w,t.h)*R.PIXEL),l.glow&&this.level<2&&this.filters<R.FILTER_MAX&&this.glow())}}shock(t,i,p){const l=new Ft({center:{x:t,y:i},amplitude:18,wavelength:90,brightness:1.15,speed:Math.max(400,p*3),radius:p*2.4,time:0});this.filters+=1,this.scene.filterArea=this.app.screen,this.scene.filters=[...this.scene.filters||[],l];const r=performance.now(),m=()=>{const O=(performance.now()-r)/1e3;l.time=O,O<R.BLUR_MAX+.25?requestAnimationFrame(m):(this.scene.filters=(this.scene.filters||[]).filter(k=>k!==l),this.filters-=1,l.destroy())};requestAnimationFrame(m)}glow(){const t=new bt({distance:6,outerStrength:2.2,innerStrength:0,color:13627135,quality:.2});this.filters+=1,this.out.filters=[t],setTimeout(()=>{this.out.filters=[],this.filters-=1,t.destroy()},R.BLUR_MAX*1e3)}tick=()=>{const t=Math.min(.05,this.app.ticker.deltaMS/1e3),i=this.app.ticker.deltaMS/1e3;for(this.fps=this.fps*.9+1e3/Math.max(1,this.app.ticker.deltaMS)*.1,this.forceLevel!=null?this.level=this.forceLevel:this.live.length&&(this.fps<R.FPS_LOW?(this.lowT+=i,this.okT=0,this.lowT>1&&this.level<4&&(this.level+=1,this.lowT=0)):this.fps>R.FPS_OK&&(this.okT+=i,this.lowT=0,this.okT>3&&this.level>0&&(this.level-=1,this.okT=0)));this.queue.length&&this.live.length<(this.level>=2?3:R.MAX_LIVE);){const p=this.queue.shift();performance.now()-p.at>R.WAIT_MAX?p.fall():this.start(p.o)}if(!this.live.length){this.out.visible&&(this.out.visible=!1,this.app.renderer.render({container:this.draw,target:this.rt,clear:!0})),this.unshake();return}for(const p of this.live)p.t+=t,p.draw(Math.max(0,p.t),this.fancy,this.reduce);for(const p of this.live.filter(l=>l.done))this.draw.removeChild(p.c),p.c.destroy({children:!0});if(this.live=this.live.filter(p=>!p.done),this.out.visible=!0,this.app.renderer.render({container:this.draw,target:this.rt,clear:!0}),this.shakeT>0){this.shakeT-=t;const p=Math.max(0,this.shakeT/.25);this.scene.x=(Math.random()-.5)*2*this.shakeAmp*p,this.scene.y=(Math.random()-.5)*2*this.shakeAmp*p,this.shakeT<=0&&this.unshake()}};unshake(){(this.scene.x||this.scene.y)&&(this.scene.x=0,this.scene.y=0),this.shakeAmp=0}destroy(){this.app.ticker.remove(this.tick),this.rt.destroy(!0)}}const Rt=Object.freeze(Object.defineProperty({__proto__:null,NUM:R,RECIPES:J,SKILLS:ft,SlashFx:mt,SlashLayer:Et,TWIN:pt,loadObjTex:dt,objTex:j,setTwin:yt,twinOf:at},Symbol.toStringTag,{value:"Module"}));export{bt as G,Et as S,Ft as a,Rt as s};
