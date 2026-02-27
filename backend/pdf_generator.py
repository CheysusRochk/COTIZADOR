from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import os

class PDFGenerator:
    def __init__(self):
        self.filename = "cotizacion.pdf"
        self.styles = getSampleStyleSheet()
        # Colores extraídos aproximados de la imagen
        self.dark_blue = colors.HexColor("#002147") # Azul oscuro corporativo
        self.light_gray = colors.HexColor("#DDDDDD")
        
        # Estilos personalizados
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            fontName='Helvetica-Bold',
            fontSize=8,
            textColor=colors.white,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='CellText',
            fontName='Helvetica',
            fontSize=8,
            textColor=colors.black,
            alignment=TA_LEFT
        ))
        
        self.styles.add(ParagraphStyle(
            name='CellTextBold',
            fontName='Helvetica-Bold',
            fontSize=8,
            textColor=colors.black,
            alignment=TA_LEFT
        ))

    def create_pdf(self, items, client_data, terms_data, quote_number="0000", filename=None):
        if filename:
            self.filename = filename
            
        doc = SimpleDocTemplate(self.filename, pagesize=A4,
                                rightMargin=1*cm, leftMargin=1*cm,
                                topMargin=1*cm, bottomMargin=1*cm)
        
        # LOGO HANDLING
        # Check if assets/logo.png exists
        logo_path = os.path.join(os.getcwd(), "assets", "logo.png")
        logo_img = None
        if os.path.exists(logo_path):
            try:
                # Resize logo to fit nicely (e.g., 4cm width, aspect ratio preserved)
                logo_img = Image(logo_path, width=4*cm, height=1.5*cm)
                logo_img.hAlign = 'LEFT'
            except:
                pass

        story = []
        
        # 1. HEADER SECTION
        # Logo + Info (Left) vs Quote Box (Right)
        
        # Info empresa
        company_info_elements = []
        if logo_img:
            company_info_elements.append(logo_img)
            company_info_elements.append(Spacer(1, 6))
        else:
             # Only show text if no logo, or user requested removal of text if logo exists
             pass
            
        company_info_elements.extend([
            # Removed large WARP6 title as requested
            Paragraph("Av. Villarroel entre Tejerina y Tarapacá N.149", ParagraphStyle('Addr', fontSize=8, fontName='Helvetica')),
            Paragraph("<b>NIT:</b> 682803029", ParagraphStyle('Tiny', fontSize=7)),
            Paragraph("<b>Teléfono:</b> 64650001", ParagraphStyle('Tiny', fontSize=7)),
            Paragraph("<b>Correo:</b> warp6sol@gmail.com", ParagraphStyle('Tiny', fontSize=7)),
        ])
        
        # Quote metadata table
        now = datetime.now()
        quote_num = quote_number # Dynamic
        
        # FIX: Font size and style to match Date (smaller, standard)
        quote_data = [
            [Paragraph("COTIZACIÓN", self.styles['TableHeader'])],
            [Paragraph(quote_num, ParagraphStyle('QuoteNum', fontSize=10, fontName='Helvetica-Bold', alignment=TA_CENTER))],
            [
                Table([
                    [Paragraph("DÍA", self.styles['TableHeader']), Paragraph("MES", self.styles['TableHeader']), Paragraph("AÑO", self.styles['TableHeader'])],
                    [str(now.day), str(now.month), str(now.year)]
                ], colWidths=[1.5*cm, 1.5*cm, 1.5*cm], style=[
                    ('BACKGROUND', (0,0), (-1,0), self.dark_blue),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('FONTSIZE', (0,0), (-1,-1), 8),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
                ])
            ]
        ]
        
        quote_table = Table(quote_data, colWidths=[4.5*cm])
        quote_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), self.dark_blue),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))

        header_table = Table([
            [company_info_elements, quote_table]
        ], colWidths=[13*cm, 5*cm])
        
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        
        story.append(header_table)
        story.append(Spacer(1, 12))
        
        # 2. CLIENT DATA SECTION
        story.append(Paragraph("DATOS CLIENTE", ParagraphStyle('SectionTitle', fontSize=10, fontName='Helvetica-Bold', textColor=self.dark_blue)))
        story.append(Spacer(1, 4))
        
        # Table structure exactly mimicking image
        # Row 1: NOMBRE | DIRECCION | CIUDAD
        # Row 2: CORREO | TELEFONO | REFERENCIA
        
        cd = client_data
        
        client_table_data = [
            [
                Paragraph("NOMBRE", self.styles['TableHeader']),
                Paragraph("DIRECCIÓN", self.styles['TableHeader']),
                Paragraph("CIUDAD", self.styles['TableHeader'])
            ],
            [
                Paragraph(cd.get('nombre', ''), self.styles['CellTextBold']),
                Paragraph(cd.get('direccion', ''), self.styles['CellText']),
                Paragraph(cd.get('ciudad', ''), self.styles['CellText'])
            ],
            [
                Paragraph("CORREO", self.styles['TableHeader']),
                Paragraph("TELÉFONO", self.styles['TableHeader']),
                Paragraph("REFERENCIA", self.styles['TableHeader'])
            ],
            [
                Paragraph(cd.get('correo', ''), self.styles['CellText']),
                Paragraph(cd.get('telefono', ''), self.styles['CellText']),
                Paragraph(cd.get('referencia', ''), self.styles['CellTextBold'])
            ]
        ]
        
        ct = Table(client_table_data, colWidths=[7*cm, 7*cm, 5*cm])
        ct.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), self.dark_blue), # Header row 1
            ('BACKGROUND', (0,2), (-1,2), self.dark_blue), # Header row 2
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        
        story.append(ct)
        story.append(Spacer(1, 12))
        
        # 3. PRODUCTS SECTION
        
        prod_data = [[
            Paragraph("N.", self.styles['TableHeader']),
            Paragraph("DESCRIPCIÓN", self.styles['TableHeader']),
            Paragraph("CANTIDAD", self.styles['TableHeader']),
            Paragraph("PRECIO UNIT.", self.styles['TableHeader']),
            Paragraph("PRECIO TOTAL", self.styles['TableHeader'])
        ]]
        
        total = 0
        for idx, item in enumerate(items, 1):
            sale_price = item.get('sale_price', 0)
            qty = item.get('quantity', 1)
            subtotal = sale_price * qty
            total += subtotal
            
            name_text = item.get('name', '').replace('\n', '<br/>')
            
            prod_data.append([
                str(idx),
                Paragraph(name_text, self.styles['CellText']),
                str(qty),
                f"{sale_price:.2f}",
                f"{subtotal:.2f}"
            ])
            
        # Add empty rows to fill space if needed (optional)
        
        # Create Table
        pt = Table(prod_data, colWidths=[1*cm, 10*cm, 2.5*cm, 2.75*cm, 2.75*cm])
        pt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), self.dark_blue),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),     # Center everything by default
            ('ALIGN', (1,1), (1,-1), 'LEFT'),        # Left align descriptions
            ('ALIGN', (3,1), (4,-1), 'RIGHT'),       # Right align prices
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        
        story.append(pt)
        
        # Total Row (Separate table to match layout)
        total_data = [[
            "",  # Empty space
            Paragraph("<b>TOTAL, EN BOLIVIANOS:</b>", ParagraphStyle('TotalLabel', fontSize=9, textColor=colors.white, alignment=TA_RIGHT)),
            Paragraph(f"<b>Bs. {total:.2f}</b>", ParagraphStyle('TotalVal', fontSize=9, textColor=colors.black, alignment=TA_RIGHT))
        ]]
        
        # Calculate width of empty space: Total width - (Label + Value) columns
        # Total Table width = 19cm. Let's make label+value match the last columns logic
        tt = Table(total_data, colWidths=[13.5*cm, 2.75*cm, 2.75*cm])
        tt.setStyle(TableStyle([
            ('BACKGROUND', (1,0), (1,0), self.dark_blue), # Label background
            ('BACKGROUND', (2,0), (2,0), self.light_gray), # Value background
            ('GRID', (1,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (2,0), (2,0), 'RIGHT'),
        ]))
        
        story.append(tt)
        story.append(Spacer(1, 12))
        
        # 4. TERMS & CONDITIONS FOOTER
        # This is a complex table with merged cells
        
        # Define white text style for labels
        white_label_style = ParagraphStyle('WhiteLabel', fontSize=8, fontName='Helvetica-Bold', textColor=colors.white)
        
        # Data preparation
        literal_price = terms_data.get('precioLiteral', f"SON: {total:.2f} BOLIVIANOS")
        
        footer_data = [
            [Paragraph("TÉRMINOS Y CONDICIONES", ParagraphStyle('FooterH', textColor=colors.white, fontSize=8, fontName='Helvetica-Bold')), ""],
            [Paragraph("PRECIO:", white_label_style), Paragraph(f"Bs {total:.2f} ({literal_price})", self.styles['CellText'])],
            [Paragraph("FORMA DE PAGO:", white_label_style), Paragraph(terms_data.get('formaPago', ''), self.styles['CellText'])],
            [Paragraph("TIEMPO DE ENTREGA:", white_label_style), Paragraph(terms_data.get('entrega', ''), self.styles['CellText'])],
            [Paragraph("VIGENCIA DE COTIZACIÓN:", white_label_style), Paragraph(terms_data.get('validez', ''), self.styles['CellText'])],
            [Paragraph(f"<b>Nota:</b> {terms_data.get('nota', '')}", ParagraphStyle('NoteWhite', fontSize=8, fontName='Helvetica', textColor=colors.white)), ""]
        ]
        
        ft = Table(footer_data, colWidths=[5*cm, 14*cm])
        ft.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), self.dark_blue), # Header Title Background
            ('SPAN', (0,0), (1,0)), # Merge title row
            ('GRID', (0,0), (-1,-2), 0.5, colors.black), # Grid for all except last row
            ('BACKGROUND', (0,5), (-1,5), self.dark_blue), # Bottom blue bar for Nota? Or just inside
            # Actually image shows Nota inside a blue bar at bottom? No, seems white.
            # Let's check image: "Nota: ...." is white background, but footer header is blue.
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        
        # Fix: The image shows first column is strictly titles (dark blue maybe? No, checking image again)
        # Image:
        # Row 1: "TERMINOS Y CONDICIONES" (Blue bg, spans all)
        # Row 2: "PRECIO:" (Blue bg?) | "Bs 250..." (White)
        # Actually looks like Column 1 has Blue Background in Footer? 
        # "PRECIO:", "FORMA DE PAGO:" ... seem to be white text on blue background?
        # Let's look closer... No, "PRECIO:" is white text on blue background. 
        # OK, applied blue background to first column
        
        ft.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), self.dark_blue), # Header row
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            
            ('BACKGROUND', (0,1), (0,-2), self.dark_blue), # First col (labels) blue
            ('TEXTCOLOR', (0,1), (0,-2), colors.white),
            
            ('BACKGROUND', (1,1), (1,-2), colors.white), # Values white
            ('TEXTCOLOR', (1,1), (1,-2), colors.black),
            ('GRID', (0,0), (-1,-2), 0.5, colors.black),
            
            # Nota row (last)
            ('BACKGROUND', (0,-1), (-1,-1), self.dark_blue),
            ('TEXTCOLOR', (0,-1), (-1,-1), colors.white),
            ('SPAN', (0,-1), (-1,-1))
        ]))
        
        story.append(ft)
        
        doc.build(story)
        return self.filename

# Test logic...
