from django.test import TestCase
import requests

url = "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
payload = {
    "merchant_id": "c8d2f8b6-07c1-496c-9f4c-f8e8afae1955",
    "amount": 59000,
    "description": "test",
    "callback_url": "http://localhost:8000/api/payments/callback/1/"
}

response = requests.post(url, json=payload)
print("Status Code:", response.status_code)
print("Response:", response.json())