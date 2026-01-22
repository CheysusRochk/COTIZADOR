from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import asyncio
from scraper import DigicorpScraper
from pdf_generator import PDFGenerator
from quote_manager import QuoteNumberManager

app = FastAPI(title="Warp6 Cotizador API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
scraper = DigicorpScraper()
pdf_gen = PDFGenerator()
quote_mgr = QuoteNumberManager()

# Credentials provided by user
USER_EMAIL = "warp6Sol@gmail.com"
USER_PASS = "W4rp6s0l!"

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class SearchRequest(BaseModel):
    query: str

class QuoteItem(BaseModel):
    name: str
    price: float  # Base cost price
    quantity: int
    margin_percentage: float  # Individual margin for this product
    image_url: Optional[str] = None

class ClientData(BaseModel):
    nombre: str
    direccion: str = ""
    ciudad: str = ""
    correo: str = ""
    telefono: str = ""
    referencia: str = ""

class TermsData(BaseModel):
    validez: str
    entrega: str
    formaPago: str
    nota: str = ""
    precioLiteral: str = ""

class QuoteRequest(BaseModel):
    items: List[QuoteItem] 
    client_data: ClientData
    terms_data: TermsData
    quote_number: str = "BORRADOR" # New field for quote number

@app.get("/")
def read_root():
    return {"message": "Warp6 Cotizador API is running"}

@app.on_event("startup")
def startup_event():
    # Attempt auto-login on startup
    print("Attempting auto-login...")
    try:
        scraper.login(USER_EMAIL, USER_PASS)
    except Exception as e:
        print(f"Auto-login failed: {e}")

@app.post("/api/login")
def login(creds: LoginRequest):
    try:
        scraper.login(creds.username, creds.password)
        return {"status": "success", "message": "Logged in"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
def search_products(query: str):
    try:
        results = scraper.search_products(query)
        return {"results": results}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/next-quote-number")
def get_next_quote_number():
    """Get the next quote number in DDMMYY-N format"""
    try:
        result = quote_mgr.get_next_quote_number()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-pdf")
def generate_pdf(quote: QuoteRequest):
    try:
        # Calculate prices with individual margins
        final_items = []
        for item in quote.items:
            base_price = item.price
            margin_multiplier = 1 + (item.margin_percentage / 100)
            sale_price = base_price * margin_multiplier
            
            final_items.append({
                "name": item.name,
                "quantity": item.quantity,
                "cost_price": base_price,
                "sale_price": sale_price,
                "margin_pct": item.margin_percentage
            })
            
        filename = f"cotizacion_{quote.client_data.nombre.replace(' ', '_')}.pdf"
        output_path = os.path.join(os.getcwd(), "generated_pdfs")
        os.makedirs(output_path, exist_ok=True)
        full_path = os.path.join(output_path, filename)
        
        # Pass terms data and quote number
        pdf_gen.create_pdf(final_items, quote.client_data.dict(), quote.terms_data.dict(), quote.quote_number, full_path)
        
        return FileResponse(full_path, media_type='application/pdf', filename=filename)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
def shutdown_event():
    scraper.close()
