from pathlib import Path
import fitz

pdf_path = Path("documents/manual-prueba-auditorias-internas-sst.pdf")
output_dir = Path(".agents/outputs/auditoria-manual")
output_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf_path)
text_parts = []
for index, page in enumerate(doc):
    text_parts.append(f"\n--- PAGE {index + 1} ---\n")
    text_parts.append(page.get_text())
    if index < 3:
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pix.save(output_dir / f"page-{index + 1}.png")

(output_dir / "manual.txt").write_text("".join(text_parts), encoding="utf-8")
print(f"pages={len(doc)}")
print(f"text={output_dir / 'manual.txt'}")
print(f"renders={output_dir}")