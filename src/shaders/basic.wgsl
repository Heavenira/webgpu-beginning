// Your code here:

@vertex  // This is an attribute in Rust. Indicates a vertex shader.
fn /*name*/vertexMain(
    /*access_the_0th_shaderLocation;name_is_pos*/@location(0) pos: vec2f) ->
    /*return_position*/@builtin(position) vec4f {
    
        // return vec4f(0, 0, 0, 1);  // (X, Y, Z, W)
        return vec4f(pos.x, pos.y, 0, 1);  // (X, Y, Z, W)
}

// This will set the color of every pixel of the triangle to red
@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1); // (Red, Green, Blue, Alpha)
}