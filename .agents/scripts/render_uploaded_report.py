from pathlib import Path
import fitz

pdf_path = Path('attached_assets/informe-consolidado-sst-pesv-demo-prueba-2026-corregido.pdf')
out_dir = Path('.agents/outputs/informe-consolidado-sst-pesv-demo-2026-corregido')
out_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf_path)
print(f'pages={doc.page_count}')
print(f'metadata={doc.metadata}')
for index, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out_path = out_dir / f'page-{index+1}.png'
    pix.save(out_path)
    text = page.get_text('text')
    (out_dir / f'page-{index+1}.txt').write_text(text, encoding='utf-8')
    blocks = page.get_text('dict')['blocks']
    text_blocks = [b for b in blocks if b.get('type') == 0]
    image_blocks = [b for b in blocks if b.get('type') == 1]
    print(f'page={index+1} chars={len(text)} text_blocks={len(text_blocks)} image_blocks={len(image_blocks)} png={out_path}')
    print('  first_lines=', ' | '.join(line.strip() for line in text.splitlines()[:5] if line.strip()))
