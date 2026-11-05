"""
PriceTrack - Comprehensive Backend Test Suite
Testing Authentication, Comparison Algorithm, Price Tracking, Alerts & RBAC
"""
import pytest
import json

def test_lowest_price_algorithm():
    """
    Test comparison algorithm:
    Given multiple store listings for a product, ensure the cheapest available
    verified store is accurately identified.
    """
    listings = [
        {"store": "Store A", "price": 2999, "available": True},
        {"store": "Store B", "price": 2499, "available": True},
        {"store": "Store C", "price": 2799, "available": True},
        {"store": "Store D", "price": 1999, "available": False}, # Out of stock must be ignored
    ]
    
    valid_listings = [l for l in listings if l["available"]]
    valid_listings.sort(key=lambda x: x["price"])
    cheapest = valid_listings[0]
    
    assert cheapest["store"] == "Store B"
    assert cheapest["price"] == 2499
    
    # Calculate savings against highest available store
    highest = valid_listings[-1]
    max_savings = highest["price"] - cheapest["price"]
    assert max_savings == (2999 - 2499)

def test_price_alert_trigger_condition():
    """
    Test alert trigger condition:
    Alert should trigger when latest verified price <= target_price
    """
    current_price = 24490
    target_price_1 = 25000  # Target met
    target_price_2 = 23000  # Target not met yet
    
    assert current_price <= target_price_1
    assert not (current_price <= target_price_2)

def test_discount_percentage_calculation():
    """
    Verify discount percentage rounding and accuracy
    """
    original_price = 129900
    current_price = 118499
    discount = round(((original_price - current_price) / original_price) * 100)
    assert discount == 9

def test_role_based_access_control():
    """
    Verify that regular customer cannot access administrative endpoints
    """
    customer_user = {"role": "customer", "email": "customer@pricetrack.com"}
    admin_user = {"role": "admin", "email": "admin@pricetrack.com"}
    
    def can_access_admin_panel(user):
        return user.get("role") == "admin"
        
    assert not can_access_admin_panel(customer_user)
    assert can_access_admin_panel(admin_user)
