from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from typing import List, Dict, Optional
import time

class DigicorpScraper:
    def __init__(self):
        self.driver = None
        self.base_url = "https://www.digicorp.com.bo"
        self.username = None
        self.password = None

    def start_session(self, headless=False):
        """Iniciar el navegador Chrome"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        print("Browser session started")

    def login(self, username, password):
        """Login a Digicorp"""
        if not self.driver:
            self.start_session(headless=False)
        
        self.username = username
        self.password = password
        
        print(f"Navigating to {self.base_url}...")
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Verificar si ya está logueado
            if "Cerrar Sesión" in self.driver.page_source or "Mi Cuenta" in self.driver.page_source:
                print("Already logged in.")
                return
            
            # Buscar el botón de login
            try:
                login_link = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Iniciar sesión"))
                )
                login_link.click()
                time.sleep(2)
            except:
                print("Login button not found, trying alternative...")
                login_link = self.driver.find_element(By.CSS_SELECTOR, "a[href*='login']")
                login_link.click()
                time.sleep(2)
            
            # Llenar credenciales
            try:
                email_input = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='login[username]'], input[type='email']"))
                )
                email_input.send_keys(username)
                
                password_input = self.driver.find_element(By.CSS_SELECTOR, "input[name='login[password]'], input[type='password']")
                password_input.send_keys(password)
                
                # Submit
                password_input.submit()
                time.sleep(3)
                print("Login submitted.")
            except Exception as e:
                print(f"Error filling login form: {e}")
                
        except Exception as e:
            print(f"Error during login: {e}")

    def search_products(self, query: str) -> List[Dict]:
        """Buscar productos en Digicorp usando el dropdown modal"""
        if not self.driver:
            self.start_session(headless=False)
            
        print(f"Searching for {query}...")
        try:
            # El input de búsqueda puede estar en un modal o en el header
            # Intentar varios selectores comunes
            search_input = None
            try:
                # Esperar menos tiempo para probar diferentes selectores
                search_input = WebDriverWait(self.driver, 3).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input#search"))
                )
            except:
                try:
                    search_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='search']")
                except:
                    try:
                        search_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Buscar'], input[placeholder*='buscar']")
                    except:
                        # Si no encontramos el input, buscar por cualquier input visible
                        all_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input")
                        for inp in all_inputs:
                            if inp.is_displayed():
                                search_input = inp
                                break
            
            if not search_input:
                print("ERROR: No se encontró el input de búsqueda")
                return []
            
            print(f"Found search input: {search_input.get_attribute('id') or search_input.get_attribute('class')}")
            
            # CRITICAL FIX: Close previous search results if open
            try:
                # Click the 'close' button or simply clear input and click body
                # Digicorp usually has a close button in the modal or we can click outside
                # Let's try to click the wrapper or close button
                try:
                     close_btn = self.driver.find_element(By.CSS_SELECTOR, "div.mm-wrapper.modal-open")
                     if close_btn:
                         self.driver.execute_script("arguments[0].click();", close_btn)
                except:
                     pass
                
                # Also try hitting ESC key on body
                webdriver.ActionChains(self.driver).send_keys(Keys.ESCAPE).perform()
                time.sleep(1)
            except:
                pass

            search_input.clear()
            
            # Escribir la búsqueda
            search_input.send_keys(query)
            time.sleep(2)  # Dar tiempo al modal para que aparezca
            
            results = []
            
            # Buscar el contenedor del modal: id="search-result-container"
            try:
                modal_container = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.ID, "search-result-container"))
                )
                print("Found search results modal!")
                
                # Buscar las tarjetas de productos: class="card product-card product-list mb-3"
                product_cards = modal_container.find_elements(By.CSS_SELECTOR, ".card.product-card.product-list")
                print(f"Found {len(product_cards)} products in modal")
                
                for card in product_cards[:50]:  # Limitar a 50 resultados (aumentado de 20)
                    try:
                        # Nombre: h3.product-title > a
                        name_el = card.find_element(By.CSS_SELECTOR, "h3.product-title a")
                        name = name_el.text.strip()
                        
                        # Precio: .a-price-whole y .a-price-fraction dentro de .text-accent-digicorp-red
                        # CORRECCIÓN CRÍTICA:
                        # Si 'a-price-whole' contiene visualmente "11" y 'a-price-fraction' "90",
                        # a veces .text devuelve "1190" para el whole si están anidados o muy juntos.
                        # Estrategia: Obtener ambos, y si whole termina con fraction, cortarlo.
                        price_text = "Consultar"
                        try:
                            price_container = card.find_element(By.CSS_SELECTOR, ".text-accent-digicorp-red .a-price")
                            
                            # Intentar obtener los elementos
                            try:
                                fraction_el = price_container.find_element(By.CSS_SELECTOR, ".a-price-fraction")
                                fraction_str = fraction_el.text.strip()
                            except:
                                fraction_str = None
                                
                            whole_el = price_container.find_element(By.CSS_SELECTOR, ".a-price-whole")
                            whole_str = whole_el.text.strip()
                            
                            # Limpieza básica
                            whole_str = whole_str.replace('.', '').replace(',', '')
                            
                            if fraction_str:
                                # Si whole contiene fraction al final (ej: "2660" termina en "60"), lo quitamos
                                # Pero cuidado con coincidencias falsas (ej: precio 60, fracción 00).
                                # Verificamos si length > length_fraction
                                clean_fraction = fraction_str.replace('.', '').replace(',', '')
                                
                                if whole_str.endswith(clean_fraction) and len(whole_str) > len(clean_fraction):
                                    whole_str = whole_str[:-len(clean_fraction)]
                                
                                whole = float(whole_str)
                                fraction = float(clean_fraction) / 100.0
                                total_price = whole + fraction
                                price_text = f"{total_price:.2f} Bs"
                            else:
                                # Sin fracción
                                whole = float(whole_str)
                                price_text = f"{whole:.2f} Bs"
                                
                        except Exception as e:
                            # print(f"Price error: {e}")
                            pass
                        
                        # Stock: buscar el div que contiene "stock: XX"
                        stock_status = "Consultar"
                        try:
                            stock_div = card.find_element(By.XPATH, ".//*[contains(text(), 'stock:')]")
                            stock_status = stock_div.text.strip()
                        except:
                            pass
                        
                        # Imagen: a.product-list-thumb img
                        image_url = ""
                        try:
                            img_el = card.find_element(By.CSS_SELECTOR, "a.product-list-thumb img")
                            image_url = img_el.get_attribute("src")
                        except:
                            pass
                        
                        if name:  # Solo agregar si tiene nombre
                            results.append({
                                "name": name,
                                "price_raw": price_text,
                                "stock": stock_status,
                                "image_url": image_url
                            })
                    except Exception as e:
                        print(f"Error extracting product card: {e}")
                        continue
                
            except Exception as e:
                print(f"Error finding modal: {e}")
                return []
            
            print(f"Successfully extracted {len(results)} products")
            return results
            
        except Exception as e:
            print(f"Search error: {e}")
            import traceback
            traceback.print_exc()
            return []

    def close(self):
        """Cerrar el navegador"""
        if self.driver:
            self.driver.quit()
            print("Browser closed")

# Test
if __name__ == "__main__":
    scraper = DigicorpScraper()
    scraper.login("warp6Sol@gmail.com", "W4rp6s0l!")
    results = scraper.search_products("camara")
    print(results)
    scraper.close()
