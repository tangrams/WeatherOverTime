// Author: Patricio Gonzalez Vivo
// Title: WindArrow

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.141592653589793
#define TWO_PI 6.28318530718

mat2 rotate2D (float angle) {
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float shape(vec2 st, int N){
    st = st *2.-1.;
    float a = atan(st.x,st.y)+PI;
    float r = TWO_PI/float(N);
    return cos(floor(.5+a/r)*r-a)*length(st);
}

vec4 getColor (vec2 st) {
    float texWidth = u_tex0Resolution.x;
    float texHeigth = u_tex0Resolution.y;
    st.y = 1.-st.y/texHeigth;
    return texture2D(u_tex0,vec2(st.x/texWidth,st.y));
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(1.);
    
    float t = u_time;
    float index = 100.;
    float i_now = floor(t);
    float f_now = fract(t);
    float next = i_now+1.;

    vec4 data_now = getColor(vec2(mod(i_now,u_resolution.x),index));
    vec4 data_next = getColor(vec2(mod(next,u_resolution.x),index));

    float temp = data_now.r;
    float w_speed = data_now.g;

    float dir_now = data_now.b;
    float dir_next = data_next.b;

    float dir_delta = fract(dir_next-dir_now);
    if (dir_delta > .5) {
        dir_delta -= 1.;
    }
    dir_next = dir_now + dir_delta;

    float w_deg = (160./360.)*-TWO_PI;//mix(dir_now, dir_next, f_now)*-TWO_PI;

    st -= .5;
    st = rotate2D(w_deg) * st;
    st += .5;

    // Arrow
    float scale = .5;
    float d = (shape(st*vec2(scale+.5,.5)+vec2(scale*-.5+.25,.3),3)/shape(st*vec2(scale+.5,.5)+vec2(scale*-.5+.25,1.132),3));
    color = mix(vec3(0.,0.,1.),vec3(1.,0.,0.), .5);
    color *= 1.0-step(0.216,d);

    gl_FragColor = vec4(color,1.0);
}