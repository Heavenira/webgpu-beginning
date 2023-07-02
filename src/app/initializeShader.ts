

export async function initializeShader():
    Promise<{
        canvas: HTMLCanvasElement;
        adapter: GPUAdapter;
        device: GPUDevice;
    }> {
    

    /**
     * ----------------------------------
     *           Initialize GPU          
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
     *        Configure the Canvas
     * ----------------------------------
    */

    /** Displays graphics in `<canvas>` element. */

    const canvas = document.querySelector("canvas");
    if (!canvas) {
        throw new Error("No canvas detected on page.")
    }

    /** Stores state information about how things will be drawn onto the screen. */
    
    const context = canvas.getContext("webgpu");
    if (!context) {
        throw new Error("Failed to acquire canvas context.");
    }

    
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
    device: device,
    format: canvasFormat,
    });

    return {canvas, adapter, device};
}