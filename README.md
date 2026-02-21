# Concrete Strength Properties Web App (v6)

## Updates requested

1. **GPa values** are rounded to **0 decimals** (nearest).
2. **βcc(t)** values are displayed with **3 decimal places**.
3. **Strain values (‰)** are displayed with **2 decimal places**.
4. Approximations on fctm values are removed.

Other retained behaviours:
- Stress–strain plot x-axis strain values rounded to **2 decimals**.
- Summary excludes the Inputs subsection.
- Compressive MPa values: rounded **up to 0 decimals**.
- Tensile MPa values: rounded **up to 1 decimal**.

Optional local server:

```bash
python -m http.server 8000
```
