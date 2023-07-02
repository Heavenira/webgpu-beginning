

// Part one
if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
}


const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
}
const device = await adapter.requestDevice();

const canvas = document.querySelector("canvas")!;

const context = canvas.getContext("webgpu")!;

const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
    device: device,
    format: canvasFormat,
});

const vertices = new Float32Array([
    -0.79, -0.8,
    0.8, -0.8,
    0.8,  0.8,
    
    -0.8, -0.8,
    0.8,  0.8,
    -0.8,  0.8,
]);


const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage:
    GPUBufferUsage.VERTEX
    |
    GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

// Part two

const vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 8,
    attributes: [{
        format: "float32x2",
        offset: 0,
        shaderLocation: 0,
    }],
    
};

const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: importedShader
});

const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout]
    },
    fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [{
            format: canvasFormat
        }]
    }
});
const encoder = device.createCommandEncoder();  