from pathlib import Path
import fitz

pdf_path = Path("attached_assets/SST-Colombia-Propuesta-Comercial_(6)_1790105901814.pdf")
out_dir = Path(".agents/outputs/reference-proposal")
out_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(pdf_path)
print(f"pages={document.page_count}")
print(f"metadata={document.metadata}")
for page_number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    output_path = out_dir / f"page-{page_number}.png"
    pixmap.save(output_path)
    text = page.get_text("text").replace("\n", " | ")
    print(f"page={page_number} size={page.rect.width}x{page.rect.height} png={output_path}")
    print(text[:1200])