
/**
 * Make sure to use `await` when calling this function.
 * @async
 * @function
 * @returns A `Promise` containing necessary constants needed for the next drawing steps.
 */
export async function initializeShader():
    Promise<{
        canvas: HTMLCanvasElement;
        adapter: GPUAdapter;
        device: GPUDevice;
    }> {
    

    /**
     * ----------------------------------
     *      Step One: Initialize GPU          
     * ----------------------------------
     */

    // Prevent the website from loading if it is incompatible.

    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }

    /** A `GPUAdapter` represents the GPU hardware in your device. */

    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
    
    if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
    }

    /** A `GPUDevice` is the main interface where most interaction with the GPU happens. */

    const device: GPUDevice = await adapter.requestDevice();


    /**
     * ----------------------------------
     *   Step Two: Configure the Canvas
     * ----------------------------------
     */

    /** Displays graphics in `<canvas>` element. */

    const canvas: HTMLCanvasElement | null = document.querySelector("canvas");
    if (!canvas) {
        throw new Error("No canvas detected on page.")
    }

    /** Stores state information about how things will be drawn onto the screen. */
    
    const context: GPUCanvasContext | null = canvas.getContext("webgpu");
    if (!context) {
        throw new Error("Failed to acquire canvas context.");
    }

    /**
     * Stores the texture format. (ie. `"r8unorm"`, `"depth16unorm"`, `"astc-4x4-unorm"`.)
     * 
     * For more information, refer to {@link https://gpuweb.github.io/gpuweb/#enumdef-gputextureformat | GPU Texture Format Documentation}.
     */

    const canvasFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

    /** Final settings to apply to the canvas configuration. */

    const canvasConfig: GPUCanvasConfiguration = {
        device: device,
        format: canvasFormat,
    }
    
    // Sets the configuration of the canvas.

    context.configure(canvasConfig);
    

    /**
     * ----------------------------------
     *    Step Three: Clear the Canvas
     * ----------------------------------
     */


    /**
     * Issues GPU commands. Here we are going to create a Render Pass.
     * 
     * (Compute can run too. Your choice.)
     */

    const encoder: GPUCommandEncoder = device.createCommandEncoder();


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

    const pass = encoder.beginRenderPass({
        colorAttachments: [gpuColorAttachment]
    });
    // End the render pass by adding the following call immediately after beginRenderPass():
    pass.end();
    // It's important to know that simply making these calls does not cause the GPU to actually do anything. They're just recording commands for the GPU to do later.



    if (false) {
        /**
         * In order to create a `GPUCommandBuffer`, call `finish()` on the command encoder.
         * 
         * The command buffer is an opaque handle to the recorded commands.
         */
        const commandBuffer = encoder.finish();
        `Once you .queue.submit() a commandBuffer however, we can no longer use it.
        This is why it is practical to inline the .finish() command below.`
    }

    



    /**
     * The queue's submit() method takes in an array of command buffers.
     * We are only dealing with ONE though!!!!!
     * 
     * Anyhow once you execute this, JavaScript takes the wheel and overwrites the canvas.
     */ 
    device.queue.submit([encoder.finish()]);


    return {canvas, adapter, device};
}