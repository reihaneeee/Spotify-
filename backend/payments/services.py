# payments/services.py
import requests
import uuid
from django.conf import settings

class PaymentGateway:
    REQUEST_URL = "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
    VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
    
    def __init__(self):
        self.merchant_id = str(settings.ZARINPAL_MERCHANT_ID)

    def request_payment(self, amount, description, callback_url):
        payload = {
            "merchant_id": self.merchant_id,
            "amount": int(amount),
            "description": description,
            "callback_url": callback_url,
            # "metadata": {
            #     "mobile": "09051804345",
            #     "email": "reihane@gamil.com"
            # }
        }
        try:
            response = requests.post(self.REQUEST_URL, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()

            print("=== پاسخ کامل زرین‌پال ===")
            print(data)

            if data.get("data") and data["data"]["code"] == 100:
                return {
                    "success": True,
                    "authority": data["data"]["authority"],
                    "payment_url": f"https://sandbox.zarinpal.com/pg/StartPay/{data['data']['authority']}"
                }
            return {"success": False, "message": data.get("errors", {}).get("message", "خطا در اتصال به درگاه")}
        except Exception as e:
            return {"success": False, "message": str(e)}
    

    def verify_payment(self, authority, amount):
        payload = {
            "merchant_id": self.merchant_id,
            "amount": int(amount),
            "authority": authority
        }
        try:
            response = requests.post(self.VERIFY_URL, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            if data.get("data") and data["data"]["code"] == 100:
                return {"success": True, "ref_id": data["data"]["ref_id"]}
            return {"success": False, "message": data.get("errors", {}).get("message", "خطا در تایید پرداخت")}
        except Exception as e:
            return {"success": False, "message": str(e)}
