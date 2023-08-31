struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) cell: vec2f, // New line!
};


// At the top of the `code` string in the createShaderModule() call
@group(0) @binding(0) var<uniform> grid: vec2f;

@vertex
fn vertexMain(@location(0) pos: vec2f, @builtin(instance_index) instance: u32)  -> VertexOutput {

    let i = f32(instance); // Save the instance_index as a float
    let cell = vec2f(i % grid.x, floor(i / grid.x)); // Cell(i,i) in the image provided

    let cellOffset = cell / grid; // Compute the offset to cell

    // `pos` and `grid` are both vec2f. so dividing them will divide their components
    // So too, adding 1 will add to its components
    let gridPos = (pos + 1) / grid - 1 + 2 * cellOffset;
    
    var output: VertexOutput;
    output.pos = vec4f(gridPos, 0, 1);
    output.cell = cell;
    return output;

}

struct FragInput {
  @location(0) cell: vec2f,
};

@fragment
fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    let c = input.cell / grid;

    return vec4f(c, 1 - c.x, 1);
}

