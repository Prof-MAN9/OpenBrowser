import { pipeline, env } from './transformers.min.js';

// Optimization: Ensure we use the browser's native cache and 
// correctly route the WASM assets.
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
env.useBrowserCache = true;

let extractor = null;

async function getExtractor() {
    if (!extractor) {
        // Log to console so developer/user can see download progress in DevTools
        console.log('[OpenBrowser RAG] Initializing embedding model...');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[OpenBrowser RAG] Model ready.');
    }
    return extractor;
}

self.onmessage = async (e) => {
    const { type, text, id } = e.data;

    if (type === 'embed') {
        try {
            const model = await getExtractor();
            const output = await model(text, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);
            self.postMessage({ type: 'embed-result', id, embedding });
        } catch (error) {
            console.error('[RAG Worker Error]', error);
            self.postMessage({ type: 'error', id, error: error.message });
        }
    }
};
