from openai import AzureOpenAI

def get_client():
    azure_endpoint = "https://openaiaus.openai.azure.com/"
    azure_api_key = "<Insert your Azure OpenAI key>"

    client = AzureOpenAI(azure_endpoint = azure_endpoint, api_key=azure_api_key, api_version="2023-05-15")
    return client