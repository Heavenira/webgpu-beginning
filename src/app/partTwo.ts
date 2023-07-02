import { getPartOne } from './partOne';
import importedShader from "../shaders/basic.wgsl"

// Part Two
export async function getPartTwo() {
  const { device, canvasFormat, vertexBuffer, vertices, context } = await getPartOne();

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

    // Render passes are for all drawing operations sent to the canvas.
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: [0, 0, 0.4, 1], // New line
            storeOp: "store",
        }],
    });

    // THIS IS WHERE THE DRAWING FINALLY TAKES PLACE

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(vertices.length / 2);  // 6 vertices

    // THIS IS WHERE THE DRAWING FINALLY ENDS

    pass.end();

    const commandBuffer = encoder.finish();

    device.queue.submit([commandBuffer]);

    // Finish the command buffer and immediately submit it.
    device.queue.submit([encoder.finish()]);
  // at the end return the variables you need for the main.ts
  const results = { encoder: encoder };
  return results;
};