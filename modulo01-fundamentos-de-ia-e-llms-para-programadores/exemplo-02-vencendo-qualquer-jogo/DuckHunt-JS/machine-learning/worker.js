importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

const MODEL_PATH = `yolov5n_web_model/model.json`;
const LABELS_PATH = `yolov5n_web_model/labels.json`;
const INPUT_MODEL_DIMENSIONS = 640;
const CLASS_THRESHOLD = 0.4;

let _model = null;
let _labels = [];

async function loadModuleAndLabels() {
    await tf.ready();

    _labels = await (await fetch(LABELS_PATH)).json();
    _model = await tf.loadGraphModel(MODEL_PATH);

    const dummyInput = tf.ones(_model.inputs[0].shape);
    await _model.executeAsync(dummyInput);
    tf.dispose(dummyInput);

    postMessage({ type: 'model-loaded' });

}

// Preprocess the input image to match the model's expected input format
// tf.browser.fromPixels() converts the image to a tensor, then we resize it to the model's input dimensions,
// normalize pixel values to [0, 1], and add a batch dimension.
// .div(255) normalizes the pixel values, and 
// .expandDims(0) adds a batch dimension to create a shape of [1, height, width, channels].
// The tf.tidy() function is used to automatically clean up intermediate tensors created during preprocessing,

function preprocessImage(input) {
    return tf.tidy(() => {

        const image = tf.browser.fromPixels(input);
        
        return tf.image
            .resizeBilinear(image, [INPUT_MODEL_DIMENSIONS, INPUT_MODEL_DIMENSIONS])
            .div(255)
            .expandDims(0);
    })
}

// Run inference on the preprocessed image tensor using the loaded model. The output is processed to 
// extract predictions.
// The output of the model is typically an array of tensors, which may include bounding boxes, class scores,
// and class labels.
async function runInference(tensor) {
    const output = await _model.executeAsync(tensor);
    tf.dispose(tensor);
    // Process output to extract predictions (this will depend on your model's output format)
    // For example, if the model outputs bounding boxes and scores, you would parse them here.

    const [boxes, scores, classes] = output.slice(0,3)
    const [boxesData, scoresData, classesData] = await Promise.all([
        boxes.data(),
        scores.data(),
        classes.data()
    ]);

    output.forEach(t => t.dispose());

    // Here you would typically apply a confidence threshold and non-max suppression to filter predictions
    // For demonstration, we'll just return the raw outputs
    return { 
        boxes: boxesData, 
        scores: scoresData, 
        classes: classesData 
    };  
}

function* processPrediction({boxes, scores, classes}, width, height) {
    for (let index = 0; index < scores.length; index++) {
        if (scores[index] < CLASS_THRESHOLD) continue

        const label = _labels[classes[index]]
        if (label !== 'kite') continue

        let [x1, y1, x2, y2] = boxes.slice(index * 4, (index + 1) * 4);
        x1 *= width
        x2 *= width
        y1 *= height
        y2 *= height

        const boxWidth = x2 - x1;
        const boxHeight = y2 - y1;
        const centerX = x1 + boxWidth / 2;
        const centerY = y1 + boxHeight / 2; 

        yield { 
            x: centerX, 
            y: centerY, 
            score: (scores[index] * 100).toFixed(2)
        };
    }
}

loadModuleAndLabels();

self.onmessage = async ({ data }) => {
    if (data.type !== 'predict') return
    if(!_model) return

    const input = preprocessImage(data.image)
    const {width, height} = data.image;

    const inferenceResults = await runInference(input);
    
    for (const prediction of processPrediction(inferenceResults, width, height)) {
        postMessage({
            type: 'prediction',
            ...prediction
        });
    }
};

console.log('🧠 YOLOv5n Web Worker initialized');
