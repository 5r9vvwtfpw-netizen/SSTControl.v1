from pathlib import Path

import pymupdf


source = Path("attached_assets/Propuesta_comercial_temporada_SG-SST_PESV_1792748797072.pdf")
output_dir = Path(".agents/outputs")
output_dir.mkdir(parents=True, exist_ok=True)

document = pymupdf.open(source)
print(f"pages={document.page_count}")
for page_number, page in enumerate(document, start=1):
    image_path = output_dir / f"propuesta-temporada-page-{page_number}.png"
    page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False).save(image_path)
    print(f"rendered={image_path}")
