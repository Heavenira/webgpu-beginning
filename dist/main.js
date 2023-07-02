"use strict";(()=>{async function f(){if(!navigator.gpu)throw new Error("WebGPU not supported on this browser.");let e=await navigator.gpu.requestAdapter();if(!e)throw new Error("No appropriate GPUAdapter found.");let t=await e.requestDevice(),o=document.querySelector("canvas").getContext("webgpu"),n=navigator.gpu.getPreferredCanvasFormat();o.configure({device:t,format:n});let r=new Float32Array([-.79,-.8,.8,-.8,.8,.8,-.8,-.8,.8,.8,-.8,.8]),a=t.createBuffer({label:"Cell vertices",size:r.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});return t.queue.writeBuffer(a,0,r),{device:t,canvasFormat:n,vertexBuffer:a,vertices:r,context:o}}var l=`// Your code here:

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
}`;async function d(){let{device:e,canvasFormat:t,vertexBuffer:i,vertices:o,context:n}=await f(),r={arrayStride:8,attributes:[{format:"float32x2",offset:0,shaderLocation:0}]},a=e.createShaderModule({label:"Cell shader",code:l}),u=e.createRenderPipeline({label:"Cell pipeline",layout:"auto",vertex:{module:a,entryPoint:"vertexMain",buffers:[r]},fragment:{module:a,entryPoint:"fragmentMain",targets:[{format:t}]}}),s=e.createCommandEncoder(),c=s.beginRenderPass({colorAttachments:[{view:n.getCurrentTexture().createView(),loadOp:"clear",clearValue:[0,0,.4,1],storeOp:"store"}]});c.setPipeline(u),c.setVertexBuffer(0,i),c.draw(o.length/2),c.end();let v=s.finish();return e.queue.submit([v]),e.queue.submit([s.finish()]),{encoder:s}}async function m(){let{encoder:e}=await d()}m();})();
