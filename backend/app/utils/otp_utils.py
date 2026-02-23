import random
import string
from datetime import datetime, timedelta
import os


def generate_otp(length: int = 6) -> str:
    """
    Generate a random OTP code

    Args:
        length: Length of OTP code (default 6 digits)

    Returns:
        Random OTP code as string
    """
    return ''.join(random.choices(string.digits, k=length))


def get_otp_expiry_time() -> datetime:
    """
    Get OTP expiry time based on environment configuration

    Returns:
        DateTime object representing OTP expiry time
    """
    expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", 15))
    return datetime.utcnow() + timedelta(minutes=expiry_minutes)


def is_otp_expired(expiry_time: datetime) -> bool:
    """
    Check if OTP is expired

    Args:
        expiry_time: DateTime object representing expiry time

    Returns:
        True if OTP is expired, False otherwise
    """
    return datetime.utcnow() > expiry_time


def calculate_remaining_time(expiry_time: datetime) -> dict:
    """
    Calculate remaining time for OTP validity

    Args:
        expiry_time: DateTime object representing expiry time

    Returns:
        Dictionary with minutes and seconds remaining
    """
    if is_otp_expired(expiry_time):
        return {"minutes": 0, "seconds": 0, "expired": True}

    remaining = expiry_time - datetime.utcnow()
    minutes = remaining.seconds // 60
    seconds = remaining.seconds % 60

    return {"minutes": minutes, "seconds": seconds, "expired": False}
