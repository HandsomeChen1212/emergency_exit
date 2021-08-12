import tensorflow_addons as tfa
import onnx
from onnx_tf.backend import prepare
import tensorflow as tf
print(tf.__version__)

base_model = onnx.load('./runs/train/exp9/weights/best.onnx')
to_tf = prepare(base_model)


converter = tf.compat.v1.lite.TFLiteConverter.from_saved_model('./runs/train/exp9/weights/customyolov5')
tflite_model = converter.convert() #just FYI: this step could go wrong and your notebook instance could crash
