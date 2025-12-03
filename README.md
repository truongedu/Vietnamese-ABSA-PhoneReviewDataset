# Vietnamese-ABSA-PhoneReview
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

> **Note:** To train the models, you must manually create a `data/` folder in the root directory and place the dataset files (`train.jsonl`, `dev.jsonl`, `test.jsonl`) there.


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

To address the challenges of the **UIT-ViSD4SA** dataset—specifically the noisy text and severe class imbalance (e.g., `STORAGE` has very few samples compared to `GENERAL`)—we implemented and compared two distinct modeling approaches.

### 1. Baseline Approach (`train_roberta_large.ipynb`)
* **Backbone:** `xlm-roberta-large`.
* **Architecture:** Standard Sentence-level ABSA. We use the `[CLS]` token representation fed into two simple Linear heads: one for Aspect Detection and one for Polarity Classification.
* **Loss Function:** Standard Binary Cross Entropy (BCE).
* **Limitation:** The model is biased towards majority classes. It completely failed to learn minority aspects, resulting in a **0.00% F1-Score for the `STORAGE` class**.

### 2. Improved Approach (`train_roberta_ABSA_AGA.ipynb`)
To overcome the baseline's limitations, we introduced two key enhancements:

* **Aspect-Guided Attention (AGA):** Instead of relying solely on the `[CLS]` token, we initialized learnable query vectors for each aspect. These queries interact with the token embeddings via Multi-Head Attention, allowing the model to dynamically focus on relevant keywords for each specific aspect (e.g., focusing on "GB", "dung lượng" for `STORAGE`).
* **Weighted BCE Loss:** We calculated positive weights (`pos_weight`) based on the ratio of negative to positive samples. These weights were clipped to prevent gradient explosion. This forces the model to pay significantly more attention to rare classes during training.

---

## 📊 Experimental Results
The proposed method (AGA + Weighted Loss) demonstrated superior performance, particularly in "waking up" the model to recognize rare classes that the baseline completely ignored.

| Metric | Baseline Model | **Improved Model (AGA)** | Improvement |
| :--- | :---: | :---: | :---: |
| **Aspect Macro F1** | ~80.33% | **86.68%** | 🔺 **+6.35%** |
| **Joint Macro F1** | ~77.04% | **82.99%** | 🔺 **+5.95%** |
| **STORAGE Class F1** | **0.00%** | **65.75%** | 🚀 **Detected** |

> **Key Insight:** While the overall metrics improved, the most critical success was in the **`STORAGE`** aspect. The Baseline model had 0 recall for this class, whereas the Improved model achieved a usable F1-score of **65.75%**, proving the effectiveness of the Weighted Loss and AGA mechanism in handling imbalanced data.
---

## 🛠️ How to Run

The training codes are provided as Jupyter Notebooks, optimized for **Kaggle** or **Google Colab** environments (GPU P100/T4 recommended).

### 1. Training
1.  **Data Setup:** Create a folder named `data/` in your environment and upload the dataset files (`train.jsonl`, `dev.jsonl`, `test.jsonl`).
2.  **Open Notebook:**
    * For the baseline: Open `train_roberta_large.ipynb`.
    * For the improved model: Open `train_roberta_ABSA_AGA.ipynb`.
3.  **Run:** Execute all cells.
4.  **Output:**
    * The script will generate detailed logs describing precision/recall per class.
    * The best model weights will be saved as a `.pt` file (e.g., `best_sentence_AGA.pt`).

## 🚀 Deployment
We provide an interactive web app to demonstrate the model.



## 🔗 References

* **Dataset:** [UIT-ViSD4SA](https://github.com/kimkim00/UIT-ViSD4SA) - Released by the University of Information Technology, Vietnam National University, Ho Chi Minh City.
* **Base Model:** [XLM-RoBERTa](https://huggingface.co/xlm-roberta-large) - Pre-trained Multilingual Language Model by Facebook AI.