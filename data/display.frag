// Author @patriciogv - 2016
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589793
#define TWO_PI 6.28318530718

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform vec2 u_hour;
uniform vec2 u_id;

#define CHAR_BLANK 12.0
#define CHAR_MINUS 11.0
#define CHAR_DECIMAL_POINT 10.0

float SampleDigit(const in float fDigit, const in vec2 vUV) {       
    if(vUV.x < 0.0) return 0.0;
    if(vUV.y < 0.0) return 0.0;
    if(vUV.x >= 1.0) return 0.0;
    if(vUV.y >= 1.0) return 0.0;
    
    // In this version, each digit is made up of a 4x5 array of bits
    float fDigitBinary = 0.0;
    
    if(fDigit < 0.5) { // 0
        fDigitBinary = 7.0 + 5.0 * 16.0 + 5.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 1.5) { // 1
        fDigitBinary = 2.0 + 2.0 * 16.0 + 2.0 * 256.0 + 2.0 * 4096.0 + 2.0 * 65536.0;
    } else if(fDigit < 2.5) { // 2
        fDigitBinary = 7.0 + 1.0 * 16.0 + 7.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 3.5) { // 3
        fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 4.5) { // 4
        fDigitBinary = 4.0 + 7.0 * 16.0 + 5.0 * 256.0 + 1.0 * 4096.0 + 1.0 * 65536.0;
    } else if(fDigit < 5.5) { // 5
        fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 1.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 6.5) { // 6
        fDigitBinary = 7.0 + 5.0 * 16.0 + 7.0 * 256.0 + 1.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 7.5) { // 7
        fDigitBinary = 4.0 + 4.0 * 16.0 + 4.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 8.5) { // 8
        fDigitBinary = 7.0 + 5.0 * 16.0 + 7.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 9.5) { // 9
        fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;
    } else if(fDigit < 10.5) { // '.'
        fDigitBinary = 2.0 + 0.0 * 16.0 + 0.0 * 256.0 + 0.0 * 4096.0 + 0.0 * 65536.0;
    } else if(fDigit < 11.5) { // '-'
        fDigitBinary = 0.0 + 0.0 * 16.0 + 7.0 * 256.0 + 0.0 * 4096.0 + 0.0 * 65536.0;
    }
    vec2 vPixel = floor(vUV * vec2(4.0, 5.0));
    float fIndex = vPixel.x + (vPixel.y * 4.0);
    return mod(floor(fDigitBinary / pow(2.0, fIndex)), 2.0);
}

float PrintValue(const in vec2 vStringCharCoords, const in float fValue, const in float fMaxDigits, const in float fDecimalPlaces) {
    float fAbsValue = abs(fValue);
    float fStringCharIndex = floor(vStringCharCoords.x);
    float fLog10Value = log2(fAbsValue) / log2(10.0);
    float fBiggestDigitIndex = max(floor(fLog10Value), 0.0);
    
    // This is the character we are going to display for this pixel
    float fDigitCharacter = CHAR_BLANK;
    float fDigitIndex = fMaxDigits - fStringCharIndex;
    if(fDigitIndex > (-fDecimalPlaces - 1.5)) {
        if(fDigitIndex > fBiggestDigitIndex) {
            if(fValue < 0.0) {
                if(fDigitIndex < (fBiggestDigitIndex+1.5)) {
                    fDigitCharacter = CHAR_MINUS;
                }
            }
        } else {        
            if(fDigitIndex == -1.0) {
                if(fDecimalPlaces > 0.0) {
                    fDigitCharacter = CHAR_DECIMAL_POINT;
                }
            } else {
                if(fDigitIndex < 0.0) {
                    // move along one to account for .
                    fDigitIndex += 1.0;
                }
                float fDigitValue = (fAbsValue / (pow(10.0, fDigitIndex)));
                // This is inaccurate - I think because I treat each digit independently
                // The value 2.0 gets printed as 2.09 :/
                //fDigitCharacter = mod(floor(fDigitValue), 10.0);
                fDigitCharacter = mod(floor(0.0001+fDigitValue), 10.0); // fix from iq
            }       
        }
    }
    vec2 vCharPos = vec2(fract(vStringCharCoords.x), vStringCharCoords.y);
    return SampleDigit(fDigitCharacter, vCharPos);  
}

float PrintValue(in vec2 fragCoord, const in vec2 vPixelCoords, const in vec2 vFontSize, const in float fValue, const in float fMaxDigits, const in float fDecimalPlaces){
    return PrintValue((fragCoord.xy - vPixelCoords) / vFontSize, fValue, fMaxDigits, fDecimalPlaces);
}

float rect(vec2 st, vec2 size){
    size = .25-size*.125;
    vec2 uv = step(size,st*(1.0-st));
    return (uv.x*uv.y);
}

float rect(vec2 st, float size){
    return rect(st,vec2(size));
}

void main() {
    vec2 st = gl_FragCoord.st/u_resolution.xy;
    float id = u_id.x;
    float hour = u_hour.x;
    id = 50.;
    hour = (u_mouse.x/u_resolution.x)*u_tex0Resolution.x;

    vec2 pos = st;
    pos.y = 1.-pos.y;
    pos.y /= u_tex0Resolution.y;
    
    pos.y += id/u_tex0Resolution.y;
    vec4 tex = texture2D(u_tex0,pos);
    
    float t = mod(hour,u_tex0Resolution.x)/u_tex0Resolution.x;
    vec3 color = tex.rgb*tex.a;

    vec2 i_st = floor(st*vec2(1.,3.));
    color = mix(vec3(0.),
                color,
                vec3((i_st.y == 0.)?1.:0.,
                     (i_st.y == 1.)?1.:0.,
                     (i_st.y == 2.)?1.:0.));

    color *= 1. + step(t-0.002,st.x)*step(st.x,t+0.002)*2.;
    color += step(t-0.0005,st.x)*step(st.x,t+0.0005);

    vec2 vFontSize = vec2(4.0, 5.0);
    vec2 currentPos = vec2(1.-id/u_tex0Resolution.y,t);
    st.x -= t;

    vec2 offset = st - vec2(0.008,-0.280);
    offset.x *= u_resolution.x/u_resolution.y;
    color += rect(offset,.01)-rect(offset,.001);

    st *= 35.;
    st.x *= u_resolution.x/u_resolution.y;
   
    color += PrintValue(st, vec2(0.,3.), vFontSize, texture2D(u_tex0,currentPos).x*100., 2., 1.);
    

    gl_FragColor = vec4( color , 1.0);
}