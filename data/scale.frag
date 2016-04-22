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

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.);

    color = texture2D(u_tex0,vec2(.98-st.y*.95)).rgb;
    
    gl_FragColor = vec4(color,1.0);
}