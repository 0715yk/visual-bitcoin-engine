// Visual Ethereum Engine i18n — Français
export const ETH_I18N_FR = {
  "eth.header.title": "Visual Ethereum Engine",
  "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · Simulateur éducatif",
  "eth.header.tagline":
    "Un <b>moteur Ethereum</b> (comptes · contrats intelligents · PoS) écrit en Rust, compilé en WebAssembly, qui tourne en direct dans votre navigateur",
  "eth.meta.title": "Visual Ethereum Engine — Simulateur Ethereum interactif",
  "eth.tabs.overview": "Aperçu",
  "eth.tabs.keccak": "1 · Keccak · Adresse",
  "eth.tabs.account": "2 · Comptes · Gas",
  "eth.tabs.contracts": "3 · Contrats intelligents",
  "eth.tabs.tokens": "4 · Jetons (ERC-20)",
  "eth.tabs.oracles": "5 · Oracles",
  "eth.tabs.pos": "6 · Consensus PoS",
  "eth.tabs.realestate": "7 · Immobilier",
  "eth.tabs.evm": "8 · Exécuteur EVM",
  "eth.tabs.merkle": "9 · Preuve de Merkle",
  "eth.tabs.wrapup": "10 · Bilan",
  "eth.ov.o9": "<b>9 · Preuve de Merkle</b> — comment un client léger vérifie une seule valeur sans tout l'état (animé)",
  "eth.ov.o10": "<b>10 · Bilan</b> — tout Ethereum sur une page : le relais, la réexécution et l'analogie Web2",

  // ---------- 9 · Preuve de Merkle ----------
  "eth.mk.nodesH": "D'abord — chaque nœud détient-il tout le world state ?",
  "eth.mk.nodesLead":
    "\"Tout le monde réexécute\" ne marche que si l'on <b>détient l'état</b>. Mais <b>combien</b> un nœud en détient dépend de son type. En particulier, un <b>client léger ne détient aucun état</b>, il vérifie donc les valeurs avec la <b>preuve de Merkle</b> ci-dessous.",
  "eth.mk.colNode": "Type de nœud",
  "eth.mk.colHold": "Détient le world state ?",
  "eth.mk.colDesc": "Détails",
  "eth.mk.fullK": "Nœud complet <small>(le plus courant)</small>",
  "eth.mk.fullHold": "✅ État actuel (récent)",
  "eth.mk.fullDesc":
    "Conserve le world state le plus récent + tous les blocs. <b>Élague l'état intermédiaire très ancien (prune)</b>. Peut reconstruire depuis le genesis en réexécutant si besoin.",
  "eth.mk.archK": "Nœud d'archive",
  "eth.mk.archHold": "✅ Tout l'état historique",
  "eth.mk.archDesc":
    "Conserve un <b>instantané de l'état à chaque bloc</b> depuis le bloc 1. Plusieurs To (pour explorateurs · infrastructure).",
  "eth.mk.lightK": "Client léger",
  "eth.mk.lightHold": "❌ N'en détient aucun",
  "eth.mk.lightDesc":
    "Ne conserve que <b>les en-têtes de bloc</b>. Pour un solde, il interroge un nœud complet et le <b>vérifie via une preuve de Merkle</b> par rapport au stateRoot de l'en-tête.",
  "eth.mk.mergeNote":
    "<b>Depuis The Merge (2022) :</b> un nœud complet Ethereum, ce sont en fait <b>deux programmes</b>. Le <b>client d'exécution</b> (Geth · Nethermind, …) <b>détient le world state et exécute l'EVM</b>, tandis que le <b>client de consensus</b> (Prysm · Lighthouse, …) gère le PoS · attestations · slot/epoch. \"Détenir le world state\" est précisément le rôle du <b>client d'exécution</b>.",
  "eth.mk.conceptH": "Preuve de Merkle — vérifier une valeur sans tout l'état",
  "eth.mk.conceptLead":
    "Un client léger ne fait confiance qu'au <b>seul stateRoot de l'en-tête du bloc</b>. Pour vérifier \"ce solde est-il réel ?\", un nœud complet qui détient l'état n'envoie que <b>quelques hachages frères du chemin</b> ; le client <b>recalcule le hachage de la feuille jusqu'au sommet</b> et le compare au stateRoot. Choisissez un compte ci-dessous et <b>lancez la preuve</b> — le chemin clignote en remontant jusqu'au stateRoot.",
  "eth.mk.conceptWho":
    "<b>Qui le fait ?</b> <b>Pas le proposeur.</b> C'est un échange à la demande entre nœuds : \"celui qui détient l'état (nœud complet) génère la preuve / celui qui ne l'a pas (client léger) la vérifie\".",
  "eth.mk.simH": "Simulateur d'arbre de Merkle",
  "eth.mk.lieTitle": "Et si le nœud complet déclarait un solde faux ?",
  "eth.mk.lieLabel": "😈 Le nœud complet ment (solde falsifié)",
  "eth.mk.run": "▶ Lancer la preuve",
  "eth.mk.reset": "↺ Réinitialiser",
  "eth.mk.proofH": "Ce que le nœud complet envoie <small>(hachages frères + valeur)</small>",
  "eth.mk.verifyH": "Le recalcul du client léger",
  "eth.mk.whyH": "Pourquoi c'est infalsifiable",
  "eth.mk.why1":
    "Un hachage <b>change complètement dès qu'une seule valeur change.</b> Donc si un nœud complet gonfle un solde, le stateRoot que recalcule le client léger <b>ne correspondra pas à celui de l'en-tête</b>. Activez l'interrupteur <b>😈 mensonge</b> ci-dessus et lancez pour le voir — l'essentiel est de vérifier l'authenticité avec quelques hachages <b>sans faire confiance au nœud complet</b>.",
  "eth.mk.why2":
    "<b>Analogie git :</b> fichiers (comptes) → hachages de répertoire (nœuds intermédiaires) → hachage final de l'arbre (stateRoot). Comme faire confiance à un seul hachage de commit permet de <b>vérifier partiellement</b> qu'un fichier donné est vraiment dans ce commit.",
  "eth.mk.legend":
    "Partez des <b>feuilles (comptes)</b> ci-dessous, <b>appariez chacune avec son frère et faites keccak</b>, en remontant <b>vers le haut (↑)</b> d'un niveau à la fois. Le sommet, c'est le <b>stateRoot</b>.",
  "eth.mk.up1": "↑ Concaténez les deux nœuds (N01, N23) et faites keccak",
  "eth.mk.up2": "↑ Concaténez les deux feuilles frères et faites keccak",
  "eth.mk.grpRoot": "combiner → stateRoot",
  "eth.mk.grpN01": "combiner → N01",
  "eth.mk.grpN23": "combiner → N23",
  "eth.mk.prove": "Prouver {name}",
  "eth.mk.claim": "Valeur déclarée",
  "eth.mk.forged": "⚠ falsifié",
  "eth.mk.sib1": "Hachage frère ①",
  "eth.mk.sib2": "Hachage frère ②",
  "eth.mk.posR": "droite",
  "eth.mk.posL": "gauche",
  "eth.mk.step1":
    "① Partez du hachage de la feuille de <b>{name}</b>. <span class=\"mono\">keccak({name}:{bal}) = {hash}</span>",
  "eth.mk.step2":
    "② Ajoutez la feuille frère <span class=\"mono\">{sib}</span> à {pos} et refaites keccak → on monte au parent <b>{parent}</b>.",
  "eth.mk.step3":
    "③ Ajoutez le nœud frère <span class=\"mono\">{sib}</span> à {pos} et faites keccak → recalcul du <b>stateRoot</b> !",
  "eth.mk.step4ok":
    "④ Le résultat recalculé <b>correspond au stateRoot de l'en-tête</b>. Vérifié avec seulement 2 hachages frères — sans tout l'état !",
  "eth.mk.step4bad":
    "④ Falsifier une valeur a rendu le <b>hachage du sommet complètement différent.</b> Il ne correspond pas au stateRoot de l'en-tête, donc le client léger le rejette aussitôt.",
  "eth.mk.vOk":
    "✔ stateRoot recalculé = stateRoot de l'en-tête<br/><span class=\"mono\">{root}</span> — <b>ce solde est réel.</b> Vérifié sans faire confiance au nœud complet.",
  "eth.mk.vBad":
    "✘ Recalculé <span class=\"mono\">{comp}</span> ≠ en-tête <span class=\"mono\">{header}</span><br/><b>Non concordant → mensonge démasqué.</b> Un solde falsifié ne peut jamais produire le même stateRoot.",

  // ---------- 10 · Bilan ----------
  "eth.wrap.heroH": "Bilan — Ethereum synthétise un \"serveur qui ne s'arrête jamais\" à partir d'un <em>relais</em>",
  "eth.wrap.heroLead":
    "Web2.0 a <b>un serveur central</b> qui tourne 24h/24. Ethereum <b>n'a pas</b> un tel serveur. À la place, <b>un nœud différent prend le témoin (bloc) à chaque slot</b>, faisant avancer l'état d'un cran, tandis que les autres nœuds <b>le revérifient eux-mêmes</b>. Le \"serveur qui ne se repose jamais\" est une <b>illusion synthétisée par des milliers de nœuds qui font le relais à tour de rôle</b>.",
  "eth.wrap.woA": "1 serveur central (24h/24)",
  "eth.wrap.woArrow": "→ remplacé par →",
  "eth.wrap.woB": "des milliers de nœuds incités · relais du témoin à chaque slot + revérification mutuelle",
  "eth.wrap.relayH": "Le relais — le témoin, c'est le <span class=\"wr-hl-block\">bloc + stateRoot</span>",
  "eth.wrap.relayLead":
    "À chaque slot (12s), <b>un nœud proposeur tiré au sort</b> exécute les tx pour construire le nouveau world state et stateRoot (crée le témoin) et le passe au slot suivant. <b>Les autres validateurs prennent le témoin et le réexécutent</b>, notant si le stateRoot correspond et votant. Tous les 32 slots (= 1 epoch), une fois assez de votes accumulés, il devient <b>finalized</b> — verrouillé, irréversible.",
  "eth.wrap.sec": "12s",
  "eth.wrap.p1": "🏃 Proposeur <b>#7</b><small>tirage RANDAO</small>",
  "eth.wrap.p2": "🏃 Proposeur <b>#42</b><small>passe à un autre nœud</small>",
  "eth.wrap.p3": "🏃 Proposeur <b>#13</b><small>tente de falsifier le stateRoot</small>",
  "eth.wrap.baton1": "📦 Bloc<br/><span class=\"mono\">stateRoot: a1c3…</span>",
  "eth.wrap.baton2": "📦 Bloc<br/><span class=\"mono\">stateRoot: 9f0b…</span>",
  "eth.wrap.baton3": "📦 Bloc<br/><span class=\"mono\">stateRoot: ☠ falsifié</span>",
  "eth.wrap.reexec": "✔ Les validateurs réexécutent",
  "eth.wrap.agree": "≥ 2/3 d'accord",
  "eth.wrap.handoff": "transmettre<br/>l'état",
  "eth.wrap.mismatch": "✘ réexécution → écart",
  "eth.wrap.rejected": "rejeté · témoin abandonné",
  "eth.wrap.justified": "justified ✔",
  "eth.wrap.finalized": "finalized 🔒 (irréversible)",
  "eth.wrap.epochLen": "1 epoch = 32 slots",
  "eth.wrap.pt1":
    "<b>Point 1 · Pas d'exécution permanente :</b> aucun nœud ne \"tourne 24h/24 comme un serveur\". Il se réveille pour revérifier <b>seulement quand un témoin arrive (= un bloc arrive)</b>, puis se rendort. Même idée que le code d'un contrat qui <b>dort s'il n'y a pas de tx</b> (exécution passive).",
  "eth.wrap.pt2":
    "<b>Point 2 · La falsification est écartée, pas punie :</b> un bloc au stateRoot falsifié (slot 102) est détecté lors de la revérification et <b>simplement rejeté/ignoré</b>. Le slashing n'arrive que pour des attaques du consensus lui-même, comme la <b>double signature ou les votes contradictoires</b>.",
  "eth.wrap.pt3":
    "<b>Point 3 · La continuité est un artefact :</b> slot · epoch · votes · pénalités s'emboîtent comme des engrenages pour produire <b>l'apparence d'\"un serveur qui ne s'arrête jamais\".</b> La réalité, c'est <b>un relais couru à tour de rôle où chacun revérifie les autres</b>.",
  "eth.wrap.vsH": "Serveur Web2.0 vs le relais Ethereum",
  "eth.wrap.web2H": "Web2.0 — serveur central",
  "eth.wrap.web2List":
    "<li><b>Une machine</b> tourne 24h/24 (un processus résident)</li><li>Ce qu'elle calcule est <b>digne de confiance</b></li><li>Base de la confiance = <b>l'entreprise opératrice</b></li><li>L'entreprise peut <b>changer valeurs/logique</b> à volonté</li><li>Si elle s'arrête, le service s'arrête (point unique de défaillance)</li>",
  "eth.wrap.web3H": "Web3.0 — Ethereum",
  "eth.wrap.web3List":
    "<li><b>Pas de serveur permanent.</b> À chaque slot <b>un nœud différent prend le témoin</b></li><li>Des milliers de nœuds <b>réexécutent et comparent tous</b> (vérifier, pas faire confiance)</li><li>Base de la confiance = <b>incitations économiques + théorie des jeux</b> (stake · récompenses · slashing)</li><li>Le code est <b>immuable</b>. Personne ne peut changer le résultat</li><li>Si des nœuds tombent, les autres poursuivent le relais</li>",
  "eth.wrap.vsConcl":
    "<b>En une ligne :</b> là où Web2 justifiait la centralisation par <b>\"une entreprise digne de confiance\",</b> Ethereum l'a remplacée par <b>\"une conception d'incitations où l'on n'a pas besoin de faire confiance (psychologie humaine)\".</b> L'essentiel est de résoudre la centralisation non par la technique mais par <b>l'économie et la théorie des jeux</b>.",
  "eth.wrap.sumH": "Tout ce qu'on a clarifié",
  "eth.wrap.sumFlow":
    "<div class=\"node\"><div class=\"n\">1</div><div class=\"t\">Le code dort</div><div class=\"d\">Un contrat n'est que des données stockées dans l'état. Il ne s'exécute que quand une tx l'appelle (passif).</div></div><div class=\"node\"><div class=\"n\">2</div><div class=\"t\">Pas d'exécution automatique</div><div class=\"d\">\"Exécuter au-dessus de 3000\" nécessite un <b>keeper/bot</b> hors chaîne qui surveille et appelle via tx. Le prix est fourni par un <b>oracle</b>.</div></div><div class=\"node\"><div class=\"n\">3</div><div class=\"t\">Tout le monde réexécute</div><div class=\"d\">Chaque nœud calcule sur <b>sa propre copie</b>. Donc v+1 fait N fois n'est pas v+N mais v+1 partout (N personnes résolvant le même problème).</div></div><div class=\"node\"><div class=\"n\">4</div><div class=\"t\">Le déterminisme est requis</div><div class=\"d\">Pas d'aléa, d'API externes ni d'heure courante. Sinon chaque nœud obtient une réponse différente et la revérification casse.</div></div><div class=\"node\"><div class=\"n\">5</div><div class=\"t\">Faux = écarté / attaque = slashing</div><div class=\"d\">stateRoot erroné → rejeté. Double signature / votes contradictoires → slashing. Hors ligne → petite pénalité.</div></div><div class=\"node\"><div class=\"n\">6</div><div class=\"t\">justified → finalized</div><div class=\"d\">Une fois verrouillé par un vote des 2/3, c'est irréversible. Le bloc est alors confirmé dans le world state.</div></div>",
  "eth.wrap.sumConcl":
    "<b>Conclusion :</b> un contrat intelligent n'est pas un \"programme qui vit tout seul\" mais un <b>moteur de règles immuable qui ne bouge que comme promis quand on l'appelle</b>, et <b>qui l'appelle, et quand</b>, cela reste dans le monde humain (Web2). Ethereum semble dépendre de Web2 <b>non parce qu'il est impur, mais parce qu'il tente de faire plus</b>.",

  // ---------- 7 · Escrow immobilier ----------
  "eth.re.h1": "Une vente immobilière sur Ethereum — le contrat escrow",
  "eth.re.lead":
    "Ici, tout ce que vous avez appris se rassemble en <b>une seule transaction réelle</b>. Dans l'immobilier traditionnel, une <b>société d'escrow, le registre foncier et un agent</b> portent la confiance. Ici, c'est le <b>code (un contrat)</b> qui joue ce rôle — il verrouille les fonds et ne les remet au vendeur qu'une fois les conditions confirmées. Observez comment <b>tx · nonce · gas · storage · blocs · stateRoot</b> évoluent à chaque étape.",
  "eth.re.name": "Bien",
  "eth.re.seller": "Vendeur",
  "eth.re.buyer": "Acheteur",
  "eth.re.inspector": "Inspecteur",
  "eth.re.price": "Prix (ETH)",
  "eth.re.fee": "Frais d'inspecteur (ETH)",
  "eth.re.reset": "Réinitialiser",
  "eth.re.step1": "① Mettre en vente (deploy)",
  "eth.re.step2": "② Déposer les fonds (deposit)",
  "eth.re.step3": "③ Confirmer le titre (confirm)",
  "eth.re.step4": "④ Payer le vendeur (release)",
  "eth.re.stepRefund": "Annuler · rembourser (refund)",
  "eth.re.role.buyer": "Acheteur",
  "eth.re.role.seller": "Vendeur",
  "eth.re.role.inspector": "Inspecteur",
  "eth.re.role.contract": "Contrat escrow",
  "eth.re.flow.deposit": "① deposit",
  "eth.re.flow.confirm": "② confirm",
  "eth.re.flow.release": "③ release",
  "eth.re.priceLbl": "Prix",
  "eth.re.feeLbl": "Frais d'inspecteur",
  "eth.re.state.None": "Non listé",
  "eth.re.state.Listed": "Listé (en attente des fonds)",
  "eth.re.state.Funded": "Fonds verrouillés (en attente de confirmation)",
  "eth.re.state.Confirmed": "Confirmé (en attente du paiement)",
  "eth.re.state.Released": "Vente conclue ✅",
  "eth.re.state.Refunded": "Annulée (remboursée)",
  "eth.re.hintStart":
    "<b>Départ :</b> quand le vendeur (<b>Bob</b>) clique sur <b>① Mettre en vente</b>, le contrat Escrow est <b>déployé</b>. C'est un compte dédié + des règles pour cette seule vente.",
  "eth.re.hintListed":
    "<b>Ensuite :</b> l'acheteur (<b>Alice</b>) fait <b>② Déposer les fonds</b>. L'argent est verrouillé dans le <b>contrat, pas chez le vendeur</b> — personne ne peut le prendre avant que les conditions soient remplies. (msg.value doit être exactement égal au prix.)",
  "eth.re.hintFunded":
    "<b>Ensuite :</b> l'<b>inspecteur neutre (Carol)</b> fait <b>③ Confirmer le titre</b>. Seul l'inspecteur peut l'appeler (imposé par le code), et aucun fonds ne bouge avant la confirmation. Si Alice tente confirm, la transaction <b>revert</b>.",
  "eth.re.hintConfirmed":
    "<b>Dernière étape :</b> cliquez sur <b>④ Payer le vendeur</b> et le contrat <b>répartit les fonds verrouillés</b> — des <b>frais pour l'inspecteur</b>, le reste pour le <b>vendeur</b>. L'inspecteur qui a fait le travail est payé automatiquement par le code.",
  "eth.re.hintReleased":
    "<b>Terminé ✅</b> les soldes du vendeur et de l'<b>inspecteur (frais)</b> ont augmenté et le verrou du contrat est maintenant à 0. Voyez le solde de l'inspecteur monter dans le registre et le stateRoot changer dans l'explorateur de blocs. Lancez une nouvelle vente avec <b>Réinitialiser</b>.",
  "eth.re.hintRefunded":
    "<b>Annulée :</b> comme c'était avant la confirmation, les fonds ont été <b>remboursés atomiquement à l'acheteur</b> — tout ou rien, pas d'état à moitié. Lancez une nouvelle vente avec <b>Réinitialiser</b>.",
  "eth.re.msgDeployed": "Escrow déployé · {addr} · nonce {nonce}",
  "eth.re.stateH": "État actuel du contrat · des comptes",
  "eth.re.stateLead":
    "À gauche : soldes en direct, storage du contrat et événements. À droite : le code Solidity qui définit les règles — la fonction que vous venez d'appeler s'illumine.",
  "eth.re.ledgerH": "Soldes des comptes (parties prenantes)",
  "eth.re.blocksH": "Comment ça s'empile en blocs — tx + stateRoot",
  "eth.re.blocksLead":
    "Chaque étape est une <b>transaction</b> ; une fois dans un bloc, l'empreinte de l'état complet — le <b>stateRoot</b> — change. Comme des commits git, rien n'est modifié : <b>les nouveaux blocs s'empilent vers l'avant</b>. (Le stateRoot ici est un keccak-256 de l'instantané comptes+contrats de cette simulation.)",
  "eth.re.blocksNote":
    "<b>Comment lire :</b> chaque bloc montre sa tx (qui · quelle fonction) et le <code>stateRoot</code> juste après. Une tx qui change l'état rend le stateRoot <b>complètement différent</b> ; une tx qui revert ne change rien, donc le stateRoot reste le même.",
  "eth.re.blocksEmpty": "Pas encore de blocs — lancez une étape.",
  "eth.re.genesisTx": "État genèse (avant la vente)",
  "eth.re.srDiff": "stateRoot changé",
  "eth.re.srSame": "stateRoot inchangé (revert)",
  "eth.re.vsH": "Immobilier traditionnel ↔ escrow Ethereum",
  "eth.re.vsCol1": "Rôle",
  "eth.re.vsCol2": "Vente traditionnelle",
  "eth.re.vsCol3": "Escrow Ethereum",
  "eth.re.vsRows":
    "<tr><td class=\"k\">Garde des fonds</td><td>Société d'escrow · compte bancaire</td><td><b>Verrouillés dans le contrat</b> (personne ne peut les prendre)</td></tr><tr><td class=\"k\">Vérification des conditions</td><td>Registre · notaire · agent</td><td><b>tx de l'inspecteur</b> (confirm)</td></tr><tr><td class=\"k\">Paiement</td><td>Un humain fait le virement (retards · erreurs)</td><td><b>Le code, automatiquement</b> (seulement si la condition est remplie)</td></tr><tr><td class=\"k\">Annulation · remboursement</td><td>Litiges · procès possibles</td><td><b>Remboursement atomique via refund()</b></td></tr><tr><td class=\"k\">En qui on a confiance</td><td>Plusieurs institutions et personnes</td><td><b>Le code déployé</b> (immuable)</td></tr><tr><td class=\"k\">Registre</td><td>Registres par institution (cloisonnés)</td><td><b>Blocs · stateRoot</b> (publics · vérifiables)</td></tr>",
  "eth.re.vsWhy":
    "<b>Le point clé :</b> ce qui a changé, c'est <i>en qui on a confiance</i>. La confiance, autrefois dispersée entre institutions et personnes, se concentre maintenant dans <b>un morceau de code impossible à modifier après déploiement</b>. Le revers : <b>si le code a un bug, c'est aussi la règle</b> (onglet 3), d'où les audits pour les services réels.",

  // ---------- Aperçu ----------
  "eth.ov.h1": "Ethereum est « un registre qui exécute du code »",
  "eth.ov.lead":
    "Si Bitcoin est un <b>registre d'argent</b>, Ethereum est un registre sur lequel on peut poser des <b>programmes (contrats intelligents)</b>. Une fois déployé, le code ne peut être changé par personne, et il <b>s'exécute automatiquement</b> quand les conditions sont remplies. Depuis The Merge, le consensus est <b>Proof of Stake</b> — les validators misent 32 ETH pour proposer et attester les blocs.",
  "eth.ov.btcN": "Bitcoin",
  "eth.ov.btcT": "PoW · UTXO · registre d'argent",
  "eth.ov.btcD":
    "Enregistre « qui possède combien ». Script minimal. Tout misé sur la sécurité et la simplicité.",
  "eth.ov.ethN": "Ethereum",
  "eth.ov.ethT": "PoS · comptes · registre exécuteur de code",
  "eth.ov.ethD":
    "Enregistre les soldes + <b>le code et le storage des contrats</b>. Jetons, bourses, assurances — tout devient « programme sur la chaîne ».",
  "eth.ov.why":
    "<b>En une ligne :</b> un contrat intelligent est <b>un coffre-fort qui ne bouge que selon des règles écrites à l'avance</b>. Une banque peut modifier ses conditions ; un contrat déployé, lui, ne peut être changé — <b>pas même par son créateur</b>. Déployez-en un et appelez-le vous-même sur ce site.",
  "eth.ov.cross":
    "← La validation fonctionne exactement comme dans les onglets Bitcoin : chaque nœud <b>vérifie les règles tout seul</b>. Ce qui diffère, c'est la défense anti-Sybil — PoW utilise l'électricité, PoS un dépôt de garantie (32 ETH + slashing).",
  "eth.ov.orderH": "Parcours recommandé",
  "eth.ov.o1": "<b>1 · Keccak · Adresse</b> — comment les adresses naissent des hachages (vs SHA-256)",
  "eth.ov.o2": "<b>2 · Comptes · Gas</b> — solde · nonce · frais EIP-1559 (vs UTXO)",
  "eth.ov.o3": "<b>3 · Contrats intelligents</b> — déployer → appeler → storage · événements · gas (le cœur)",
  "eth.ov.o4": "<b>4 · Jetons (ERC-20)</b> — un token est la table de soldes d'un contrat (exemple SAND)",
  "eth.ov.o5": "<b>5 · Oracles</b> — la chaîne ne voit pas le monde · price feed façon Chainlink · assurance",
  "eth.ov.o6": "<b>6 · Consensus PoS</b> — slots → attest → justified/finalized · slashing",
  "eth.ov.o7": "<b>7 · Immobilier</b> — un escrow qui relie tout ce que tu as appris (synthèse)",
  "eth.ov.o8": "<b>8 · Exécuteur EVM</b> — parcours le bytecode pas à pas pendant son exécution",

  // ---------- 1 · Comptes · Gas ----------
  "eth.acc.h1": "Les comptes stockent les soldes « comme un nombre » (un choix différent de l'UTXO)",
  "eth.acc.lead":
    "Bitcoin <i>calculait</i> votre solde en additionnant des fragments de pièces (UTXO). Ethereum stocke un <b>nombre de solde directement, comme un compte bancaire</b>. Envoyer, c'est juste <b>baisser votre nombre et augmenter le leur</b> — pas de monnaie rendue, pas de fragments UTXO. Essayez.",
  "eth.acc.feeBoxH": "Déplier les formules de frais (EIP-1559)",
  "eth.acc.feeBoxBody":
    "<p><b>Unités :</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>. Le tip est en <b>Gwei/gas</b>, pas en ETH.</p><p><b>Pourquoi ×21 000 ?</b> Le Gwei est un prix unitaire par gas ; un transfert d'ETH simple consomme un montant fixe de <span class=\"mono\">21,000</span> gas. (Jetons/contrats en consomment plus.)</p><ul class=\"tight\"><li><b>gas used</b> = 21,000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">(fixe dans cette simulation)</span> → brûlé</li><li><b>tip</b> = valeur saisie T Gwei/gas → proposer du bloc</li></ul><pre class=\"mono eth-fee-formula\">brûlé = 21,000 × 10 × 10⁻⁹ = 0.000210 ETH\ntip  = 21,000 × T × 10⁻⁹ ETH → proposer\npayé = value + brûlé + tip</pre><p class=\"small muted\">Exemple : T=5 → tip = 0.000105 ETH. Pas « 5 ETH de tip ».</p>",
  "eth.acc.shortWhy":
    "<b>En bref :</b> <b>value → destinataire</b>, <b>tip → proposer</b>, <b>base fee → brûlé</b>. Regardez les soldes bouger et la valeur <b>n=</b> (nonce) augmenter de un à droite.",
  "eth.acc.vsH": "UTXO Bitcoin ↔ compte Ethereum",
  "eth.acc.vsCol1": "Aspect",
  "eth.acc.vsCol2": "Bitcoin (UTXO)",
  "eth.acc.vsCol3": "Ethereum (compte)",
  "eth.acc.vsRows":
    "<tr><td class=\"k\">Solde</td><td>Somme des fragments de pièces (UTXO) — pas stocké directement</td><td>Stocké <b>directement comme un nombre</b></td></tr><tr><td class=\"k\">Envoi</td><td>Consommer des UTXO entiers + créer la <b>monnaie</b></td><td>Votre solde <b>−</b>, le leur <b>+</b> (pas de monnaie rendue)</td></tr><tr><td class=\"k\">Anti-réutilisation</td><td>Un UTXO est <b>détruit</b> une fois dépensé (automatique)</td><td>Protégé par un numéro <b>nonce</b> (carte ci-dessous)</td></tr><tr><td class=\"k\">Parallélisme</td><td>Des UTXO différents se traitent facilement en même temps</td><td>Un compte est <b>sériel</b> (ordre des nonces)</td></tr><tr><td class=\"k\">État des contrats</td><td>Difficile à exprimer</td><td><b>Naturel</b> via solde + storage</td></tr>",
  "eth.acc.vsWhy":
    "<b>Pourquoi cette divergence ?</b> Bitcoin, centré sur « l'argent », a choisi l'UTXO pour sa <b>simplicité, son parallélisme et sa confidentialité</b> ; Ethereum devait suivre <b>l'état des programmes (contrats)</b>, donc un <b>modèle de comptes</b> qui lit directement « combien / quelle valeur cette adresse détient maintenant » était plus commode. Ni meilleur ni pire — <b>des conceptions aux objectifs différents</b>.",
  "eth.acc.whereH": "Mais où exactement ce solde est-il stocké ?",
  "eth.acc.whereBody":
    "<p>« Stocké directement » ne veut pas dire que le solde est <b>dans un bloc</b>. Il vit dans le <b>world state</b> que chaque nœud maintient — une immense map <code>adresse → objet compte</code>. Un compte, c'est juste 4 champs.</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>Champ</th><th>Signification</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>Nombre de tx envoyées par ce compte (le numéro de la carte ci-dessous)</td></tr><tr><td class=\"k\">balance</td><td><b>Solde (en wei)</b> ← ici</td></tr><tr><td class=\"k\">storageRoot</td><td>Hachage résumé du storage du contrat (vide pour les EOA)</td></tr><tr><td class=\"k\">codeHash</td><td>Hachage du code du contrat (vide pour les EOA)</td></tr></tbody></table><p>Portefeuilles (EOA) et contrats partagent la <b>même structure</b> ; un portefeuille laisse simplement les deux derniers champs vides.</p><p><b>Ce qui va dans un bloc :</b> seul le hachage sommet de l'arbre de hachage de toute la map = le <b>state root</b> est écrit dans l'<b>en-tête du bloc</b>. Les nombres de solde eux-mêmes sont conservés par chaque nœud, qui met à jour sa propre base en exécutant les transactions. Donc un bloc = <b>« l'empreinte de l'état à ce moment (state root) » + « les tx de ce bloc »</b>.</p><p class=\"small muted\"><b>↔ Bitcoin :</b> Bitcoin n'a aucun endroit qui stocke un solde — les nœuds gardent l'<b>ensemble UTXO</b> et calculent à la volée « la somme des UTXO dépensables par mon adresse ». Ethereum garde un <b>nombre de solde par adresse</b> directement, donc une consultation = une seule lecture.</p>",
  "eth.acc.nonceH": "nonce — le « numéro anti-réutilisation » du modèle de comptes",
  "eth.acc.nonceLead":
    "Un nonce est un <b>compteur de transactions par compte</b> (0, 1, 2, …). Voyons pourquoi il est indispensable.",
  "eth.acc.nonceProblem":
    "<b>Problème :</b> un solde en ETH n'est qu'un <b>nombre</b>. Si quelqu'un <b>rediffuse 10 fois votre tx signée « 1 ETH à Bob »</b> ? Dans Bitcoin, l'UTXO dépensé a déjà disparu, donc c'est bloqué automatiquement — mais un compte n'a qu'un solde, donc <b>rien ne l'empêche.</b>",
  "eth.acc.nonceBox":
    "<span class=\"who\">{who}</span><span class=\"note\"> — nonce actuel</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ la prochaine tx est #{cur}, en cas de succès</span> <span class=\"nxt\">{next}</span></span>",
  "eth.acc.nonceRoles":
    "<b>Solution — le nonce fait deux choses à la fois :</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① Protection anti-rejeu (replay)</b> — chaque numéro sert exactement une fois. Une tx avec un nonce déjà utilisé est rejetée, donc les rediffusions échouent.</li><li><b>② Ordre garanti</b> — obligatoirement 0 → 1 → 2. Une tx qui saute un numéro attend (pending) que les précédentes passent.</li></ul>",
  "eth.acc.nonceSig":
    "<b>🔑 Lien avec la signature de l'onglet 1 :</b> le nonce fait <b>partie de ce que vous signez</b> (le sighash). Donc même un transfert identique produit une <b>signature complètement différente quand le nonce diffère</b> → rejouer une vieille signature échoue car ce nonce est déjà consommé. « La signature verrouille le contenu » devient ici la protection anti-réutilisation.",
  "eth.acc.nonceDeeperH": "Plus loin : tx pending / bloquée · trou de nonce · adresses de contrat",
  "eth.acc.nonceDeeperBody":
    "<p><b>Tx bloquée (stuck) :</b> si le nonce 5 est envoyé avec des frais trop bas et stagne, les nonces 6·7 <b>doivent attendre</b> (ordre oblige). Solution : renvoyer le même nonce 5 avec des frais plus élevés pour <b>l'écraser</b>.</p><p><b>Trou de nonce (nonce gap) :</b> si vous envoyez par erreur 7 après 5, alors 7 <b>attend indéfiniment</b> l'arrivée du 6 — le mempool le garde en attendant le 6.</p><p><b>Lien avec les adresses de contrat :</b> comme à l'onglet 1, adresse de contrat = <code>keccak(adresse du déployeur + nonce)</code>. Donc <b>même le même déployeur obtient une nouvelle adresse à chaque fois</b>, car le nonce augmente.</p>",
  "eth.acc.gasH": "Gas · EIP-1559 — comment les frais se répartissent",
  "eth.acc.gasLead":
    "Changez le tip lors de l'envoi et l'aperçu ci-dessus (brûlé · tip · payé) se met à jour en direct. Voici d'où viennent ces nombres.",
  "eth.acc.gasWhat":
    "<b>C'est quoi, le gas ?</b> Chaque calcul et chaque écriture en storage utilisent les ressources des nœuds. Le gas est l'<b>unité qui mesure ce travail</b>. Un simple transfert d'ETH est fixé à <b>21 000 gas</b> par le protocole (jetons/contrats coûtent plus). <b>Frais = gas × prix par gas</b> — ça décourage le spam et récompense les validators.",
  "eth.acc.gasEip":
    "<b>EIP-1559 — le prix a deux parties :</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — fixée <b>automatiquement selon la congestion</b>. Fixe à <b>10 Gwei/gas</b> ici. → ne va à personne : elle est <b>brûlée (burn)</b>.</li><li><b>priority tip</b> — le supplément que vous choisissez (champ ci-dessus). → va au <b>proposer (validator)</b> du bloc.</li></ul>",
  "eth.acc.burnWhy":
    "<b>🔥 Ce que signifie brûler :</b> l'ETH payé en base fee est <b>perdu pour toujours</b>. Plus le réseau est chargé, plus on en brûle, créant une <b>pression déflationniste qui réduit le total d'ETH</b>. La direction rappelle Bitcoin qui « ralentit l'émission via les halvings », mais Ethereum <b>brûle des pièces qui existent déjà</b>.",
  "eth.acc.propTag": "proposer",
  "eth.acc.burnLbl": "brûlé",
  "eth.acc.from": "De",
  "eth.acc.to": "À",
  "eth.acc.amt": "Montant (ETH)",
  "eth.acc.gas": "tip (Gwei/gas)",
  "eth.acc.feePreview": "brûlé {burn} · tip {tip} → {prop} · {from} paie {paid}",
  "eth.acc.send": "Envoyer",
  "eth.acc.sendFail": "Envoi échoué",

  // ---------- 1 · Keccak · Adresse ----------
  "eth.kc.h1": "Keccak-256 — le hachage qui fabrique les « ids » d'Ethereum",
  "eth.kc.lead":
    "Presque chaque id que vous croisez dans Ethereum — adresses, sélecteurs de fonction, topics d'événement, adresses de contrat — vient de ce seul hachage. Même usage que le SHA-256 de Bitcoin, mais Ethereum utilise <b>Keccak-256</b>. Commencez par hacher quelque chose.",
  "eth.kc.playIn": "Entrée (n'importe quel texte)",
  "eth.kc.playOutLbl": "Keccak-256 (entrée de toute longueur → toujours 32 octets = 64 hex)",
  "eth.kc.avalanche":
    "<b>Effet d'avalanche :</b> changez un caractère et environ la moitié des bits du résultat basculent. Impossible de l'inverser (hachage→entrée), et la même entrée donne toujours le même résultat — mêmes propriétés que SHA-256.",
  "eth.kc.sha3H": "Piège : Keccak-256 ≠ NIST SHA3-256",
  "eth.kc.sha3Body":
    "<p>Ethereum utilise le Keccak original d'<b>avant</b> la finalisation du standard, donc il diffère du SHA3-256 du NIST par <b>un octet de padding</b>. Même entrée, résultat complètement différent.</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (pad 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (pad 0x06)</pre><p class=\"small muted\">Voilà pourquoi appeler <code>sha3_256</code> dans une bibliothèque ne produit pas d'adresses Ethereum. Il faut utiliser <code>keccak256</code>.</p>",
  "eth.kc.addrH": "Adresse = les « 20 derniers octets » de keccak(clé publique)",
  "eth.kc.addrLead":
    "Une adresse de portefeuille, c'est la clé publique passée dans Keccak, puis tronquée aux <b>20 derniers octets</b>. (Cette démo hache un nom au lieu d'une clé publique — même règle.)",
  "eth.kc.addrIn": "Entrée (démo : nom → hachage → adresse)",
  "eth.kc.hashLbl": "① Keccak-256 complet (32 octets) — les 12 premiers octets grisés, seuls les 20 derniers servent",
  "eth.kc.addrLbl": "② Adresse = 20 derniers octets + 0x",
  "eth.kc.addrWhy":
    "<b>Pourquoi jeter les 12 premiers octets ?</b> Le hachage fait 32 octets mais une adresse n'a besoin que de <b>20 octets (160 bits)</b> — la forme courte économise de l'espace tout en gardant <b>la probabilité que deux personnes différentes tombent sur la même adresse pratiquement nulle</b> (cette coïncidence s'appelle une « collision de hachage » — avec 20 octets il y a 2¹⁶⁰ possibilités, donc ça n'arrive pratiquement jamais). Les vraies clés hachent les coordonnées X·Y de secp256k1 (<b>64 octets</b>, sans le préfixe 0x04).",
  "eth.kc.idsH": "Keccak partout dans Ethereum — un aperçu rapide",
  "eth.kc.idsLead":
    "Ethereum utilise Keccak à de nombreux endroits. Chaque usage <b>hache une entrée différente</b> puis <b>ne garde que la partie utile</b>. Pour l'instant, cliquez un peu partout pour sentir que « Keccak apparaît partout » — ce que sont vraiment les sélecteurs, topics et adresses de contrat est couvert dans les onglets suivants.",
  "eth.kc.selH": "① Sélecteur de fonction — les <b>4 premiers octets</b> du hachage de la signature",
  "eth.kc.selLead":
    "L'id qui dit « quelle fonction ? » lors d'un appel. C'est le préfixe utilisé quand vous appelez buy()/transfer() à l'onglet 3.",
  "eth.kc.selIn": "Signature de fonction",
  "eth.kc.selOut":
    "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ sélecteur <b class=\"mono\">0x{sel}</b> <span class=\"muted\">(8 premiers hex = 4 octets)</span>",
  "eth.kc.topicH": "② topic0 d'événement — les <b>32 octets complets</b> du hachage de la signature",
  "eth.kc.topicLead":
    "La valeur qui marque un log comme « ceci est un événement Transfer ». C'est le topic0 des journaux d'événements des onglets 3 et 4.",
  "eth.kc.topicIn": "Signature d'événement",
  "eth.kc.topicOut":
    "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">(les 32 octets gardés tels quels)</span>",
  "eth.kc.caH": "③ Adresse de contrat — 20 derniers octets de keccak(<b>adresse du déployeur + nonce</b>)",
  "eth.kc.caLead":
    "Chaque déploiement incrémente le nonce, donc l'adresse change à chaque fois. Déployer le distributeur à l'onglet 3 utilise exactement cette règle.",
  "eth.kc.caDeployer": "Déployeur (nom)",
  "eth.kc.caNonce": "nonce",
  "eth.kc.caOut":
    "keccak(\"{pre}\")<br>→ adresse de contrat <b class=\"mono\">{addr}</b> <span class=\"muted\">(20 derniers octets)</span>",
  "eth.kc.when":
    "<b>Résumé — la même <u>fonction</u> de hachage à plusieurs endroits</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>Adresse</b> ← hacher la <b>clé publique</b> → 20 derniers octets</li><li><b>Adresse de contrat</b> ← hacher <b>déployeur+nonce</b> → 20 derniers octets</li><li><b>Sélecteur de fonction</b> ← hacher la <b>signature</b> → 4 premiers octets</li><li><b>topic0 d'événement</b> ← hacher la <b>signature</b> → 32 octets complets</li></ul>",
  "eth.kc.deeperH": "Plus loin : emplacement des mapping en storage · CREATE2 · adresses checksum",
  "eth.kc.deeperBody":
    "<p><b>Emplacement des mapping en storage :</b> où <code>balanceOf[Alice]</code> vit dans le storage est aussi décidé par <code>keccak(clé ‖ n° de slot)</code> — le vrai calcul d'adresse derrière la « table storage du token » de l'onglet 4.</p><p><b>CREATE2 :</b> au lieu du nonce, l'adresse est <code>keccak(0xff ‖ déployeur ‖ salt ‖ keccak(code))</code> — calculable avant le déploiement, ce dont dépendent les L2 et les portefeuilles.</p><p><b>Adresses checksum (EIP-55) :</b> la casse des lettres d'une adresse est dérivée en hachant l'adresse elle-même. C'est une somme de contrôle anti-fautes de frappe : la casse mixte de <code>0xAbC…</code> a réellement un sens.</p>",

  // Carte 2.5 — création de portefeuille (BTC↔ETH)
  "eth.kc.genH": "D'où vient donc la clé publique — un portefeuille en 3 étapes",
  "eth.kc.genLead":
    "Créer un portefeuille, c'est juste <b>nombre aléatoire (clé privée) → multiplication sur courbe elliptique → clé publique → hachage → adresse</b>. Les deux premières étapes (privée→publique) sont <b>identiques à Bitcoin</b> (même courbe secp256k1) ; <b>seule la fonction de hachage pour l'adresse diffère</b>. Pour voir cette « multiplication sur courbe elliptique (saut) » en images, allez à l'<b>onglet 4 de Bitcoin</b>.",
  "eth.kc.genCol1": "Étape",
  "eth.kc.genCol2": "Bitcoin",
  "eth.kc.genCol3": "Ethereum",
  "eth.kc.genRows":
    "<tr><td class=\"k\">① Clé privée</td><td><b>Aléatoire</b> 256 bits</td><td><b>Aléatoire</b> 256 bits <span class=\"same\">identique</span></td></tr><tr><td class=\"k\">② Clé publique</td><td class=\"mono\">clé privée × G (secp256k1)</td><td class=\"mono\">clé privée × G <span class=\"same\">même courbe</span></td></tr><tr><td class=\"k\">③ Adresse</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) 20 derniers o → 0x… <span class=\"diff\">seul le hachage diffère</span></td></tr><tr><td class=\"k\">Signature</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">identique</span></td></tr><tr><td class=\"k\">Phrase de récupération</td><td>BIP-39 (12/24 mots)</td><td>BIP-39 <span class=\"same\">identique</span></td></tr><tr><td class=\"k\">Chemin de compte</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">seul le nombre diffère</span></td></tr><tr><td class=\"k\">Où c'est stocké</td><td>wallet.dat · puce matérielle</td><td>extension navigateur (chiffrée) · puce matérielle</td></tr>",
  "eth.kc.genKey":
    "<b>🔑 Point clé :</b> les <b>fondamentaux (clés, signatures, seed) sont presque identiques sur les deux chaînes.</b> C'est pourquoi <b>un seul portefeuille matériel peut gérer à la fois BTC et ETH</b>. La différence visible, c'est essentiellement l'<b>encodage de l'adresse (le hachage)</b>.",
  "eth.kc.genStoreH": "Où la clé privée est-elle stockée ? · phrase de récupération · où se passe la signature",
  "eth.kc.genStore":
    "<p><b>La clé privée n'est pas sur la blockchain.</b> La chaîne ne contient que des adresses, soldes, transactions et signatures. La clé privée vit <b>uniquement dans votre portefeuille</b> — les nœuds ne la voient jamais (sinon n'importe qui pourrait voler vos fonds).</p><ul class=\"tight\"><li><b>MetaMask</b> — gardée dans le stockage de l'extension navigateur, <b>chiffrée avec votre mot de passe</b>, déchiffrée seulement au besoin.</li><li><b>Portefeuille matériel (Ledger·Trezor)</b> — enfermée dans une puce sécurisée, <b>ne quitte jamais l'appareil</b> ; la signature se fait sur l'appareil.</li><li><b>Phrase de récupération (12 mots)</b> — la <b>graine</b> de toutes vos clés privées. À elle seule elle peut restaurer tous les comptes → si elle fuit, tout est perdu.</li></ul><p><b>La signature se passe « dans votre appareil ».</b> Le portefeuille signe la tx localement avec la clé privée → seuls la <b>signature + la tx</b> partent vers la chaîne → les nœuds <b>vérifient seulement avec la clé publique</b>. L'asymétrie « signer = moi seul, vérifier = tout le monde ».</p>",

  "eth.acc.contrastEth": "ETH natif (géré par le protocole)",
  "eth.acc.contrastEthHint": "Champ balance de l'objet compte · pas d'UTXO · comme à l'onglet 1",
  "eth.acc.contrastTok": "Registre d'app · {token} (storage)",
  "eth.acc.contrastTokHint": "La quantité de token (value) n'est pas de l'ETH · mais le gas d'exécution se paie en ETH",
  "eth.acc.tokAmt": "Quantité",
  "eth.acc.tokOk":
    "Storage mis à jour : {from} → {to} · {amt} {token}. Ce qui a bougé, c'est du {token}, pas de l'ETH — mais <b>le gas se paie quand même en ETH</b>.",
  "eth.logH": "Journal du moteur",

  // ---------- 8 · Exécuteur EVM ----------
  "eth.evm.h1": "EVM — le CPU qui fait tourner Ethereum",
  "eth.evm.lead":
    "Un contrat intelligent est en fin de compte du <b>bytecode</b>, et le CPU virtuel qui l'exécute instruction (opcode) par instruction est l'<b>EVM</b>. Injectez une tx (instruction) dans le world state (données), et l'EVM brûle du gas pour l'exécuter et produire un <b>nouvel état</b>. Comme la JVM, c'est une <b>machine virtuelle à pile</b>, et comme la boucle d'événements JS, elle <b>s'exécute en un seul thread jusqu'au bout</b>.",
  "eth.evm.mapCol1": "Ordinateur",
  "eth.evm.mapCol2": "Ethereum",
  "eth.evm.mapCol3": "Ce que c'est",
  "eth.evm.mapRows":
    "<tr><td class=\"k\">Disque / BD (tout)</td><td>world state</td><td>Tous les soldes de comptes + tout le storage des contrats</td></tr><tr><td class=\"k\">Un fichier / une table dedans</td><td>storage</td><td>Les cases persistantes d'un contrat (partie du world state)</td></tr><tr><td class=\"k\">RAM (volatile)</td><td>stack · memory</td><td>Disparaît à la fin de la tx</td></tr><tr><td class=\"k\">Programme à exécuter</td><td>tx</td><td>Qui · quelle fonction · arguments</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>Exécute le bytecode opcode par opcode</td></tr><tr><td class=\"k\">Électricité / horloge</td><td>gas</td><td>Coût et plafond d'exécution</td></tr><tr><td class=\"k\">Checksum de toute la BD</td><td>stateRoot</td><td>Empreinte du world state entier</td></tr>",
  "eth.evm.analogy":
    "<b>Comme la JVM :</b> les deux sont des <b>machines à pile</b> — on calcule en empilant des valeurs, pas avec des registres. <code>PUSH 3, PUSH 4, ADD</code> → 7 sur la pile. <b>Comme la boucle d'événements JS :</b> un seul thread, <b>exécution jusqu'au bout</b> (jamais interrompue), puis terminaison ou revert intégral.",
  "eth.evm.determinism":
    "<b>La différence décisive :</b> l'EVM doit être <b>totalement déterministe</b> — pas de <code>random</code>, pas d'horloge, pas d'E/S réseau. Chaque nœud du monde exécute la même tx et doit obtenir <b>exactement les mêmes pile, storage et gas</b>, sinon le consensus casse. C'est aussi pour ça que le gas existe (stopper les boucles infinies / DoS).",
  "eth.evm.runH": "Exécutez pas à pas, un opcode à la fois",
  "eth.evm.runLead":
    "Choisissez un programme et appuyez sur <b>Pas suivant</b> : à chaque opcode exécuté, regardez comment la <b>pile, le storage et le gas</b> changent — comme un visualiseur de boucle d'événements.",
  "eth.evm.program": "Programme",
  "eth.evm.calldata": "Entrée v (calldata)",
  "eth.evm.calldataPrice": "Prix (calldata)",
  "eth.evm.exSstoreEscrow":
    "<b>SSTORE</b> — mise à jour du storage de l'escrow : <b>{slot} ← {val}</b>. Les state/price/locked de l'onglet 7 sont exactement ces écritures de slot.",
  "eth.evm.stepBack": "◀ Retour",
  "eth.evm.step": "▶ Pas suivant",
  "eth.evm.runAll": "⏩ Tout exécuter",
  "eth.evm.reset": "↺ Réinitialiser",
  "eth.evm.bytecodeH": "Bytecode · PC",
  "eth.evm.stackH": "Stack (sommet ↑ · volatile)",
  "eth.evm.memoryH": "Memory (volatile)",
  "eth.evm.storageH": "Storage (les cases de ce contrat · partie du world state)",
  "eth.evm.gasH": "Gas",
  "eth.evm.gasUsed": "utilisé",
  "eth.evm.gasLeft": "restant",
  "eth.evm.emptyStack": "Pile vide",
  "eth.evm.emptyMem": "Aucune mémoire utilisée",
  "eth.evm.emptyStorage": "Rien d'écrit dans le storage pour l'instant",
  "eth.evm.exInit": "État initial avant exécution — pile, mémoire et storage vides, gas au maximum. Appuyez sur <b>Pas suivant</b> pour exécuter les opcodes un par un.",
  "eth.evm.exPush": "<b>PUSH1 {v}</b> — pousse la valeur immédiate {v} au sommet de la pile.",
  "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — lit l'entrée de la tx (v) et la pousse sur la pile. (l'offset qui était sur la pile est consommé)",
  "eth.evm.exAdd": "<b>ADD</b> — dépile les deux valeurs du haut, les additionne, repousse le résultat.",
  "eth.evm.exMul": "<b>MUL</b> — dépile les deux valeurs du haut, les multiplie, pousse le résultat.",
  "eth.evm.exSub": "<b>SUB</b> — dépile les deux valeurs du haut, les soustrait, pousse le résultat.",
  "eth.evm.exSstore":
    "<b>SSTORE</b> — dépile (slot, valeur) et <b>l'écrit de façon permanente dans le storage</b>. C'est le moment où le world state change ! Voilà pourquoi c'est si cher en gas (20000 pour 0→valeur).",
  "eth.evm.exSload": "<b>SLOAD</b> — lit une valeur depuis un slot de storage et la pousse sur la pile.",
  "eth.evm.exMstore": "<b>MSTORE</b> — écrit une valeur en mémoire volatile. (disparaît à la fin de la tx)",
  "eth.evm.exStop": "<b>STOP</b> — l'exécution se termine ✅. Le storage final de cette tx est validé et un nouveau stateRoot le reflétant est produit.",
  "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — l'exécution s'arrête et <b>tous les changements d'état sont annulés</b>. Mais le gas dépensé jusque-là n'est pas remboursé.",
  "eth.evm.gitH": "World state ↔ stateRoot — comme git",
  "eth.evm.gitLead":
    "À gauche, le <b>storage</b> de ce contrat (un morceau du world state) ; à droite, un <b>stateRoot éducatif</b> haché à partir de lui. Sur une vraie chaîne, le stateRoot hache <b>tous les soldes de comptes + tout le storage des contrats</b>. Quand SSTORE change une valeur, un commit s'ajoute — et <b>l'historique reste</b>, même si vous changez de programme.",
  "eth.evm.gitTree": "storage (partie du world state)",
  "eth.evm.gitRoot": "stateRoot · hachage de commit",
  "eth.evm.gitHistH": "Historique des commits",
  "eth.evm.clearHist": "Effacer l'historique",
  "eth.evm.gitEmpty": "Pas encore de commits — avancez pas à pas jusqu'à rencontrer SSTORE.",
  "eth.evm.gitRootFirst": "Premier instantané (hachage de l'état vide)",
  "eth.evm.gitRootChanged": "Changé ↑ différent du commit précédent {prev} — preuve que le storage a bougé",
  "eth.evm.gitRootSame": "Identique au commit précédent — pas de changement du storage",
  "eth.evm.commitGenesis": "genesis · storage vide",
  "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
  "eth.evm.commitStop": "STOP · {prog} terminé",
  "eth.evm.commitSnap": "Instantané",
  "eth.evm.whyH": "Pourquoi c'est le vrai cœur d'Ethereum",
  "eth.evm.why1":
    "<b>ERC-20, oracles, DeFi sont tous des applications qui tournent là-dessus.</b> Code du contrat = classe, adresse déployée = une instance, storage = les champs de cette instance, appel de fonction = appel de méthode. L'EVM est le moteur qui fait réellement tourner ces méthodes.",
  "eth.evm.why2":
    "<b>Pourquoi SSTORE coûte cher :</b> pile et mémoire sont comme la RAM et disparaissent à la fin de la tx, mais <b>le storage est comme un disque — permanent</b> et partie du world state, donc chaque nœud doit le garder pour toujours. C'est pourquoi une écriture en storage (20000 gas) écrase l'arithmétique (3 gas).",
  "eth.evm.why3":
    "<b>L'essentiel :</b> <code>new_state = EVM.execute(state, tx)</code> puis <code>stateRoot = hash(new_state)</code>. Une fois cette machine à transitions d'état comprise, tout le reste ressemble à « des instances qui tournent dessus ».",

  // ---------- 2 · Contrats intelligents ----------
  "eth.sc.h1": "Contrats intelligents — déployez un distributeur automatique",
  "eth.sc.lead":
    "Ci-dessous, un vrai <b>SnackMachine</b> en Solidity. Déployez-le et son code est figé sur la chaîne ; n'importe qui peut appeler <code>buy()</code>. <b>Même le propriétaire ne peut pas changer les règles.</b>",
  "eth.sc.acctTypesH": "D'abord — Ethereum a deux types de comptes",
  "eth.sc.eoaN": "Compte portefeuille (EOA)",
  "eth.sc.eoaT": "Alice · Bob · votre MetaMask",
  "eth.sc.eoaD":
    "Adresse = 20 derniers octets de keccak(<b>clé publique</b>). <b>Possède une clé privée</b>, donc peut initier des transactions en signant.",
  "eth.sc.caN": "Compte contrat",
  "eth.sc.caT": "SnackMachine · SAND · Uniswap",
  "eth.sc.caD":
    "Adresse = 20 derniers octets de keccak(<b>adresse du déployeur + nonce</b>). <b>Pas de clé privée</b> — a du code et du storage à la place, et n'agit que lorsqu'on l'appelle.",
  "eth.sc.txKinds":
    "<b>Transfert, déploiement et appel sont tous « la même tx » — chacun incrémente le nonce de +1.</b> Tout ce qu'un EOA envoie est une transaction ; seuls <code>to</code>/<code>data</code> diffèrent. Donc un déploiement consomme un nonce comme un transfert, et ce nonce devient l'ingrédient de l'adresse de contrat ci-dessus.<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>Action</th><th>À quoi ressemble la tx</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">Transfert simple</td><td><code>to</code>=destinataire · value · pas de <code>data</code></td><td>+1</td></tr><tr><td class=\"k\">Déploiement de contrat</td><td><code>to</code>=<b>vide (null)</b> · <code>data</code>=<b>bytecode</b></td><td>+1</td></tr><tr><td class=\"k\">Appel de contrat</td><td><code>to</code>=adresse du contrat · <code>data</code>=<b>fonction+arguments</b></td><td>+1</td></tr></tbody></table>",
  "eth.sc.deriveH": "Comment cette adresse a été fabriquée (calculée en direct à l'instant)",
  "eth.sc.derive1": "Adresse de portefeuille de {who} — 20 derniers octets de keccak(clé publique* de {who})",
  "eth.sc.derive2": "Préimage = adresse du portefeuille + le nonce du moment ({nonce}) — ce nonce est <b>le compteur même que vous avez vu à l'onglet 2</b>",
  "eth.sc.derive3": "keccak-256(préimage) — on ne garde que les 40 derniers des 64 hex",
  "eth.sc.derive4": "→ adresse du contrat",
  "eth.sc.deriveMatch": "✓ correspond à l'en-tête ci-dessus",
  "eth.sc.deriveNote":
    "* Cette simulation hache un nom au lieu d'une clé publique (règle de l'onglet 1). Le vrai Ethereum hache RLP([adresse, nonce]) — mêmes ingrédients. Adresses de portefeuille et de contrat se ressemblent, mais elles sont fabriquées à partir d'ingrédients différents.",
  "eth.sc.historyH": "Historique d'état — rien n'est modifié, de nouvelles lignes s'empilent",
  "eth.sc.historyLead":
    "Pensez à un registre écrit au stylo. Les entrées passées ne peuvent être ni effacées ni écrasées — <b>seule une transaction réussie ajoute la ligne suivante (une nouvelle version vN)</b>. Si elle revert, <b>aucune nouvelle version n'est créée</b> — vous verrez juste en dessous un marqueur ⛔ « tentative rejetée », et l'état ne change jamais à moitié (atomicité). Le gas est quand même dépensé, lui.",
  "eth.sc.histRevert": "Pas de nouvelle version (atomicité) · gas quand même dépensé — {reason}",
  "eth.sc.histNoChange": "Pas de changement du storage (seul le solde a bougé)",
  "eth.sc.storageLead":
    "storage = le <b>tiroir privé</b> de ce contrat. Il contient les <b>valeurs actuelles</b> des variables déclarées en haut du code Solidity (<code>price</code>, <code>stock</code>…). Seuls les appels de fonction peuvent le changer.",
  "eth.tok.storageLead":
    "Voyez ceci comme le <b>registre SAND</b> de The Sandbox. Les valeurs dans <code>mapping(address → uint256) balanceOf</code> sont ce qu'un portefeuille affiche comme « solde de tokens » — une <b>case différente</b> de l'ETH. (Mini-version éducative — pas le contrat SAND du mainnet.)",

  // ---------- Où c'est stocké (blocs vs BD d'état) ----------
  "eth.ws.h1": "Mais où tout cela est-il stocké ? — blocs vs BD du nœud",
  "eth.ws.lead":
    "On s'attendrait à ce que code, storage et soldes vivent dans les blocs — mais <b>les blocs n'enregistrent que des « bons de commande »</b>. Les résultats sont calculés par chaque nœud et conservés dans sa propre base.",
  "eth.ws.blockN": "Bloc (sur la chaîne, pour toujours)",
  "eth.ws.blockT": "Le registre partagé",
  "eth.ws.blockD":
    "<b>Liste de transactions</b> — des bons de commande comme « Bob a appelé buy() avec 0.5 ETH » + <b>stateRoot</b> — un hachage de 32 octets résumant tout l'état après exécution. <b>Aucun état en soi.</b>",
  "eth.ws.dbN": "BD d'état (chaque nœud, en local)",
  "eth.ws.dbT": "Le résultat du rejeu des bons de commande",
  "eth.ws.dbD":
    "Chaque compte est <span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>. Les comptes portefeuille ont un code vide ; les comptes contrat portent <b>bytecode + storage</b>.",
  "eth.ws.why":
    "<b>Pourquoi ça marche ?</b> La transition d'état est une fonction pure (<span class=\"mono\">nouvelÉtat = f(ancienÉtat, tx)</span>), donc enregistrer <b>seulement les entrées (les tx)</b> permet à quiconque de rejouer depuis la genèse jusqu'au même état. Les nœuds se vérifient mutuellement en <b>comparant des stateRoot de 32 octets</b> — la même astuce que la racine de Merkle de l'onglet 5 de Bitcoin.",
  "eth.ws.tableH": "La BD d'état de cette simulation, en direct",
  "eth.ws.tableLead":
    "<b>Tous les comptes</b> de ce monde simulé apparaissent — les contrats utilisés par d'autres onglets (SAND → onglet 4 Jetons, ETH/USD Feed → onglet 5 Oracles) sont pré-déployés à la genèse. Exactement comme la vraie BD d'état d'Ethereum contient déjà USDT et Uniswap.",
  "eth.ws.originTok": "déployé à la genèse · utilisé à l'onglet 3",
  "eth.ws.originFeed": "déployé à la genèse · utilisé à l'onglet 4",
  "eth.ws.originGenesis": "déployé à la genèse",
  "eth.ws.originYou": "vient d'être déployé par {who}",
  "eth.ws.colAcct": "Compte",
  "eth.ws.codeNone": "aucun (portefeuille)",
  "eth.ws.codeYes": "oui · bytecode {kind}",
  "eth.ws.srcNote":
    "<b>Le source Solidity n'est PAS sur la chaîne.</b> Seul le <b>bytecode</b> compilé y va. Les sources visibles sur Etherscan existent parce que les développeurs les soumettent : Etherscan recompile et compare avec le bytecode sur la chaîne — un <b>service hors chaîne</b>. Cette page qui montre du Solidity suit la même idée.",
  "eth.sc.deployer": "Déployeur",
  "eth.sc.price": "Prix (ETH)",
  "eth.sc.stock": "Stock",
  "eth.sc.deploy": "🚀 Déployer",
  "eth.sc.deployOk":
    "Déployé → adresse <b class=\"mono\">{addr}</b> (keccak(déployeur, nonce {nonce})) · gas {gas}",
  "eth.sc.deployedBy": "déployé par {by} · nonce {nonce}",
  "eth.sc.callH": "Appelez-le",
  "eth.sc.caller": "Appelant",
  "eth.sc.value": "ETH à envoyer (msg.value)",
  "eth.sc.storageH": "storage (état du contrat)",
  "eth.sc.storageEmpty": "Pas de storage",
  "eth.sc.eventsH": "Journal d'événements",
  "eth.sc.eventsEmpty": "Pas encore d'événements — appelez une fonction",
  "eth.sc.codeH": "Code Solidity (la fonction appelée s'illumine)",
  "eth.sc.revertNote":
    "revert : l'état est revenu en arrière et aucune value n'est partie, mais les frais de gas ont été dépensés et le nonce a avancé — exactement comme le vrai Ethereum.",
  "eth.sc.why":
    "<b>En bref :</b> un contrat est un compte avec <b>adresse, solde et nonce</b> — plus <b>du code et du storage</b>. L'argent ne bouge que comme le dit le code. Essayez <code>withdraw()</code> en tant que Bob — ça <b>revert</b>, mais le gas est quand même payé.",
  "eth.sc.asideH": "Pourquoi « le code fait loi » est une grande affaire",
  "eth.sc.asideBody":
    "<p><b>Dépôt bancaire :</b> conditions, employés et tribunaux peuvent intervenir. <b>Dépôt dans un contrat :</b> rien ne peut déplacer l'argent hormis les conditions du code déployé.</p><p>L'adresse qui vaut <b>keccak(déployeur, nonce)</b> et le <b>topic0 = keccak(signature)</b> des événements sont les mêmes règles de hachage que l'onglet 1.</p><p>Le revers vient du même principe — un contrat bugué <b>ne peut pas être corrigé</b> (voir le piratage de The DAO).</p>",

  // ---------- 4 · Jetons ----------
  "eth.tok.h1": "ERC-20 — solde en ETH et solde en tokens vivent à des endroits différents",
  "eth.tok.lead":
    "L'<b>ETH</b> est géré par le protocole comme le champ <b>balance</b> de l'objet compte (onglet 1 — un nombre de compte, pas des UTXO Bitcoin). Le <b>SAND</b> de The Sandbox ou l'USDT ne sont pas ce champ — ce sont une <b>table dans le storage de ce contrat de token</b> sur Ethereum (adresse → quantité). L'ERC-20 est le <b>standard</b> de cette table ; le <b>SAND</b> ci-dessous est un mini-token éducatif avec cette structure.",
  "eth.tok.std":
    "<b>Même world state, cases différentes.</b> Ethereum gère la <code>balance</code> des comptes (ETH). Les tokens d'applications comme SAND et USDT gèrent leurs propres tables de storage. (Le vrai SAND s'échange souvent sur Polygon pour un gas moins cher, mais le token lui-même reste un actif de la famille ERC-20 d'Ethereum.)",
  "eth.tok.why":
    "<b>À vérifier :</b> ① le Transfer <b>value=50 SAND</b> n'envoie pas d'ETH à Bob — seule la table du storage change ② exécuter la tx coûte quand même du <b>gas en ETH</b> (l'ETH d'Alice peut légèrement baisser) ③ le <b>topic0</b> de l'événement est égal au vrai hachage du Transfer ERC-20 du mainnet.",

  // ---------- 4 · Oracles ----------
  "eth.or.h1": "Oracles — la chaîne ne voit pas le monde extérieur",
  "eth.or.lead":
    "Les contrats ne peuvent utiliser ni internet ni les API, car chaque nœud doit <b>rejouer le même calcul</b> — p. ex. s'ils interrogent chacun une API météo, certains réussissent et d'autres échouent, ou certains reçoivent la donnée A et d'autres la B, donc le <b>résultat divergerait</b>. Les données externes (prix, météo, scores) doivent être <b>injectées par des nœuds oracle sous forme de transactions</b>. C'est ainsi que fonctionne Chainlink.",
  "eth.or.reportH": "① Les nœuds oracle rapportent un prix",
  "eth.or.nodesLead":
    "Imaginez chaque nœud publiant en tx <b>le prix qu'il a vu sur l'API d'une bourse</b>. (Les vrais nœuds Chainlink ne sont pas les bourses elles-mêmes — ce sont des <b>opérateurs indépendants</b> qui interrogent plusieurs API de bourses/agrégateurs ; ici on les étiquette par source.)",
  "eth.or.reported": "rapporté",
  "eth.or.why":
    "<b>Pourquoi la médiane ?</b> Un seul nœud manipulé <b>ne peut pas bouger la médiane</b>. Donnez à Coinbase un nombre absurde — latestAnswer tient bon. Un design à oracle unique se fait avoir instantanément (un grand classique des piratages DeFi).",
  "eth.ins.h1": "② Un contrat qui consomme l'oracle — assurance sur le prix",
  "eth.ins.lead":
    "Déployez une assurance qui paie 1 ETH si l'ETH descend <b>sous 3 000 $</b>. Le paiement est décidé par la <b>médiane du feed</b>, pas par une personne. Regardez le <b>solde de Bob</b> ci-dessous monter après un settle réussi.",
  "eth.ins.ledgerH": "Soldes des comptes (suivi du paiement)",
  "eth.ins.ledgerLead": "Voyez comment l'ETH de Bob change depuis le début — à la souscription et au settle.",
  "eth.ins.role.underwriter": "Assureur (alimente le pool)",
  "eth.ins.role.insured": "Assuré",
  "eth.ins.role.pool": "Pool de paiement",
  "eth.ins.threshold": "Seuil (USD)",
  "eth.ins.deploy": "Alice déploie l'assurance (alimente le pool de 1 ETH)",
  "eth.ins.buy": "Bob souscrit buyPolicy() — 0.1 ETH",
  "eth.ins.condRule": "Règle de paiement : median < {threshold} (égal = expirée)",
  "eth.ins.condNoFeed": "Le feed n'a pas encore de réponse — d'abord oracle report() ci-dessus",
  "eth.ins.condMet": "Médiane actuelle {median} < {threshold} → settle() paiera ✅",
  "eth.ins.condUnmet": "Médiane actuelle {median} ≥ {threshold} → settle() ne paiera PAS (expirée)",
  "eth.ins.warn":
    "<b>Le problème de l'oracle :</b> un code de contrat parfait échoue quand même si <b>les données qui l'alimentent sont empoisonnées</b>. Décentraliser la donnée elle-même — plusieurs nœuds, médianes, pénalités basées sur le stake — c'est le travail des réseaux d'oracles comme Chainlink.",
  "eth.or.deeperH": "Plus loin : le problème de l'oracle · tiers vs première partie · récompenses et slashing",
  "eth.or.deeperBody":
    "<p><b>Le problème de l'oracle, reformulé :</b> les données sur la chaîne restent fiables parce que les membres se vérifient mutuellement, mais <b>les données hors chaîne ne peuvent pas être vérifiées vraies/fausses par les règles de la chaîne</b>. Comme des voyageurs passant le <b>contrôle d'immigration</b>, les données extérieures ont besoin d'un examinateur — mais confier ce travail à une seule entreprise re-centralise tout. Ce dilemme est le problème de l'oracle.</p><p><b>Oracles tiers</b> (Chainlink, Band) : de nombreux nœuds vérificateurs récupèrent les données indépendamment et se mettent d'accord (la médiane ci-dessus en est une mini-version). Les nœuds exacts gagnent des <b>récompenses (LINK)</b> ; les nœuds fautifs <b>perdent leurs coins en staking et leur réputation</b>, et reçoivent moins de missions. Décentralisé, mais plus lent et les récompenses sont partagées.</p><p><b>Oracles première partie</b> (PYTH, etc.) : les bourses/fournisseurs de données <b>signent et publient directement</b>, avec du staking pour dissuader le mensonge. Rapide et efficace, mais il faut faire confiance au fournisseur — ça penche vers la centralisation.</p><p><b>Pourquoi c'est important :</b> une fois que les oracles sécurisent la confiance, les contrats intelligents peuvent gérer des <b>actifs du monde réel (RWA)</b> comme l'immobilier et les actions. Notez que le coin LINK n'est pas la technologie elle-même — c'est la <b>récompense versée aux nœuds vérificateurs</b>.</p>",

  // ---------- 5 · PoS ----------
  "eth.pos.h1": "Proof of Stake — qui fabrique les blocs, et quand deviennent-ils définitifs",
  "eth.pos.lead":
    "Depuis The Merge (2022), plus de minage façon Bitcoin. Le temps est découpé en <b>slots</b> (des cases de 12 secondes en réalité) ; à chaque slot, un validator est choisi par un <b>tirage aléatoire pondéré par la mise</b> (RANDAO en réalité) pour <b>proposer</b> un bloc. Les autres validators le vérifient et émettent une <b>attestation (vote pour)</b>. Un paquet de slots (8 ici, 32 en réalité) forme une <b>epoch</b> — les votes sont comptés par epoch pour faire avancer la finality.",
  "eth.pos.statsLead":
    "Comment lire : <b>Slot</b> = la case de temps où on en est · <b>Epoch</b> = numéro du paquet de slots · <b>Justified/Finalized</b> = jusqu'où la finalité en deux phases ci-dessous a progressé (<b>—</b> = aucune epoch finalisée pour l'instant).",
  "eth.pos.chainLead":
    "Chaque bloc porte un <b>stateRoot</b> — l'empreinte du world state à cet instant. Faites un transfert ou un appel de contrat dans un autre onglet, puis avancez d'un slot : l'empreinte change. C'est exactement ce que les validators ré-exécutent et comparent avant d'attester. La <b>ligne attest</b> de chaque bloc liste les validators qui ont voté pour lui (✓ a voté · ✗ hors ligne).",
  "eth.pos.liveHead": "slot {slot} — <b>{p}</b> propose un bloc → les autres attestent",
  "eth.pos.liveOk": "2/3 atteints ✓ (compte pour la finality)",
  "eth.pos.liveFail": "sous les 2/3 ✗ (finality retardée)",
  "eth.pos.advance": "⏭ Slot suivant",
  "eth.pos.advance5": "×5 slots",
  "eth.pos.epoch": "Jusqu'à la fin de l'epoch",
  "eth.pos.offline": "Part de validators hors ligne",
  "eth.pos.reset": "Réinitialiser",
  "eth.pos.chainH": "Chaîne (justified → finalized)",
  "eth.pos.twoPhase":
    "<b>Pourquoi une finalité en deux phases ?</b> Pensez à la signature d'un contrat — quand les votes d'une epoch rassemblent <b>2/3 de la mise</b>, cette epoch est <b>justified (paraphée)</b>. Quand l'epoch suivante rassemble aussi 2/3, la précédente justified est promue <b>finalized (notariée)</b> — c'est Casper FFG. Annuler un checkpoint finalized exige que des validators signent des votes contradictoires, ce qui <b>brûle instantanément 1/3+ de toute la mise via le slashing</b>. Voilà pourquoi c'est « économiquement » final.",
  "eth.pos.convey":
    "<b>Unité et rythme de la finalité :</b> la finality avance par <b>epoch</b>, pas par bloc. En temps normal, c'est un tapis roulant — quand l'epoch 5 rassemble 2/3, l'epoch 5 devient justified et <b>l'epoch 4 précédente devient finalized</b> — justified marche toujours une case devant (en réalité un bloc est finalisé ~2 epochs ≈ 13 minutes après sa création). Mais la finalité est <b>rétroactive à tous les ancêtres</b> : si un blocage (validators hors ligne) gèle la finality pendant quelques epochs puis que la participation revient, la portion gelée <b>rattrape tout d'un coup</b> — essayez de baisser le curseur dans l'expérience ci-dessous et regardez Finalized bondir.",
  "eth.pos.tryOffline":
    "<b>Expérience :</b> poussez le curseur hors ligne à <b>34%+</b> et avancez une epoch — les votes n'atteignent plus 2/3 et <b>justified/finalized se figent</b>. Les blocs continuent de s'empiler, mais rien ne se finalise. Le vrai Ethereum gère un blocage prolongé en rognant lentement la mise des validators hors ligne (<b>inactivity leak</b>) jusqu'à restaurer les 2/3.",
  "eth.pos.vsBtc":
    "<b>vs Bitcoin :</b> la finalité en PoW est probabiliste (« plus de confirmations = plus sûr »). Le Gasper de PoS est une finalité économique — annuler un checkpoint signé aux 2/3 brûle <b>1/3+ de toute la mise via le slashing</b>.",
  "eth.pos.proposeCheck":
    "<b>Un proposer peut-il trafiquer les tx ?</b> Il peut choisir <b>quelles tx inclure et dans quel ordre</b> depuis le mempool, mais modifier le montant/destinataire de la tx de quelqu'un d'autre <b>casse la signature → rejetée</b> (onglets 1–2). Il peut inclure ses propres tx fraîchement signées, mais seulement dans la limite de <b>ses propres fonds</b>. Les autres validators ré-exécutent les tx du bloc et vérifient que le <b>stateRoot correspond</b> (onglet 8) — attest si oui, rejet sinon.",
  "eth.st.h1": "Cycle de vie du validator — staking · slashing",
  "eth.st.lead":
    "Pour proposer et voter, on met <b>32 ETH</b> en staking et on s'active. Les infractions comme la double signature sont punies par le <b>slashing</b> — défense anti-Sybil par dépôt de garantie au lieu de l'électricité du PoW.",
  "eth.st.label": "Nom du validator",
  "eth.st.amt": "Mise (ETH)",
  "eth.st.deposit": "Déposer",
  "eth.st.activate": "Activer le dernier dépôt",
  "eth.st.slashId": "ID cible",
  "eth.st.slash": "Double signature → slashing",
  "eth.st.offline": "Pénalité hors ligne",
  "eth.st.listH": "Validators",
  "eth.st.slashScale":
    "<b>Pourquoi une coupe partielle plutôt qu'une confiscation totale ?</b> La pénalité immédiate du vrai Ethereum est étonnamment petite (environ <b>1 ETH</b> sur 32). En revanche, le validator est <b>éjecté définitivement</b> (ici aussi, un Slashed ne peut pas être réactivé), et surtout il existe une <b>pénalité de corrélation</b> — plus il y a de mise slashée dans la même fenêtre, plus l'amende grossit. À l'instant où <b>1/3+ de la mise complote</b> pour annuler un checkpoint finalized, ils perdent <b>tout</b>. Une erreur isolée (accident de gestion de clés) est punie légèrement ; une attaque coordonnée, de façon catastrophique.",
  "eth.st.depOk": "Déposé · validator #{id} (Pending)",
  "eth.st.actOk": "Activé — participe aux propositions/attestations dès le prochain slot",
  "eth.st.slashOk": "Slashé — une partie de la mise brûlée · statut Slashed",
  "eth.st.offOk": "Pénalité d'inactivité appliquée",
  "eth.at.h1": "Tentez une attaque — fork · double proposition",
  "eth.at.lead":
    "Un validator dont c'est le tour de proposer <b>signe deux blocs différents pour le même slot</b>, montrant à chaque moitié du réseau une version différente (une tentative de double dépense — la version PoS de la « chaîne secrète » de l'onglet 7 de BTC). Résultat : ① la chaîne se fourche, mais ② le poids de vote de la majorité honnête garde la chaîne d'origine en tête, et ③ <b>deux signatures pour le même slot sont une preuve mathématique</b> de triche — pas d'excuses possibles, <b>slashing</b> automatique. Contrairement à BTC, une attaque ratée brûle le dépôt de garantie : impossible de réessayer.",
  "eth.at.sigLayers":
    "<b>La « signature » ici n'est pas une signature de tx — il y a trois couches.</b> ① <b>signature de tx</b> = « c'est moi qui envoie cet argent » (clé de portefeuille de l'expéditeur, onglets 1·2) ② <b>signature de bloc</b> = « c'est moi qui ai construit ce bloc » (le proposer signe l'en-tête du bloc fini avec sa clé de validator) ③ <b>signature d'attestation</b> = « c'est moi qui vote pour ce bloc ». La preuve d'équivocation, c'est deux exemplaires de ② pour le même slot. À noter : les clés de validator utilisent des <b>signatures BLS</b> (contrairement à l'ECDSA des portefeuilles) — des milliers d'entre elles peuvent être fusionnées en une seule (agrégation), ce qui permet à un million de validators de tous voter à chaque epoch tout en tenant dans un bloc.",
  "eth.at.attacker": "ID du validator attaquant",
  "eth.at.fork": "Attaque par fork (double proposition)",
  "eth.at.warn":
    "<b>vs 51% :</b> les doubles dépenses Bitcoin sont une course à « la chaîne secrète la plus longue » — on peut réessayer tant qu'on a de l'électricité. Attaquer un checkpoint PoS finalized <b>brûle le dépôt de garantie</b>, donc la même attaque ne peut pas être répétée.",
};
