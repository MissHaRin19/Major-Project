# Machine Learning Model

## LSTM Autoencoder

An LSTM Autoencoder is used for anomaly detection in ECG time-series data.

### Why LSTM?
- Captures temporal dependencies
- Suitable for sequential biomedical signals
- Learns patterns of normal heart activity

### Working

1. Model is trained on normal ECG data
2. Reconstruction error is calculated
3. If error exceeds threshold → anomaly detected

### Threshold

A threshold value is selected empirically to balance false positives and detection sensitivity.

---

## Baseline Model: Isolation Forest

Isolation Forest is used as a comparison model.

### Characteristics:
- Unsupervised anomaly detection
- Works on feature space, not sequences
- Faster but less accurate for time-series data

---

## Conclusion

LSTM performs better due to its ability to learn temporal patterns, while Isolation Forest provides a simple baseline for comparison.
