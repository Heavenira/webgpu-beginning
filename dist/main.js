"use strict";(()=>{var u=`// Your code here:

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
}`;async function l(){if(!navigator.gpu)throw new Error("WebGPU not supported on this browser.");let o=await navigator.gpu.requestAdapter();if(!o)throw new Error("No appropriate GPUAdapter found.");let e=await o.requestDevice(),n=document.querySelector("canvas");if(!n)throw new Error("No canvas detected on page.");let r=n.getContext("webgpu");if(!r)throw new Error("Failed to acquire canvas context.");let s=navigator.gpu.getPreferredCanvasFormat(),d={device:e,format:s};r.configure(d);let a=new Float32Array([-.8,-.8,.8,-.8,.8,.8,-.8,-.8,.8,.8,-.8,.8]),i=e.createBuffer({label:"Cell vertices",size:a.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(i,0,a);let m={arrayStride:8,attributes:[{format:"float32x2",offset:0,shaderLocation:0}]},c=e.createShaderModule({label:"Cell shader",code:u}),p=e.createRenderPipeline({label:"Cell pipeline",layout:"auto",vertex:{module:c,entryPoint:"vertexMain",buffers:[m]},fragment:{module:c,entryPoint:"fragmentMain",targets:[{format:s}]}}),f=e.createCommandEncoder(),v={view:r.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:.4,a:1}},t=f.beginRenderPass({colorAttachments:[v]});t.setPipeline(p),t.setVertexBuffer(0,i),t.draw(a.length/2),t.end(),e.queue.submit([f.finish()])}async function h(){await l()}h();})();
