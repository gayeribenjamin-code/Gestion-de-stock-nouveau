import ExcelJS from "exceljs"

/**
 * Génère un classeur Excel professionnel de gestion de boutique télécom.
 * Toutes les feuilles sont reliées par des formules vivantes.
 * Aucune macro VBA — uniquement des fonctions modernes d'Excel 365.
 */

// Nombre de lignes de formules pré-remplies (support de plusieurs milliers via extension)
const N = 300
const FIRST = 2
const LAST = N + 1 // 301

// Palette (thème sombre bleu nuit / accent cyan)
const COLORS = {
  primary: "FF0F172A", // bleu nuit (en-têtes)
  primaryLight: "FF1E293B",
  accent: "FF06B6D4", // cyan
  headerText: "FFFFFFFF",
  band: "FFF1F5F9", // gris très clair
  green: "FF16A34A",
  greenBg: "FFDCFCE7",
  amber: "FFCA8A04",
  amberBg: "FFFEF9C3",
  red: "FFDC2626",
  redBg: "FFFEE2E2",
  card: "FF0EA5B7",
  border: "FFCBD5E1",
}

type Col = {
  header: string
  key: string
  width: number
  numFmt?: string
}

function styleHeaderRow(ws: ExcelJS.Worksheet, rowNumber: number, count: number) {
  const row = ws.getRow(rowNumber)
  for (let c = 1; c <= count; c++) {
    const cell = row.getCell(c)
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } }
    cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11, name: "Calibri" }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      bottom: { style: "medium", color: { argb: COLORS.accent } },
    }
  }
  row.height = 34
}

function applyGridBorders(ws: ExcelJS.Worksheet, firstRow: number, lastRow: number, cols: number) {
  for (let r = firstRow; r <= lastRow; r++) {
    for (let c = 1; c <= cols; c++) {
      const cell = ws.getRow(r).getCell(c)
      cell.border = {
        top: { style: "hair", color: { argb: COLORS.border } },
        left: { style: "hair", color: { argb: COLORS.border } },
        bottom: { style: "hair", color: { argb: COLORS.border } },
        right: { style: "hair", color: { argb: COLORS.border } },
      }
      if ((r - firstRow) % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.band } }
      }
    }
  }
}

export async function buildWorkbookBuffer(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "v0 — Gestion Boutique Télécom"
  wb.created = new Date()
  wb.properties.date1904 = false

  /* =========================================================
   * FEUILLE 6 : PARAMÈTRES  (créée en 1er pour les listes)
   * ========================================================= */
  const params = wb.addWorksheet("Paramètres", {
    properties: { tabColor: { argb: COLORS.accent } },
    views: [{ showGridLines: false }],
  })

  const paramCols = [
    "Catégories",
    "Marques",
    "Fournisseurs",
    "Modes de paiement",
    "Vendeurs",
    "Devise",
    "Emplacements",
    "Garantie",
    "État du produit",
  ]
  params.getRow(1).values = paramCols
  styleHeaderRow(params, 1, paramCols.length + 1)
  params.getColumn(11).width = 4

  const categories = [
    "Smartphones",
    "Téléphones classiques",
    "Power Banks",
    "Écouteurs Bluetooth",
    "Casques audio",
    "Chargeurs",
    "Câbles USB",
    "Coques de protection",
    "Verres trempés",
    "Montres connectées",
    "Haut-parleurs Bluetooth",
    "Clés USB",
    "Cartes mémoire",
    "Routeurs Wi-Fi",
    "Accessoires téléphoniques",
  ]
  const marques = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "Tecno",
    "Infinix",
    "Itel",
    "Oraimo",
    "Anker",
    "JBL",
    "Sony",
    "Huawei",
    "Nokia",
    "Realme",
    "Oppo",
    "Générique",
  ]
  const fournisseurs = ["TechImport SARL", "Global Phone Distrib", "Oraimo Officiel", "Accessoires Plus"]
  const modes = ["Espèces", "Mobile Money", "Carte bancaire", "Virement", "À crédit"]
  const vendeurs = ["Amadou Diallo", "Fatou Ndiaye", "Ibrahim Koné", "Awa Traoré"]
  const devises = ["FCFA", "EUR", "USD", "MAD", "DZD"]
  const emplacements = ["Vitrine", "Comptoir", "Réserve", "Entrepôt", "Rayon A", "Rayon B"]
  const garanties = ["Oui", "Non"]
  const etats = ["Neuf", "Occasion", "Reconditionné"]

  const fillCol = (colIndex: number, arr: string[]) => {
    arr.forEach((v, i) => {
      const cell = params.getRow(2 + i).getCell(colIndex)
      cell.value = v
    })
  }
  fillCol(1, categories)
  fillCol(2, marques)
  fillCol(3, fournisseurs)
  fillCol(4, modes)
  fillCol(5, vendeurs)
  fillCol(6, devises)
  fillCol(7, emplacements)
  fillCol(8, garanties)
  fillCol(9, etats)

  // Seuil global (info) + colonnes largeur
  params.getColumn(1).width = 24
  params.getColumn(2).width = 16
  params.getColumn(3).width = 22
  params.getColumn(4).width = 18
  params.getColumn(5).width = 18
  params.getColumn(6).width = 10
  params.getColumn(7).width = 14
  params.getColumn(8).width = 12
  params.getColumn(9).width = 16
  applyGridBorders(params, 2, 61, paramCols.length)

  // Bloc réglages à droite
  params.getCell("K1").value = ""
  params.mergeCells("K3:L3")
  params.getCell("K3").value = "RÉGLAGES GÉNÉRAUX"
  params.getCell("K3").font = { bold: true, color: { argb: COLORS.headerText } }
  params.getCell("K3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } }
  params.getCell("K3").alignment = { horizontal: "center", vertical: "middle" }
  params.getRow(3).height = 24
  params.getCell("K4").value = "Devise principale"
  params.getCell("L4").value = "FCFA"
  params.getCell("K5").value = "Seuil de stock faible (défaut)"
  params.getCell("L5").value = 5
  params.getColumn(12).width = 14
  ;["K4", "K5"].forEach((a) => (params.getCell(a).font = { bold: true }))
  ;["L4", "L5"].forEach((a) => {
    params.getCell(a).alignment = { horizontal: "center" }
    params.getCell(a).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.band } }
  })

  // Plages nommées -> alimentent les menus déroulants
  wb.definedNames.add("Paramètres!$A$2:$A$61", "Categories")
  wb.definedNames.add("Paramètres!$B$2:$B$61", "Marques")
  wb.definedNames.add("Paramètres!$C$2:$C$61", "Fournisseurs")
  wb.definedNames.add("Paramètres!$D$2:$D$61", "ModesPaiement")
  wb.definedNames.add("Paramètres!$E$2:$E$61", "Vendeurs")
  wb.definedNames.add("Paramètres!$F$2:$F$61", "Devises")
  wb.definedNames.add("Paramètres!$G$2:$G$61", "Emplacements")
  wb.definedNames.add("Paramètres!$H$2:$H$3", "GarantieList")
  wb.definedNames.add("Paramètres!$I$2:$I$4", "EtatList")
  wb.definedNames.add("Paramètres!$L$5", "SeuilFaible")

  /* =========================================================
   * FEUILLE 1 : STOCK PRODUITS
   * ========================================================= */
  const stock = wb.addWorksheet("Stock Produits", {
    properties: { tabColor: { argb: COLORS.primary } },
    views: [{ state: "frozen", xSplit: 3, ySplit: 1, showGridLines: false }],
  })

  const stockCols: Col[] = [
    { header: "ID Produit", key: "id", width: 12 },
    { header: "Date d'ajout", key: "date", width: 13, numFmt: "dd/mm/yyyy" },
    { header: "Nom du produit", key: "nom", width: 30 },
    { header: "Marque", key: "marque", width: 14 },
    { header: "Modèle", key: "modele", width: 16 },
    { header: "Catégorie", key: "cat", width: 20 },
    { header: "Couleur", key: "couleur", width: 12 },
    { header: "Capacité", key: "capacite", width: 12 },
    { header: "IMEI", key: "imei", width: 18 },
    { header: "N° de série", key: "serie", width: 16 },
    { header: "Fournisseur", key: "fournisseur", width: 20 },
    { header: "Tél. fournisseur", key: "telf", width: 16 },
    { header: "Prix d'achat", key: "achat", width: 13, numFmt: "#,##0" },
    { header: "Transport", key: "transport", width: 11, numFmt: "#,##0" },
    { header: "Douane", key: "douane", width: 11, numFmt: "#,##0" },
    { header: "Autres frais", key: "autres", width: 12, numFmt: "#,##0" },
    { header: "Coût réel total", key: "cout", width: 14, numFmt: "#,##0" },
    { header: "Prix vente conseillé", key: "conseille", width: 15, numFmt: "#,##0" },
    { header: "Prix vente réel", key: "reel", width: 14, numFmt: "#,##0" },
    { header: "Bénéfice unitaire", key: "benef", width: 14, numFmt: "#,##0" },
    { header: "Marge (%)", key: "marge", width: 11, numFmt: '0.0"%"' },
    { header: "Qté achetée", key: "qacheté", width: 11, numFmt: "#,##0" },
    { header: "Qté vendue", key: "qvendu", width: 11, numFmt: "#,##0" },
    { header: "Stock dispo.", key: "dispo", width: 12, numFmt: "#,##0" },
    { header: "Seuil min.", key: "seuil", width: 10, numFmt: "#,##0" },
    { header: "Valeur du stock", key: "valeur", width: 15, numFmt: "#,##0" },
    { header: "Emplacement", key: "empl", width: 14 },
    { header: "Garantie", key: "gar", width: 10 },
    { header: "Durée garantie", key: "duree", width: 14 },
    { header: "État", key: "etat", width: 14 },
    { header: "Observations", key: "obs", width: 24 },
    { header: "Statut du stock", key: "statut", width: 20 },
    // Colonnes techniques (utilisées par les statistiques)
    { header: "CA réalisé", key: "caReal", width: 13, numFmt: "#,##0" },
    { header: "Bénéfice réalisé", key: "benefReal", width: 14, numFmt: "#,##0" },
    { header: "À réappro.", key: "reappro", width: 11 },
  ]
  stock.getRow(1).values = stockCols.map((c) => c.header)
  stockCols.forEach((c, i) => {
    stock.getColumn(i + 1).width = c.width
    if (c.numFmt) stock.getColumn(i + 1).numFmt = c.numFmt
  })
  styleHeaderRow(stock, 1, stockCols.length)

  // Formules pour toutes les lignes
  for (let r = FIRST; r <= LAST; r++) {
    stock.getCell(`A${r}`).value = { formula: `IF($C${r}="","","PRD-"&TEXT(ROW()-1,"0000"))` }
    stock.getCell(`Q${r}`).value = { formula: `IF($C${r}="","",M${r}+N${r}+O${r}+P${r})` }
    stock.getCell(`T${r}`).value = { formula: `IF($C${r}="","",S${r}-Q${r})` }
    stock.getCell(`U${r}`).value = { formula: `IF(OR($C${r}="",S${r}=0),"",T${r}/S${r}*100)` }
    stock.getCell(`W${r}`).value = {
      formula: `IF($C${r}="","",SUMIF(Ventes!$C$${FIRST}:$C$${LAST},$C${r},Ventes!$D$${FIRST}:$D$${LAST}))`,
    }
    stock.getCell(`X${r}`).value = { formula: `IF($C${r}="","",V${r}-W${r})` }
    stock.getCell(`Z${r}`).value = { formula: `IF($C${r}="","",X${r}*Q${r})` }
    stock.getCell(`AF${r}`).value = {
      formula: `IF($C${r}="","",IF(X${r}<=0,"🔴 Rupture de stock",IF(X${r}<=Y${r},"🟡 Stock faible","🟢 Stock suffisant")))`,
    }
    // techniques
    stock.getCell(`AG${r}`).value = { formula: `IF($C${r}="","",W${r}*S${r})` }
    stock.getCell(`AH${r}`).value = { formula: `IF($C${r}="","",W${r}*T${r})` }
    stock.getCell(`AI${r}`).value = {
      formula: `IF($C${r}="","",IF(X${r}<=Y${r},"Oui","Non"))`,
    }
  }

  applyGridBorders(stock, FIRST, LAST, stockCols.length)

  // Validations de données (menus déroulants)
  for (let r = FIRST; r <= LAST; r++) {
    stock.getCell(`D${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=Marques"] }
    stock.getCell(`F${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=Categories"] }
    stock.getCell(`K${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=Fournisseurs"] }
    stock.getCell(`AA${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=Emplacements"] }
    stock.getCell(`AB${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=GarantieList"] }
    stock.getCell(`AD${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=EtatList"] }
    stock.getCell(`Y${r}`).value = stock.getCell(`Y${r}`).value // placeholder
  }

  // Mise en forme conditionnelle du statut
  stock.addConditionalFormatting({
    ref: `AF${FIRST}:AF${LAST}`,
    rules: [
      {
        type: "containsText",
        operator: "containsText",
        text: "Rupture",
        priority: 1,
        style: {
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: COLORS.redBg } },
          font: { color: { argb: COLORS.red }, bold: true },
        },
      },
      {
        type: "containsText",
        operator: "containsText",
        text: "faible",
        priority: 2,
        style: {
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: COLORS.amberBg } },
          font: { color: { argb: COLORS.amber }, bold: true },
        },
      },
      {
        type: "containsText",
        operator: "containsText",
        text: "suffisant",
        priority: 3,
        style: {
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: COLORS.greenBg } },
          font: { color: { argb: COLORS.green }, bold: true },
        },
      },
    ],
  })
  // Marge : barre de données
  stock.addConditionalFormatting({
    ref: `U${FIRST}:U${LAST}`,
    rules: [{ type: "dataBar", cfvo: [{ type: "num", value: 0 }, { type: "num", value: 60 }], color: { argb: COLORS.accent }, priority: 4 } as any],
  })

  stock.autoFilter = `A1:AF1`

  /* =========================================================
   * FEUILLE 2 : VENTES
   * ========================================================= */
  const ventes = wb.addWorksheet("Ventes", {
    properties: { tabColor: { argb: COLORS.accent } },
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
  })
  const venteCols: Col[] = [
    { header: "N° de facture", key: "facture", width: 14 },
    { header: "Date", key: "date", width: 13, numFmt: "dd/mm/yyyy" },
    { header: "Produit", key: "produit", width: 32 },
    { header: "Qté vendue", key: "qte", width: 11, numFmt: "#,##0" },
    { header: "Prix unitaire", key: "pu", width: 13, numFmt: "#,##0" },
    { header: "Montant total", key: "montant", width: 14, numFmt: "#,##0" },
    { header: "Nom du client", key: "client", width: 20 },
    { header: "Tél. client", key: "telc", width: 15 },
    { header: "Mode de paiement", key: "mode", width: 16 },
    { header: "Vendeur", key: "vendeur", width: 18 },
    { header: "Remise", key: "remise", width: 11, numFmt: "#,##0" },
    { header: "Bénéfice réalisé", key: "benef", width: 15, numFmt: "#,##0" },
  ]
  ventes.getRow(1).values = venteCols.map((c) => c.header)
  venteCols.forEach((c, i) => {
    ventes.getColumn(i + 1).width = c.width
    if (c.numFmt) ventes.getColumn(i + 1).numFmt = c.numFmt
  })
  styleHeaderRow(ventes, 1, venteCols.length)

  for (let r = FIRST; r <= LAST; r++) {
    ventes.getCell(`A${r}`).value = { formula: `IF($C${r}="","","FCT-"&TEXT(ROW()-1,"0000"))` }
    ventes.getCell(`F${r}`).value = { formula: `IF($C${r}="","",D${r}*E${r}-N(K${r}))` }
    ventes.getCell(`L${r}`).value = {
      formula: `IF($C${r}="","",F${r}-D${r}*IFERROR(VLOOKUP($C${r},'Stock Produits'!$C$${FIRST}:$Q$${LAST},15,FALSE),0))`,
    }
    ventes.getCell(`C${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`='Stock Produits'!$C$${FIRST}:$C$${LAST}`],
    }
    ventes.getCell(`I${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=ModesPaiement"] }
    ventes.getCell(`J${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["=Vendeurs"] }
  }
  applyGridBorders(ventes, FIRST, LAST, venteCols.length)
  ventes.autoFilter = "A1:L1"

  /* =========================================================
   * FEUILLE 3 : FOURNISSEURS
   * ========================================================= */
  const four = wb.addWorksheet("Fournisseurs", {
    properties: { tabColor: { argb: COLORS.primaryLight } },
    views: [{ showGridLines: false }],
  })
  const fourCols: Col[] = [
    { header: "Nom", key: "nom", width: 24 },
    { header: "Téléphone", key: "tel", width: 16 },
    { header: "Adresse", key: "adr", width: 28 },
    { header: "Ville", key: "ville", width: 16 },
    { header: "Pays", key: "pays", width: 14 },
    { header: "Email", key: "email", width: 26 },
    { header: "Produits fournis", key: "prod", width: 30 },
    { header: "Observations", key: "obs", width: 26 },
  ]
  four.getRow(1).values = fourCols.map((c) => c.header)
  fourCols.forEach((c, i) => (four.getColumn(i + 1).width = c.width))
  styleHeaderRow(four, 1, fourCols.length)

  const fourData = [
    ["TechImport SARL", "+221 77 123 45 67", "Zone Industrielle, Km 5", "Dakar", "Sénégal", "contact@techimport.sn", "Smartphones, Téléphones classiques", "Livraison rapide"],
    ["Global Phone Distrib", "+225 07 88 99 00", "Boulevard Latrille", "Abidjan", "Côte d'Ivoire", "sales@globalphone.ci", "Smartphones, Montres connectées", "Bons prix en gros"],
    ["Oraimo Officiel", "+234 80 555 12 34", "Ikeja City Mall", "Lagos", "Nigéria", "b2b@oraimo.com", "Power Banks, Écouteurs, Chargeurs", "Garantie 1 an"],
    ["Accessoires Plus", "+212 6 61 22 33 44", "Derb Omar", "Casablanca", "Maroc", "info@accessoiresplus.ma", "Coques, Câbles, Verres trempés", "Grande variété"],
  ]
  fourData.forEach((row, i) => four.getRow(2 + i).values = row)
  applyGridBorders(four, 2, 41, fourCols.length)

  /* =========================================================
   * FEUILLE 5 : STATISTIQUES  (avant Dashboard car il en dépend)
   * ========================================================= */
  const stats = wb.addWorksheet("Statistiques", {
    properties: { tabColor: { argb: COLORS.card } },
    views: [{ showGridLines: false }],
  })

  const sTitle = (cell: string, text: string, span = 7) => {
    const startCol = cell.replace(/\d+/, "")
    const rowNum = Number.parseInt(cell.replace(/\D+/g, ""), 10)
    const endColIndex = stats.getColumn(startCol).number + span - 1
    const endCol = stats.getColumn(endColIndex).letter
    stats.mergeCells(`${startCol}${rowNum}:${endCol}${rowNum}`)
    const c = stats.getCell(cell)
    c.value = text
    c.font = { bold: true, color: { argb: COLORS.headerText }, size: 12 }
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } }
    c.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    stats.getRow(rowNum).height = 26
  }

  // --- Synthèse par catégorie ---
  sTitle("A1", "📊 SYNTHÈSE PAR CATÉGORIE", 6)
  const catHeaders = ["Catégorie", "Nb produits", "Qté vendue", "CA estimé", "Bénéfice", "Valeur stock", "Marge %"]
  stats.getRow(2).values = catHeaders
  styleHeaderRow(stats, 2, catHeaders.length)
  categories.forEach((cat, i) => {
    const r = 3 + i
    stats.getCell(`A${r}`).value = { formula: `Paramètres!A${2 + i}` }
    stats.getCell(`B${r}`).value = { formula: `COUNTIF('Stock Produits'!$F$${FIRST}:$F$${LAST},$A${r})` }
    stats.getCell(`C${r}`).value = { formula: `SUMIF('Stock Produits'!$F$${FIRST}:$F$${LAST},$A${r},'Stock Produits'!$W$${FIRST}:$W$${LAST})` }
    stats.getCell(`D${r}`).value = { formula: `SUMIF('Stock Produits'!$F$${FIRST}:$F$${LAST},$A${r},'Stock Produits'!$AG$${FIRST}:$AG$${LAST})` }
    stats.getCell(`E${r}`).value = { formula: `SUMIF('Stock Produits'!$F$${FIRST}:$F$${LAST},$A${r},'Stock Produits'!$AH$${FIRST}:$AH$${LAST})` }
    stats.getCell(`F${r}`).value = { formula: `SUMIF('Stock Produits'!$F$${FIRST}:$F$${LAST},$A${r},'Stock Produits'!$Z$${FIRST}:$Z$${LAST})` }
    stats.getCell(`G${r}`).value = { formula: `IF(D${r}=0,0,E${r}/D${r}*100)` }
  })
  const catLast = 2 + categories.length
  applyGridBorders(stats, 3, catLast, catHeaders.length)
  ;["D", "E", "F"].forEach((col) => (stats.getColumn(col).numFmt = "#,##0"))
  stats.getColumn("C").numFmt = "#,##0"
  stats.getColumn("B").numFmt = "#,##0"
  stats.getColumn("G").numFmt = '0.0"%"'
  stats.getColumn("A").width = 24
  ;["B", "C", "D", "E", "F", "G"].forEach((c) => (stats.getColumn(c).width = 13))

  // --- Synthèse par marque ---
  const brandStart = catLast + 3
  sTitle(`A${brandStart}`, "🏷️ SYNTHÈSE PAR MARQUE", 5)
  const brandHeaders = ["Marque", "Nb produits", "Qté vendue", "Bénéfice total", "Bénéfice moyen"]
  stats.getRow(brandStart + 1).values = brandHeaders
  styleHeaderRow(stats, brandStart + 1, brandHeaders.length)
  marques.forEach((m, i) => {
    const r = brandStart + 2 + i
    stats.getCell(`A${r}`).value = { formula: `Paramètres!B${2 + i}` }
    stats.getCell(`B${r}`).value = { formula: `COUNTIF('Stock Produits'!$D$${FIRST}:$D$${LAST},$A${r})` }
    stats.getCell(`C${r}`).value = { formula: `SUMIF('Stock Produits'!$D$${FIRST}:$D$${LAST},$A${r},'Stock Produits'!$W$${FIRST}:$W$${LAST})` }
    stats.getCell(`D${r}`).value = { formula: `SUMIF('Stock Produits'!$D$${FIRST}:$D$${LAST},$A${r},'Stock Produits'!$AH$${FIRST}:$AH$${LAST})` }
    stats.getCell(`E${r}`).value = { formula: `IF(B${r}=0,0,D${r}/B${r})` }
  })
  const brandLast = brandStart + 1 + marques.length
  applyGridBorders(stats, brandStart + 2, brandLast, brandHeaders.length)

  // --- Produits à réapprovisionner ---
  const reapStart = brandLast + 3
  sTitle(`A${reapStart}`, "⚠️ PRODUITS À RÉAPPROVISIONNER (filtrez la colonne « À réappro. » sur « Oui » dans Stock)", 6)
  stats.getCell(`A${reapStart + 1}`).value = { formula: `"Nombre de produits à réapprovisionner : "&COUNTIF('Stock Produits'!$AI$${FIRST}:$AI$${LAST},"Oui")` }
  stats.getCell(`A${reapStart + 1}`).font = { bold: true, color: { argb: COLORS.amber } }

  // --- Prix extrêmes ---
  const priceStart = reapStart + 3
  sTitle(`A${priceStart}`, "💰 PRIX EXTRÊMES", 3)
  stats.getCell(`A${priceStart + 1}`).value = "Produit le plus cher (vente)"
  stats.getCell(`B${priceStart + 1}`).value = {
    formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(MAX('Stock Produits'!$S$${FIRST}:$S$${LAST}),'Stock Produits'!$S$${FIRST}:$S$${LAST},0)),"—")`,
  }
  stats.getCell(`C${priceStart + 1}`).value = { formula: `MAX('Stock Produits'!$S$${FIRST}:$S$${LAST})` }
  stats.getCell(`A${priceStart + 2}`).value = "Produit le moins cher (vente)"
  stats.getCell(`B${priceStart + 2}`).value = {
    formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(MINIFS('Stock Produits'!$S$${FIRST}:$S$${LAST},'Stock Produits'!$S$${FIRST}:$S$${LAST},">0"),'Stock Produits'!$S$${FIRST}:$S$${LAST},0)),"—")`,
  }
  stats.getCell(`C${priceStart + 2}`).value = { formula: `MINIFS('Stock Produits'!$S$${FIRST}:$S$${LAST},'Stock Produits'!$S$${FIRST}:$S$${LAST},">0")` }
  ;[priceStart + 1, priceStart + 2].forEach((r) => {
    stats.getCell(`A${r}`).font = { bold: true }
    stats.getCell(`C${r}`).numFmt = "#,##0"
  })

  // --- Top 10 vendus & rentables ---
  const topStart = priceStart + 4
  sTitle(`A${topStart}`, "🏆 TOP 10 PRODUITS LES PLUS VENDUS", 2)
  sTitle(`D${topStart}`, "💎 TOP 10 PRODUITS LES PLUS RENTABLES", 2)
  stats.getRow(topStart + 1).getCell(1).value = "Produit"
  stats.getRow(topStart + 1).getCell(2).value = "Qté vendue"
  stats.getRow(topStart + 1).getCell(4).value = "Produit"
  stats.getRow(topStart + 1).getCell(5).value = "Bénéfice"
  ;[1, 2, 4, 5].forEach((c) => {
    const cell = stats.getRow(topStart + 1).getCell(c)
    cell.font = { bold: true, color: { argb: COLORS.headerText } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primaryLight } }
    cell.alignment = { horizontal: "center" }
  })
  for (let k = 1; k <= 10; k++) {
    const r = topStart + 1 + k
    // vendus (avec départage par ROW pour éviter les doublons)
    stats.getCell(`B${r}`).value = { formula: `LARGE('Stock Produits'!$W$${FIRST}:$W$${LAST},${k})` }
    stats.getCell(`A${r}`).value = {
      formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(1,INDEX(('Stock Produits'!$W$${FIRST}:$W$${LAST}=B${r})*(COUNTIF($A$${topStart + 2}:$A${r - 1},'Stock Produits'!$C$${FIRST}:$C$${LAST})=0),0),0)),"—")`,
    }
    // rentables
    stats.getCell(`E${r}`).value = { formula: `LARGE('Stock Produits'!$AH$${FIRST}:$AH$${LAST},${k})` }
    stats.getCell(`D${r}`).value = {
      formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(1,INDEX(('Stock Produits'!$AH$${FIRST}:$AH$${LAST}=E${r})*(COUNTIF($D$${topStart + 2}:$D${r - 1},'Stock Produits'!$C$${FIRST}:$C$${LAST})=0),0),0)),"—")`,
    }
    stats.getCell(`B${r}`).numFmt = "#,##0"
    stats.getCell(`E${r}`).numFmt = "#,##0"
  }
  applyGridBorders(stats, topStart + 2, topStart + 11, 2)
  for (let r = topStart + 2; r <= topStart + 11; r++) {
    stats.getCell(`D${r}`).border = stats.getCell(`A${r}`).border
    stats.getCell(`E${r}`).border = stats.getCell(`B${r}`).border
  }
  stats.getColumn("D").width = 24

  /* =========================================================
   * FEUILLE 4 : TABLEAU DE BORD
   * ========================================================= */
  const dash = wb.addWorksheet("Tableau de Bord", {
    properties: { tabColor: { argb: COLORS.accent } },
    views: [{ showGridLines: false }],
  })
  dash.getColumn("A").width = 3
  ;["B", "C", "D", "E", "F", "G"].forEach((c) => (dash.getColumn(c).width = 22))

  dash.mergeCells("B2:G2")
  const title = dash.getCell("B2")
  title.value = "📱  TABLEAU DE BORD — GESTION BOUTIQUE TÉLÉCOM"
  title.font = { bold: true, size: 20, color: { argb: COLORS.headerText } }
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } }
  title.alignment = { horizontal: "center", vertical: "middle" }
  dash.getRow(2).height = 46

  dash.mergeCells("B3:G3")
  const sub = dash.getCell("B3")
  sub.value = "Mise à jour automatique à chaque ajout de produit ou de vente"
  sub.font = { italic: true, size: 11, color: { argb: COLORS.primaryLight } }
  sub.alignment = { horizontal: "center" }

  // KPI cards
  const kpis: { label: string; formula: string; fmt?: string }[] = [
    { label: "Références produits", formula: `SUMPRODUCT(--('Stock Produits'!$C$${FIRST}:$C$${LAST}<>""))`, fmt: "#,##0" },
    { label: "Total unités achetées", formula: `SUM('Stock Produits'!$V$${FIRST}:$V$${LAST})`, fmt: "#,##0" },
    { label: "Articles vendus", formula: `SUM('Ventes'!$D$${FIRST}:$D$${LAST})`, fmt: "#,##0" },
    { label: "Articles en stock", formula: `SUM('Stock Produits'!$X$${FIRST}:$X$${LAST})`, fmt: "#,##0" },
    { label: "Produits en rupture", formula: `COUNTIF('Stock Produits'!$AF$${FIRST}:$AF$${LAST},"*Rupture*")`, fmt: "#,##0" },
    { label: "Produits stock faible", formula: `COUNTIF('Stock Produits'!$AF$${FIRST}:$AF$${LAST},"*faible*")`, fmt: "#,##0" },
    { label: "Valeur totale du stock", formula: `SUM('Stock Produits'!$Z$${FIRST}:$Z$${LAST})`, fmt: "#,##0" },
    { label: "Chiffre d'affaires", formula: `SUM('Ventes'!$F$${FIRST}:$F$${LAST})`, fmt: "#,##0" },
    { label: "Coût des marchandises", formula: `SUM('Ventes'!$F$${FIRST}:$F$${LAST})-SUM('Ventes'!$L$${FIRST}:$L$${LAST})`, fmt: "#,##0" },
    { label: "Bénéfice total", formula: `SUM('Ventes'!$L$${FIRST}:$L$${LAST})`, fmt: "#,##0" },
    { label: "Marge moyenne", formula: `IF(SUM('Ventes'!$F$${FIRST}:$F$${LAST})=0,0,SUM('Ventes'!$L$${FIRST}:$L$${LAST})/SUM('Ventes'!$F$${FIRST}:$F$${LAST})*100)`, fmt: '0.0"%"' },
    { label: "Nb factures de vente", formula: `SUMPRODUCT(--('Ventes'!$C$${FIRST}:$C$${LAST}<>""))`, fmt: "#,##0" },
  ]

  let idx = 0
  const startRow = 5
  const cols = ["B", "D", "F"]
  for (const kpi of kpis) {
    const colBase = idx % 3
    const rowBase = startRow + Math.floor(idx / 3) * 4
    const c1 = cols[colBase]
    const c2 = dash.getColumn(dash.getColumn(c1).number + 1).letter
    dash.mergeCells(`${c1}${rowBase}:${c2}${rowBase}`)
    dash.mergeCells(`${c1}${rowBase + 1}:${c2}${rowBase + 1}`)
    const labelCell = dash.getCell(`${c1}${rowBase}`)
    labelCell.value = kpi.label
    labelCell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 }
    labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primaryLight } }
    labelCell.alignment = { horizontal: "center", vertical: "middle" }
    const valueCell = dash.getCell(`${c1}${rowBase + 1}`)
    valueCell.value = { formula: kpi.formula }
    valueCell.numFmt = kpi.fmt || "#,##0"
    valueCell.font = { bold: true, size: 18, color: { argb: COLORS.primary } }
    valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } }
    valueCell.alignment = { horizontal: "center", vertical: "middle" }
    valueCell.border = { bottom: { style: "thick", color: { argb: COLORS.accent } } }
    dash.getRow(rowBase).height = 20
    dash.getRow(rowBase + 1).height = 34
    idx++
  }

  // Bloc "Champions"
  const champRow = startRow + Math.ceil(kpis.length / 3) * 4 + 1
  dash.mergeCells(`B${champRow}:G${champRow}`)
  const champTitle = dash.getCell(`B${champRow}`)
  champTitle.value = "🏆 CHAMPIONS"
  champTitle.font = { bold: true, size: 14, color: { argb: COLORS.headerText } }
  champTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } }
  champTitle.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
  dash.getRow(champRow).height = 28

  const champions: { label: string; formula: string }[] = [
    {
      label: "Produit le plus vendu",
      formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(MAX('Stock Produits'!$W$${FIRST}:$W$${LAST}),'Stock Produits'!$W$${FIRST}:$W$${LAST},0)),"—")`,
    },
    {
      label: "Produit le plus rentable",
      formula: `IFERROR(INDEX('Stock Produits'!$C$${FIRST}:$C$${LAST},MATCH(MAX('Stock Produits'!$AH$${FIRST}:$AH$${LAST}),'Stock Produits'!$AH$${FIRST}:$AH$${LAST},0)),"—")`,
    },
    {
      label: "Marque la plus vendue",
      formula: `IFERROR(INDEX(Statistiques!$A$${brandStart + 2}:$A$${brandLast},MATCH(MAX(Statistiques!$C$${brandStart + 2}:$C$${brandLast}),Statistiques!$C$${brandStart + 2}:$C$${brandLast},0)),"—")`,
    },
    {
      label: "Catégorie la plus rentable",
      formula: `IFERROR(INDEX(Statistiques!$A$3:$A$${catLast},MATCH(MAX(Statistiques!$E$3:$E$${catLast}),Statistiques!$E$3:$E$${catLast},0)),"—")`,
    },
  ]
  champions.forEach((ch, i) => {
    const r = champRow + 1 + i
    dash.getCell(`B${r}`).value = ch.label
    dash.getCell(`B${r}`).font = { bold: true, color: { argb: COLORS.primaryLight } }
    dash.mergeCells(`D${r}:G${r}`)
    dash.getCell(`D${r}`).value = { formula: ch.formula }
    dash.getCell(`D${r}`).font = { bold: true, color: { argb: COLORS.card } }
    dash.getCell(`D${r}`).alignment = { horizontal: "left", indent: 1 }
    dash.getCell(`B${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.band } }
    dash.getCell(`D${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.band } }
    dash.getRow(r).height = 22
  })

  // Note graphiques
  const noteRow = champRow + champions.length + 2
  dash.mergeCells(`B${noteRow}:G${noteRow + 1}`)
  const note = dash.getCell(`B${noteRow}`)
  note.value =
    "💡 Astuce graphiques : sélectionnez les tableaux de la feuille « Statistiques » (par catégorie, par marque, Top 10) puis Insertion ▸ Graphiques recommandés pour créer instantanément vos histogrammes et camemberts. Les données se mettent à jour automatiquement."
  note.alignment = { wrapText: true, vertical: "middle" }
  note.font = { italic: true, size: 10, color: { argb: COLORS.primaryLight } }
  note.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.amberBg } }

  /* =========================================================
   * DONNÉES D'EXEMPLE
   * ========================================================= */
  type SP = (string | number)[]
  // Ordre: nom, marque, modele, couleur, capacite, imei, serie, fournisseur, telf,
  //        achat, transport, douane, autres, conseille, reel, qacheté, seuil, empl, gar, duree, etat, obs
  const samples: SP[] = [
    ["Samsung Galaxy A15", "Samsung", "SM-A155", "Cat", "Smartphones" as any, "128 Go", "356789012345671", "SNA15001", "TechImport SARL", "+221 77 123 45 67", 85000, 3000, 5000, 1000, 115000, 110000, 20, 5, "Vitrine", "Oui", "12 mois", "Neuf", "Best-seller"],
    ["Apple iPhone 13", "Apple", "A2482", "Minuit", "Smartphones", "128 Go", "356789012345672", "SNIP13002", "Global Phone Distrib", "+225 07 88 99 00", 320000, 8000, 20000, 2000, 420000, 410000, 8, 3, "Vitrine", "Oui", "12 mois", "Neuf", "Haut de gamme"],
    ["Xiaomi Redmi 13C", "Xiaomi", "Redmi 13C", "Bleu", "Smartphones", "256 Go", "356789012345673", "SNRD13003", "Global Phone Distrib", "+225 07 88 99 00", 78000, 2500, 4500, 1000, 105000, 99000, 25, 5, "Comptoir", "Oui", "12 mois", "Neuf", ""],
    ["Power Bank Oraimo 20000mAh", "Oraimo", "OPB-P204D", "Noir", "Power Banks", "20000 mAh", "", "SNPB004", "Oraimo Officiel", "+234 80 555 12 34", 9000, 500, 800, 200, 16000, 15000, 40, 8, "Rayon A", "Oui", "12 mois", "Neuf", "Charge rapide"],
    ["Écouteurs Bluetooth JBL Tune", "JBL", "Tune 230NC", "Blanc", "Écouteurs Bluetooth", "—", "", "SNEC005", "Oraimo Officiel", "+234 80 555 12 34", 22000, 800, 1500, 200, 34000, 32000, 30, 6, "Rayon A", "Oui", "6 mois", "Neuf", ""],
    ["Chargeur Anker 20W", "Anker", "A2149", "Blanc", "Chargeurs", "20 W", "", "SNCH006", "Accessoires Plus", "+212 6 61 22 33 44", 4500, 300, 500, 100, 9000, 8500, 60, 10, "Rayon B", "Oui", "6 mois", "Neuf", ""],
    ["Câble USB-C Oraimo 1m", "Oraimo", "OCD-C61", "Noir", "Câbles USB", "1 m", "", "SNCB007", "Oraimo Officiel", "+234 80 555 12 34", 1200, 100, 150, 50, 3000, 2500, 100, 20, "Comptoir", "Non", "—", "Neuf", ""],
    ["Coque Silicone Galaxy A15", "Générique", "TPU-A15", "Transparent", "Coques de protection", "—", "", "SNCQ008", "Accessoires Plus", "+212 6 61 22 33 44", 700, 50, 100, 50, 2500, 2000, 80, 15, "Comptoir", "Non", "—", "Neuf", ""],
    ["Verre trempé iPhone 13", "Générique", "GLASS-IP13", "Transparent", "Verres trempés", "—", "", "SNVT009", "Accessoires Plus", "+212 6 61 22 33 44", 400, 50, 80, 20, 2000, 1500, 120, 20, "Comptoir", "Non", "—", "Neuf", ""],
    ["Montre connectée Xiaomi Watch", "Xiaomi", "Redmi Watch 4", "Noir", "Montres connectées", "—", "", "SNMW010", "Global Phone Distrib", "+225 07 88 99 00", 32000, 1200, 2500, 300, 52000, 49000, 15, 4, "Vitrine", "Oui", "12 mois", "Neuf", ""],
    ["Haut-parleur JBL Go 3", "JBL", "Go 3", "Rouge", "Haut-parleurs Bluetooth", "—", "", "SNHP011", "Oraimo Officiel", "+234 80 555 12 34", 18000, 700, 1200, 200, 29000, 27000, 22, 5, "Rayon A", "Oui", "12 mois", "Neuf", ""],
    ["Casque Sony WH-CH520", "Sony", "WH-CH520", "Noir", "Casques audio", "—", "", "SNCS012", "Global Phone Distrib", "+225 07 88 99 00", 28000, 1000, 2000, 300, 45000, 42000, 12, 3, "Rayon A", "Oui", "12 mois", "Neuf", ""],
    ["Routeur Wi-Fi Huawei B535", "Huawei", "B535-232", "Blanc", "Routeurs Wi-Fi", "—", "", "SNRT013", "TechImport SARL", "+221 77 123 45 67", 55000, 2000, 4000, 500, 82000, 78000, 10, 3, "Réserve", "Oui", "12 mois", "Neuf", "4G LTE"],
    ["Clé USB SanDisk 64 Go", "Générique", "Ultra 64", "Noir", "Clés USB", "64 Go", "", "SNCU014", "Accessoires Plus", "+212 6 61 22 33 44", 3500, 200, 400, 100, 7000, 6500, 50, 10, "Comptoir", "Oui", "12 mois", "Neuf", ""],
    ["Carte mémoire microSD 128 Go", "Générique", "microSD 128", "—", "Cartes mémoire", "128 Go", "", "SNCM015", "Accessoires Plus", "+212 6 61 22 33 44", 5500, 200, 500, 100, 11000, 10000, 45, 10, "Comptoir", "Oui", "12 mois", "Neuf", ""],
  ]

  const today = new Date()
  samples.forEach((s, i) => {
    const r = FIRST + i
    const [nom, marque, modele, couleur, cat, cap, imei, serie, fourn, telf, achat, transport, douane, autres, conseille, reel, qach, seuil, empl, gar, duree, etat, obs] = s
    stock.getCell(`B${r}`).value = new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - (samples.length - i)))
    stock.getCell(`C${r}`).value = nom
    stock.getCell(`D${r}`).value = marque
    stock.getCell(`E${r}`).value = modele
    stock.getCell(`G${r}`).value = couleur
    stock.getCell(`F${r}`).value = cat
    stock.getCell(`H${r}`).value = cap
    stock.getCell(`I${r}`).value = imei
    stock.getCell(`J${r}`).value = serie
    stock.getCell(`K${r}`).value = fourn
    stock.getCell(`L${r}`).value = telf
    stock.getCell(`M${r}`).value = achat
    stock.getCell(`N${r}`).value = transport
    stock.getCell(`O${r}`).value = douane
    stock.getCell(`P${r}`).value = autres
    stock.getCell(`R${r}`).value = conseille
    stock.getCell(`S${r}`).value = reel
    stock.getCell(`V${r}`).value = qach
    stock.getCell(`Y${r}`).value = seuil
    stock.getCell(`AA${r}`).value = empl
    stock.getCell(`AB${r}`).value = gar
    stock.getCell(`AC${r}`).value = duree
    stock.getCell(`AD${r}`).value = etat
    stock.getCell(`AE${r}`).value = obs
  })

  // Ventes d'exemple : produit, qté, PU, client, telc, mode, vendeur, remise, daysAgo
  const salesSamples: [string, number, number, string, string, string, string, number, number][] = [
    ["Samsung Galaxy A15", 3, 110000, "Moussa Sow", "+221 70 111 22 33", "Mobile Money", "Amadou Diallo", 0, 12],
    ["Apple iPhone 13", 1, 410000, "Aïcha Ba", "+225 05 44 55 66", "Carte bancaire", "Fatou Ndiaye", 10000, 10],
    ["Power Bank Oraimo 20000mAh", 6, 15000, "Jean Kouassi", "+225 07 22 33 44", "Espèces", "Ibrahim Koné", 0, 9],
    ["Écouteurs Bluetooth JBL Tune", 4, 32000, "Nadia El Fassi", "+212 6 77 88 99", "Mobile Money", "Awa Traoré", 2000, 8],
    ["Chargeur Anker 20W", 10, 8500, "Ousmane Diop", "+221 77 555 66 77", "Espèces", "Amadou Diallo", 0, 7],
    ["Câble USB-C Oraimo 1m", 15, 2500, "Client comptoir", "", "Espèces", "Fatou Ndiaye", 0, 6],
    ["Verre trempé iPhone 13", 20, 1500, "Client comptoir", "", "Espèces", "Ibrahim Koné", 0, 5],
    ["Xiaomi Redmi 13C", 5, 99000, "Bintou Camara", "+223 76 12 34 56", "Mobile Money", "Awa Traoré", 5000, 4],
    ["Montre connectée Xiaomi Watch", 2, 49000, "Fatoumata Sidibé", "+223 66 98 76 54", "Carte bancaire", "Amadou Diallo", 0, 3],
    ["Haut-parleur JBL Go 3", 3, 27000, "Kevin Mensah", "+233 24 111 22 33", "Espèces", "Fatou Ndiaye", 1000, 2],
    ["Casque Sony WH-CH520", 2, 42000, "Sarah Johnson", "+234 80 222 33 44", "Carte bancaire", "Ibrahim Koné", 0, 1],
    ["Clé USB SanDisk 64 Go", 8, 6500, "Client comptoir", "", "Espèces", "Awa Traoré", 0, 1],
  ]
  salesSamples.forEach((s, i) => {
    const r = FIRST + i
    const [produit, qte, pu, client, telc, mode, vendeur, remise, daysAgo] = s
    const d = new Date(today)
    d.setDate(today.getDate() - daysAgo)
    ventes.getCell(`B${r}`).value = d
    ventes.getCell(`C${r}`).value = produit
    ventes.getCell(`D${r}`).value = qte
    ventes.getCell(`E${r}`).value = pu
    ventes.getCell(`G${r}`).value = client
    ventes.getCell(`H${r}`).value = telc
    ventes.getCell(`I${r}`).value = mode
    ventes.getCell(`J${r}`).value = vendeur
    ventes.getCell(`K${r}`).value = remise
  })

  /* =========================================================
   * PROTECTION DES FORMULES
   * ========================================================= */
  // Déverrouiller les cellules de saisie, verrouiller les colonnes calculées
  const lockedStockCols = ["A", "Q", "T", "U", "W", "X", "Z", "AF", "AG", "AH", "AI"]
  for (let r = FIRST; r <= LAST; r++) {
    for (let c = 1; c <= stockCols.length; c++) {
      const letter = stock.getColumn(c).letter
      stock.getCell(`${letter}${r}`).protection = { locked: lockedStockCols.includes(letter) }
    }
  }
  const lockedVenteCols = ["A", "F", "L"]
  for (let r = FIRST; r <= LAST; r++) {
    for (let c = 1; c <= venteCols.length; c++) {
      const letter = ventes.getColumn(c).letter
      ventes.getCell(`${letter}${r}`).protection = { locked: lockedVenteCols.includes(letter) }
    }
  }
  // Activer la protection (sans mot de passe : autorise tri/filtre)
  const prot = {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    sort: true,
    autoFilter: true,
  } as ExcelJS.WorksheetProtection
  await stock.protect("", prot)
  await ventes.protect("", prot)
  await stats.protect("", { selectLockedCells: true, selectUnlockedCells: true } as ExcelJS.WorksheetProtection)
  await dash.protect("", { selectLockedCells: true, selectUnlockedCells: true } as ExcelJS.WorksheetProtection)

  // Ordre des onglets : Dashboard en premier
  const order = ["Tableau de Bord", "Stock Produits", "Ventes", "Fournisseurs", "Statistiques", "Paramètres"]
  ;[dash, stock, ventes, four, stats, params].forEach((ws) => {
    ;(ws as any).orderNo = order.indexOf(ws.name) + 1
  })

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
