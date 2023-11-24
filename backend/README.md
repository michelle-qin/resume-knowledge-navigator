# LLM-Webapp

## Setup guide:

### Backend:

(Optional) Create a conda environment.

```bash
conda create -n llm python=3.9
conda activate llm
```

Install required packages

```bash
pip install requests Flask openai
```

To start the server run

```bash
flask --app backend run --debug
```
