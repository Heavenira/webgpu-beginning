import gridShader from "../shaders/grid.wgsl"

/** Width and height of Conway's Game of Life. */
const GRID_SIZE = 16;

const UPDATE_INTERVAL = 500; // Update every 200ms (5 times/sec)
let step = 0; // Track how many simulation steps have been run




/**
 * @async Make sure to use `await` when calling this function.
 * @returns Creates Conway's Game of Life.
 */
export async function gameOfLife() {
    
    /**
     * ----------------------------------
     *      Step One: Initialize GPU          
     * ----------------------------------
     */

    // #region

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

    // #endregion

    /**
     * ----------------------------------
     *   Step Two: Configure the Canvas
     * ----------------------------------
     */

    // #region 
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

    // #endregion

    /**
     * ----------------------------------
     *     Step Three: Shader Code
     * ----------------------------------
     */

    // #region

    /** Triangle vertices of square. */
    const vertices = new Float32Array([
        //   X,    Y,
          -0.8, -0.8, // Triangle 1 (Blue)
           0.8, -0.8,
           0.8,  0.8,
        
          -0.8, -0.8, // Triangle 2 (Red)
           0.8,  0.8,
          -0.8,  0.8,
    ]);
    

    /** Buffer used to hold vertices. Immutable. The data will be initialized to zero. Methods populate the data. */
    const vertexBuffer: GPUBuffer = device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    // Place memory in the vertexBuffer address.
    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);
    
    /**
     * ----------------------------------
     *     Chapter Five: Shader Code
     * ----------------------------------
     */

    // #region


    /** Uniform buffer that describes the Conway Game of Life grid.  */
    const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
    /** Buffer used to hold vertices. Immutable. The data will be initialized to zero. Methods populate the data. */
    const uniformBuffer = device.createBuffer({
        label: "Grid Uniforms",
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    // Just like last time, we are rendering this as always!!!
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);


    // #endregion

    /** The vertex data structure. Used to navigate memory. */
    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8, // bytes to skip forward in the buffer
        attributes: [{  // used to store position; allows for multiple
            format: "float32x2",
            offset: 0,  // used for multiple attributes
            shaderLocation: 0, // Position, see vertex shader
        }],
    };

    /** Shader instruction. This includes the code written in WGSL. */
    const cellShaderModule: GPUShaderModule = device.createShaderModule({
        label: "Cell shader",
        code: gridShader,
    });
    

    /** The final render pipeline. */
    const cellPipeline = device.createRenderPipeline({
        label: "Cell pipeline",
        layout: "auto",  // you only have vertex shaders so you can leave as is
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



    // #endregion

    /**
     * ----------------------------------
     *    Step Four: Clear the Canvas
     * ----------------------------------
     */

    // #region


    /** This draws color on each pass. Pretty standard. */
    const gpuColorAttachment: GPURenderPassColorAttachment = {
        view: context.getCurrentTexture().createView(), // returns a GPU Texture View with a pixel width and height matching the canvas's
        loadOp: "clear", // do this when the canvas STARTS rendering
        storeOp: "store", // do this when the canvas FINISHES rendering

        // stuff that we specify
        clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
    }


    // Create an array representing the active state of each cell.
    const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);


    // Create two storage buffers to hold the cell state.
    const cellStateStorage = [
        device.createBuffer({
            label: "Cell State A",
            size: cellStateArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        device.createBuffer({
            label: "Cell State B",
            size: cellStateArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
    ];

    // Mark every third cell of the first grid as active.
    for (let i = 0; i < cellStateArray.length; i+=3) {
        cellStateArray[i] = 1;
    }
    device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);
    
    // Mark every other cell of the second grid as active.
    for (let i = 0; i < cellStateArray.length; i++) {
        cellStateArray[i] = i % 2;
    }
    device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);


    // Mark every third cell of the grid as active.
    for (let i = 0; i < cellStateArray.length; i += 3) {
        cellStateArray[i] = 1;
    }



    /** Resource group that binds stuff (ie. uniforms, textures or samplers). This is an opaque, immutable handle. */
    const bindGroups = [
        device.createBindGroup({
          label: "Cell renderer bind group A",
          layout: cellPipeline.getBindGroupLayout(0),
          entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
          }, {
            binding: 1,
            resource: { buffer: cellStateStorage[0] }
          }],
        }),
         device.createBindGroup({
          label: "Cell renderer bind group B",
          layout: cellPipeline.getBindGroupLayout(0),
          entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
          }, {
            binding: 1,
            resource: { buffer: cellStateStorage[1] }
          }],
        })
    ];

    function updateGrid() {
        step++;
        
        /**
         * Issues GPU commands. Here we are going to create a Render Pass.
         * 
         * (Compute can run too. Your choice.)
         */
        const encoder: GPUCommandEncoder = device.createCommandEncoder();

        /**
         * `pass` occurs when all drawing operations in WebGPU happen.
         * 
         * For more advanced uses, you could have multiple render passes (ie. depth, normal).
         * 
         * These are referred to as "attachments". Won't need them here, but it's worth mentioning.
         * 
         * Put this to work immediately!
         */

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
              view: context!.getCurrentTexture().createView(),
              loadOp: "clear",
              clearValue: { r: 0, g: 0, b: 0.4, a: 1.0 },
              storeOp: "store",
            }]
          });

        // `pass`'s jobs should go between its definition and `pass.end`.
        {
            pass.setPipeline(cellPipeline);
            pass.setVertexBuffer(0, vertexBuffer);

            pass.setBindGroup(0, bindGroups[step % 2]); // New line!

            
            pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE); // 6 vertices
            // End the render pass by adding the following call immediately after beginRenderPass():
            pass.end();
        }
        // It's important to know that simply making these calls does not cause the GPU to actually do anything. They're just recording commands for the GPU to do later.


        /**
         * The queue's submit() method takes in an array of command buffers.
         * We are only dealing with ONE though!!!!!
         * 
         * Anyhow when we execute this, JavaScript takes the wheel and overwrites the canvas.
         */ 
        device.queue.submit([encoder.finish()]);
    }
    // Move all of our rendering code into a function
    setInterval(updateGrid, UPDATE_INTERVAL)

    // #endregion
}