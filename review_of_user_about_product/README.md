# Vietnamese-ABSA-PhoneReview-Dataset
## 📦 Dataset

This project uses the **UIT-ViSD4SA** dataset, a Vietnamese benchmark dataset for
**Aspect-Based Sentiment Analysis (ABSA)** in the smartphone review domain.

The original dataset was released by the University of Information Technology (UIT),
Vietnam National University, Ho Chi Minh City.

🔗 **UIT-ViSD4SA Dataset Repository**  
[![Dataset: UIT-ViSD4SA](https://img.shields.io/badge/Dataset-UIT--ViSD4SA-blue)](https://github.com/kimkim00/UIT-ViSD4SA/tree/main)


The dataset contains:
- 10 aspect categories: BATTERY, CAMERA, DESIGN, FEATURES, GENERAL, PERFORMANCE, PRICE, SCREEN, SER&ACC, STORAGE.
- 3 sentiment polarities (Positive, Neutral, Negative)  
- User-generated Vietnamese smartphone reviews with teencode, emojis, and noisy text

The original structure (`train.jsonl`, `dev.jsonl`, `test.jsonl`) is preserved to ensure full compatibility with the training and evaluation scripts in this project.

Place them inside a folder named data/ in your working directory.


📂 Project Structure & Data Setup
To run the training notebooks, please ensure your directory is structured as follows:

.
├── data/                        # Directory for dataset files (Create manually)
│   ├── train.jsonl
│   ├── dev.jsonl
│   └── test.jsonl
├── deployment/                  # Interactive Web App
│   ├── app.py                   # Streamlit application code
│   └── requirements.txt         # Dependencies for deployment
├── train_roberta_large.ipynb    # Baseline Model (Jupyter Notebook for Kaggle)
├── train_roberta_ABSA_AGA.ipynb # Improved Model (AGA + Weighted Loss)
└── README.md


## 🧠 Methodology

To address the challenge of **Aspect-Based Sentiment Analysis (ABSA)** on the noisy and imbalanced Vietnamese smartphone review dataset, we investigated two distinct modeling approaches.

### 1. Baseline Approach
* **File:** `train_roberta_large.ipynb`
* **Architecture:** We utilized **XLM-RoBERTa Large** as the backbone. The model employs a standard sentence-level classification architecture using the `[CLS]` token representation fed into two separate Linear heads: one for Aspect Detection and one for Polarity Classification.
* **Loss Function:** Standard Binary Cross Entropy (BCE).
* **Limitation:** The baseline struggled significantly with class imbalance. It failed to detect minority aspects, resulting in a **0.00 F1-Score for the `STORAGE` aspect**.

### 2. Improved Approach (AGA + Weighted Loss)
* **File:** `train_roberta_ABSA_AGA.ipynb`
* **Architecture:** We enhanced the backbone with an **Aspect-Guided Attention (AGA)** mechanism.
    * *How it works:* AGA introduces learnable query vectors for each aspect category. These queries interact with the contextual embeddings from XLM-RoBERTa via Multi-Head Attention, allowing the model to dynamically focus on relevant tokens for specific aspects (e.g., focusing on "GB", "bộ nhớ" for the `STORAGE` aspect).
* **Imbalance Handling:** We replaced the standard loss with a **Weighted BCE Loss**.
    * *Technique:* Positive weights (`pos_weight`) were calculated based on the ratio of negative to positive samples for each class.
    * *Clipping:* Weights were clipped (max value = 10) to prevent exploding gradients while ensuring the model is heavily penalized for missing rare classes.
* **Result:** This approach successfully captured under-represented classes, boosting the performance on the `STORAGE` aspect from 0% to over 60%.

---

## 📊 Experimental Results

The combination of Aspect-Guided Attention and Weighted Loss yielded significant improvements, particularly for minority classes, without compromising the overall performance on dominant classes.

| Metric | Baseline Model | **Improved Model (AGA)** |
| :--- | :---: | :---: |
| **Aspect Macro F1** | ~0.80 | **~0.86** |
| **Joint Macro F1** | ~0.77 | **~0.83** |
| **STORAGE Class F1** | ❌ **0.00%** | ✅ **~63.9%** |

*Note: The `STORAGE` class represents the most extreme case of data imbalance in the dataset. The Improved Model demonstrates robust capability in handling such scarcity.*

---

## 🛠️ Training & Outputs

The training is performed using Jupyter Notebooks, optimized for **Kaggle** environments with GPU support (P100 or T4).

### How to Run
1.  **Upload Notebook:** Upload the `train_roberta_ABSA_AGA.ipynb` file to Kaggle.
2.  **Add Data:** Attach the **UIT-ViSD4SA** dataset to your Kaggle notebook.
    * *Configuration:* Ensure the `ROOT_DIR` path in the notebook matches the dataset path in Kaggle.
3.  **Execution:** Run all cells.

### Generated Artifacts
Upon completion, the training script automatically generates the following directories and files:

* **`checkpoints_sentenceABSA_AGA/`**: Contains the saved model weights.
    * `best_sentence_AGA.pt`: The model checkpoint with the highest validation score (Use this for deployment).
* **`metrics_sentenceABSA_AGA/`**: Contains detailed evaluation logs.
    * `test_aspect_per_class.csv`: Precision, Recall, and F1 scores broken down by aspect.
    * `test_joint_per_aspect.csv`: Joint detection performance.
    * `test_summary.json`: Overall summary metrics.

---

## 🚀 Deployment
