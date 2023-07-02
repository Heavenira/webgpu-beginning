import {initializeShader} from "./initializeShader";

export async function gameOfLife() {
    const {device, context, encoder} = await initializeShader();


    /** This draws color on each pass. Pretty standard. */

    const gpuColorAttachment: GPURenderPassColorAttachment = {
        view: context.getCurrentTexture().createView(), // returns a GPU Texture View with a pixel width and height matching the canvas's
        loadOp: "clear", // do this when the canvas STARTS rendering
        storeOp: "store", // do this when the canvas FINISHES rendering

        // stuff that we specify
        clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
    }

    /**
     * `pass` occurs when all drawing operations in WebGPU happen.
     * 
     * For more advanced uses, you could have multiple render passes (ie. depth, normal).
     * 
     * These are referred to as "attachments". Won't need them here, but it's worth mentioning.
     */

    const pass: GPURenderPassEncoder = encoder.beginRenderPass({
        colorAttachments: [gpuColorAttachment]
    });
    // End the render pass by adding the following call immediately after beginRenderPass():
    pass.end();
    // It's important to know that simply making these calls does not cause the GPU to actually do anything. They're just recording commands for the GPU to do later.


    /**
     * The queue's submit() method takes in an array of command buffers.
     * We are only dealing with ONE though!!!!!
     * 
     * Anyhow when we execute this, JavaScript takes the wheel and overwrites the canvas.
     */ 
    device.queue.submit([encoder.finish()]);

}