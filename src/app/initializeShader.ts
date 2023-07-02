
/**
 * @async Make sure to use `await` when calling this function.
 * @returns A `Promise` containing necessary constants needed for the drawing process:
 * 
 * `device` containing the `GPUDevice`,
 * 
 * `context` containing the `GPUCanvasContext`, 
 * 
 * `encoder` containing the `GPUCommandEncoder`.
*/
export async function initializeShader():
Promise<{
    device: GPUDevice;
    context: GPUCanvasContext;
    encoder: GPUCommandEncoder;
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
    
    // We are good to return these two variables.
    // They are the only requirements for the computation.
    return {device, context, encoder}
}