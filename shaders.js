const vertex_shader_code = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;

varying vec4 vColor;
varying vec4 vLighting;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowMapTextureCoord;

varying vec4 vPosition;
varying vec4 vMVPosition;

struct _light {
    vec4 diffuse;
    vec4 ambient;
    vec4 specular;
    vec4 position;
};

struct _material {
    vec4 diffuse;
    vec4 ambient;
    vec4 specular;
    float shininess;
};

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLightMatrix;
uniform vec3 uLightLookAt;
uniform _light light[2];
uniform _material material;
uniform bool phong;

vec4 mPosition;
vec4 mvPosition;
vec3 N;

void main()  {
    mPosition = uModelMatrix*aVertexPosition;
    mvPosition = uViewMatrix*mPosition;  
    vPosition = aVertexPosition;
    gl_Position = uProjectionMatrix*mvPosition;
    N = normalize((uModelMatrix*uViewMatrix*vec4(aVertexNormal,0.0)).xyz);
  
    vLighting.rgb = vec3(0,0,0);
  
    for (int i = 0; i < 2; i++)
    {
        vec3 delta = light[i].position.w * mvPosition.xyz;
        vec3 L = normalize(light[i].position.xyz - delta);
        vec3 E = -normalize(mvPosition.xyz);
        vec3 H = normalize(L+E); 
        float Ks = pow(max(dot(N, H),0.0), material.shininess);
        float Kd = max(dot(L,N), 0.0);
        vLighting += Ks * material.specular * light[i].specular 
        + Kd * material.diffuse * light[i].diffuse 
        + material.ambient * light[i].ambient;
        vLighting.a = 1.0;  
    }
    
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
    vShadowMapTextureCoord = uLightMatrix * mPosition;
    vShadowMapTextureCoord.xyz *= vec3(0.5, 0.5, 0.5);
    vShadowMapTextureCoord.xyz += vShadowMapTextureCoord.w * vec3(0.5, 0.5, 0.5);
}
`;


const fragment_shader_code = `
    precision highp float;
    varying vec4 vColor;
    varying vec4 vLighting;
    varying vec3 vNormal;
    varying vec4 vMVPosition;
    
    varying vec2 vTextureCoord;
    varying vec4 vShadowMapTextureCoord;
    
    varying vec4 vPosition;
    uniform sampler2D uSampler;
    uniform sampler2D uShadowMap;
    
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uLightMatrix;
    
    uniform float innerAngle;
    uniform float outerAngle;
    
    struct _light {
        vec4 diffuse;
        vec4 ambient;
        vec4 specular;
        vec4 position;
    };

    struct _material {
        vec4 diffuse;
        vec4 ambient;
        vec4 specular;
        float shininess;
    };
    
    uniform vec3 uLightLookAt;
    uniform _light light[2];
    uniform _material material;
    uniform bool phong;

    void main(void) {
        vec4 pointColor = texture2D(uSampler, vTextureCoord);

        vec3 shadowMapTextureCoord = vShadowMapTextureCoord.xyz / vShadowMapTextureCoord.w;
        float currentDepth = shadowMapTextureCoord.z;
        
        bool inRange =
            shadowMapTextureCoord.x >= 0.0 &&
            shadowMapTextureCoord.x <= 1.0 &&
            shadowMapTextureCoord.y >= 0.0 &&
            shadowMapTextureCoord.y <= 1.0;
      
        vec4 shadowMapTextureColor = vec4(texture2D(uShadowMap, shadowMapTextureCoord.xy).rrr, 1.0);
        float projectedDepth = texture2D(uShadowMap, shadowMapTextureCoord.xy).r;
        float shadowLight = (inRange && projectedDepth < currentDepth) ? 0.0 : 1.0;
        
        vec3 posToLight = normalize(uProjectionMatrix * uModelMatrix * vPosition - light[0].position).xyz;
        vec3 viewSpaceLightDir = normalize(vec4(uLightLookAt, 1.0) - light[0].position).xyz;
        float angle = dot(posToLight, -viewSpaceLightDir);
        
        float spotAttenuation = smoothstep(outerAngle, innerAngle, angle );
        float attenuation = shadowLight * spotAttenuation;
        
        float projectedAmount = inRange ? 1.0 : 0.0;
        gl_FragColor = vec4(pointColor.rgb * vLighting.rgb * attenuation, pointColor.a);
    }
  `

const shadowmap_fragment_shader_code = `
    precision highp float;
    // varying vec4 vertexPosition;
    void main(void) {
        gl_FragColor = vec4(gl_FragCoord.zzz, 1.0);
    }
  `;

const shadowmap_vertex_shader_code = `
    attribute vec4 aVertexPosition;
    // varying vec4 vertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      // vertexPosition = gl_Position;
    }
  `;