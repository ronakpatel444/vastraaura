# 📦 Incoming Catalogs Folder

Put your phone gallery catalog folders here!

### Example structure for 17 catalogs:
```
incoming-catalogs/
├── Design-101/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── details.txt (Optional: Price, Fabric, etc.)
├── Design-102/
│   ├── 1.jpg
│   └── 2.jpg
...
└── Design-117/
    ├── 1.jpg
    └── 2.jpg
```

### To list all 17 catalogs in 30 seconds with complete SEO:
Run in terminal:
```bash
npm run import-catalogs
```

The automation will:
1. Scan all 17 folders.
2. Auto-detect category (`3 Piece Suit`, `Short Kurtis`, `Kurta Sets`, `Chaniya Choli`, `Lehenga`, `Saree`).
3. Auto-generate SEO Google Ranking Title & Keywords.
4. Set price, original MRP, discount badge, size stocks (S, M, L, XL, XXL).
5. Copy images to website and publish live on the website!
