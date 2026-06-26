# Dump Search

This project was built to explore the core mechanics of modern search and retrieval engines like Elasticsearch, Typesense, and Apache Lucene. Rather than relying on external libraries, I implemented an inverted index from scratch. To improve search relevance, the system calculates term weights to support proximity search and utilizes a phonetic algorithm to enable robust fuzzy search capabilities.

---

## Key Capabilities

- **Custom Ingestion Pipeline:** Tokenizes, filters, stems, and indexes raw text or JSON payloads into a relational store.
- **Content Retrieval:** Combines TF-IDF scoring, positional awareness for proximity queries, and phonetic matching to surface highly relevant snippets.
- **Minimalist UI:** A clean, dual purpose interface built for quick document ingestion and instant querying.

---

## Architecture & Data Pipeline

### 1. Ingestion & Indexing Pipeline

When text or JSON documents are uploaded, they pass through a rigid text-processing pipeline before hitting the database:

1. **Raw Document:** The raw file is uploaded.
2. **Tokenization:** Text is split into individual words.
3. **Stop-word Removal:** Filler words (e.g., "the", "and") are removed.
4. **Stemming:** Words are reduced to their base form (e.g., "running" to "run").
5. **Double Metaphone:** Words are converted to phonetic codes to support fuzzy search.
6. **TF-IDF Calculation:** Term weights are generated based on frequency.
7. **SQLite:** The processed data is stored in the inverted index.

![Uploading Document](https://github.com/user-attachments/assets/c5b3bb01-8822-4656-891b-2f49ff0db051)

### 2. Query & Retrieval Engine

When a user executes a search, the query undergoes the exact same processing pipeline. The engine then scans the index, applies positional weights to favor documents where the search terms appear close together (Proximity Search), and returns ranked, context-aware snippets instantly.

![Retrieving Content](https://github.com/user-attachments/assets/06055b44-3f13-4c18-a6e0-68974abb65a9)

---

## 🛠️ Tech Stack

- **Monorepo Management:** Turborepo
- **Frontend:** TypeScript, React, Tailwind CSS
- **Backend:** Node.js, Express, SQLite
- **Search Architecture:** Inverted Index, TF-IDF, Token Proximity Weighting, and `Double Metaphone` (via Natural library) for phonetic fuzzy matching.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v22+
- npm

### Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/salman7875/dump-search.git
   cd dump-search
   ```
