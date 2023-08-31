@group(0) @binding(0) var<uniform> grid: vec2f; // New line


@compute
@workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE}) // New line
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {

}