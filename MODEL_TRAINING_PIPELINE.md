# SecureBioSim Model Training & Data Preprocessing Guide

This document explains how the ECG anomaly model in SecureBioSim is prepared, trained, thresholded, and exported from the Colab notebook workflow.

## 1. Dataset source
- The notebook uses the **MIT-BIH Arrhythmia Dataset** as the source of ECG records.
- The workflow extracts **normal ECG windows** for autoencoder training so the model learns baseline physiological behavior rather than attack signatures directly.

## 2. Preprocessing steps
The preprocessing flow in `MP.ipynb` follows these stages:

1. **Set the ECG window size** to `140` samples.
2. **Extract normal windows** around valid ECG regions using the notebook helper `extract_normal_windows(record_id)`.
3. **Stack windows across records** into one training array.
4. **Normalize all samples** using `MinMaxScaler(feature_range=(-1, 1))`.
5. **Reshape the data** from `(N, 140)` into `(N, 140, 1)` for LSTM input.

### Important preprocessing values
- `WINDOW_SIZE = 140`
- Total extracted normal windows shown in the notebook: `25689`
- Final training tensor shape shown in the notebook: `(25689, 140, 1)`

## 3. Model architecture
The notebook trains an **LSTM autoencoder** with sequence input shape `(140, 1)`.

The architecture summary shown in the notebook indicates:
- Input layer
- LSTM encoder layers
- RepeatVector
- LSTM decoder layers
- TimeDistributed output layer

This design is appropriate for anomaly detection because the model is trained to reconstruct normal ECG patterns, and reconstruction failure signals abnormal telemetry.

## 4. Training workflow
The notebook trains the model using `model.fit(...)` on the normalized ECG windows.

At a high level, the training process is:
1. prepare normal windows,
2. normalize them,
3. reshape them to sequence format,
4. fit the LSTM autoencoder,
5. compute reconstruction errors on normal data.

## 5. Threshold calculation
The anomaly threshold is derived in the notebook from the distribution of reconstruction error on normal samples.

The formula used is:

```python
threshold = np.mean(reconstruction_error) + 3*np.std(reconstruction_error)
```

This means the runtime threshold should ideally be tied to the notebook-derived value rather than being changed manually.

## 6. Evaluation metrics and how to read them
The notebook evaluates the trained autoencoder by combining reconstruction errors from the normal ECG windows with reconstruction errors from simulated attack windows, then converting those errors into predicted labels with the anomaly threshold.

### Metric formulas
Using the confusion-matrix counts:
- **True Positive (TP):** an attack window correctly flagged as an attack.
- **True Negative (TN):** a normal window correctly kept as normal.
- **False Positive (FP):** a normal window incorrectly flagged as an attack.
- **False Negative (FN):** an attack window missed by the detector.

The notebook reports these standard metrics:
- **Accuracy** = `(TP + TN) / (TP + TN + FP + FN)`
- **Precision** = `TP / (TP + FP)`
- **Recall** = `TP / (TP + FN)`
- **F1 score** = `2 * (Precision * Recall) / (Precision + Recall)`

### What each metric means in this project
- **Accuracy** summarizes overall correctness across both normal and attack windows.
- **Precision** shows how trustworthy an attack alert is once the model raises it. Higher precision means fewer false alarms during normal telemetry.
- **Recall** shows how many attack windows are successfully caught. Higher recall means fewer missed attacks.
- **F1 score** balances precision and recall, which is useful here because missed attacks and false alarms both matter in a Bio-CPS setting.

### Confusion matrix interpretation
The notebook confusion matrix is arranged as:
- rows = **actual labels** (`Normal`, `Attack`)
- columns = **predicted labels** (`Normal`, `Attack`)

So the matrix cells mean:
- top-left = **TN**
- top-right = **FP**
- bottom-left = **FN**
- bottom-right = **TP**

### Current notebook-reported results
From the latest saved output in `MP.ipynb`, the evaluation over combined normal and simulated attack windows reports:
- **Accuracy:** `0.7347502822219627`
- **Precision:** `0.9441048678105899`
- **Recall:** `0.4990462844018841`
- **F1 score:** `0.6529489660792502`

The accompanying class report in the notebook shows equal support for both classes:
- normal support: `25689`
- attack support: `25689`

The saved confusion matrix is:

```text
[[24930   759]
 [12869 12820]]
```

This means the current saved notebook run is **very precise when it predicts an attack**, but it still **misses roughly half of the simulated attack windows** because recall is about `0.499`. In practical terms, the model currently behaves more like a conservative detector that avoids false positives better than it avoids false negatives.

## 7. Exported artifacts
The notebook exports the following files:

### Main model artifact
- `lstm_ecg_autoencoder.keras`

### Supporting datasets generated in notebook
- `normal_ecg_windows.json`
- `attack_ecg_windows.json`

These are exported using `files.download(...)` in Colab.

## 8. How runtime inference uses the exported model
The FastAPI backend loads the exported Keras model from:

- `MODEL_PATH = "lstm_ecg_autoencoder.keras"`

At inference time, the backend:
1. reshapes incoming ECG to `(1, 140, 1)`,
2. runs `model.predict(...)`,
3. computes mean squared reconstruction error,
4. compares error against the runtime threshold,
5. combines reconstruction error with checksum/replay/signal heuristics for final inference.

## 9. Finalization note
There is currently a **reproducibility gap** between notebook-derived thresholding and backend runtime constants.

For full finalization, the team should:
- document the exact dataset record list used,
- store the final threshold value produced by training,
- export scaler metadata if needed,
- and ensure backend constants match notebook outputs exactly.

## 10. Recommended end-to-end training/export checklist
- Download MIT-BIH ECG records.
- Extract only normal windows.
- Normalize using MinMax scaling to `[-1, 1]`.
- Reshape to `(N, 140, 1)`.
- Train LSTM autoencoder.
- Compute reconstruction error on normal validation data.
- Set threshold using `mean + 3*std`.
- Export `.keras` model.
- Record threshold and preprocessing assumptions for backend deployment.
