import uuid
import qrcode
import io
import base64

def generate_table_qr_token() -> str:
    """Generate a secure 12-character unique hex token for table validation"""
    return uuid.uuid4().hex[:12]

def generate_qr_code_base64(url: str) -> str:
    """Generate base64 encoded PNG string of QR code for frontend rendering"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#2b1810", back_color="#ffffff")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"
