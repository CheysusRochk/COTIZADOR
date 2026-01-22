import json
import os
from datetime import datetime

class QuoteNumberManager:
    def __init__(self, storage_file="quotes_counter.json"):
        self.storage_file = storage_file
        self.ensure_file_exists()
    
    def ensure_file_exists(self):
        """Create the counter file if it doesn't exist"""
        if not os.path.exists(self.storage_file):
            with open(self.storage_file, 'w') as f:
                json.dump({}, f)
    
    def get_next_quote_number(self):
        """
        Generate next quote number in format DDMMYY-N
        Example: 220126-1 for January 22, 2026, first quote of the day
        """
        today = datetime.now()
        date_key = today.strftime("%Y-%m-%d")
        date_part = today.strftime("%d%m%y")  # DDMMYY format
        
        # Read current counters
        with open(self.storage_file, 'r') as f:
            counters = json.load(f)
        
        # Get or initialize counter for today
        if date_key in counters:
            daily_count = counters[date_key] + 1
        else:
            daily_count = 1
        
        # Update counter
        counters[date_key] = daily_count
        
        # Write back
        with open(self.storage_file, 'w') as f:
            json.dump(counters, f, indent=2)
        
        # Format: DDMMYY-N
        quote_number = f"{date_part}-{daily_count}"
        
        return {
            "quote_number": quote_number,
            "date": date_key,
            "daily_sequence": daily_count
        }

# Test
if __name__ == "__main__":
    manager = QuoteNumberManager()
    result = manager.get_next_quote_number()
    print(f"Next quote number: {result['quote_number']}")
    print(f"Date: {result['date']}")
    print(f"Daily sequence: {result['daily_sequence']}")
