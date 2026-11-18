import{Filter as Z,GpuProgram as j,GlProgram as Y,Color as ht,deprecation as ut,RenderTexture as ct,Sprite as ft,Container as pt,Graphics as dt}from"./lib-E5VvUVpg.js";import{an as J,aP as mt}from"./index-XyDQjWmm.js";var tt=`in vec2 aPosition;
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
`,et=`struct GlobalFilterUniforms {
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
}`,gt=`precision highp float;
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
`,wt=`struct GlowUniforms {
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

const PI: f32 = 3.14159265358979323846264;`,vt=Object.defineProperty,kt=(z,e,f)=>e in z?vt(z,e,{enumerable:!0,configurable:!0,writable:!0,value:f}):z[e]=f,B=(z,e,f)=>(kt(z,typeof e!="symbol"?e+"":e,f),f);const ot=class st extends Z{constructor(e){e={...st.DEFAULT_OPTIONS,...e};const f=e.distance??10,d=e.quality??.1,u=j.from({vertex:{source:et,entryPoint:"mainVertex"},fragment:{source:wt,entryPoint:"mainFragment"}}),n=Y.from({vertex:tt,fragment:gt.replace(/__ANGLE_STEP_SIZE__/gi,`${(1/d/f).toFixed(7)}`).replace(/__DIST__/gi,`${f.toFixed(0)}.0`),name:"glow-filter"});super({gpuProgram:u,glProgram:n,resources:{glowUniforms:{uDistance:{value:f,type:"f32"},uStrength:{value:[e.innerStrength,e.outerStrength],type:"vec2<f32>"},uColor:{value:new Float32Array(3),type:"vec3<f32>"},uAlpha:{value:e.alpha,type:"f32"},uQuality:{value:d,type:"f32"},uKnockout:{value:e?.knockout??!1?1:0,type:"f32"}}},padding:f}),B(this,"uniforms"),B(this,"_color"),this.uniforms=this.resources.glowUniforms.uniforms,this._color=new ht,this.color=e.color??16777215}get distance(){return this.uniforms.uDistance}set distance(e){this.uniforms.uDistance=this.padding=e}get innerStrength(){return this.uniforms.uStrength[0]}set innerStrength(e){this.uniforms.uStrength[0]=e}get outerStrength(){return this.uniforms.uStrength[1]}set outerStrength(e){this.uniforms.uStrength[1]=e}get color(){return this._color.value}set color(e){this._color.setValue(e);const[f,d,u]=this._color.toArray();this.uniforms.uColor[0]=f,this.uniforms.uColor[1]=d,this.uniforms.uColor[2]=u}get alpha(){return this.uniforms.uAlpha}set alpha(e){this.uniforms.uAlpha=e}get quality(){return this.uniforms.uQuality}set quality(e){this.uniforms.uQuality=e}get knockout(){return this.uniforms.uKnockout===1}set knockout(e){this.uniforms.uKnockout=e?1:0}};B(ot,"DEFAULT_OPTIONS",{distance:10,outerStrength:4,innerStrength:0,color:16777215,alpha:1,quality:.1,knockout:!1});let xt=ot;var Mt=`
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
`,Tt=`
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
`,St=Object.defineProperty,yt=(z,e,f)=>e in z?St(z,e,{enumerable:!0,configurable:!0,writable:!0,value:f}):z[e]=f,H=(z,e,f)=>(yt(z,typeof e!="symbol"?e+"":e,f),f);const rt=class at extends Z{constructor(...e){let f=e[0]??{};(Array.isArray(f)||"x"in f&&"y"in f)&&(ut("6.0.0","ShockwaveFilter constructor params are now options object. See params: { center, speed, amplitude, wavelength, brightness, radius, time }"),f={center:f,...e[1]},e[2]!==void 0&&(f.time=e[2])),f={...at.DEFAULT_OPTIONS,...f};const d=j.from({vertex:{source:et,entryPoint:"mainVertex"},fragment:{source:Tt,entryPoint:"mainFragment"}}),u=Y.from({vertex:tt,fragment:Mt,name:"shockwave-filter"});super({gpuProgram:d,glProgram:u,resources:{shockwaveUniforms:{uTime:{value:f.time,type:"f32"},uCenter:{value:f.center,type:"vec2<f32>"},uSpeed:{value:f.speed,type:"f32"},uWave:{value:new Float32Array(4),type:"vec4<f32>"}}}}),H(this,"uniforms"),H(this,"time"),this.time=0,this.uniforms=this.resources.shockwaveUniforms.uniforms,Object.assign(this,f)}apply(e,f,d,u){this.uniforms.uTime=this.time,e.applyFilter(this,f,d,u)}get center(){return this.uniforms.uCenter}set center(e){Array.isArray(e)&&(e={x:e[0],y:e[1]}),this.uniforms.uCenter=e}get centerX(){return this.uniforms.uCenter.x}set centerX(e){this.uniforms.uCenter.x=e}get centerY(){return this.uniforms.uCenter.y}set centerY(e){this.uniforms.uCenter.y=e}get speed(){return this.uniforms.uSpeed}set speed(e){this.uniforms.uSpeed=e}get amplitude(){return this.uniforms.uWave[0]}set amplitude(e){this.uniforms.uWave[0]=e}get wavelength(){return this.uniforms.uWave[1]}set wavelength(e){this.uniforms.uWave[1]=e}get brightness(){return this.uniforms.uWave[2]}set brightness(e){this.uniforms.uWave[2]=e}get radius(){return this.uniforms.uWave[3]}set radius(e){this.uniforms.uWave[3]=e}};H(rt,"DEFAULT_OPTIONS",{center:{x:0,y:0},speed:500,amplitude:30,wavelength:160,brightness:1,radius:-1});let It=rt;const L={PIXEL:3,MAX_LIVE:6,WAIT_MAX:600,BLUR_MAX:.3,FILTER_MAX:2,FPS_LOW:50,FPS_OK:57,tiers:[{name:"Ⅰ",dur:.35,arcs:1,cross:!1,len:1,thick:.22,ghosts:0,flash:0,sparks:0,hitstop:0,shock:!1,shake:0,glow:!1},{name:"Ⅱ",dur:.45,arcs:1,cross:!1,len:1.12,thick:.26,ghosts:2,flash:.55,sparks:0,hitstop:0,shock:!1,shake:0,glow:!1},{name:"Ⅲ",dur:.6,arcs:3,cross:!1,len:1.18,thick:.24,ghosts:2,flash:.75,sparks:16,hitstop:.06,shock:!1,shake:1,glow:!1},{name:"Ⅳ",dur:.9,arcs:2,cross:!0,len:1.45,thick:.3,ghosts:3,flash:1,sparks:26,hitstop:.08,shock:!0,shake:3,glow:!0}],shake:[0,2,4,7]},$={cut:{shape:"crescent",colors:[737144,3117024,11068159],hi:16777215,spark:"square",sound:"cut"},smash:{shape:"crescent",colors:[6957576,15233050,16765066],hi:16774368,spark:"square",sound:"smash"},sweep:{shape:"crescent",colors:[743988,3131514,11861976],hi:16777215,spark:"shard",sound:"cut"},wind:{shape:"crescent",colors:[744026,4184264,13172724],hi:16777215,spark:"shard",sound:"cut"},light:{shape:"crescent",colors:[8014342,16103498,16773808],hi:16777215,spark:"square",sound:"cut"},dark:{shape:"crescent",colors:[1706032,8008920,14204159],hi:16051455,spark:"shard",sound:"cut"},mech:{shape:"crescent",colors:[3817288,10135220,15659766],hi:16760906,spark:"square",sound:"smash"},water:{shape:"crescent",colors:[735850,3120096,12577535],hi:16777215,spark:"square",sound:"cut"},arcane:{shape:"crescent",colors:[2755162,9063679,15127807],hi:16777215,spark:"shard",sound:"cut"},star:{shape:"crescent",colors:[8016384,16767050,16775368],hi:16777215,spark:"square",sound:"cut"},frost:{shape:"crescent",colors:[739962,7128831,15268095],hi:16777215,spark:"shard",sound:"cut"}},nt={slash:{fam:"cut",tier:2,slit:1.1,dur:.62,cuts:[{at:0,phi:.78,rad:.62,len:1.45,sweep:.95,thick:.34,oy:-.12,ghosts:2},{at:.08,phi:1.22,rad:.62,len:1.45,sweep:.95,thick:.34,oy:.04,ghosts:2},{at:.16,phi:.56,rad:.7,len:1.5,sweep:.9,thick:.3,oy:.18,ghosts:2}],sparks:20,flash:.8,hitstop:.06,shake:1},hammer:{fam:"smash",tier:2,dur:.66,cuts:[{at:0,phi:.92,rad:.75,sweep:.85,thick:.5,len:1.45,ghosts:2}],sparks:18,flash:.9,hitstop:.09,shake:2,extra:"crack"},quake:{fam:"smash",tier:3,dur:.95,cuts:[{at:0,phi:.95,rad:.82,sweep:.9,thick:.55,len:1.65,ghosts:3}],sparks:30,flash:1,hitstop:.1,shake:3,shock:!0,extra:"quake"},spin:{fam:"sweep",tier:2,slit:1.2,dur:.6,cuts:[{at:0,phi:.5,rad:.8,len:1.35,sweep:.85,thick:.26,oy:-.24,ghosts:2},{at:.07,phi:.5,rad:.85,len:1.4,sweep:.9,thick:.3,oy:0,ghosts:2},{at:.14,phi:.5,rad:.8,len:1.35,sweep:.85,thick:.26,oy:.24,ghosts:2}],sparks:18,flash:.75,hitstop:.06,shake:1,extra:"gust"},reap:{fam:"sweep",tier:3,slit:1.5,dur:.9,cuts:[{at:0,phi:.7,rad:.62,sweep:1.15,thick:.2,len:1.6,ghosts:3},{at:.13,phi:1.3,rad:.62,sweep:1.1,thick:.18,len:1.5,ghosts:2}],sparks:28,flash:1,hitstop:.08,shake:3,shock:!0,glow:!0},wblade:{fam:"wind",tier:0,slit:1,dur:.5,cuts:[{at:0,phi:.62,rad:.62,len:1.35,sweep:.8,thick:.32,ghosts:2}],sparks:12,flash:.6,extra:"fly"},shade:{fam:"dark",tier:0,slit:1.1,dur:.5,cuts:[{at:0,phi:.8,rad:.64,len:1.35,sweep:.85,thick:.32,ghosts:2}],sparks:12,flash:.6},claw:{fam:"dark",tier:1,slit:.9,dur:.55,cuts:[-.22,0,.22].map((z,e)=>({at:e*.035,phi:.8,rad:.7,len:1.25,sweep:.7,thick:.16,ox:z*.7,oy:-z*.7,ghosts:1})),sparks:16,flash:.7,hitstop:.04,shake:1},phantom:{fam:"dark",tier:2,slit:1.1,dur:.66,cuts:[{at:0,phi:.75,rad:.62,len:1.4,sweep:.9,thick:.28,ghosts:3},{at:.06,phi:1.25,rad:.62,len:1.4,sweep:.9,thick:.28,ghosts:3},{at:.12,phi:.5,rad:.75,len:1.45,sweep:.85,thick:.26,ghosts:3}],sparks:22,flash:.85,hitstop:.06,shake:1,extra:"ghost"},eclipse:{fam:"dark",tier:3,slit:1.5,dur:.95,cuts:[{at:0,phi:.78,rad:.62,len:1.7,sweep:1.05,thick:.38,ghosts:3},{at:.08,phi:1.22,rad:.62,len:1.7,sweep:1.05,thick:.38,ghosts:3}],sparks:40,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"eclipse"},bulwark:{fam:"light",tier:1,dur:.7,cuts:[],sparks:20,flash:.9,hitstop:.09,shake:2,extra:"shield"},holysword:{fam:"light",tier:2,dur:.75,cuts:[],sparks:24,flash:1,hitstop:.08,shake:2,extra:"sword"},skylance:{fam:"light",tier:3,dur:.95,cuts:[],sparks:36,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"lance"},wrench:{fam:"mech",tier:0,dur:.5,cuts:[{at:0,phi:.85,rad:.7,len:1.2,sweep:.7,thick:.45,ghosts:1}],sparks:14,flash:.8,hitstop:.05,shake:1,extra:"clang"},cog:{fam:"mech",tier:1,dur:.75,cuts:[],sparks:22,flash:.8,hitstop:.06,shake:1,extra:"cog"},piston:{fam:"mech",tier:2,dur:.8,cuts:[],sparks:20,flash:.9,hitstop:.09,shake:2,extra:"piston"},drill:{fam:"mech",tier:3,dur:.95,cuts:[],sparks:40,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"drill"},aqua:{fam:"water",tier:0,slit:1.1,dur:.5,cuts:[{at:0,phi:.72,rad:.64,len:1.35,sweep:.85,thick:.32,ghosts:2}],sparks:16,flash:.6},wave:{fam:"water",tier:1,dur:.7,cuts:[],sparks:18,flash:.7,hitstop:.05,shake:1,extra:"wave"},anchor:{fam:"water",tier:2,dur:.8,cuts:[],sparks:22,flash:.9,hitstop:.09,shake:2,extra:"anchor"},tsunami:{fam:"water",tier:3,slit:1.4,dur:1,cuts:[{at:0,phi:.78,rad:.62,len:1.65,sweep:1,thick:.38,ghosts:3},{at:.08,phi:1.22,rad:.62,len:1.65,sweep:1,thick:.38,ghosts:3}],sparks:36,flash:1,hitstop:.09,shake:3,shock:!0,glow:!0,extra:"tsunami"},vortex:{fam:"arcane",tier:2,dur:.85,cuts:[],sparks:30,flash:1,hitstop:.08,shake:2,extra:"vortex"},twinkle:{fam:"star",tier:0,dur:.6,cuts:[],sparks:16,flash:.9,hitstop:.05,shake:1,extra:"star"},void:{fam:"arcane",tier:3,dur:1,cuts:[],sparks:40,flash:1,hitstop:.1,shake:3,shock:!0,glow:!0,extra:"void"},ice:{fam:"frost",tier:2,dur:.8,cuts:[],sparks:26,flash:.9,hitstop:.08,shake:2,extra:"shatter"},spikes:{fam:"frost",tier:1,dur:.75,cuts:[],sparks:18,flash:.8,hitstop:.06,shake:1,extra:"spikes"},radiant:{fam:"light",tier:0,slit:1.2,dur:.5,cuts:[{at:0,phi:.75,rad:.66,len:1.4,sweep:.85,thick:.34,ghosts:2}],sparks:16,flash:.8,extra:"holy"}},it={a:{},b:{rad:.5,len:1.4,thick:.34,ghosts:2,sparks:46,stagger:.07,bigFlash:1,shards:!0,sweep:1.05},c:{rad:.56,len:1.5,thick:.5,ghosts:6,ghostGap:.07,ghostAlpha:.5,sparks:30,dur:1,sweep:1},d:{rad:.62,len:1.7,thick:.4,ghosts:3,ghostGap:.1,ghostAlpha:.32,sparks:54,stagger:.08,bigFlash:1,shards:!0,sweep:1.05,dur:1,flash:1}};function Ct(z){let e=z>>>0||1;return()=>(e^=e<<13,e^=e>>>17,e^=e<<5,(e>>>0)%1e5/1e5)}const q=z=>1-(1-z)*(1-z),y=(z,e=0,f=1)=>Math.max(e,Math.min(f,z));class lt{constructor(e,f=0){this.o=e;const d=e.skill?nt[e.skill]??null:null;this.S=d;const u=L.tiers[y(d?d.tier:e.tier,0,3)];this.T=d?{...u,dur:d.dur,sparks:d.sparks??u.sparks,flash:d.flash??u.flash,hitstop:d.hitstop??u.hitstop,shake:d.shake??u.shake,shock:d.shock??u.shock,glow:d.glow??u.glow}:e.tier>=3?{...u,...it[e.v??J()]}:u,this.C=$[d?d.fam:e.fam||"cut"]??$.cut,this.r=Ct(e.seed??7),this.level=f,this.makeSparks()}o;g=new dt;t=0;done=!1;impacted=!1;level=0;T;C;sparks=[];r;S=null;get impactT(){return this.T.dur*.32}makeSparks(){const e=Math.round(this.T.sparks*(this.level>=1?.5:1));this.sparks=[];const f=this.T.shards?2.6:1.6,d=this.T.shards?1.5:1;for(let u=0;u<e;u++){const n=(this.r()-.5)*f+(this.o.dir>0?0:Math.PI),g=(30+this.r()*70)*d;this.sparks.push({x:0,y:0,vx:Math.cos(n)*g,vy:Math.sin(n)*g-25,life:.25+this.r()*.3,size:this.r()<(this.T.shards?.6:.3)?2:1,col:this.r()<.4?this.C.hi:this.C.colors[2]})}}crescent(e,f,d,u,n,g,W,F,a){if(g<=W||a<=.02)return;const c=this.g,A=18,[v,E,N]=this.C.colors,P=(_,I,S,C)=>{const T=[];for(let k=0;k<=A;k++){const R=W+(g-W)*(k/A),D=u+(n-u)*R,o=Math.sin(Math.PI*((R-W)/Math.max(.001,g-W)))**.6;T.push(e+Math.cos(D)*(d-(d-I)*o),f+Math.sin(D)*(d-(d-I)*o))}for(let k=A;k>=0;k--){const R=W+(g-W)*(k/A),D=u+(n-u)*R;T.push(e+Math.cos(D)*_,f+Math.sin(D)*_)}c.poly(T).fill({color:S,alpha:C})};P(d,d-F*d,v,a*.9),P(d*(1-F*.15),d-F*d*.75,E,a),P(d*(1-F*.2),d-F*d*.38,N,a);const O=[],w=Math.max(W,g-.35);for(let _=0;_<=10;_++){const I=w+(g-w)*(_/10),S=u+(n-u)*I;O.push(e+Math.cos(S)*d*(1-F*.22),f+Math.sin(S)*d*(1-F*.22))}c.moveTo(O[0],O[1]);for(let _=2;_<O.length;_+=2)c.lineTo(O[_],O[_+1]);c.stroke({width:1,color:this.C.hi,alpha:a})}draw(e,f=!0,d=!1){if(this.S){this.drawSkill(e,f,d);return}const u=this.g,n=this.o,g=f?this.T:L.tiers[0],W=this.T.dur;u.clear();const F=n.x,a=n.y,c=Math.max(n.w,n.h)*.85*g.len*(this.T.rad??1),A=n.dir,v=this.level>=3?Math.min(1,g.arcs):g.arcs;for(let P=0;P<v;P++){const O=g.cross?P*(this.T.stagger??0):P*.12*W,w=e-O;if(w<0)continue;const _=g.dur*.75,I=y(w/_),S=q(y(I/.55)),C=y((I-.2)/.8)**1.4,T=1-y((I-.7)/.3),k=g.cross&&P===1?-1:1,R=A>0?k>0?Math.PI*.78:Math.PI*1.22:k>0?Math.PI*.22:-Math.PI*.22,D=c*(1-(g.cross?0:P*.07)),o=F+(g.cross?0:(P-(v-1)/2)*n.w*.16*A),s=a+(g.cross?0:(P-(v-1)/2)*n.h*.1),i=o-Math.cos(R)*D,t=s-Math.sin(R)*D,r=(this.T.sweep??.78)*Math.min(1.2,g.len),l=(A>0?1:-1)*k,h=R+r*l,p=R-r*l,m=this.T.ghostGap??.14,M=this.T.ghostAlpha??.22;if(f&&this.level<3)for(let x=g.ghosts;x>=1;x--)this.crescent(i,t,D,h+m*x*l,p+m*x*l,S,C,g.thick,T*(M/(M>.3?Math.sqrt(x):x)));this.crescent(i,t,D,h,p,S,C,g.thick,T)}const E=this.impactT;if(f&&g.flash&&!d&&this.level<3&&e>=E&&e<E+.1){const P=(e-E)/.1,O=Math.max(n.w,n.h)*(.35+.25*P)*g.len,w=Math.max(1,3*(1-P)),_=g.flash*(1-P);for(const[I,S]of[[1,0],[0,1],[.7,.7],[.7,-.7]]){const C=I&&S?O*.55:O;u.poly([F-I*C,a-S*C,F+S*w,a-I*w,F+I*C,a+S*C,F-S*w,a+I*w]).fill({color:this.C.hi,alpha:_})}u.circle(F,a,Math.max(2,Math.max(n.w,n.h)*.08*(1-P))).fill({color:this.C.hi,alpha:_})}const N=this.T.bigFlash??0;if(f&&N&&!d&&this.level<3&&e>=E&&e<E+.14){const P=(e-E)/.14,O=Math.max(n.w,n.h)*(.25+.55*P)*g.len;u.circle(F,a,O).fill({color:16777215,alpha:N*.85*(1-P)**1.5}),u.circle(F,a,O*.55).fill({color:this.C.colors[2],alpha:N*.6*(1-P)});const w=O*1.6,_=Math.max(1,4*(1-P));for(const[I,S]of[[.7,.7],[.7,-.7]])u.poly([F-I*w,a-S*w,F+S*_,a-I*_,F+I*w,a+S*w,F-S*_,a+I*_]).fill({color:16777215,alpha:N*(1-P)})}if(f&&e>=E){const P=e-E,O=!!this.T.shards;for(const w of this.sparks){if(P>w.life)continue;const _=F+w.vx*P,I=a+w.vy*P+60*P*P,S=1-P/w.life;if(O&&w.size>1){const C=w.vy+120*P,T=Math.hypot(w.vx,C)||1,k=4;u.moveTo(Math.round(_),Math.round(I)).lineTo(Math.round(_-w.vx/T*k),Math.round(I-C/T*k)).stroke({width:1,color:w.col,alpha:S})}else u.rect(Math.round(_),Math.round(I),w.size,w.size).fill({color:w.col,alpha:S})}}e>=E&&!this.impacted&&(this.impacted=!0,n.onImpact?.()),e>=this.T.dur+(f?.35:0)&&(this.done=!0)}drawSkill(e,f,d){const u=this.g,n=this.o,g=this.S,W=this.T,F=W.dur;u.clear();const a=n.x,c=n.y,A=Math.max(n.w,n.h)*.85,v=n.dir||1,E=F*.62,N=f?g.cuts:g.cuts.slice(0,1),P=g.extra==="fly"?y(e/(E*.45)):1,O=(1-q(P))*-2.4*n.w*v;for(const o of N){const s=e-o.at;if(s<0)continue;const i=y(s/E),t=q(y(i/.5)),r=y((i-.18)/.82)**1.4,l=1-y((i-.7)/.3),h=A*(o.len??1)*(o.rad??1),p=Math.PI*(v>0?o.phi:1-o.phi),m=(o.sweep??.85)*Math.min(1.2,o.len??1),M=a+(o.ox??0)*n.w*v+O,x=c+(o.oy??0)*n.h,b=M-Math.cos(p)*h,G=x-Math.sin(p)*h;let U=p+m,X=p-m;Math.cos(U)>Math.cos(X)==v>0&&([U,X]=[X,U]);const V=Math.sign(X-U)||1,Q=o.thick??.28;if(f&&this.level<3)for(let K=o.ghosts??1;K>=1;K--)this.crescent(b,G,h,U-.14*K*V,X-.14*K*V,t,r,Q,l*(.22/K));this.crescent(b,G,h,U,X,t,r,Q,l)}if(g.extra==="fly"&&f&&P<1)for(let o=0;o<4;o++){const s=c+(o-1.5)*n.h*.14,i=a+O-v*n.w*(.4+o*.15);u.moveTo(Math.round(i),Math.round(s)).lineTo(Math.round(i-v*n.w*(.6+.2*o)),Math.round(s)).stroke({width:1,color:this.C.colors[2],alpha:.7*(1-P)})}if(g.slit&&f&&!d&&this.level<3)for(const o of N){const s=o.at+E*.22,i=(e-s)/.16;if(i<0||i>1)continue;const t=Math.PI*(v>0?o.phi:1-o.phi),r=t+Math.PI/2,l=Math.cos(r),h=Math.sin(r),p=-h,m=l,M=a+(o.ox??0)*n.w*v,x=c+(o.oy??0)*n.h,b=A*.75*g.slit*(.6+.4*q(y(i*3))),G=Math.max(.6,2.4*g.slit*Math.sin(Math.PI*Math.min(1,i*1.4))),U=1-i*i;u.poly([M-l*b,x-h*b,M+p*G,x+m*G,M+l*b,x+h*b,M-p*G,x-m*G]).fill({color:this.C.colors[2],alpha:U*.8}),u.poly([M-l*b*.8,x-h*b*.8,M+p*G*.45,x+m*G*.45,M+l*b*.8,x+h*b*.8,M-p*G*.45,x-m*G*.45]).fill({color:16777215,alpha:U})}const w=this.impactT;if(g.extra==="holy"&&f&&!d&&e>=w&&e<w+.22){const o=(e-w)/.22,s=1-o,i=A*(.7+.5*q(o)),t=i*.55,r=Math.max(1.5,5*(1-o));for(const[l,h]of[[this.C.colors[1],1],[16777215,.5]])u.poly([a,c-i*h,a+r*h,c,a,c+i*.6*h,a-r*h,c]).fill({color:l,alpha:s}),u.poly([a-t*h,c,a,c-r*h,a+t*h,c,a,c+r*h]).fill({color:l,alpha:s})}const _=this.C.hi,[I,S,C]=this.C.colors,T=(o,s,i)=>{i>.01&&u.poly(o).fill({color:s,alpha:Math.min(1,i)})};if(g.extra==="ghost"&&f&&e<E)for(let o=0;o<3;o++){const s=y((e-o*.06)/(E*.5));if(s<=0||s>=1)continue;const i=c+(o-1)*n.h*.3,t=a-v*n.w*(1.6-1.6*q(s));u.moveTo(Math.round(t),Math.round(i)).lineTo(Math.round(t-v*n.w*.9),Math.round(i)).stroke({width:2,color:S,alpha:.7*(1-s)})}if(g.extra==="eclipse"&&f&&e>=w&&e<w+.45){const o=(e-w)/.45,s=A*(.35+.55*q(o)),i=1-o;u.circle(a,c,s).stroke({width:Math.max(1,4*(1-o)),color:656404,alpha:i}),u.circle(a,c,s+2).stroke({width:1,color:16765802,alpha:i});for(let t=0;t<12;t++){const r=t/12*Math.PI*2+o*.6,l=s*(t%2?.35:.6);u.moveTo(a+Math.cos(r)*(s+2),c+Math.sin(r)*(s+2)).lineTo(a+Math.cos(r)*(s+2+l),c+Math.sin(r)*(s+2+l)).stroke({width:1,color:16771496,alpha:i*.9})}}if(g.extra==="shield"){const o=n.w*.36,s=n.h*.62,i=(t,r,l)=>[t-o*l,r-s*.5*l,t+o*l,r-s*.5*l,t+o*l,r+s*.05*l,t,r+s*.5*l,t-o*l,r+s*.05*l];if(e<w){const t=q(y(e/w)),r=a-v*(n.w*2.2*(1-t)+n.w*.45);if(T(i(r,c,1),I,1),T(i(r,c,.8),S,1),T(i(r,c,.45),C,1),u.moveTo(r,c-s*.4).lineTo(r,c+s*.4).stroke({width:1,color:_,alpha:.9}),f)for(let l=0;l<3;l++){const h=c+(l-1)*s*.3;u.moveTo(Math.round(r-v*o),Math.round(h)).lineTo(Math.round(r-v*(o+n.w*.8*(1-t))),Math.round(h)).stroke({width:1,color:C,alpha:.7})}}else{const t=e-w,r=a-v*n.w*.45;if(t<.06){T(i(r,c,1),I,1),T(i(r,c,.8),S,1);for(const[l,h]of[[.6,-.4],[-.5,.3],[.2,.45],[-.3,-.45]])u.moveTo(r,c).lineTo(r+l*o,c+h*s).stroke({width:1,color:16777215,alpha:1})}else for(let l=0;l<8;l++){const h=l/8*Math.PI*2+.3,p=n.w*(1.6+l%3*.5),m=t-.06,M=r+Math.cos(h)*p*m-v*n.w*.4*m,x=c+Math.sin(h)*p*m+90*m*m,b=1-y(m/.45),G=Math.max(2,o*.32),U=h+m*9;T([M+Math.cos(U)*G,x+Math.sin(U)*G,M+Math.cos(U+2.2)*G*.8,x+Math.sin(U+2.2)*G*.8,M+Math.cos(U+4.1)*G*.6,x+Math.sin(U+4.1)*G*.6],l%2?S:C,b)}}}if(g.extra==="sword"){const o=n.h*.95,s=n.w*.17,i=q(y(e/w)**1.6),t=c-n.h*2.4*(1-i)+n.h*.15,r=e<w?1:1-y((e-w-.25)/.25);if(T([a,t,a+s,t-o*.12,a+s*.8,t-o,a-s*.8,t-o,a-s,t-o*.12],S,r),T([a,t,a+s*.4,t-o*.12,a+s*.3,t-o,a-s*.3,t-o,a-s*.4,t-o*.12],C,r),T([a-s*1.9,t-o+s*.2,a+s*1.9,t-o+s*.2,a+s*1.6,t-o-s*1.1,a-s*1.6,t-o-s*1.1],S,r),T([a-s*1.6,t-o-s*.2,a+s*1.6,t-o-s*.2,a+s*1.4,t-o-s*.7,a-s*1.4,t-o-s*.7],C,r),T([a-s*.7,t-o-s*1.2,a+s*.7,t-o-s*1.2,a+s*.7,t-o-s*4,a-s*.7,t-o-s*4],I,r),f&&e<w&&u.moveTo(a,t-o-s*4).lineTo(a,t-o-s*4-n.h*.8*(1-i)).stroke({width:2,color:C,alpha:.6}),e>=w&&e<w+.4){const l=(e-w)/.4,h=c+n.h*.48;u.ellipse(a,h,n.w*(.3+1.3*l),n.h*(.06+.1*l)).stroke({width:1,color:C,alpha:1-l})}}if(g.extra==="lance"){const o=a-v*n.w*2.6,s=a+v*n.w*1.6,i=y(e/(w*1.15)),t=o+(s-o)*q(i),r=e<w?1.5:Math.max(.5,7*Math.sin(Math.PI*y((e-w)/.4)));if((e<w+.4||!1)&&(T([o,c-r,t,c-r*.6,t,c+r*.6,o,c+r],S,.85),T([o,c-r*.45,t,c-r*.25,t,c+r*.25,o,c+r*.45],16777215,1)),i<1){const h=n.w*.75,p=n.h*.2;T([t+v*h,c,t,c-p,t-v*h*.3,c,t,c+p],C,1),T([t+v*h*.8,c,t,c-p*.4,t,c+p*.4],16777215,1)}}const k=e-w,R=(o,s,i,t)=>o.map((r,l)=>l%2?t+(o[l-1]*Math.sin(s)+r*Math.cos(s)):i+(r*Math.cos(s)-o[l+1]*Math.sin(s)));if(g.extra==="clang"&&f&&k>=0&&k<.2){const o=k/.2;for(let s=0;s<6;s++){const i=-Math.PI/2+(s-2.5)*.45+(v>0?.3:-.3),t=A*.15+A*.6*o,r=t+A*.25*(1-o);u.moveTo(a+Math.cos(i)*t,c+Math.sin(i)*t).lineTo(a+Math.cos(i)*r,c+Math.sin(i)*r).stroke({width:1,color:_,alpha:1-o})}}if(g.extra==="cog"){const o=n.w*.3,s=10,i=[];for(let p=0;p<s*2;p++){const m=p/(s*2)*Math.PI*2,M=p%2?o*.78:o;i.push(Math.cos(m)*M,Math.sin(m)*M)}let t=a,r=c,l=1;if(k<0){const p=q(y(e/w));t=a-v*(n.w*2.4*(1-p)+o*.4)}else if(k<.12)t=a-v*o*.4;else{const p=(k-.12)/.35;t=a-v*(o*.4+n.w*.8*p),r=c-n.h*1.2*p+60*p*p*0,l=1-y(p)}const h=e*18*v;if(l>.02&&(T(R(i,h,t,r),I,l),T(R(i.map(p=>p*.82),h,t,r),S,l),u.circle(t,r,o*.28).fill({color:I,alpha:l}),u.circle(t,r,o*.12).fill({color:C,alpha:l})),f&&k>=0&&k<.3)for(let p=0;p<8;p++){const m=k/.3,M=-Math.PI*.5-v*.6+(p-3.5)*.22,x=o*.6+A*.7*m;u.moveTo(t+Math.cos(M)*x,r+Math.sin(M)*x+40*m*m).lineTo(t+Math.cos(M)*(x+5),r+Math.sin(M)*(x+5)+40*m*m).stroke({width:1,color:_,alpha:1-m})}}if(g.extra==="piston"){const o=n.w*.45,s=n.h*.32,i=k<0?q(y(e/w)**1.5):1,t=c+n.h*.02-s-n.h*1.8*(1-i)+(k>=0&&k<.08?3:0),r=k<.3?1:1-y((k-.3)/.2);if(T([a-n.w*.08,t-n.h*2,a+n.w*.08,t-n.h*2,a+n.w*.08,t,a-n.w*.08,t],I,r),T([a-o,t,a+o,t,a+o,t+s,a-o,t+s],I,r),T([a-o*.9,t+2,a+o*.9,t+2,a+o*.9,t+s-2,a-o*.9,t+s-2],S,r),T([a-o*.9,t+2,a+o*.9,t+2,a+o*.9,t+4,a-o*.9,t+4],C,r),f&&k>=0&&k<.55)for(const l of[-1,1])for(let h=0;h<3;h++){const p=y((k-h*.05)/.5);p<=0||p>=1||u.circle(a+l*(o+n.w*.9*p+h*4),t+s*.6-n.h*.2*p,Math.max(1.5,n.w*(.08+.12*p))).fill({color:15265522,alpha:.7*(1-p)})}}if(g.extra==="drill"){const o=n.w*1.1,s=n.h*.28,i=k<0?q(y(e/w)):1,t=a+v*n.w*.15-v*n.w*2.2*(1-i)+(k>=0&&k<.25?v*Math.sin(k*90)*1.5:0),r=t-v*o,l=k<.28?1:1-y((k-.28)/.2);T([t,c,r,c-s,r,c+s],I,l),T([t,c,r,c-s*.75,r,c+s*.75],S,l);for(let h=0;h<5;h++){const p=(h/5+e*6)%1,m=r+(t-r)*p,M=s*(1-p)*.85;u.moveTo(m,c-M).lineTo(m+v*3,c+M).stroke({width:1,color:C,alpha:l*.9})}if(T([r,c-s*1.1,r-v*n.w*.25,c-s*1.1,r-v*n.w*.25,c+s*1.1,r,c+s*1.1],I,l),f&&k>=0&&k<.3)for(let h=0;h<10;h++){const p=k/.3,m=Math.PI*(v>0?1:0)+(h-4.5)*.3,M=n.w*.2+A*.8*p;u.rect(Math.round(a+Math.cos(m)*M),Math.round(c+Math.sin(m)*M+50*p*p),2,2).fill({color:h%2?_:9075304,alpha:1-p})}}if(g.extra==="wave"||g.extra==="tsunami"){const o=g.extra==="tsunami",s=o?w*.6:0,i=o?F*.7:F*.75,t=y((e-s)/i);if(t>0&&t<1){const r=a-v*n.w*(o?2.2:1.8)+v*n.w*(o?4:3.4)*q(t),l=n.h*(o?1.15:.8),h=c+n.h*.5,p=1-y((t-.75)/.25),m=n.w*(o?1.6:1.2);if(T([r-v*m,h,r-v*m*.6,h-l*.75,r-v*n.w*.15,h-l,r+v*n.w*.25,h-l*.8,r+v*n.w*.1,h-l*.55,r+v*n.w*.18,h],I,p*.9),T([r-v*m*.8,h,r-v*m*.5,h-l*.62,r-v*n.w*.12,h-l*.85,r+v*n.w*.15,h-l*.7,r+v*n.w*.02,h-l*.45,r+v*n.w*.05,h],S,p*.9),u.moveTo(r-v*m*.5,h-l*.62).lineTo(r-v*n.w*.12,h-l*.85).lineTo(r+v*n.w*.15,h-l*.7).stroke({width:2,color:C,alpha:p}),f)for(let M=0;M<6;M++){const x=r+v*n.w*(.05+M%3*.12),b=h-l*(.85-M*.08)-Math.sin(e*30+M)*2;u.circle(x,b,1.5).fill({color:16777215,alpha:p})}}}if(g.extra==="anchor"){const o=k<0?q(y(e/w)**1.6):1,s=c+n.h*.25-n.h*2.4*(1-o),i=k<.3?1:1-y((k-.3)/.25),t=n.w*.5,r=n.h*.9,l=4871522,h=12109008;u.moveTo(a,s-r).lineTo(a,s-r-n.h*2).stroke({width:2,color:l,alpha:i}),T([a-t*.09,s-r,a+t*.09,s-r,a+t*.09,s,a-t*.09,s],l,i),T([a-t*.45,s-r*.75,a+t*.45,s-r*.75,a+t*.45,s-r*.66,a-t*.45,s-r*.66],l,i);const p=s-r*.35;u.moveTo(a+Math.cos(.15*Math.PI)*t,p+Math.sin(.15*Math.PI)*t).arc(a,p,t,.15*Math.PI,.85*Math.PI).stroke({width:3,color:l,alpha:i}),u.moveTo(a+Math.cos(.2*Math.PI)*(t-1),p+Math.sin(.2*Math.PI)*(t-1)).arc(a,p,t-1,.2*Math.PI,.8*Math.PI).stroke({width:1,color:h,alpha:i});for(const m of[-1,1])T([a+m*t*.98,s-r*.35+t*.42,a+m*t*1.18,s-r*.35+t*.12,a+m*t*.8,s-r*.35+t*.3],l,i);if(u.circle(a,s-r-t*.12,t*.13).stroke({width:2,color:l,alpha:i}),k>=0&&k<.5){const m=k/.5,M=c+n.h*.48;if(u.ellipse(a,M,n.w*(.4+1.4*m),n.h*(.08+.12*m)).stroke({width:2,color:C,alpha:1-m}),f)for(let x=0;x<9;x++){const b=-Math.PI*(.15+.7*(x/8)),G=n.w*(1.4+x%3*.4);u.circle(a+Math.cos(b)*G*m,M+Math.sin(b)*G*m+120*m*m,1.5).fill({color:x%2?C:S,alpha:1-m})}}}if(g.extra==="vortex"){if(k<0){const o=y(e/w);for(let s=0;s<3;s++){const i=[];for(let t=0;t<=16;t++){const r=t/16,l=A*(1.3-1.1*o)*(1-r*.85),h=s*(Math.PI*2/3)+r*4.2+o*7*v;i.push(a+Math.cos(h)*l,c+Math.sin(h)*l*.8)}u.moveTo(i[0],i[1]);for(let t=2;t<i.length;t+=2)u.lineTo(i[t],i[t+1]);u.stroke({width:2,color:s%2?S:C,alpha:.4+.6*o})}u.circle(a,c,Math.max(1,A*.12*(1-o))).fill({color:I,alpha:.9})}else if(k<.06)u.circle(a,c,2).fill({color:16777215,alpha:1});else if(k<.45){const o=(k-.06)/.39,s=1-o;for(let i=0;i<12;i++){const t=i/12*Math.PI*2,r=A*.2*o,l=A*(.4+.9*q(o))*(i%2?.7:1);u.moveTo(a+Math.cos(t)*r,c+Math.sin(t)*r).lineTo(a+Math.cos(t)*l,c+Math.sin(t)*l).stroke({width:i%2?1:2,color:i%3?C:16777215,alpha:s})}u.circle(a,c,A*(.25+.8*q(o))).stroke({width:Math.max(1,3*s),color:S,alpha:s})}}const D=(o,s,i,t)=>{const r=[];for(let l=0;l<10;l++){const h=l%2?i*.45:i,p=t+l/10*Math.PI*2-Math.PI/2;r.push(o+Math.cos(p)*h,s+Math.sin(p)*h)}return r};if(g.extra==="star"){if(k<0){const o=q(y(e/w)),s=a-v*n.w*2.2*(1-o),i=c-n.h*.5*Math.sin(Math.PI*o),t=n.w*.28;if(T(D(s,i,t,e*10),I,1),T(D(s,i,t*.75,e*10),S,1),T(D(s,i,t*.4,e*10),C,1),f)for(let r=1;r<=3;r++){const l=Math.max(0,o-r*.08),h=a-v*n.w*2.2*(1-l),p=c-n.h*.5*Math.sin(Math.PI*l);u.circle(h,p,Math.max(1,3-r*.7)).fill({color:C,alpha:.6/r})}}else if(k<.5){const o=k/.5,s=1-o;u.circle(a,c,A*(.2+.6*q(o))).stroke({width:Math.max(1,3*s),color:S,alpha:s});for(let i=0;i<8;i++){const t=i/8*Math.PI*2+.2,r=A*(.15+1*q(o));T(D(a+Math.cos(t)*r,c+Math.sin(t)*r+40*o*o,Math.max(3,n.w*.17*(1-o*.5)),o*8),i%2?S:C,s)}}}if(g.extra==="void"){if(k<0){const o=y(e/w),s=A*(.08+.32*o);for(let i=0;i<18;i++){const t=(i/18+o*1.6)%1,r=i*2.4+t*5*v,l=A*1.5*(1-t)+s;u.rect(Math.round(a+Math.cos(r)*l),Math.round(c+Math.sin(r)*l*.8),2,2).fill({color:i%3?C:16777215,alpha:.4+.6*t})}u.circle(a,c,s*1.25).stroke({width:2,color:S,alpha:.9}),u.circle(a,c,s).fill({color:328200,alpha:1})}else if(k<.05)u.circle(a,c,2).fill({color:16777215,alpha:1});else if(k<.55){const o=(k-.05)/.5,s=1-o;for(const[i,t]of[[0,1],[1,.65]])u.circle(a,c,A*(.3+1.3*q(y(o-i*.12)))*t).stroke({width:Math.max(1,4*s),color:i?C:S,alpha:s});for(let i=0;i<16;i++){const t=i/16*Math.PI*2,r=A*(.5+1.1*q(o))*(i%2?.6:1);u.moveTo(a,c).lineTo(a+Math.cos(t)*r,c+Math.sin(t)*r).stroke({width:i%2?1:2,color:i%4?C:16777215,alpha:s})}}}if(g.extra==="shatter"||g.extra==="spikes"){const o=(t,r,l,h,p,m)=>{const M=Math.cos(p),x=Math.sin(p),b=-x,G=M;T([t-b*h,r-G*h,t+M*l,r+x*l,t+b*h,r+G*h],I,m),T([t-b*h*.55,r-G*h*.55,t+M*l*.92,r+x*l*.92,t+b*h*.2,r+G*h*.2],S,m),u.moveTo(t,r).lineTo(t+M*l*.85,r+x*l*.85).stroke({width:1,color:C,alpha:m})},s=c+n.h*.48;if((g.extra==="shatter"?[0,1,2,3,4,5].map(t=>{const r=-Math.PI/2+(t-2.5)*.55;return[a+Math.cos(r+Math.PI)*n.w*.15,c+n.h*.25,r,n.h*(.7+t%2*.25)]}):[0,1,2,3,4].map(t=>[a-v*n.w*(1.6-t*.4),s,-Math.PI/2+v*.15*(t-2),n.h*(.3+t*.16)])).forEach(([t,r,l,h],p)=>{const m=g.extra==="shatter"?p*.03:p*(w/5),M=y((e-m)/.12);if(!(M<=0)){if(k<.04||g.extra==="spikes"&&k<0)o(t,r,h*q(M),Math.max(3,n.w*(g.extra==="shatter"?.15:.13)),l,1);else if(k>=.04||g.extra==="spikes"){const x=y((k-.04)/.45);if(x>=1)return;for(let b=0;b<3;b++){const G=l+(b-1)*.9,U=A*(.9+b*.3),X=t+Math.cos(l)*h*.5+Math.cos(G)*U*x,V=r+Math.sin(l)*h*.5+Math.sin(G)*U*x+90*x*x;T([X,V-4,X+3.5,V+1,X-3.5,V+3],b%2?S:C,1-x)}}}}),k>=0&&k<.06)for(const[t,r]of[[.5,-.5],[-.45,.2],[.15,.5],[-.25,-.45]])u.moveTo(a,c).lineTo(a+t*n.w,c+r*n.h).stroke({width:1,color:16777215,alpha:1})}if((g.extra==="sword"||g.extra==="lance")&&f&&!d&&e>=w&&e<w+.22){const o=(e-w)/.22,s=1-o,i=A*(.8+.6*q(o)),t=i*.6,r=Math.max(1.5,5*(1-o));for(const[l,h]of[[S,1],[16777215,.5]])u.poly([a,c-i*h,a+r*h,c,a,c+i*.6*h,a-r*h,c]).fill({color:l,alpha:s}),u.poly([a-t*h,c,a,c-r*h,a+t*h,c,a,c+r*h]).fill({color:l,alpha:s})}if(g.extra==="gust"&&f&&e<E){const o=e/E;for(let s=0;s<4;s++){const i=c+(s-1.5)*n.h*.22,t=a+v*n.w*(-1.2+2.4*o+s*.1);u.moveTo(Math.round(t),Math.round(i)).lineTo(Math.round(t-v*n.w*.5),Math.round(i)).stroke({width:1,color:this.C.colors[2],alpha:.6*(1-o)})}}if((g.extra==="crack"||g.extra==="quake"||g.extra==="piston"||g.extra==="anchor")&&e>=w){const o=e-w,s=g.extra==="quake",i=c+n.h*.48,t=1-y((o-.35)/.4),r=y(o/.18);this.r;for(const l of[-1,1]){let h=a,p=i;const m=n.w*(s?1.5:.8)*r,M=s?7:5;u.moveTo(Math.round(h),Math.round(p));for(let x=1;x<=M;x++)h=a+l*(m*x)/M,p=i+(x*37%5-2)*.8,u.lineTo(Math.round(h),Math.round(p));u.stroke({width:2,color:1707781,alpha:t}),u.moveTo(Math.round(a),Math.round(i-1));for(let x=1;x<=M;x++)u.lineTo(Math.round(a+l*(m*x)/M),Math.round(i-1+(x*37%5-2)*.8));u.stroke({width:1,color:this.C.colors[2],alpha:t*.7})}if(s&&o<.45)for(let l=0;l<2;l++){const h=y((o-l*.1)/.35);h<=0||h>=1||u.ellipse(a,i,n.w*(.4+1.4*h),n.h*(.08+.12*h)).stroke({width:1,color:this.C.colors[2],alpha:1-h})}if(s&&f)for(let l=0;l<5;l++){const h=a+(l-2)*n.w*.32,p=n.h*(.3+l*13%4*.09)*Math.sin(Math.PI*y(o/.5));if(p<=.5)continue;const m=Math.max(3,n.w*.09);u.poly([h-m,i,h-m*.3,i-p,h+m*.4,i-p*.85,h+m,i]).fill({color:5917242,alpha:t}),u.poly([h-m*.3,i-p,h+m*.4,i-p*.85,h+m*.1,i-p*.5]).fill({color:12363914,alpha:t})}if(f&&o<.5)for(let l=0;l<(s?8:5);l++){const h=o/.5,p=a+(l-(s?3.5:2))*n.w*.22*(.6+h),m=i-n.h*.12*h;u.circle(Math.round(p),Math.round(m),Math.max(1,n.w*.06*(.5+h))).fill({color:9075304,alpha:.5*(1-h)})}}if(f&&W.flash&&!d&&this.level<3&&e>=w&&e<w+.1){const o=(e-w)/.1,s=Math.max(n.w,n.h)*(.35+.25*o)*(1+g.tier*.12),i=Math.max(1,3*(1-o)),t=W.flash*(1-o);for(const[r,l]of[[1,0],[0,1],[.7,.7],[.7,-.7]]){const h=r&&l?s*.55:s;u.poly([a-r*h,c-l*h,a+l*i,c-r*i,a+r*h,c+l*h,a-l*i,c+r*i]).fill({color:this.C.hi,alpha:t})}u.circle(a,c,Math.max(2,Math.max(n.w,n.h)*.08*(1-o))).fill({color:this.C.hi,alpha:t})}if(f&&e>=w){const o=e-w;for(const s of this.sparks){if(o>s.life)continue;const i=a+s.vx*o,t=c+s.vy*o+60*o*o,r=1-o/s.life;u.rect(Math.round(i),Math.round(t),s.size,s.size).fill({color:s.col,alpha:r})}}e>=w&&!this.impacted&&(this.impacted=!0,n.onImpact?.()),e>=F+(f?.35:0)&&(this.done=!0)}}class Pt{constructor(e,f,d,u,n){this.app=e,this.host=f,this.scene=d,this.rt=ct.create({width:Math.ceil(u/L.PIXEL),height:Math.ceil(n/L.PIXEL),scaleMode:"nearest",antialias:!1,resolution:1}),this.out=new ft(this.rt),this.out.scale.set(L.PIXEL),this.out.visible=!1,f.addChild(this.out),this.reduce=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches,e.ticker.add(this.tick)}app;host;scene;draw=new pt;rt;out;live=[];queue=[];level=0;fps=60;lowT=0;okT=0;filters=0;fancy=!0;reduce=!1;forceLevel=null;shakeT=0;shakeAmp=0;resize(e,f){this.rt.resize(Math.ceil(e/L.PIXEL),Math.ceil(f/L.PIXEL))}add(e,f){const d=L.PIXEL,u={...e,x:e.x/d,y:e.y/d,w:e.w/d,h:e.h/d};return this.level>=4?!1:this.live.length>=(this.level>=2?3:L.MAX_LIVE)?(this.queue.push({o:u,at:performance.now(),fall:f}),!0):(this.start(u),!0)}start(e){const f=this.fancy?e.tier:0,d=new lt({...e,tier:f},this.level);this.live.push(d),this.draw.addChild(d.g);const u=L.tiers[y(f,0,3)],n=e.onImpact;d.o.onImpact=()=>{n?.(),this.fancy&&(u.shake&&!this.reduce&&(this.shakeAmp=Math.max(this.shakeAmp,L.shake[u.shake]??0),this.shakeT=.25),u.hitstop&&(d.t-=u.hitstop),u.shock&&this.level<2&&this.filters<L.FILTER_MAX&&this.shock(e.x*L.PIXEL,e.y*L.PIXEL,Math.max(e.w,e.h)*L.PIXEL),u.glow&&this.level<2&&this.filters<L.FILTER_MAX&&this.glow())}}shock(e,f,d){const u=new It({center:{x:e,y:f},amplitude:18,wavelength:90,brightness:1.15,speed:Math.max(400,d*3),radius:d*2.4,time:0});this.filters+=1,this.scene.filterArea=this.app.screen,this.scene.filters=[...this.scene.filters||[],u];const n=performance.now(),g=()=>{const W=(performance.now()-n)/1e3;u.time=W,W<L.BLUR_MAX+.25?requestAnimationFrame(g):(this.scene.filters=(this.scene.filters||[]).filter(F=>F!==u),this.filters-=1,u.destroy())};requestAnimationFrame(g)}glow(){const e=new xt({distance:6,outerStrength:2.2,innerStrength:0,color:13627135,quality:.2});this.filters+=1,this.out.filters=[e],setTimeout(()=>{this.out.filters=[],this.filters-=1,e.destroy()},L.BLUR_MAX*1e3)}tick=()=>{const e=Math.min(.05,this.app.ticker.deltaMS/1e3),f=this.app.ticker.deltaMS/1e3;for(this.fps=this.fps*.9+1e3/Math.max(1,this.app.ticker.deltaMS)*.1,this.forceLevel!=null?this.level=this.forceLevel:this.live.length&&(this.fps<L.FPS_LOW?(this.lowT+=f,this.okT=0,this.lowT>1&&this.level<4&&(this.level+=1,this.lowT=0)):this.fps>L.FPS_OK&&(this.okT+=f,this.lowT=0,this.okT>3&&this.level>0&&(this.level-=1,this.okT=0)));this.queue.length&&this.live.length<(this.level>=2?3:L.MAX_LIVE);){const d=this.queue.shift();performance.now()-d.at>L.WAIT_MAX?d.fall():this.start(d.o)}if(!this.live.length){this.out.visible&&(this.out.visible=!1,this.app.renderer.render({container:this.draw,target:this.rt,clear:!0})),this.unshake();return}for(const d of this.live)d.t+=e,d.draw(Math.max(0,d.t),this.fancy,this.reduce);for(const d of this.live.filter(u=>u.done))this.draw.removeChild(d.g),d.g.destroy();if(this.live=this.live.filter(d=>!d.done),this.out.visible=!0,this.app.renderer.render({container:this.draw,target:this.rt,clear:!0}),this.shakeT>0){this.shakeT-=e;const d=Math.max(0,this.shakeT/.25);this.scene.x=(Math.random()-.5)*2*this.shakeAmp*d,this.scene.y=(Math.random()-.5)*2*this.shakeAmp*d,this.shakeT<=0&&this.unshake()}};unshake(){(this.scene.x||this.scene.y)&&(this.scene.x=0,this.scene.y=0),this.shakeAmp=0}destroy(){this.app.ticker.remove(this.tick),this.rt.destroy(!0)}}const bt=Object.freeze(Object.defineProperty({__proto__:null,NUM:L,RECIPES:$,SKILLS:nt,SlashFx:lt,SlashLayer:Pt,TWIN:it,setTwin:mt,twinOf:J},Symbol.toStringTag,{value:"Module"}));export{xt as G,Pt as S,It as a,bt as s};
