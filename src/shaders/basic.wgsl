// At the top of the `code` string in the createShaderModule() call
@group(0) @binding(0) var<uniform> grid: vec2f;

/*@vertex
fn vertexMain(@location(0) pos: vec2f) ->
  @builtin(position) vec4f {
  return vec4f(pos / grid, 0, 1);
}*/

// ...fragmentMain is unchanged 

@vertex  // This is an attribute in Rust. Indicates a vertex shader.
fn /*name*/vertexMain(
    /*access_the_0th_shaderLocation;name_is_pos*/@location(0) pos: vec2f) ->
    /*return_position*/@builtin(position) vec4f {
    
        //return vec4f(pos.x, pos.y, 0, 1);  // its common for 4D results
        return vec4f(pos, 0, 1);  // its common for 4D results
}

// This will set the color of every pixel of the triangle to red
@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1); // (Red, Green, Blue, Alpha)
}