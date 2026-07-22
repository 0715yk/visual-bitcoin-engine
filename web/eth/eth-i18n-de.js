// Visual Ethereum Engine i18n — Deutsch
export const ETH_I18N_DE = {
  "eth.header.title": "Visual Ethereum Engine",
  "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · Lern-Simulator",
  "eth.header.tagline":
    "Eine in Rust geschriebene <b>Ethereum-Engine</b> (Konten · Smart Contracts · PoS), kompiliert nach WebAssembly und live in deinem Browser",
  "eth.meta.title": "Visual Ethereum Engine — Interaktiver Ethereum-Simulator",
  "eth.tabs.overview": "Überblick",
  "eth.tabs.keccak": "1 · Keccak · Adresse",
  "eth.tabs.account": "2 · Konten · Gas",
  "eth.tabs.contracts": "3 · Smart Contracts",
  "eth.tabs.tokens": "4 · Token (ERC-20)",
  "eth.tabs.oracles": "5 · Orakel",
  "eth.tabs.pos": "6 · PoS-Konsens",
  "eth.tabs.realestate": "7 · Immobilienkauf",
  "eth.tabs.evm": "8 · EVM-Runner",

  // ---------- 7 · Immobilien-Escrow ----------
  "eth.re.h1": "Ein Immobilienkauf auf Ethereum — der Escrow-Contract",
  "eth.re.lead":
    "Hier fügt sich alles Gelernte zu <b>einer echten Transaktion</b> zusammen. Beim klassischen Immobilienkauf tragen <b>Treuhandfirma, Grundbuchamt und Makler</b> das Vertrauen. Hier übernimmt <b>Code (ein Contract)</b> diese Rolle — er sperrt das Geld und gibt es erst an den Verkäufer, wenn die Bedingungen bestätigt sind. Beobachte bei jedem Schritt, wie sich <b>tx · nonce · gas · storage · Blöcke · stateRoot</b> bewegen.",
  "eth.re.name": "Objekt",
  "eth.re.seller": "Verkäufer",
  "eth.re.buyer": "Käufer",
  "eth.re.inspector": "Prüfer",
  "eth.re.price": "Preis (ETH)",
  "eth.re.fee": "Prüfergebühr (ETH)",
  "eth.re.reset": "Zurücksetzen",
  "eth.re.step1": "① Objekt einstellen (deploy)",
  "eth.re.step2": "② Geld hinterlegen (deposit)",
  "eth.re.step3": "③ Titel bestätigen (confirm)",
  "eth.re.step4": "④ Verkäufer auszahlen (release)",
  "eth.re.stepRefund": "Abbrechen · Rückerstattung (refund)",
  "eth.re.role.buyer": "Käufer",
  "eth.re.role.seller": "Verkäufer",
  "eth.re.role.inspector": "Prüfer",
  "eth.re.role.contract": "Escrow-Contract",
  "eth.re.flow.deposit": "① deposit",
  "eth.re.flow.confirm": "② confirm",
  "eth.re.flow.release": "③ release",
  "eth.re.priceLbl": "Preis",
  "eth.re.feeLbl": "Prüfergebühr",
  "eth.re.state.None": "Nicht eingestellt",
  "eth.re.state.Listed": "Eingestellt (wartet auf Geld)",
  "eth.re.state.Funded": "Geld gesperrt (wartet auf confirm)",
  "eth.re.state.Confirmed": "Bestätigt (wartet auf Auszahlung)",
  "eth.re.state.Released": "Kauf abgeschlossen ✅",
  "eth.re.state.Refunded": "Abgebrochen (erstattet)",
  "eth.re.hintStart":
    "<b>Start:</b> Wenn der Verkäufer (<b>Bob</b>) auf <b>① Objekt einstellen</b> klickt, wird der Escrow-Contract <b>deployt</b>. Das ist ein eigenes Konto + Regeln nur für diesen einen Kauf.",
  "eth.re.hintListed":
    "<b>Weiter:</b> Die Käuferin (<b>Alice</b>) macht <b>② Geld hinterlegen</b>. Das Geld wird im <b>Contract gesperrt, nicht beim Verkäufer</b> — niemand kommt daran, bevor die Bedingungen erfüllt sind. (msg.value muss exakt dem Preis entsprechen.)",
  "eth.re.hintFunded":
    "<b>Weiter:</b> Die neutrale <b>Prüferin (Carol)</b> macht <b>③ Titel bestätigen</b>. Nur die Prüferin darf das aufrufen (vom Code erzwungen), und vor der Bestätigung fließt kein Geld. Versucht Alice confirm, gibt es einen <b>revert</b>.",
  "eth.re.hintConfirmed":
    "<b>Zuletzt:</b> Klicke <b>④ Verkäufer auszahlen</b>, und der Contract <b>teilt das gesperrte Geld auf</b> — eine <b>Gebühr an die Prüferin</b>, der Rest an den <b>Verkäufer</b>. Wer die Arbeit gemacht hat, wird automatisch vom Code bezahlt.",
  "eth.re.hintReleased":
    "<b>Fertig ✅</b> Die Guthaben von Verkäufer und <b>Prüferin (Gebühr)</b> sind gestiegen, und die Sperre des Contracts steht auf 0. Sieh im Kontenbuch, wie das Guthaben der Prüferin steigt, und im Block-Explorer, wie sich der stateRoot ändert. Neuer Kauf mit <b>Zurücksetzen</b>.",
  "eth.re.hintRefunded":
    "<b>Abgebrochen:</b> Da es vor der Bestätigung war, wurde das Geld <b>atomar an die Käuferin zurückerstattet</b> — ganz oder gar nicht, kein halber Zustand. Neuer Kauf mit <b>Zurücksetzen</b>.",
  "eth.re.msgDeployed": "Escrow deployt · {addr} · nonce {nonce}",
  "eth.re.stateH": "Aktueller Contract- · Kontostand",
  "eth.re.stateLead":
    "Links: Live-Guthaben, Contract-storage und Events. Rechts: der Solidity-Code, der die Regeln festlegt — die gerade aufgerufene Funktion leuchtet auf.",
  "eth.re.ledgerH": "Kontenguthaben (Beteiligte)",
  "eth.re.blocksH": "Wie es sich in Blöcke stapelt — tx + stateRoot",
  "eth.re.blocksLead":
    "Jeder Schritt ist eine <b>Transaktion</b>; sobald sie in einem Block liegt, ändert sich der Fingerabdruck des gesamten Zustands — der <b>stateRoot</b>. Wie bei git-Commits wird nichts editiert: <b>neue Blöcke stapeln sich nach vorn</b>. (Der stateRoot hier ist ein keccak-256 des Konten- und Contract-Schnappschusses dieser Simulation.)",
  "eth.re.blocksNote":
    "<b>So liest du es:</b> Jeder Block zeigt seine tx (wer · welche Funktion) und den <code>stateRoot</code> direkt danach. Eine tx, die den Zustand ändert, macht den stateRoot <b>komplett anders</b>; eine revertete tx ändert nichts, also bleibt auch der stateRoot gleich.",
  "eth.re.blocksEmpty": "Noch keine Blöcke — führe einen Schritt aus.",
  "eth.re.genesisTx": "Genesis-Zustand (vor dem Kauf)",
  "eth.re.srDiff": "stateRoot geändert",
  "eth.re.srSame": "stateRoot unverändert (revert)",
  "eth.re.vsH": "Klassischer Immobilienkauf ↔ Ethereum-Escrow",
  "eth.re.vsCol1": "Rolle",
  "eth.re.vsCol2": "Klassischer Kauf",
  "eth.re.vsCol3": "Ethereum-Escrow",
  "eth.re.vsRows":
    "<tr><td class=\"k\">Geldverwahrung</td><td>Treuhandfirma · Bankkonto</td><td><b>Im Contract gesperrt</b> (niemand kommt heran)</td></tr><tr><td class=\"k\">Bedingungsprüfung</td><td>Grundbuchamt · Notar · Makler</td><td><b>Prüfer-tx</b> (confirm)</td></tr><tr><td class=\"k\">Auszahlung</td><td>Ein Mensch überweist (Verzögerungen · Fehler)</td><td><b>Code, automatisch</b> (nur bei erfüllter Bedingung)</td></tr><tr><td class=\"k\">Abbruch · Erstattung</td><td>Streit · Klagen möglich</td><td><b>Atomare Erstattung per refund()</b></td></tr><tr><td class=\"k\">Wem du vertraust</td><td>Mehreren Institutionen & Menschen</td><td><b>Deploytem Code</b> (unveränderlich)</td></tr><tr><td class=\"k\">Aufzeichnung</td><td>Bücher pro Institution (verstreut · intransparent)</td><td><b>Blöcke · stateRoot</b> (öffentlich · prüfbar)</td></tr>",
  "eth.re.vsWhy":
    "<b>Der Punkt:</b> Geändert hat sich, <i>wem du vertraust</i>. Vertrauen, das über Institutionen und Menschen verstreut war, bündelt sich in <b>einem Stück Code, das nach dem Deploy nicht mehr geändert werden kann</b>. Die Kehrseite: <b>Hat der Code einen Bug, ist auch das die Regel</b> (Tab 3) — deshalb werden echte Dienste auditiert.",

  // ---------- Überblick ----------
  "eth.ov.h1": "Ethereum ist \"ein Buch, das Code ausführt\"",
  "eth.ov.lead":
    "Wenn Bitcoin ein <b>Geldbuch</b> ist, dann ist Ethereum ein Buch, auf das du <b>Programme (Smart Contracts)</b> legen kannst. Einmal deployt, kann niemand den Code mehr ändern, und er <b>läuft automatisch</b>, sobald die Bedingungen erfüllt sind. Seit The Merge ist der Konsens <b>Proof of Stake</b> — Validatoren staken 32 ETH, um Blöcke vorzuschlagen und zu attestieren.",
  "eth.ov.btcN": "Bitcoin",
  "eth.ov.btcT": "PoW · UTXO · Geldbuch",
  "eth.ov.btcD":
    "Zeichnet auf, \"wer wie viel besitzt.\" Minimales Scripting. Voll auf Sicherheit und Einfachheit gesetzt.",
  "eth.ov.ethN": "Ethereum",
  "eth.ov.ethT": "PoS · Konten · Code ausführendes Buch",
  "eth.ov.ethD":
    "Zeichnet Guthaben + <b>Contract-Code & storage</b> auf. Token, Börsen, Versicherungen — alles \"Programme auf der Chain.\"",
  "eth.ov.why":
    "<b>In einem Satz:</b> Ein Smart Contract ist <b>ein Tresor, der sich nur nach vorab geschriebenen Regeln bewegt</b>. Eine Bank kann ihre AGB ändern; ein deployter Contract ist unveränderbar — <b>nicht einmal von seinem Ersteller</b>. Deploye und rufe hier selbst einen auf.",
  "eth.ov.cross":
    "← Die Validierung funktioniert genau wie in den Bitcoin-Tabs: Jeder Knoten <b>prüft die Regeln allein</b>. Der Unterschied ist die Sybil-Abwehr — PoW nutzt Strom, PoS nutzt Sicherheiten (32 ETH + slashing).",
  "eth.ov.orderH": "Empfohlene Lernreihenfolge",
  "eth.ov.o1": "<b>1 · Keccak · Adresse</b> — wie aus Hashes Adressen entstehen (vs. SHA-256)",
  "eth.ov.o2": "<b>2 · Konten · Gas</b> — Guthaben · nonce · EIP-1559-Gebühren (vs. UTXO)",
  "eth.ov.o3": "<b>3 · Smart Contracts</b> — deploy → call → storage · Events · gas (der Kern)",
  "eth.ov.o4": "<b>4 · Token (ERC-20)</b> — ein Token ist die Guthabentabelle eines Contracts (Beispiel SAND)",
  "eth.ov.o5": "<b>5 · Orakel</b> — Chains sehen die Welt nicht · Price Feed im Chainlink-Stil · Versicherung",
  "eth.ov.o6": "<b>6 · PoS-Konsens</b> — slots → attest → justified/finalized · slashing",
  "eth.ov.o7": "<b>7 · Immobilienkauf</b> — ein Escrow, der alles Gelernte verbindet (Abschlussprojekt)",
  "eth.ov.o8": "<b>8 · EVM-Runner</b> — Schritt für Schritt durch den Bytecode während der Ausführung",

  // ---------- 1 · Konten · Gas ----------
  "eth.acc.h1": "Konten speichern Guthaben \"als Zahl\" (eine andere Wahl als UTXO)",
  "eth.acc.lead":
    "Bitcoin <i>berechnete</i> dein Guthaben, indem es Münzfragmente (UTXOs) summierte. Ethereum speichert eine <b>Guthabenzahl direkt, wie ein Bankkonto</b>. Senden heißt nur: <b>deine Zahl sinkt, die andere steigt</b> — kein Wechselgeld, keine UTXO-Fragmente. Probier es aus.",
  "eth.acc.feeBoxH": "Gebührenformeln ausklappen (EIP-1559)",
  "eth.acc.feeBoxBody":
    "<p><b>Einheiten:</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>. Der tip ist <b>Gwei/gas</b>, nicht ETH.</p><p><b>Warum ×21.000?</b> Gwei ist ein Preis pro gas-Einheit; einfache ETH-Überweisungen kosten fix <span class=\"mono\">21.000</span> gas. (Token/Contracts brauchen mehr.)</p><ul class=\"tight\"><li><b>gas used</b> = 21.000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">(in dieser Simulation fix)</span> → verbrannt</li><li><b>tip</b> = Eingabe T Gwei/gas → Block-Proposer</li></ul><pre class=\"mono eth-fee-formula\">Verbrennung = 21.000 × 10 × 10⁻⁹ = 0,000210 ETH\ntip  = 21.000 × T × 10⁻⁹ ETH → Proposer\nAbzug = value + Verbrennung + tip</pre><p class=\"small muted\">Beispiel: T=5 → tip = 0,000105 ETH. Nicht \"5 ETH tip.\"</p>",
  "eth.acc.shortWhy":
    "<b>Kurz:</b> <b>value → Empfänger</b>, <b>tip → Proposer</b>, <b>base fee → verbrannt</b>. Sieh zu, wie sich die Guthaben bewegen und der <b>n=</b>-Wert (nonce) rechts um eins hochtickt.",
  "eth.acc.vsH": "Bitcoin-UTXO ↔ Ethereum-Konto",
  "eth.acc.vsCol1": "Aspekt",
  "eth.acc.vsCol2": "Bitcoin (UTXO)",
  "eth.acc.vsCol3": "Ethereum (Konto)",
  "eth.acc.vsRows":
    "<tr><td class=\"k\">Guthaben</td><td>Summe der Münz-(UTXO-)Fragmente — nicht direkt gespeichert</td><td><b>Direkt als Zahl</b> gespeichert</td></tr><tr><td class=\"k\">Senden</td><td>Ganze UTXOs verbrauchen + frisches <b>Wechselgeld</b> prägen</td><td>Dein Guthaben <b>−</b>, ihres <b>+</b> (kein Wechselgeld)</td></tr><tr><td class=\"k\">Wiederverwendungsschutz</td><td>Ein UTXO wird beim Ausgeben <b>zerstört</b> (automatisch)</td><td>Geschützt durch eine <b>nonce</b>-Nummer (Karte unten)</td></tr><tr><td class=\"k\">Parallelität</td><td>Verschiedene UTXOs lassen sich leicht gleichzeitig verarbeiten</td><td>Ein Konto ist <b>seriell</b> (nonce-Reihenfolge)</td></tr><tr><td class=\"k\">Contract-Zustand</td><td>Umständlich auszudrücken</td><td><b>Natürlich</b> via Guthaben + storage</td></tr>",
  "eth.acc.vsWhy":
    "<b>Warum die Trennung?</b> Bitcoin konzentrierte sich auf \"Geld\" und wählte UTXO für <b>Einfachheit, Parallelität und Privatsphäre</b>; Ethereum musste <b>Programm-(Contract-)Zustand</b> verwalten, also war ein <b>Kontenmodell</b> praktischer, das direkt liest \"wie viel / welchen Wert hält diese Adresse gerade\". Nicht besser oder schlechter — <b>Designs mit unterschiedlichen Zielen</b>.",
  "eth.acc.whereH": "Aber wo genau wird dieses Guthaben gespeichert?",
  "eth.acc.whereBody":
    "<p>\"Direkt gespeichert\" heißt nicht, dass das Guthaben <b>in einem Block</b> steht. Es lebt im <b>world state</b>, den jeder Knoten pflegt — eine riesige <code>Adresse → Kontoobjekt</code>-Map. Ein Konto sind nur 4 Felder.</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>Feld</th><th>Bedeutung</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>Anzahl der txs, die dieses Konto gesendet hat (die Nummer in der Karte unten)</td></tr><tr><td class=\"k\">balance</td><td><b>Guthaben (in wei)</b> ← hier</td></tr><tr><td class=\"k\">storageRoot</td><td>Digest-Hash des Contract-storage (leer bei Wallet-EOAs)</td></tr><tr><td class=\"k\">codeHash</td><td>Hash des Contract-Codes (leer bei Wallet-EOAs)</td></tr></tbody></table><p>Wallets (EOA) und Contracts haben die <b>gleiche Struktur</b>; ein Wallet lässt einfach die letzten beiden Felder leer.</p><p><b>Was in einen Block kommt:</b> Nur der eine oberste Hash des Hash-Baums der gesamten Map = der <b>state root</b> wird in den <b>Block-Header</b> geschrieben. Die Guthabenzahlen selbst hält jeder Knoten, der seine eigene DB beim Ausführen der Transaktionen aktualisiert. Ein Block ist also = <b>\"ein Fingerabdruck des Zustands zu diesem Zeitpunkt (state root)\" + \"die txs dieses Blocks\"</b>.</p><p class=\"small muted\"><b>↔ Bitcoin:</b> Bitcoin hat gar keinen Ort, der ein Guthaben speichert — Knoten halten die <b>UTXO-Menge</b> und berechnen \"Summe der von meiner Adresse ausgebbaren UTXOs\" spontan. Ethereum hält eine <b>balance-Zahl pro Adresse</b> direkt, ein Nachschlagen ist also ein einziger Lesevorgang.</p>",
  "eth.acc.nonceH": "nonce — die \"Anti-Wiederverwendungs-Nummer\" des Kontenmodells",
  "eth.acc.nonceLead":
    "Eine nonce ist ein <b>Transaktionszähler pro Konto</b> (0, 1, 2, …). Sehen wir uns an, warum sie unverzichtbar ist.",
  "eth.acc.nonceProblem":
    "<b>Problem:</b> Ein ETH-Guthaben ist nur eine <b>Zahl</b>. Was, wenn jemand deine signierte \"1 ETH an Bob\"-tx <b>10-mal erneut sendet</b>? Bei Bitcoin ist das ausgegebene UTXO schon weg, es wird automatisch geblockt — aber ein Konto hat nur ein Guthaben, also <b>gibt es nichts, was das stoppt.</b>",
  "eth.acc.nonceBox":
    "<span class=\"who\">{who}</span><span class=\"note\">s aktuelle nonce</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ nächste tx ist #{cur}, bei Erfolg</span> <span class=\"nxt\">{next}</span></span>",
  "eth.acc.nonceRoles":
    "<b>Lösung — eine nonce leistet zwei Dinge zugleich:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① Replay-Schutz</b> — jede Nummer wird genau einmal benutzt. Eine tx mit schon verbrauchter nonce wird abgelehnt, Wiederholungen scheitern.</li><li><b>② Reihenfolge</b> — es muss 0 → 1 → 2 gehen. Eine tx, die vorprescht, wartet (pending), bis die früheren gelandet sind.</li></ul>",
  "eth.acc.nonceSig":
    "<b>🔑 Verbindung zum Signieren in Tab 1:</b> Die nonce ist <b>Teil dessen, was du signierst</b> (der sighash). Selbst eine identische Überweisung erzeugt also eine <b>völlig andere Signatur, wenn die nonce anders ist</b> → das Wiederabspielen einer alten Signatur scheitert, weil diese nonce schon verbraucht ist. \"Die Signatur versiegelt den Inhalt\" wird hier zum Wiederverwendungsschutz.",
  "eth.acc.nonceDeeperH": "Tiefer: pending/stuck tx · nonce gap · Contract-Adressen",
  "eth.acc.nonceDeeperBody":
    "<p><b>Stuck tx:</b> Wird nonce 5 mit zu niedriger Gebühr gesendet und bleibt hängen, <b>müssen nonce 6·7 warten</b> (Reihenfolge). Lösung: dieselbe nonce 5 mit höherer Gebühr erneut senden und damit <b>überschreiben</b>.</p><p><b>Nonce gap:</b> Sendest du nach 5 versehentlich 7, <b>wartet 7 ewig</b>, bis 6 kommt — der mempool hält sie für 6 zurück.</p><p><b>Bezug zu Contract-Adressen:</b> Wie in Tab 1: Contract-Adresse = <code>keccak(Deployer-Adresse + nonce)</code>. So bekommt <b>selbst derselbe Deployer jedes Mal eine neue Adresse</b>, wenn die nonce wächst.</p>",
  "eth.acc.gasH": "Gas · EIP-1559 — wie die Gebühr aufgeteilt wird",
  "eth.acc.gasLead":
    "Ändere beim Senden den tip, und die Vorschau oben (Verbrennung · tip · Abzug) aktualisiert sich live. Hier kommen diese Zahlen her.",
  "eth.acc.gasWhat":
    "<b>Was ist gas?</b> Jede Berechnung und jeder Speichervorgang nutzt Knoten-Ressourcen. Gas ist die <b>Einheit, die diese Arbeit misst</b>. Eine einfache ETH-Überweisung ist vom Protokoll auf <b>21.000 gas</b> fixiert (Token/Contracts kosten mehr). <b>Gebühr = gas × Preis pro gas</b> — das verhindert Spam und belohnt Validatoren.",
  "eth.acc.gasEip":
    "<b>EIP-1559 — der Preis hat zwei Teile:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — wird <b>automatisch nach Auslastung</b> festgelegt. Hier fix bei <b>10 Gwei/gas</b>. → geht an niemanden und wird <b>verbrannt</b>.</li><li><b>priority tip</b> — der Aufschlag, den du wählst (Eingabe oben). → geht an den Block-<b>Proposer (Validator)</b>.</li></ul>",
  "eth.acc.burnWhy":
    "<b>🔥 Was Verbrennen bedeutet:</b> Als base fee gezahltes ETH ist <b>für immer weg</b>. Je voller das Netzwerk, desto mehr wird verbrannt — es entsteht <b>deflationärer Druck, der die ETH-Gesamtmenge schrumpft</b>. Die Richtung ähnelt Bitcoins \"neue Ausgabe per Halving drosseln\", aber Ethereum <b>verbrennt bereits existierende Coins</b>.",
  "eth.acc.propTag": "Proposer",
  "eth.acc.burnLbl": "Verbrennung",
  "eth.acc.from": "Absender",
  "eth.acc.to": "Empfänger",
  "eth.acc.amt": "Betrag (ETH)",
  "eth.acc.gas": "tip (Gwei/gas)",
  "eth.acc.feePreview": "Verbrennung {burn} · tip {tip} → {prop} · {from} zahlt {paid}",
  "eth.acc.send": "Senden",
  "eth.acc.sendFail": "Senden fehlgeschlagen",

  // ---------- 1 · Keccak · Adresse ----------
  "eth.kc.h1": "Keccak-256 — der Hash, der Ethereums \"ids\" erzeugt",
  "eth.kc.lead":
    "Fast jede id, die dir in Ethereum begegnet — Adressen, Funktions-Selektoren, Event-topics, Contract-Adressen — kommt aus diesem einen Hash. Gleicher Zweck wie Bitcoins SHA-256, aber Ethereum nutzt <b>Keccak-256</b>. Hash zuerst selbst etwas.",
  "eth.kc.playIn": "Eingabe (beliebiger Text)",
  "eth.kc.playOutLbl": "Keccak-256 (Eingabe beliebiger Länge → immer 32 Bytes = 64 Hex)",
  "eth.kc.avalanche":
    "<b>Lawineneffekt:</b> Ändere ein Zeichen, und etwa die Hälfte der Ausgabebits kippt. Umkehren (Hash→Eingabe) geht nicht, und dieselbe Eingabe liefert immer dieselbe Ausgabe — gleiche Eigenschaften wie SHA-256.",
  "eth.kc.sha3H": "Falle: Keccak-256 ≠ NIST SHA3-256",
  "eth.kc.sha3Body":
    "<p>Ethereum nutzt das originale Keccak von <b>vor</b> der Standardisierung, es unterscheidet sich also von NISTs SHA3-256 um <b>ein Padding-Byte</b>. Gleiche Eingabe, völlig andere Ausgabe.</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (Padding 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (Padding 0x06)</pre><p class=\"small muted\">Deshalb liefert der Aufruf von <code>sha3_256</code> in einer Bibliothek keine Ethereum-Adressen. Du musst <code>keccak256</code> verwenden.</p>",
  "eth.kc.addrH": "Adresse = die \"letzten 20 Bytes\" von keccak(öffentlicher Schlüssel)",
  "eth.kc.addrLead":
    "Eine Wallet-Adresse ist der Keccak-gehashte öffentliche Schlüssel, gekürzt auf die <b>letzten 20 Bytes</b>. (Diese Demo hasht einen Namen statt eines Pubkeys — gleiche Regel.)",
  "eth.kc.addrIn": "Eingabe (Demo: Name → Hash → Adresse)",
  "eth.kc.hashLbl": "① Voller Keccak-256 (32 Bytes) — erste 12 Bytes ausgegraut, nur die letzten 20 werden benutzt",
  "eth.kc.addrLbl": "② Adresse = letzte 20 Bytes + 0x",
  "eth.kc.addrWhy":
    "<b>Warum die ersten 12 Bytes verwerfen?</b> Der Hash hat 32 Bytes, aber eine Adresse braucht nur <b>20 Bytes (160 Bit)</b> — die kürzere Form spart Platz, und trotzdem ist <b>die Wahrscheinlichkeit, dass zwei verschiedene Menschen zufällig dieselbe Adresse bekommen, praktisch null</b> (dieser Zufall heißt \"Hash-Kollision\" — bei 20 Bytes gibt es 2¹⁶⁰ Möglichkeiten, es passiert also praktisch nie). Echte Schlüssel hashen die secp256k1-X·Y-Koordinaten (<b>64 Bytes</b>, ohne das 0x04-Präfix).",
  "eth.kc.idsH": "Keccak überall in Ethereum — eine kurze Vorschau",
  "eth.kc.idsLead":
    "Ethereum nutzt Keccak an vielen Stellen. Jede Verwendung <b>hasht eine andere Eingabe</b> und <b>behält nur den Teil, den sie braucht</b>. Klick dich fürs Erste einfach durch und bekomme ein Gefühl dafür, dass \"Keccak überall auftaucht\" — was Selektoren, topics und Contract-Adressen genau sind, kommt in den nächsten Tabs.",
  "eth.kc.selH": "① Funktions-Selektor — die <b>ersten 4 Bytes</b> des Signatur-Hashes",
  "eth.kc.selLead":
    "Die id, die bei einem Aufruf sagt \"welche Funktion?\". Sie ist das Präfix, wenn du in Tab 3 buy()/transfer() aufrufst.",
  "eth.kc.selIn": "Funktionssignatur",
  "eth.kc.selOut":
    "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ Selektor <b class=\"mono\">0x{sel}</b> <span class=\"muted\">(erste 8 Hex = 4 Bytes)</span>",
  "eth.kc.topicH": "② Event-topic0 — die <b>vollen 32 Bytes</b> des Signatur-Hashes",
  "eth.kc.topicLead":
    "Der Wert, der einen Log-Eintrag als \"das ist ein Transfer-Event\" markiert. Das ist der topic0 in den Event-Logs der Tabs 3 & 4.",
  "eth.kc.topicIn": "Event-Signatur",
  "eth.kc.topicOut":
    "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">(alle 32 Bytes bleiben erhalten)</span>",
  "eth.kc.caH": "③ Contract-Adresse — letzte 20 Bytes von keccak(<b>Deployer-Adresse + nonce</b>)",
  "eth.kc.caLead":
    "Jeder Deploy erhöht die nonce, also ändert sich die Adresse jedes Mal. Der Deploy des Automaten in Tab 3 nutzt genau diese Regel.",
  "eth.kc.caDeployer": "Deployer (Name)",
  "eth.kc.caNonce": "nonce",
  "eth.kc.caOut":
    "keccak(\"{pre}\")<br>→ Contract-Adresse <b class=\"mono\">{addr}</b> <span class=\"muted\">(letzte 20 Bytes)</span>",
  "eth.kc.when":
    "<b>Zusammenfassung — dieselbe Hash-<u>Funktion</u> an vielen Stellen</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>Adresse</b> ← den <b>öffentlichen Schlüssel</b> hashen → letzte 20 Bytes</li><li><b>Contract-Adresse</b> ← <b>Deployer+nonce</b> hashen → letzte 20 Bytes</li><li><b>Funktions-Selektor</b> ← die <b>Signatur</b> hashen → erste 4 Bytes</li><li><b>Event-topic0</b> ← die <b>Signatur</b> hashen → volle 32 Bytes</li></ul>",
  "eth.kc.deeperH": "Tiefer: mapping-Speicherort · CREATE2 · Prüfsummen-Adressen",
  "eth.kc.deeperBody":
    "<p><b>mapping-Speicherort:</b> Wo <code>balanceOf[Alice]</code> im storage liegt, wird ebenfalls durch <code>keccak(key ‖ slot#)</code> bestimmt — die echte Adressrechnung hinter der \"Token-storage-Tabelle\" in Tab 4.</p><p><b>CREATE2:</b> Statt der nonce ist die Adresse <code>keccak(0xff ‖ Deployer ‖ salt ‖ keccak(Code))</code> — vor dem Deploy berechenbar, weshalb L2s und Wallets darauf setzen.</p><p><b>Prüfsummen-Adressen (EIP-55):</b> Die Groß-/Kleinschreibung einer Adresse wird durch Hashen der Adresse selbst bestimmt. Es ist eine Fehler fangende Prüfsumme — die gemischte Schreibweise in <code>0xAbC…</code> trägt also wirklich Bedeutung.</p>",

  // Karte 2.5 — Wallet-Erzeugung (BTC↔ETH)
  "eth.kc.genH": "Und woher kommt der öffentliche Schlüssel — 3 Schritte zum Wallet",
  "eth.kc.genLead":
    "Ein Wallet zu erstellen ist nur <b>Zufallszahl (privater Schlüssel) → Elliptische-Kurven-Multiplikation → öffentlicher Schlüssel → Hash → Adresse</b>. Die ersten zwei Schritte (privat→öffentlich) sind <b>identisch mit Bitcoin</b> (gleiche secp256k1-Kurve); <b>nur die Hash-Funktion für die Adresse unterscheidet sich</b>. Um diese \"Elliptische-Kurven-Multiplikation (Sprung)\" visualisiert zu sehen, schau in <b>Bitcoin-Tab 4</b>.",
  "eth.kc.genCol1": "Schritt",
  "eth.kc.genCol2": "Bitcoin",
  "eth.kc.genCol3": "Ethereum",
  "eth.kc.genRows":
    "<tr><td class=\"k\">① Privater Schlüssel</td><td>256-Bit-<b>Zufall</b></td><td>256-Bit-<b>Zufall</b> <span class=\"same\">gleich</span></td></tr><tr><td class=\"k\">② Öffentlicher Schlüssel</td><td class=\"mono\">privkey × G (secp256k1)</td><td class=\"mono\">privkey × G <span class=\"same\">gleiche Kurve</span></td></tr><tr><td class=\"k\">③ Adresse</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) letzte 20 B → 0x… <span class=\"diff\">nur Hash anders</span></td></tr><tr><td class=\"k\">Signatur</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">gleich</span></td></tr><tr><td class=\"k\">Seed-Phrase</td><td>BIP-39 (12/24 Wörter)</td><td>BIP-39 <span class=\"same\">gleich</span></td></tr><tr><td class=\"k\">Kontopfad</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">nur die Zahl anders</span></td></tr><tr><td class=\"k\">Speicherort</td><td>wallet.dat · Hardware-Chip</td><td>Browser-Erweiterung (verschlüsselt) · Hardware-Chip</td></tr>",
  "eth.kc.genKey":
    "<b>🔑 Kernpunkt:</b> Die <b>Grundlagen (Schlüssel, Signaturen, Seed) sind auf beiden Chains fast gleich.</b> Deshalb kann <b>ein Hardware-Wallet BTC und ETH gemeinsam verwalten</b>. Der sichtbare Unterschied ist im Grunde nur die <b>Adress-Kodierung (der Hash)</b>.",
  "eth.kc.genStoreH": "Wo wird der private Schlüssel gespeichert? · Seed-Phrase · wo wird signiert?",
  "eth.kc.genStore":
    "<p><b>Der private Schlüssel liegt nicht auf der Blockchain.</b> Die Chain enthält nur Adressen, Guthaben, Transaktionen und Signaturen. Der private Schlüssel lebt <b>nur in deinem Wallet</b> — Knoten sehen ihn nie (könnten sie es, könnte jeder dein Geld stehlen).</p><ul class=\"tight\"><li><b>MetaMask</b> — liegt im Speicher der Browser-Erweiterung, <b>mit deinem Passwort verschlüsselt</b>, wird nur bei Bedarf entschlüsselt.</li><li><b>Hardware-Wallet (Ledger·Trezor)</b> — eingeschlossen in einem Sicherheitschip, <b>verlässt das Gerät nie</b>; signiert wird auf dem Gerät.</li><li><b>Seed-Phrase (12 Wörter)</b> — der <b>Samen</b> all deiner privaten Schlüssel. Sie allein kann jedes Konto wiederherstellen → wird sie geleakt, ist alles weg.</li></ul><p><b>Signiert wird \"in deinem Gerät.\"</b> Das Wallet signiert die tx lokal mit dem privaten Schlüssel → nur <b>Signatur + tx</b> gehen an die Chain → Knoten <b>verifizieren nur mit dem öffentlichen Schlüssel</b>. Die \"signieren = nur ich, prüfen = jeder\"-Asymmetrie.</p>",

  "eth.acc.contrastEth": "Natives ETH (vom Protokoll verwaltet)",
  "eth.acc.contrastEthHint": "balance-Feld des Kontoobjekts · kein UTXO · wie in Tab 1",
  "eth.acc.contrastTok": "App-Buch · {token} (storage)",
  "eth.acc.contrastTokHint": "Die Tokenmenge (value) ist kein ETH · aber das Ausführungs-gas wird in ETH bezahlt",
  "eth.acc.tokAmt": "Menge",
  "eth.acc.tokOk":
    "Storage aktualisiert: {from} → {to} · {amt} {token}. Bewegt hat sich {token}, nicht ETH — aber <b>gas wird trotzdem in ETH bezahlt</b>.",
  "eth.logH": "Engine-Protokoll",

  // ---------- 8 · EVM-Runner ----------
  "eth.evm.h1": "EVM — die CPU, die Ethereum antreibt",
  "eth.evm.lead":
    "Ein Smart Contract ist letztlich <b>Bytecode</b>, und die virtuelle CPU, die ihn Anweisung für Anweisung (opcode) ausführt, ist die <b>EVM</b>. Füttere eine tx (Anweisung) in den world state (Daten), und die EVM verbrennt gas, um sie auszuführen und einen <b>neuen Zustand</b> zu erzeugen. Wie die JVM ist sie eine <b>stackbasierte virtuelle Maschine</b>, und wie der JS-Event-Loop <b>läuft sie single-threaded bis zum Ende</b>.",
  "eth.evm.mapCol1": "Computer",
  "eth.evm.mapCol2": "Ethereum",
  "eth.evm.mapCol3": "Was es ist",
  "eth.evm.mapRows":
    "<tr><td class=\"k\">Festplatte / DB (gesamt)</td><td>world state</td><td>Alle Kontoguthaben + der storage aller Contracts</td></tr><tr><td class=\"k\">Eine Datei/Tabelle darin</td><td>storage</td><td>Die dauerhaften Slots eines Contracts (Teil des world state)</td></tr><tr><td class=\"k\">RAM (flüchtig)</td><td>stack · memory</td><td>Weg, wenn die tx endet</td></tr><tr><td class=\"k\">Auszuführendes Programm</td><td>tx</td><td>Wer · welche Funktion · Argumente</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>Führt Bytecode opcode für opcode aus</td></tr><tr><td class=\"k\">Stromrechnung / Takt</td><td>gas</td><td>Kosten und Obergrenze der Ausführung</td></tr><tr><td class=\"k\">Prüfsumme der ganzen DB</td><td>stateRoot</td><td>Fingerabdruck des gesamten world state</td></tr>",
  "eth.evm.analogy":
    "<b>Wie die JVM:</b> Beide sind <b>Stack-Maschinen</b> — gerechnet wird über einen Stack, nicht über Register. <code>PUSH 3, PUSH 4, ADD</code> → 7 auf dem Stack. <b>Wie der JS-Event-Loop:</b> single-threaded, <b>läuft bis zum Ende</b> (wird nie unterbrochen), dann fertig oder komplett revertet.",
  "eth.evm.determinism":
    "<b>Der entscheidende Unterschied:</b> Die EVM muss <b>vollständig deterministisch</b> sein — kein <code>random</code>, keine Uhrzeit, kein Netzwerk-I/O. Jeder Knoten der Welt führt dieselbe tx aus und muss <b>exakt denselben Stack, storage und gas</b> bekommen, sonst bricht der Konsens. Deshalb gibt es auch gas (gegen Endlosschleifen / DoS).",
  "eth.evm.runH": "Schritt für Schritt, ein opcode nach dem anderen",
  "eth.evm.runLead":
    "Wähle ein Programm und drücke <b>Nächster Schritt</b>: Jedes Mal, wenn ein opcode läuft, siehst du, wie sich <b>Stack, storage und gas</b> ändern — wie in einem Event-Loop-Visualizer.",
  "eth.evm.program": "Programm",
  "eth.evm.calldata": "Eingabe v (calldata)",
  "eth.evm.calldataPrice": "Preis (calldata)",
  "eth.evm.exSstoreEscrow":
    "<b>SSTORE</b> — Escrow-storage-Update: <b>{slot} ← {val}</b>. state/price/locked aus Tab 7 sind genau solche Slot-Schreibvorgänge.",
  "eth.evm.stepBack": "◀ Zurück",
  "eth.evm.step": "▶ Nächster Schritt",
  "eth.evm.runAll": "⏩ Alles ausführen",
  "eth.evm.reset": "↺ Zurücksetzen",
  "eth.evm.bytecodeH": "Bytecode · PC",
  "eth.evm.stackH": "Stack (top ↑ · flüchtig)",
  "eth.evm.memoryH": "Memory (flüchtig)",
  "eth.evm.storageH": "Storage (Slots dieses Contracts · Teil des world state)",
  "eth.evm.gasH": "Gas",
  "eth.evm.gasUsed": "verbraucht",
  "eth.evm.gasLeft": "übrig",
  "eth.evm.emptyStack": "Stack ist leer",
  "eth.evm.emptyMem": "Kein Memory benutzt",
  "eth.evm.emptyStorage": "Noch nichts in den storage geschrieben",
  "eth.evm.exInit": "Ausgangszustand vor der Ausführung — Stack, Memory und storage alle leer, gas voll. Drücke <b>Nächster Schritt</b>, um opcodes einzeln auszuführen.",
  "eth.evm.exPush": "<b>PUSH1 {v}</b> — legt den Direktwert {v} oben auf den Stack.",
  "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — liest die Eingabe der tx (v) und legt sie auf den Stack. (Der offset auf dem Stack wird verbraucht.)",
  "eth.evm.exAdd": "<b>ADD</b> — nimmt die obersten zwei Werte, addiert sie und legt das Ergebnis zurück.",
  "eth.evm.exMul": "<b>MUL</b> — nimmt die obersten zwei Werte, multipliziert und legt das Ergebnis ab.",
  "eth.evm.exSub": "<b>SUB</b> — nimmt die obersten zwei Werte, subtrahiert und legt das Ergebnis ab.",
  "eth.evm.exSstore":
    "<b>SSTORE</b> — nimmt (slot, Wert) und <b>schreibt ihn dauerhaft in den storage</b>. Das ist der Moment, in dem sich der world state ändert! Deshalb kostet es so viel gas (20000 für 0→Wert).",
  "eth.evm.exSload": "<b>SLOAD</b> — liest einen Wert aus einem storage-Slot und legt ihn auf den Stack.",
  "eth.evm.exMstore": "<b>MSTORE</b> — schreibt einen Wert in den flüchtigen Memory. (Weg, wenn die tx endet.)",
  "eth.evm.exStop": "<b>STOP</b> — die Ausführung endet ✅. Der finale storage dieser tx wird festgeschrieben, und ein neuer stateRoot, der ihn widerspiegelt, wird erzeugt.",
  "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — die Ausführung stoppt, und <b>alle Zustandsänderungen werden zurückgerollt</b>. Aber das bis hierhin verbrauchte gas gibt es nicht zurück.",
  "eth.evm.gitH": "World state ↔ stateRoot — wie git",
  "eth.evm.gitLead":
    "Links ist der <b>storage</b> dieses Contracts (ein Stück world state); rechts ein daraus gehashter <b>Lern-stateRoot</b>. Auf einer echten Chain hasht der stateRoot <b>alle Kontoguthaben + den storage aller Contracts</b>. Wenn SSTORE einen Wert ändert, wird ein Commit angehängt — und <b>die Historie bleibt</b>, auch wenn du das Programm wechselst.",
  "eth.evm.gitTree": "storage (Teil des world state)",
  "eth.evm.gitRoot": "stateRoot · Commit-Hash",
  "eth.evm.gitHistH": "Commit-Historie",
  "eth.evm.clearHist": "Historie löschen",
  "eth.evm.gitEmpty": "Noch keine Commits — geh Schritt für Schritt weiter, bis du auf SSTORE triffst.",
  "eth.evm.gitRootFirst": "Erster Schnappschuss (Hash des leeren Zustands)",
  "eth.evm.gitRootChanged": "Geändert ↑ anders als der vorige Commit {prev} — Beweis, dass sich der storage bewegt hat",
  "eth.evm.gitRootSame": "Gleich wie der vorige Commit — keine storage-Änderung",
  "eth.evm.commitGenesis": "genesis · leerer storage",
  "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
  "eth.evm.commitStop": "STOP · {prog} abgeschlossen",
  "eth.evm.commitSnap": "Schnappschuss",
  "eth.evm.whyH": "Warum das der eigentliche Kern von Ethereum ist",
  "eth.evm.why1":
    "<b>ERC-20, Orakel, DeFi sind alles Apps, die darauf laufen.</b> Contract-Code = Klasse, deployte Adresse = eine Instanz, storage = die Felder dieser Instanz, Funktionsaufruf = Methodenaufruf. Die EVM ist die Engine, die diese Methoden tatsächlich ausführt.",
  "eth.evm.why2":
    "<b>Warum SSTORE teuer ist:</b> Stack und Memory sind wie RAM und verschwinden mit dem Ende der tx, aber <b>storage ist wie eine Festplatte — dauerhaft</b> und Teil des world state, also muss ihn jeder Knoten für immer behalten. Deshalb übertrifft ein storage-Schreibvorgang (20000 gas) die Arithmetik (3 gas) um Längen.",
  "eth.evm.why3":
    "<b>Die Essenz:</b> <code>new_state = EVM.execute(state, tx)</code>, dann <code>stateRoot = hash(new_state)</code>. Hast du diese Zustandsübergangs-Maschine verstanden, sieht alles andere aus wie 'Instanzen, die darauf laufen'.",

  // ---------- 2 · Smart Contracts ----------
  "eth.sc.h1": "Smart Contracts — deploye einen Automaten",
  "eth.sc.lead":
    "Unten steht eine echte Solidity-<b>SnackMachine</b>. Deploye sie, und ihr Code ist auf der Chain eingefroren; jeder kann <code>buy()</code> aufrufen. <b>Nicht einmal der owner kann die Regeln ändern.</b>",
  "eth.sc.acctTypesH": "Zuerst — Ethereum hat zwei Arten von Konten",
  "eth.sc.eoaN": "Wallet-Konto (EOA)",
  "eth.sc.eoaT": "Alice · Bob · dein MetaMask",
  "eth.sc.eoaD":
    "Adresse = letzte 20 Bytes von keccak(<b>öffentlicher Schlüssel</b>). <b>Hat einen privaten Schlüssel</b> und kann daher per Signatur Transaktionen starten.",
  "eth.sc.caN": "Contract-Konto",
  "eth.sc.caT": "SnackMachine · SAND · Uniswap",
  "eth.sc.caD":
    "Adresse = letzte 20 Bytes von keccak(<b>Deployer-Adresse + nonce</b>). <b>Kein privater Schlüssel</b> — hat stattdessen Code & storage und handelt nur, wenn es aufgerufen wird.",
  "eth.sc.txKinds":
    "<b>Überweisung, Deploy und Aufruf sind alle \"dieselbe tx\" — jede erhöht die nonce um +1.</b> Alles, was ein EOA nach außen sendet, ist eine Transaktion; nur <code>to</code>/<code>data</code> unterscheiden sich. Ein Deploy verbraucht also eine nonce wie eine Überweisung, und diese nonce wird zur Zutat der Contract-Adresse oben.<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>Aktion</th><th>Wie die tx aussieht</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">Einfache Überweisung</td><td><code>to</code>=Empfänger · value · kein <code>data</code></td><td>+1</td></tr><tr><td class=\"k\">Contract-Deploy</td><td><code>to</code>=<b>leer (null)</b> · <code>data</code>=<b>Bytecode</b></td><td>+1</td></tr><tr><td class=\"k\">Contract-Aufruf</td><td><code>to</code>=Contract-Adresse · <code>data</code>=<b>Funktion+Argumente</b></td><td>+1</td></tr></tbody></table>",
  "eth.sc.deriveH": "Wie diese Adresse entstand (gerade eben live berechnet)",
  "eth.sc.derive1": "{who}s Wallet-Adresse — letzte 20 Bytes von keccak({who}s öffentlichem Schlüssel*)",
  "eth.sc.derive2": "Vorlage = Wallet-Adresse + die nonce zu diesem Zeitpunkt ({nonce}) — diese nonce ist <b>genau der Zähler, den du in Tab 2 gesehen hast</b>",
  "eth.sc.derive3": "keccak-256(Vorlage) — nur die letzten 40 von 64 Hex behalten",
  "eth.sc.derive4": "→ Contract-Adresse",
  "eth.sc.deriveMatch": "✓ stimmt mit dem Header oben überein",
  "eth.sc.deriveNote":
    "* Diese Simulation hasht einen Namen statt eines öffentlichen Schlüssels (Regel aus Tab 1). Echtes Ethereum hasht RLP([Adresse, nonce]) — gleiche Zutaten. Wallet- und Contract-Adressen sehen gleich aus, entstehen aber aus verschiedenen Zutaten.",
  "eth.sc.historyH": "Zustands-Historie — nichts wird editiert, neue Zeilen stapeln sich",
  "eth.sc.historyLead":
    "Stell dir ein mit Kugelschreiber geführtes Buch vor. Alte Einträge lassen sich weder löschen noch überschreiben — <b>nur eine erfolgreiche Transaktion fügt die nächste Zeile hinzu (eine neue Version vN)</b>. Bei einem revert <b>entsteht keine neue Version</b> — unten siehst du nur eine ⛔-Markierung 'versucht, aber abgelehnt', und der Zustand ändert sich nie halb (Atomarität). Gas wird trotzdem verbraucht.",
  "eth.sc.histRevert": "Keine neue Version (atomar) · gas trotzdem verbraucht — {reason}",
  "eth.sc.histNoChange": "Keine storage-Änderung (nur Guthaben bewegt)",
  "eth.sc.storageLead":
    "storage = die <b>private Schublade</b> dieses Contracts. Sie enthält die <b>aktuellen Werte</b> der oben im Solidity-Code deklarierten Variablen (<code>price</code>, <code>stock</code>…). Nur Funktionsaufrufe können sie ändern.",
  "eth.tok.storageLead":
    "Stell dir das als das <b>SAND-Buch</b> von The Sandbox vor. Die Werte in <code>mapping(address → uint256) balanceOf</code> sind das, was ein Wallet als \"Token-Guthaben\" anzeigt — ein <b>anderer Slot</b> als ETH. (Lern-Miniversion — nicht der Mainnet-SAND-Contract.)",

  // ---------- Speicherort (Block vs. Zustands-DB) ----------
  "eth.ws.h1": "Und wo wird das alles gespeichert? — Blöcke vs. Knoten-DB",
  "eth.ws.lead":
    "Man würde erwarten, dass Code, storage und Guthaben in Blöcken liegen — aber <b>Blöcke enthalten nur \"Bestellzettel\"</b>. Die Ergebnisse berechnet jeder Knoten selbst und hält sie in seiner eigenen DB.",
  "eth.ws.blockN": "Block (auf der Chain, für immer)",
  "eth.ws.blockT": "Die geteilte Aufzeichnung",
  "eth.ws.blockD":
    "<b>Transaktionsliste</b> — Bestellzettel wie \"Bob hat buy() mit 0,5 ETH aufgerufen\" + <b>stateRoot</b> — ein 32-Byte-Hash, der den gesamten Zustand nach der Ausführung zusammenfasst. <b>Kein Zustand selbst.</b>",
  "eth.ws.dbN": "Zustands-DB (jeder Knoten, lokal)",
  "eth.ws.dbT": "Das Ergebnis des Abspielens der Zettel",
  "eth.ws.dbD":
    "Jedes Konto ist <span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>. Wallet-Konten haben leeren Code; Contract-Konten tragen <b>Bytecode + storage</b>.",
  "eth.ws.why":
    "<b>Warum ist das okay?</b> Der Zustandsübergang ist eine reine Funktion (<span class=\"mono\">neuerZustand = f(alterZustand, tx)</span>) — <b>nur die Eingaben (txs)</b> aufzuzeichnen genügt, damit jeder ab Genesis zum selben Zustand nachrechnen kann. Knoten prüfen einander per <b>Vergleich der 32-Byte-stateRoots</b> — derselbe Trick wie die Merkle-Wurzel in Bitcoin-Tab 5.",
  "eth.ws.tableH": "Die Zustands-DB dieser Simulation, live",
  "eth.ws.tableLead":
    "<b>Jedes Konto</b> dieser Simulationswelt taucht auf — Contracts anderer Tabs (SAND → Tab 4 Token, ETH/USD Feed → Tab 5 Orakel) sind bei Genesis vor-deployt. Genau wie die echte Ethereum-Zustands-DB, die USDT und Uniswap bereits enthält.",
  "eth.ws.originTok": "Genesis-Deploy · genutzt in Tab 3",
  "eth.ws.originFeed": "Genesis-Deploy · genutzt in Tab 4",
  "eth.ws.originGenesis": "Genesis-Deploy",
  "eth.ws.originYou": "gerade deployt von {who}",
  "eth.ws.colAcct": "Konto",
  "eth.ws.codeNone": "keiner (Wallet)",
  "eth.ws.codeYes": "ja · {kind}-Bytecode",
  "eth.ws.srcNote":
    "<b>Solidity-Quellcode liegt NICHT auf der Chain.</b> Nur kompilierter <b>Bytecode</b> kommt auf die Chain. Quellcode erscheint auf Etherscan, weil Entwickler ihn einreichen und Etherscan ihn neu kompiliert und mit dem On-Chain-Bytecode abgleicht — ein <b>Off-Chain-Dienst</b>. Dass diese Seite Solidity zeigt, folgt derselben Idee.",
  "eth.sc.deployer": "Deployer",
  "eth.sc.price": "Preis (ETH)",
  "eth.sc.stock": "Bestand",
  "eth.sc.deploy": "🚀 Deployen",
  "eth.sc.deployOk":
    "Deployt → Adresse <b class=\"mono\">{addr}</b> (keccak(Deployer, nonce {nonce})) · gas {gas}",
  "eth.sc.deployedBy": "deployt von {by} · nonce {nonce}",
  "eth.sc.callH": "Aufrufen",
  "eth.sc.caller": "Aufrufer",
  "eth.sc.value": "Zu sendendes ETH (msg.value)",
  "eth.sc.storageH": "storage (Contract-Zustand)",
  "eth.sc.storageEmpty": "Kein storage",
  "eth.sc.eventsH": "Event-Log",
  "eth.sc.eventsEmpty": "Noch keine Events — rufe eine Funktion auf",
  "eth.sc.codeH": "Solidity-Code (die aufgerufene Funktion leuchtet auf)",
  "eth.sc.revertNote":
    "revert: Der Zustand wurde zurückgerollt und kein value bewegt, aber gas-Gebühren wurden bezahlt und die nonce rückte vor — genau wie im echten Ethereum.",
  "eth.sc.why":
    "<b>Kurz:</b> Ein Contract ist ein Konto mit <b>Adresse, Guthaben und nonce</b> — plus <b>Code und storage</b>. Geld bewegt sich nur, wie der Code es sagt. Probiere <code>withdraw()</code> als Bob — es <b>revertet</b>, doch gas wird trotzdem bezahlt.",
  "eth.sc.asideH": "Warum \"Code ist Gesetz\" eine große Sache ist",
  "eth.sc.asideBody":
    "<p><b>Bankeinlage:</b> AGB, Personal und Gerichte können eingreifen. <b>Contract-Einlage:</b> Nichts außer den Bedingungen des deployten Codes kann das Geld bewegen.</p><p>Dass die Adresse <b>keccak(Deployer, nonce)</b> ist und der Event-<b>topic0 = keccak(Signatur)</b> — das sind dieselben Hash-Regeln aus Tab 1.</p><p>Der Nachteil folgt aus demselben Prinzip — ein fehlerhafter Contract <b>kann nicht gepatcht werden</b> (siehe den The-DAO-Hack).</p>",

  // ---------- 4 · Token ----------
  "eth.tok.h1": "ERC-20 — ETH-Guthaben und Token-Guthaben wohnen an verschiedenen Orten",
  "eth.tok.lead":
    "<b>ETH</b> verwaltet das Protokoll als <b>balance</b> des Kontoobjekts (Tab 1 — eine Kontozahl, keine Bitcoin-UTXOs). <b>SAND</b> von The Sandbox oder USDT sind nicht dieses Feld — sie sind eine <b>Tabelle im storage jenes Token-Contracts</b> auf Ethereum (Adresse → Menge). ERC-20 ist der <b>Standard</b> für diese Tabelle; <b>SAND</b> unten ist ein Lern-Minitoken mit dieser Struktur.",
  "eth.tok.std":
    "<b>Gleicher world state, andere Slots.</b> Ethereum verwaltet das Konto-<code>balance</code> (ETH). App-Token wie SAND und USDT verwalten ihre eigenen storage-Tabellen. (Echtes SAND wird wegen des gas oft auf Polygon gehandelt, aber der Token selbst gehört zur Ethereum-ERC-20-Familie.)",
  "eth.tok.why":
    "<b>Check:</b> ① Transfer <b>value=50 SAND</b> schickt Bob kein ETH — nur die storage-Tabelle ändert sich ② die tx auszuführen kostet trotzdem <b>gas in ETH</b> (Alices ETH kann etwas sinken) ③ der <b>topic0</b> des Events entspricht dem echten Mainnet-ERC-20-Transfer-Hash.",

  // ---------- 4 · Orakel ----------
  "eth.or.h1": "Orakel — die Chain sieht die Welt nicht",
  "eth.or.lead":
    "Contracts können weder Internet noch APIs nutzen, denn jeder Knoten muss <b>dieselbe Berechnung nachspielen</b> — würden sie z. B. einzeln eine Wetter-API abfragen, gelänge es manchen und manchen nicht, oder manche bekämen Daten A und andere B: das <b>Ergebnis würde sich spalten</b>. Externe Daten (Preise, Wetter, Spielergebnisse) müssen <b>von oracle-Knoten als Transaktionen eingespeist werden</b>. So funktioniert Chainlink.",
  "eth.or.reportH": "① Oracle-Knoten melden einen Preis",
  "eth.or.nodesLead":
    "Stell dir jeden Knoten so vor, dass er <b>den Preis, den er auf einer Börsen-API sah</b>, als tx postet. (Echte Chainlink-Knoten sind nicht die Börsen selbst — sie sind <b>unabhängige Betreiber</b>, die mehrere Börsen-/Aggregator-APIs abfragen; hier beschriften wir sie nach Quelle.)",
  "eth.or.reported": "gemeldet",
  "eth.or.why":
    "<b>Warum median?</b> Ein manipulierter Knoten <b>kann den Median nicht bewegen</b>. Gib Coinbase eine absurde Zahl — latestAnswer hält stand. Ein Design mit einem einzigen oracle wird sofort geknackt (ein klassischer DeFi-Hack).",
  "eth.ins.h1": "② Ein Contract, der das Orakel nutzt — Preisversicherung",
  "eth.ins.lead":
    "Deploye eine Versicherung, die 1 ETH zahlt, wenn ETH <b>unter 3.000 $</b> fällt. Über die Auszahlung entscheidet der <b>Median des feeds</b>, kein Mensch. Beobachte, wie <b>Bobs Guthaben</b> unten nach einem erfolgreichen settle steigt.",
  "eth.ins.ledgerH": "Kontenguthaben (Auszahlung verfolgen)",
  "eth.ins.ledgerLead": "Sieh von Anfang an, wie sich Bobs ETH ändert — beim Beitritt und beim settle.",
  "eth.ins.role.underwriter": "Versicherer (füllt den Pool)",
  "eth.ins.role.insured": "Versicherter",
  "eth.ins.role.pool": "Auszahlungspool",
  "eth.ins.threshold": "Schwellenwert (USD)",
  "eth.ins.deploy": "Alice deployt die Versicherung (füllt 1-ETH-Pool)",
  "eth.ins.buy": "Bob tritt bei buyPolicy() — 0,1 ETH",
  "eth.ins.condRule": "Auszahlungsregel: median < {threshold} (gleich = verfallen)",
  "eth.ins.condNoFeed": "Feed hat noch keine Antwort — erst oben oracle report()",
  "eth.ins.condMet": "Aktueller median {median} < {threshold} → settle() zahlt aus ✅",
  "eth.ins.condUnmet": "Aktueller median {median} ≥ {threshold} → settle() zahlt NICHT aus (verfallen)",
  "eth.ins.warn":
    "<b>Das Orakel-Problem:</b> Perfekter Contract-Code scheitert trotzdem, wenn <b>die Daten, die ihn füttern, vergiftet sind</b>. Die Daten selbst zu dezentralisieren — viele Knoten, Mediane, stake-basierte Strafen — ist die Aufgabe von oracle-Netzwerken wie Chainlink.",
  "eth.or.deeperH": "Tiefer: das Orakel-Problem · Third-Party vs. First-Party · Belohnungen und slashing",
  "eth.or.deeperBody":
    "<p><b>Das Orakel-Problem, neu formuliert:</b> On-Chain-Daten bleiben vertrauenswürdig, weil die Mitglieder einander prüfen, aber <b>Off-Chain-Daten lassen sich mit On-Chain-Regeln nicht auf wahr/falsch prüfen</b>. Wie Reisende, die die <b>Einreisekontrolle</b> passieren, brauchen Daten von außen einen Prüfer — doch diesen Job einer einzigen Firma zu geben, zentralisiert wieder alles. Dieses Dilemma ist das Orakel-Problem.</p><p><b>Third-Party-Orakel</b> (Chainlink, Band): Viele Prüfknoten holen die Daten unabhängig und einigen sich (der Median oben ist die Miniversion). Genaue Knoten verdienen <b>Belohnungen (LINK)</b>; falsche <b>verlieren gestakte Coins und Reputation</b> und bekommen künftig weniger Aufträge. Dezentral, aber langsamer, und die Belohnungen werden geteilt.</p><p><b>First-Party-Orakel</b> (PYTH usw.): Börsen/Datenanbieter <b>signieren und veröffentlichen direkt</b>, mit staking gegen Lügen. Schnell und effizient, aber du musst dem Anbieter vertrauen — es kippt Richtung Zentralisierung.</p><p><b>Warum das wichtig ist:</b> Sobald Orakel Vertrauen sichern, können Smart Contracts <b>reale Vermögenswerte (RWA)</b> wie Immobilien und Aktien handhaben. Beachte: Der LINK-Coin ist nicht die Technik selbst — er ist die <b>Belohnung für die Prüfknoten</b>.</p>",

  // ---------- 5 · PoS ----------
  "eth.pos.h1": "Proof of Stake — wer macht Blöcke, und wann sind sie final",
  "eth.pos.lead":
    "Seit The Merge (2022) gibt es kein Mining im Bitcoin-Stil. Die Zeit ist in <b>slots</b> zerteilt (in Wirklichkeit 12-Sekunden-Zellen); pro slot wird ein Validator per <b>stake-gewichteter Zufallsauslosung</b> (in Wirklichkeit RANDAO) gezogen, der einen Block <b>vorschlägt</b>. Die anderen Validatoren prüfen ihn und geben eine <b>attestation (Ja-Stimme)</b> ab. Ein Bündel slots (hier 8, real 32) ist eine <b>epoch</b> — die Stimmen werden pro epoch ausgezählt, um die finality voranzubringen.",
  "eth.pos.statsLead":
    "So liest du es: <b>Slot</b> = in welcher Zeitzelle wir sind · <b>Epoch</b> = Nummer des slot-Bündels · <b>Justified/Finalized</b> = wie weit die zweiphasige finality unten fortgeschritten ist (<b>—</b> = noch keine epoch finalisiert).",
  "eth.pos.chainLead":
    "Jeder Block trägt einen <b>stateRoot</b> — den Fingerabdruck des world state in diesem Moment. Mach in einem anderen Tab eine Überweisung oder einen Contract-Aufruf und rücke dann einen slot vor: Der Fingerabdruck ändert sich. Genau das führen Validatoren vor dem attest erneut aus und vergleichen es. Die <b>attest-Zeile</b> jedes Blocks listet die Validatoren, die für ihn gestimmt haben (✓ gestimmt · ✗ offline).",
  "eth.pos.liveHead": "slot {slot} — <b>{p}</b> schlägt einen Block vor → die anderen attestieren",
  "eth.pos.liveOk": "2/3 erreicht ✓ (zählt für die finality)",
  "eth.pos.liveFail": "unter 2/3 ✗ (finality verzögert)",
  "eth.pos.advance": "⏭ Nächster slot",
  "eth.pos.advance5": "×5 slots",
  "eth.pos.epoch": "Bis epoch-Ende",
  "eth.pos.offline": "Anteil offline Validatoren",
  "eth.pos.reset": "Zurücksetzen",
  "eth.pos.chainH": "Kette (justified → finalized)",
  "eth.pos.twoPhase":
    "<b>Warum zweiphasige finality?</b> Denk an eine Vertragsunterzeichnung — sammeln die Stimmen einer epoch <b>2/3 des stakes</b>, ist diese epoch <b>justified (paraphiert)</b>. Sammelt auch die nächste epoch 2/3, wird die vorige justified zu <b>finalized (beglaubigt)</b> befördert — das ist Casper FFG. Einen finalisierten checkpoint umzukehren erfordert, dass Validatoren widersprüchliche Stimmen signieren, was sofort <b>1/3+ des gesamten stakes per slashing verbrennt</b>. Deshalb ist es \"ökonomisch\" final.",
  "eth.pos.convey":
    "<b>Einheit und Rhythmus der finality:</b> Die finality schreitet pro <b>epoch</b> voran, nicht pro Block. Normalerweise ist es ein Fließband — sammelt epoch 5 2/3, wird epoch 5 justified und <b>die vorige epoch 4 finalized</b> — justified marschiert immer einen Schritt voraus (real wird ein Block ~2 epochs ≈ 13 Minuten nach seiner Entstehung finalisiert). Aber finality wirkt <b>rückwirkend auf alle Vorfahren</b>: Friert ein Stillstand (offline Validatoren) die finality ein paar epochs ein und erholt sich die Beteiligung dann, <b>holt der eingefrorene Abschnitt auf einen Schlag auf</b> — schiebe unten im Experiment den Regler herunter und sieh Finalized springen.",
  "eth.pos.tryOffline":
    "<b>Experiment:</b> Schiebe den Offline-Regler auf <b>34 %+</b> und rücke eine epoch vor — die Stimmen verfehlen 2/3, und <b>justified/finalized bleiben stehen</b>. Blöcke stapeln sich weiter, aber nichts wird finalisiert. Das echte Ethereum begegnet einem längeren Stillstand, indem es den stake der offline Validatoren langsam abschmilzt (<b>inactivity leak</b>), bis 2/3 wiederhergestellt sind.",
  "eth.pos.vsBtc":
    "<b>vs. Bitcoin:</b> PoW-Finalität ist probabilistisch (\"mehr Bestätigungen = sicherer\"). PoS-Gasper ist ökonomische finality — einen 2/3-signierten checkpoint umzukehren verbrennt <b>1/3+ des gesamten stakes per slashing</b>.",
  "eth.pos.proposeCheck":
    "<b>Kann ein Proposer txs manipulieren?</b> Er kann <b>wählen, welche txs er aufnimmt und in welcher Reihenfolge</b> aus dem mempool, aber Betrag/Empfänger fremder txs zu ändern <b>bricht die Signatur → abgelehnt</b> (Tabs 1–2). Er kann eigene frisch signierte txs aufnehmen, aber nur im Rahmen <b>seines eigenen Geldes</b>. Andere Validatoren führen die txs des Blocks erneut aus und prüfen, ob der <b>stateRoot übereinstimmt</b> (Tab 8) — wenn ja attest, wenn nicht Ablehnung.",
  "eth.st.h1": "Validator-Lebenszyklus — staking · slashing",
  "eth.st.lead":
    "Um vorzuschlagen und abzustimmen, stakst du <b>32 ETH</b> und aktivierst. Verstöße wie Doppelsignieren werden <b>geslasht</b> — Sybil-Abwehr per Sicherheit statt PoWs Strom.",
  "eth.st.label": "Validator-Name",
  "eth.st.amt": "Stake (ETH)",
  "eth.st.deposit": "Einzahlen",
  "eth.st.activate": "Letzte Einzahlung aktivieren",
  "eth.st.slashId": "Ziel-ID",
  "eth.st.slash": "Doppelsignatur → slashing",
  "eth.st.offline": "Offline-Strafe",
  "eth.st.listH": "Validatoren",
  "eth.st.slashScale":
    "<b>Warum nur ein Teilabzug statt voller Konfiszierung?</b> Die sofortige Strafe im echten Ethereum ist überraschend klein (etwa <b>1 ETH</b> von 32). Stattdessen wird der Validator <b>dauerhaft ausgeschlossen</b> (auch hier lässt sich Slashed nicht reaktivieren), und entscheidend ist die <b>Korrelationsstrafe</b> — je mehr stake im selben Zeitfenster geslasht wird, desto größer die Strafe. In dem Moment, in dem <b>1/3+ des stakes kolludiert</b>, um einen finalisierten checkpoint umzukehren, verlieren sie <b>alles</b>. Ein einzelner Fehler (Schlüsselverwaltungs-Unfall) wird mild bestraft; ein koordinierter Angriff katastrophal.",
  "eth.st.depOk": "Eingezahlt · Validator #{id} (Pending)",
  "eth.st.actOk": "Aktiviert — nimmt ab dem nächsten slot an Vorschlägen/attestations teil",
  "eth.st.slashOk": "Geslasht — Teil des stakes verbrannt · Status Slashed",
  "eth.st.offOk": "Inactivity-Strafe angewendet",
  "eth.at.h1": "Probiere einen Angriff — Fork · Doppelvorschlag",
  "eth.at.lead":
    "Ein Validator, der mit Vorschlagen dran ist, <b>signiert zwei verschiedene Blöcke für denselben slot</b> und zeigt jeder Netzwerkhälfte eine andere Version (ein Double-Spend-Versuch — die PoS-Version der \"geheimen Kette\" aus BTC-Tab 7). Ergebnis: ① Die Kette gabelt sich, aber ② das Stimmgewicht der ehrlichen Mehrheit hält die Originalkette als head, und ③ <b>zwei Signaturen für denselben slot sind der mathematische Beweis</b> des Betrugs — keine Ausreden, automatisches <b>slashing</b>. Anders als bei BTC verbrennt ein gescheiterter Angriff die Sicherheit, ein neuer Versuch ist unmöglich.",
  "eth.at.sigLayers":
    "<b>Die \"Signatur\" hier ist keine tx-Signatur — es gibt drei Schichten.</b> ① <b>tx-Signatur</b> = \"ich bin es, der dieses Geld sendet\" (Wallet-Schlüssel des Absenders, Tabs 1·2) ② <b>Block-Signatur</b> = \"ich bin es, der diesen Block gebaut hat\" (der Proposer signiert den fertigen Block-Header mit seinem Validator-Schlüssel) ③ <b>attest-Signatur</b> = \"ich bin es, der für diesen Block stimmt\". Der Beweis des Doppelvorschlags ist, dass zwei von ② für denselben slot existieren. Übrigens nutzen Validator-Schlüssel <b>BLS-Signaturen</b> (anders als das Wallet-ECDSA) — Tausende davon lassen sich zu einer verschmelzen (Aggregation), weshalb eine Million Validatoren jede epoch komplett abstimmen können und es trotzdem in einen Block passt.",
  "eth.at.attacker": "Angreifer-Validator-ID",
  "eth.at.fork": "Fork-Angriff (Doppelvorschlag)",
  "eth.at.warn":
    "<b>vs. 51 %:</b> Bitcoin-Double-Spends sind ein Rennen um die \"längere geheime Kette\" — wiederholbar, solange du Strom hast. Einen finalisierten PoS-checkpoint anzugreifen <b>verbrennt die Sicherheit</b>, derselbe Angriff lässt sich also nicht wiederholen.",
};
