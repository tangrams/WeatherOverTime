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
uniform float u_time;

uniform vec2 u_hour;
uniform vec2 u_id;

void main() {
    vec2 st = gl_FragCoord.st/u_resolution.xy;

    vec2 pos = st;
    pos.y = 1.-pos.y;
    pos.y /= u_tex0Resolution.y;
    pos.y += u_id.x/u_tex0Resolution.y;
    vec4 tex = texture2D(u_tex0,pos);
    
    float t = mod(u_hour.x,u_tex0Resolution.x)/u_tex0Resolution.x;
    vec3 color = tex.rgb*tex.a;

    vec2 i_st = floor(st*vec2(1.,3.));
    color = mix(vec3(0.),
                color,
                vec3((i_st.y == 0.)?1.:0.,
                     (i_st.y == 1.)?1.:0.,
                     (i_st.y == 2.)?1.:0.));

    color *= 1. + step(t-0.002,st.x)*step(st.x,t+0.002)*2.;

    gl_FragColor = vec4( color , 1.0);
}