// Visual Ethereum Engine i18n — Español
export const ETH_I18N_ES = {
  "eth.header.title": "Visual Ethereum Engine",
  "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · Simulador educativo",
  "eth.header.tagline":
    "Un <b>motor de Ethereum</b> (cuentas · contratos inteligentes · PoS) escrito en Rust, compilado a WebAssembly y ejecutándose en vivo en tu navegador",
  "eth.meta.title": "Visual Ethereum Engine — Simulador interactivo de Ethereum",
  "eth.tabs.overview": "Introducción",
  "eth.tabs.keccak": "1 · Keccak · Dirección",
  "eth.tabs.account": "2 · Cuentas · Gas",
  "eth.tabs.contracts": "3 · Contratos inteligentes",
  "eth.tabs.tokens": "4 · Tokens (ERC-20)",
  "eth.tabs.oracles": "5 · Oráculos",
  "eth.tabs.pos": "6 · Consenso PoS",
  "eth.tabs.realestate": "7 · Inmobiliaria",
  "eth.tabs.evm": "8 · Ejecutor EVM",
  "eth.tabs.merkle": "9 · Prueba de Merkle",
  "eth.tabs.wrapup": "10 · Cierre",
  "eth.ov.o9": "<b>9 · Prueba de Merkle</b> — cómo un cliente ligero verifica un solo valor sin tener todo el estado (animado)",
  "eth.ov.o10": "<b>10 · Cierre</b> — todo Ethereum en una página: el relevo, la reejecución y la analogía con Web2",

  // ---------- 9 · Prueba de Merkle ----------
  "eth.mk.nodesH": "Primero — ¿cada nodo guarda todo el world state?",
  "eth.mk.nodesLead":
    "\"Todos reejecutan\" solo funciona si <b>guardas el estado</b>. Pero <b>cuánto</b> guarda un nodo depende de su tipo. En especial, un <b>cliente ligero no guarda estado</b>, así que comprueba los valores con la <b>prueba de Merkle</b> de abajo.",
  "eth.mk.colNode": "Tipo de nodo",
  "eth.mk.colHold": "¿Guarda world state?",
  "eth.mk.colDesc": "Detalles",
  "eth.mk.fullK": "Nodo completo <small>(el más común)</small>",
  "eth.mk.fullHold": "✅ Estado actual (reciente)",
  "eth.mk.fullDesc":
    "Guarda el world state más reciente + todos los bloques. <b>Poda el estado intermedio muy antiguo (prune)</b>. Puede reconstruir desde génesis reejecutando si hace falta.",
  "eth.mk.archK": "Nodo de archivo",
  "eth.mk.archHold": "✅ Todo el estado histórico",
  "eth.mk.archDesc":
    "Guarda una <b>instantánea del estado en cada bloque</b> desde el bloque 1. Varios TB (para exploradores · infraestructura).",
  "eth.mk.lightK": "Cliente ligero",
  "eth.mk.lightHold": "❌ No guarda nada",
  "eth.mk.lightDesc":
    "Solo guarda <b>las cabeceras de bloque</b>. Para un saldo pregunta a un nodo completo y lo <b>verifica con una prueba de Merkle</b> contra el stateRoot de la cabecera.",
  "eth.mk.mergeNote":
    "<b>Desde The Merge (2022):</b> un nodo completo de Ethereum son en realidad <b>dos programas</b>. El <b>cliente de ejecución</b> (Geth · Nethermind, …) <b>guarda el world state y ejecuta la EVM</b>, mientras el <b>cliente de consenso</b> (Prysm · Lighthouse, …) se ocupa del PoS · atestaciones · slot/epoch. \"Guardar el world state\" es exactamente tarea del <b>cliente de ejecución</b>.",
  "eth.mk.conceptH": "Prueba de Merkle — verificar un valor sin todo el estado",
  "eth.mk.conceptLead":
    "Un cliente ligero confía solo en el <b>único stateRoot de la cabecera del bloque</b>. Para comprobar \"¿este saldo es real?\", un nodo completo que tiene el estado envía solo <b>unos pocos hashes hermanos del camino</b>; el cliente <b>recalcula el hash desde la hoja hasta la cima</b> y lo compara con el stateRoot. Elige una cuenta abajo y <b>reproduce la prueba</b> — el camino parpadea mientras sube hasta el stateRoot.",
  "eth.mk.conceptWho":
    "<b>¿Quién lo hace?</b> <b>No el proponente.</b> Es un intercambio bajo demanda entre nodos: \"el que tiene el estado (nodo completo) genera la prueba / el que no lo tiene (cliente ligero) la verifica\".",
  "eth.mk.simH": "Simulador del árbol de Merkle",
  "eth.mk.lieTitle": "¿Y si el nodo completo informa un saldo falso?",
  "eth.mk.lieLabel": "😈 El nodo completo miente (saldo falsificado)",
  "eth.mk.run": "▶ Reproducir prueba",
  "eth.mk.reset": "↺ Reiniciar",
  "eth.mk.proofH": "Lo que envía el nodo completo <small>(hashes hermanos + valor)</small>",
  "eth.mk.verifyH": "El recálculo del cliente ligero",
  "eth.mk.whyH": "Por qué no se puede falsificar",
  "eth.mk.why1":
    "Un hash <b>cambia por completo si cambia un solo valor.</b> Así que si un nodo completo infla un saldo, el stateRoot que recalcula el cliente ligero <b>no coincidirá con el de la cabecera</b>. Activa el interruptor <b>😈 mentira</b> de arriba y reprodúcelo para verlo — la clave es verificar la autenticidad con unos pocos hashes <b>sin confiar en el nodo completo</b>.",
  "eth.mk.why2":
    "<b>Analogía con git:</b> archivos (cuentas) → hashes de directorio (nodos intermedios) → el hash final del árbol (stateRoot). Igual que confiar en un solo hash de commit te permite <b>verificar parcialmente</b> que cierto archivo está realmente en ese commit.",
  "eth.mk.legend":
    "Empieza en las <b>hojas (cuentas)</b> de abajo, <b>empareja cada una con su hermano y aplica keccak</b>, subiendo <b>hacia arriba (↑)</b> un nivel cada vez. La cima es el <b>stateRoot</b>.",
  "eth.mk.up1": "↑ Concatena los dos nodos (N01, N23) y aplica keccak",
  "eth.mk.up2": "↑ Concatena las dos hojas hermanas y aplica keccak",
  "eth.mk.grpRoot": "combinar → stateRoot",
  "eth.mk.grpN01": "combinar → N01",
  "eth.mk.grpN23": "combinar → N23",
  "eth.mk.prove": "Probar {name}",
  "eth.mk.claim": "Valor declarado",
  "eth.mk.forged": "⚠ falsificado",
  "eth.mk.sib1": "Hash hermano ①",
  "eth.mk.sib2": "Hash hermano ②",
  "eth.mk.posR": "derecha",
  "eth.mk.posL": "izquierda",
  "eth.mk.step1":
    "① Empieza por el hash de la hoja de <b>{name}</b>. <span class=\"mono\">keccak({name}:{bal}) = {hash}</span>",
  "eth.mk.step2":
    "② Añade la hoja hermana <span class=\"mono\">{sib}</span> a la {pos} y aplica keccak otra vez → sube al padre <b>{parent}</b>.",
  "eth.mk.step3":
    "③ Añade el nodo hermano <span class=\"mono\">{sib}</span> a la {pos} y aplica keccak → ¡recalcula el <b>stateRoot</b>!",
  "eth.mk.step4ok":
    "④ El resultado recalculado <b>coincide con el stateRoot de la cabecera</b>. Verificado con solo 2 hashes hermanos, ¡sin necesitar todo el estado!",
  "eth.mk.step4bad":
    "④ Falsificar un valor hizo que el <b>hash de la cima fuera completamente distinto.</b> No coincide con el stateRoot de la cabecera, así que el cliente ligero lo rechaza al instante.",
  "eth.mk.vOk":
    "✔ stateRoot recalculado = stateRoot de la cabecera<br/><span class=\"mono\">{root}</span> — <b>este saldo es real.</b> Verificado sin confiar en el nodo completo.",
  "eth.mk.vBad":
    "✘ Recalculado <span class=\"mono\">{comp}</span> ≠ cabecera <span class=\"mono\">{header}</span><br/><b>No coincide → mentira detectada.</b> Un saldo falsificado nunca puede producir el mismo stateRoot.",

  // ---------- 10 · Cierre ----------
  "eth.wrap.heroH": "Cierre — Ethereum sintetiza un \"servidor que nunca para\" a partir de un <em>relevo</em>",
  "eth.wrap.heroLead":
    "Web2.0 tiene <b>un servidor central</b> funcionando 24/7. Ethereum <b>no tiene</b> tal servidor. En su lugar, <b>un nodo distinto toma el testigo (bloque) en cada slot</b>, avanzando el estado un paso, mientras los demás nodos <b>lo reverifican por su cuenta</b>. El \"servidor que nunca descansa\" es una <b>ilusión sintetizada por miles de nodos que corren el relevo por turnos</b>.",
  "eth.wrap.woA": "1 servidor central (24/7)",
  "eth.wrap.woArrow": "→ reemplazado por →",
  "eth.wrap.woB": "miles de nodos incentivados · relevo del testigo cada slot + reverificación mutua",
  "eth.wrap.relayH": "El relevo — el testigo es el <span class=\"wr-hl-block\">bloque + stateRoot</span>",
  "eth.wrap.relayLead":
    "En cada slot (12s), <b>un nodo proponente elegido al azar</b> ejecuta las tx para construir el nuevo world state y stateRoot (crea el testigo) y lo pasa al siguiente slot. <b>Los demás validadores toman el testigo y lo reejecutan</b>, calificando si el stateRoot coincide y votando. Cada 32 slots (= 1 epoch), cuando se acumulan suficientes votos pasa a <b>finalized</b> — bloqueado, irreversible.",
  "eth.wrap.sec": "12s",
  "eth.wrap.p1": "🏃 Proponente <b>#7</b><small>sorteo RANDAO</small>",
  "eth.wrap.p2": "🏃 Proponente <b>#42</b><small>rota a otro nodo</small>",
  "eth.wrap.p3": "🏃 Proponente <b>#13</b><small>intenta falsificar el stateRoot</small>",
  "eth.wrap.baton1": "📦 Bloque<br/><span class=\"mono\">stateRoot: a1c3…</span>",
  "eth.wrap.baton2": "📦 Bloque<br/><span class=\"mono\">stateRoot: 9f0b…</span>",
  "eth.wrap.baton3": "📦 Bloque<br/><span class=\"mono\">stateRoot: ☠ falso</span>",
  "eth.wrap.reexec": "✔ Los validadores reejecutan",
  "eth.wrap.agree": "≥ 2/3 de acuerdo",
  "eth.wrap.handoff": "pasar el<br/>estado",
  "eth.wrap.mismatch": "✘ reejecución → no coincide",
  "eth.wrap.rejected": "rechazado · testigo caído",
  "eth.wrap.justified": "justified ✔",
  "eth.wrap.finalized": "finalized 🔒 (irreversible)",
  "eth.wrap.epochLen": "1 epoch = 32 slots",
  "eth.wrap.pt1":
    "<b>Punto 1 · No corre siempre:</b> ningún nodo \"funciona 24/7 como un servidor\". Se despierta a reverificar <b>solo cuando llega un testigo (= llega un bloque)</b> y luego vuelve a descansar. La misma idea que el código de un contrato <b>durmiendo cuando no hay tx</b> (ejecución pasiva).",
  "eth.wrap.pt2":
    "<b>Punto 2 · La manipulación se descarta, no se castiga:</b> un bloque con stateRoot falsificado (slot 102) se detecta en la reverificación y <b>simplemente se rechaza/ignora</b>. El slashing solo ocurre en ataques al consenso mismo, como <b>doble firma o votos contradictorios</b>.",
  "eth.wrap.pt3":
    "<b>Punto 3 · La continuidad es sintética:</b> slot · epoch · votos · penalizaciones encajan como engranajes para producir <b>la apariencia de \"un servidor que nunca para\".</b> La realidad es <b>un relevo que corre por turnos mientras todos se reverifican</b>.",
  "eth.wrap.vsH": "Servidor Web2.0 vs el relevo de Ethereum",
  "eth.wrap.web2H": "Web2.0 — servidor central",
  "eth.wrap.web2List":
    "<li><b>Una máquina</b> corre 24/7 (un proceso residente)</li><li>Lo que calcula se <b>confía</b></li><li>Base de la confianza = <b>la empresa operadora</b></li><li>La empresa puede <b>cambiar valores/lógica</b> a voluntad</li><li>Si se detiene, el servicio se detiene (punto único de fallo)</li>",
  "eth.wrap.web3H": "Web3.0 — Ethereum",
  "eth.wrap.web3List":
    "<li><b>Sin servidor permanente.</b> Cada slot <b>un nodo distinto toma el testigo</b></li><li>Miles de nodos <b>reejecutan y comparan todos</b> (verificar, no confiar)</li><li>Base de la confianza = <b>incentivos económicos + teoría de juegos</b> (stake · recompensas · slashing)</li><li>El código es <b>inmutable</b>. Nadie puede cambiar el resultado</li><li>Si algunos nodos mueren, el resto mantiene el relevo</li>",
  "eth.wrap.vsConcl":
    "<b>En una línea:</b> donde Web2 justificaba la centralización con <b>\"una empresa en la que confiar\",</b> Ethereum la reemplazó por <b>\"un diseño de incentivos en el que no hace falta confiar (psicología humana)\".</b> La clave es resolver la centralización no con tecnología sino con <b>economía y teoría de juegos</b>.",
  "eth.wrap.sumH": "Todo lo que dejamos claro",
  "eth.wrap.sumFlow":
    "<div class=\"node\"><div class=\"n\">1</div><div class=\"t\">El código duerme</div><div class=\"d\">Un contrato es solo datos guardados en el estado. Se ejecuta solo cuando una tx lo llama (pasivo).</div></div><div class=\"node\"><div class=\"n\">2</div><div class=\"t\">No hay ejecución automática</div><div class=\"d\">\"Ejecutar al pasar 3000\" necesita un <b>keeper/bot</b> fuera de la cadena que vigile y llame vía tx. El precio lo introduce un <b>oráculo</b>.</div></div><div class=\"node\"><div class=\"n\">3</div><div class=\"t\">Todos reejecutan</div><div class=\"d\">Cada nodo calcula sobre <b>su propia copia</b>. Por eso v+1 hecho N veces no es v+N sino v+1 en todas partes (N personas resolviendo el mismo problema).</div></div><div class=\"node\"><div class=\"n\">4</div><div class=\"t\">El determinismo es condición</div><div class=\"d\">Nada de azar, APIs externas ni hora actual. Si no, cada nodo obtiene otra respuesta y la reverificación se rompe.</div></div><div class=\"node\"><div class=\"n\">5</div><div class=\"t\">Error = descartado / ataque = slashing</div><div class=\"d\">stateRoot erróneo → rechazado. Doble firma / votos contradictorios → slashing. Offline → penalización pequeña.</div></div><div class=\"node\"><div class=\"n\">6</div><div class=\"t\">justified → finalized</div><div class=\"d\">Una vez bloqueado por un voto de 2/3 es irreversible. Ahí el bloque se confirma en el world state.</div></div>",
  "eth.wrap.sumConcl":
    "<b>Conclusión:</b> un contrato inteligente no es un \"programa que vive por sí mismo\" sino un <b>motor de reglas inmutable que solo se mueve como se prometió cuando se le llama</b>, y <b>quién lo llama, y cuándo</b>, sigue viviendo en el mundo humano (Web2). Ethereum parece depender de Web2 <b>no porque sea impuro, sino porque intenta hacer más</b>.",

  // ---------- 7 · Escrow inmobiliario ----------
  "eth.re.h1": "Una compraventa inmobiliaria en Ethereum — el contrato de escrow",
  "eth.re.lead":
    "Esto une todo lo que has aprendido en <b>una transacción real</b>. En el sector inmobiliario tradicional, una <b>empresa de escrow, el registro de la propiedad y el agente</b> sostienen la confianza. Aquí el <b>código (un contrato)</b> asume ese papel — bloquea los fondos y solo se los entrega al vendedor cuando las condiciones se confirman. Observa cómo se mueven <b>tx · nonce · gas · storage · bloques · stateRoot</b> en cada paso.",
  "eth.re.name": "Inmueble",
  "eth.re.seller": "Vendedor",
  "eth.re.buyer": "Comprador",
  "eth.re.inspector": "Inspector",
  "eth.re.price": "Precio (ETH)",
  "eth.re.fee": "Comisión del inspector (ETH)",
  "eth.re.reset": "Reiniciar",
  "eth.re.step1": "① Publicar inmueble (deploy)",
  "eth.re.step2": "② Depositar fondos (deposit)",
  "eth.re.step3": "③ Confirmar título (confirm)",
  "eth.re.step4": "④ Pagar al vendedor (release)",
  "eth.re.stepRefund": "Cancelar · reembolso (refund)",
  "eth.re.role.buyer": "Comprador",
  "eth.re.role.seller": "Vendedor",
  "eth.re.role.inspector": "Inspector",
  "eth.re.role.contract": "Contrato de escrow",
  "eth.re.flow.deposit": "① deposit",
  "eth.re.flow.confirm": "② confirm",
  "eth.re.flow.release": "③ release",
  "eth.re.priceLbl": "Precio",
  "eth.re.feeLbl": "Comisión del inspector",
  "eth.re.state.None": "Sin publicar",
  "eth.re.state.Listed": "Publicado (esperando fondos)",
  "eth.re.state.Funded": "Fondos bloqueados (esperando confirmación)",
  "eth.re.state.Confirmed": "Confirmado (esperando pago)",
  "eth.re.state.Released": "Operación cerrada ✅",
  "eth.re.state.Refunded": "Cancelada (reembolsada)",
  "eth.re.hintStart":
    "<b>Inicio:</b> cuando el vendedor (<b>Bob</b>) pulsa <b>① Publicar inmueble</b>, el contrato Escrow se <b>despliega</b>. Eso es una cuenta dedicada + reglas para esta única operación.",
  "eth.re.hintListed":
    "<b>Siguiente:</b> el comprador (<b>Alice</b>) hace <b>② Depositar fondos</b>. El dinero queda bloqueado en el <b>contrato, no en el vendedor</b> — nadie puede tocarlo hasta que se cumplan las condiciones. (msg.value debe coincidir exactamente con el precio.)",
  "eth.re.hintFunded":
    "<b>Siguiente:</b> el <b>inspector neutral (Carol)</b> hace <b>③ Confirmar título</b>. Solo el inspector puede llamarlo (el código lo impone), y ningún fondo se mueve antes de la confirmación. Si Alice intenta confirm, hace <b>revert</b>.",
  "eth.re.hintConfirmed":
    "<b>Último paso:</b> pulsa <b>④ Pagar al vendedor</b> y el contrato <b>reparte los fondos bloqueados</b> — una <b>comisión para el inspector</b> y el resto para el <b>vendedor</b>. El inspector que hizo el trabajo cobra automáticamente por código.",
  "eth.re.hintReleased":
    "<b>Listo ✅</b> los saldos del vendedor y del <b>inspector (comisión)</b> subieron y el bloqueo del contrato ahora es 0. Mira cómo sube el saldo del inspector en el libro y cómo cambia el stateRoot en el explorador de bloques. Empieza una nueva operación con <b>Reiniciar</b>.",
  "eth.re.hintRefunded":
    "<b>Cancelada:</b> como fue antes de la confirmación, los fondos se <b>reembolsaron atómicamente al comprador</b> — todo o nada, sin estados a medias. Empieza una nueva operación con <b>Reiniciar</b>.",
  "eth.re.msgDeployed": "Escrow desplegado · {addr} · nonce {nonce}",
  "eth.re.stateH": "Estado actual del contrato · cuentas",
  "eth.re.stateLead":
    "Izquierda: saldos en vivo, storage del contrato y eventos. Derecha: el código Solidity que define las reglas — la función que acabas de llamar se ilumina.",
  "eth.re.ledgerH": "Saldos de las cuentas (partes)",
  "eth.re.blocksH": "Cómo se apila en bloques — tx + stateRoot",
  "eth.re.blocksLead":
    "Cada paso es una <b>transacción</b>; al entrar en un bloque, la huella de todo el estado — el <b>stateRoot</b> — cambia. Como los commits de git, nada se edita: <b>los bloques nuevos se apilan hacia adelante</b>. (Aquí el stateRoot es un keccak-256 del snapshot de cuentas+contratos de este simulador.)",
  "eth.re.blocksNote":
    "<b>Cómo leerlo:</b> cada bloque muestra su tx (quién · qué función) y el <code>stateRoot</code> justo después. Una tx que cambia el estado hace que el stateRoot sea <b>completamente distinto</b>; una tx con revert no cambia nada, así que el stateRoot se queda igual.",
  "eth.re.blocksEmpty": "Aún no hay bloques — ejecuta un paso.",
  "eth.re.genesisTx": "Estado génesis (antes de la operación)",
  "eth.re.srDiff": "stateRoot cambió",
  "eth.re.srSame": "stateRoot sin cambios (revert)",
  "eth.re.vsH": "Inmobiliaria tradicional ↔ escrow en Ethereum",
  "eth.re.vsCol1": "Rol",
  "eth.re.vsCol2": "Venta tradicional",
  "eth.re.vsCol3": "Escrow en Ethereum",
  "eth.re.vsRows":
    "<tr><td class=\"k\">Custodia de fondos</td><td>Empresa de escrow · cuenta bancaria</td><td><b>Bloqueados en el contrato</b> (nadie puede tomarlos)</td></tr><tr><td class=\"k\">Verificación de condiciones</td><td>Registro · abogado · agente</td><td><b>Tx del inspector</b> (confirm)</td></tr><tr><td class=\"k\">Pago</td><td>Una persona hace la transferencia (retrasos · errores)</td><td><b>Código, automático</b> (solo si se cumple la condición)</td></tr><tr><td class=\"k\">Cancelación · reembolso</td><td>Disputas · posibles demandas</td><td><b>Reembolso atómico vía refund()</b></td></tr><tr><td class=\"k\">En quién confías</td><td>Varias instituciones y personas</td><td><b>Código desplegado</b> (inmutable)</td></tr><tr><td class=\"k\">Registro</td><td>Libros por institución (aislados)</td><td><b>Bloques · stateRoot</b> (público · verificable)</td></tr>",
  "eth.re.vsWhy":
    "<b>La clave:</b> lo que cambió es <i>en quién confías</i>. La confianza que estaba repartida entre instituciones y personas ahora se concentra en <b>una pieza de código que no puede cambiarse tras el deploy</b>. La otra cara: <b>si el código tiene un bug, ese bug también es la regla</b> (pestaña 3), y por eso los servicios reales pasan auditorías.",

  "eth.ov.h1": "Ethereum es \"un libro contable que ejecuta código\"",
  "eth.ov.lead":
    "Si Bitcoin es un <b>libro contable de dinero</b>, Ethereum es un libro sobre el que puedes poner <b>programas (contratos inteligentes)</b>. Una vez desplegado, nadie puede cambiar el código, y se <b>ejecuta automáticamente</b> cuando se cumplen las condiciones. Desde The Merge, el consenso es <b>Proof of Stake</b> — los validators depositan 32 ETH en staking para proponer y hacer attest de bloques.",
  "eth.ov.btcN": "Bitcoin",
  "eth.ov.btcT": "PoW · UTXO · libro de dinero",
  "eth.ov.btcD":
    "Registra \"quién posee cuánto\". Scripting mínimo. Todo apostado a la seguridad y la simplicidad.",
  "eth.ov.ethN": "Ethereum",
  "eth.ov.ethT": "PoS · cuentas · libro que ejecuta código",
  "eth.ov.ethD":
    "Registra saldos + <b>código y storage de contratos</b>. Tokens, exchanges, seguros — todo son \"programas en la cadena\".",
  "eth.ov.why":
    "<b>En una línea:</b> un contrato inteligente es <b>una caja fuerte que solo se mueve según reglas escritas de antemano</b>. Un banco puede cambiar sus condiciones; un contrato desplegado no puede cambiarse — <b>ni siquiera por su creador</b>. Despliega y llama uno tú mismo en este sitio.",
  "eth.ov.cross":
    "← La validación funciona exactamente como en las pestañas de Bitcoin: cada nodo <b>comprueba las reglas por su cuenta</b>. Lo que difiere es la defensa Sybil — PoW usa electricidad, PoS usa colateral (32 ETH + slashing).",
  "eth.ov.orderH": "Ruta sugerida",
  "eth.ov.o1": "<b>1 · Keccak · Dirección</b> — cómo nacen las direcciones a partir de hashes (vs SHA-256)",
  "eth.ov.o2": "<b>2 · Cuentas · Gas</b> — saldo · nonce · comisiones EIP-1559 (vs UTXO)",
  "eth.ov.o3": "<b>3 · Contratos inteligentes</b> — deploy → llamada → storage · eventos · gas (el núcleo)",
  "eth.ov.o4": "<b>4 · Tokens (ERC-20)</b> — un token es la tabla de saldos de un contrato (ejemplo SAND)",
  "eth.ov.o5": "<b>5 · Oráculos</b> — la cadena no puede ver el mundo · price feed al estilo Chainlink · seguros",
  "eth.ov.o6": "<b>6 · Consenso PoS</b> — slots → attest → justified/finalized · slashing",
  "eth.ov.o7": "<b>7 · Bienes raíces</b> — un escrow que une todo lo aprendido (proyecto final)",
  "eth.ov.o8": "<b>8 · Ejecutor EVM</b> — recorre el bytecode paso a paso mientras se ejecuta",

  "eth.acc.h1": "Las cuentas guardan el saldo \"como un número\" (una elección distinta a UTXO)",
  "eth.acc.lead":
    "Bitcoin <i>calculaba</i> tu saldo sumando fragmentos de moneda (UTXOs). Ethereum guarda un <b>número de saldo directamente, como una cuenta bancaria</b>. Enviar solo <b>baja tu número y sube el del otro</b> — sin cambio, sin fragmentos UTXO. Pruébalo.",
  "eth.acc.feeBoxH": "Desplegar fórmulas de comisión (EIP-1559)",
  "eth.acc.feeBoxBody":
    "<p><b>Unidades:</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>. El tip es <b>Gwei/gas</b>, no ETH.</p><p><b>¿Por qué ×21.000?</b> Gwei es un precio unitario por gas; una transferencia simple de ETH usa un gas fijo de <span class=\"mono\">21,000</span>. (Tokens/contratos usan más.)</p><ul class=\"tight\"><li><b>gas used</b> = 21,000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">(fijo en este simulador)</span> → se quema</li><li><b>tip</b> = entrada T Gwei/gas → al proposer del bloque</li></ul><pre class=\"mono eth-fee-formula\">quema = 21,000 × 10 × 10⁻⁹ = 0.000210 ETH\ntip   = 21,000 × T × 10⁻⁹ ETH → proposer\npago  = value + quema + tip</pre><p class=\"small muted\">Ejemplo: T=5 → tip = 0.000105 ETH. No es \"un tip de 5 ETH\".</p>",
  "eth.acc.shortWhy":
    "<b>En corto:</b> <b>value → destinatario</b>, <b>tip → proposer</b>, <b>base fee → se quema</b>. Mira cómo se mueven los saldos y cómo el valor <b>n=</b> (nonce) sube de uno en uno a la derecha.",
  "eth.acc.vsH": "UTXO de Bitcoin ↔ cuenta de Ethereum",
  "eth.acc.vsCol1": "Aspecto",
  "eth.acc.vsCol2": "Bitcoin (UTXO)",
  "eth.acc.vsCol3": "Ethereum (cuenta)",
  "eth.acc.vsRows":
    "<tr><td class=\"k\">Saldo</td><td>Suma de fragmentos de moneda (UTXO) — no se guarda directamente</td><td>Se guarda <b>directamente como un número</b></td></tr><tr><td class=\"k\">Al enviar</td><td>Se consumen UTXOs enteros + se crea <b>cambio</b> nuevo</td><td>Tu saldo <b>−</b>, el suyo <b>+</b> (sin cambio)</td></tr><tr><td class=\"k\">Protección contra reutilización</td><td>Un UTXO se <b>destruye</b> al gastarse (automático)</td><td>Protegido por un número <b>nonce</b> (tarjeta de abajo)</td></tr><tr><td class=\"k\">Paralelismo</td><td>UTXOs distintos se procesan fácil a la vez</td><td>Una cuenta es <b>secuencial</b> (orden de nonce)</td></tr><tr><td class=\"k\">Estado de contratos</td><td>Difícil de expresar</td><td><b>Natural</b> vía saldo + storage</td></tr>",
  "eth.acc.vsWhy":
    "<b>¿Por qué la división?</b> Bitcoin se centró en el \"dinero\" y eligió UTXO por su <b>simplicidad, paralelismo y privacidad</b>; Ethereum tenía que rastrear el <b>estado de los programas (contratos)</b>, así que un <b>modelo de cuentas</b> que lee directamente \"cuánto / qué valor tiene esta dirección ahora\" era más cómodo. Ni mejor ni peor — <b>diseños con objetivos distintos</b>.",
  "eth.acc.whereH": "Pero ¿dónde se guarda exactamente este saldo?",
  "eth.acc.whereBody":
    "<p>\"Se guarda directamente\" no significa que el saldo esté <b>dentro de un bloque</b>. Vive en el <b>world state</b> que mantiene cada nodo — un enorme mapa <code>dirección → objeto de cuenta</code>. Una cuenta son solo 4 campos.</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>Campo</th><th>Significado</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>Número de txs que ha enviado esta cuenta (el número de la tarjeta de abajo)</td></tr><tr><td class=\"k\">balance</td><td><b>Saldo (en wei)</b> ← aquí</td></tr><tr><td class=\"k\">storageRoot</td><td>Hash resumen del storage del contrato (vacío para EOAs de billetera)</td></tr><tr><td class=\"k\">codeHash</td><td>Hash del código del contrato (vacío para EOAs de billetera)</td></tr></tbody></table><p>Billeteras (EOA) y contratos comparten la <b>misma estructura</b>; una billetera simplemente deja vacíos los dos últimos campos.</p><p><b>Qué va en un bloque:</b> solo el hash superior del árbol de hashes de todo el mapa = el <b>state root</b> se escribe en la <b>cabecera del bloque</b>. Los números de saldo los mantiene cada nodo, que actualiza su propia DB al ejecutar transacciones. Así que un bloque = <b>\"una huella del estado en este punto (state root)\" + \"las txs de ese bloque\"</b>.</p><p class=\"small muted\"><b>↔ Bitcoin:</b> Bitcoin no tiene ningún lugar que guarde un saldo — los nodos mantienen el <b>conjunto UTXO</b> y calculan \"la suma de UTXOs gastables por mi dirección\" al vuelo. Ethereum mantiene directamente un <b>número de saldo por dirección</b>, así que una consulta es una sola lectura.</p>",
  "eth.acc.nonceH": "nonce — el \"número anti-reutilización\" del modelo de cuentas",
  "eth.acc.nonceLead":
    "Un nonce es un <b>contador de transacciones por cuenta</b> (0, 1, 2, …). Veamos por qué es imprescindible.",
  "eth.acc.nonceProblem":
    "<b>Problema:</b> un saldo de ETH es solo un <b>número</b>. ¿Y si alguien <b>retransmite tu tx firmada de \"1 ETH a Bob\" 10 veces</b>? En Bitcoin el UTXO gastado ya no existe, así que se bloquea automáticamente — pero una cuenta solo tiene un saldo, así que <b>no hay nada que lo impida.</b>",
  "eth.acc.nonceBox":
    "<span class=\"who\">{who}</span><span class=\"note\"> — nonce actual</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ la próxima tx es #{cur}, si tiene éxito</span> <span class=\"nxt\">{next}</span></span>",
  "eth.acc.nonceRoles":
    "<b>Solución — un nonce hace dos cosas a la vez:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① Protección contra replay</b> — cada número se usa exactamente una vez. Una tx con un nonce ya usado se rechaza, así que las retransmisiones fallan.</li><li><b>② Orden</b> — debe ir 0 → 1 → 2. Una tx que salta adelante espera (pending) hasta que lleguen las anteriores.</li></ul>",
  "eth.acc.nonceSig":
    "<b>🔑 Conexión con la firma de la pestaña 1:</b> el nonce <b>forma parte de lo que firmas</b> (el sighash). Así que incluso una transferencia idéntica produce una <b>firma completamente distinta cuando el nonce difiere</b> → reproducir una firma vieja falla porque ese nonce ya está gastado. \"La firma sella el contenido\" se convierte aquí en protección contra la reutilización.",
  "eth.acc.nonceDeeperH": "Más a fondo: tx pending / atascada · hueco de nonce · direcciones de contrato",
  "eth.acc.nonceDeeperBody":
    "<p><b>Tx atascada:</b> si el nonce 5 se envía con una comisión baja y se estanca, los nonce 6·7 <b>deben esperar</b> (orden). Solución: reenvía el mismo nonce 5 con una comisión mayor para <b>sobrescribirlo</b>.</p><p><b>Hueco de nonce:</b> si por error envías el 7 después del 5, el 7 <b>espera para siempre</b> hasta que llegue el 6 — el mempool lo retiene esperando al 6.</p><p><b>Relación con las direcciones de contrato:</b> como en la pestaña 1, una dirección de contrato = <code>keccak(dirección del deployer + nonce)</code>. Así que <b>incluso el mismo deployer obtiene una dirección nueva cada vez</b> a medida que el nonce crece.</p>",
  "eth.acc.gasH": "Gas · EIP-1559 — cómo se reparte la comisión",
  "eth.acc.gasLead":
    "Cambia el tip al enviar y la vista previa de arriba (quema · tip · pago) se actualiza en vivo. Aquí tienes de dónde salen esos números.",
  "eth.acc.gasWhat":
    "<b>¿Qué es el gas?</b> Cada cómputo y escritura en storage consume recursos de los nodos. El gas es la <b>unidad que mide ese trabajo</b>. Una transferencia simple de ETH está fijada en <b>21,000 gas</b> por el protocolo (tokens/contratos cuestan más). <b>Comisión = gas × precio por gas</b> — desincentiva el spam y recompensa a los validators.",
  "eth.acc.gasEip":
    "<b>EIP-1559 — el precio tiene dos partes:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — se fija <b>automáticamente según la congestión</b>. Aquí, fijo en <b>10 Gwei/gas</b>. → no va a nadie y se <b>quema</b>.</li><li><b>priority tip</b> — el extra que tú eliges (la entrada de arriba). → va al <b>proposer (validator)</b> del bloque.</li></ul>",
  "eth.acc.burnWhy":
    "<b>🔥 Qué significa quemar:</b> el ETH pagado como base fee <b>desaparece para siempre</b>. Cuanto más ocupada esté la red, más se quema, creando una <b>presión deflacionaria que reduce el ETH total</b>. La dirección se parece a Bitcoin \"frenando la emisión nueva con halvings\", pero Ethereum <b>quema monedas que ya existen</b>.",
  "eth.acc.propTag": "proposer",
  "eth.acc.burnLbl": "quema",
  "eth.acc.from": "Remitente",
  "eth.acc.to": "Destinatario",
  "eth.acc.amt": "Cantidad (ETH)",
  "eth.acc.gas": "tip (Gwei/gas)",
  "eth.acc.feePreview": "quema {burn} · tip {tip} → {prop} · {from} paga {paid}",
  "eth.acc.send": "Enviar",
  "eth.acc.sendFail": "Envío fallido",

  // ---------- 1 · Keccak · Dirección ----------
  "eth.kc.h1": "Keccak-256 — el hash que crea los \"ids\" de Ethereum",
  "eth.kc.lead":
    "Casi cada id que encuentras en Ethereum — direcciones, selectores de función, topics de eventos, direcciones de contrato — sale de este único hash. El mismo propósito que el SHA-256 de Bitcoin, pero Ethereum usa <b>Keccak-256</b>. Prueba a hashear algo primero.",
  "eth.kc.playIn": "Entrada (cualquier texto)",
  "eth.kc.playOutLbl": "Keccak-256 (entrada de cualquier longitud → siempre 32 bytes = 64 hex)",
  "eth.kc.avalanche":
    "<b>Efecto avalancha:</b> cambia un carácter y cerca de la mitad de los bits del resultado se invierten. No se puede revertir (hash→entrada), y la misma entrada siempre da el mismo resultado — las mismas propiedades que SHA-256.",
  "eth.kc.sha3H": "Trampa: Keccak-256 ≠ NIST SHA3-256",
  "eth.kc.sha3Body":
    "<p>Ethereum usa el Keccak original de <b>antes</b> de que el estándar se finalizara, así que difiere del SHA3-256 del NIST en <b>un byte de padding</b>. Misma entrada, resultado completamente distinto.</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (pad 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (pad 0x06)</pre><p class=\"small muted\">Por eso llamar a <code>sha3_256</code> en una librería no produce direcciones de Ethereum. Debes usar <code>keccak256</code>.</p>",
  "eth.kc.addrH": "Dirección = los \"últimos 20 bytes\" de keccak(clave pública)",
  "eth.kc.addrLead":
    "Una dirección de billetera es la clave pública pasada por Keccak y recortada a los <b>últimos 20 bytes</b>. (Esta demo hashea un nombre en vez de una clave pública — misma regla.)",
  "eth.kc.addrIn": "Entrada (demo: nombre → hash → dirección)",
  "eth.kc.hashLbl": "① Keccak-256 completo (32 bytes) — los primeros 12 bytes en gris, solo se usan los últimos 20",
  "eth.kc.addrLbl": "② Dirección = últimos 20 bytes + 0x",
  "eth.kc.addrWhy":
    "<b>¿Por qué descartar los primeros 12 bytes?</b> El hash mide 32 bytes pero una dirección solo necesita <b>20 bytes (160 bits)</b> — la forma corta ahorra espacio manteniendo <b>prácticamente en cero la probabilidad de que dos personas distintas caigan en la misma dirección</b> (esa coincidencia se llama \"colisión de hash\" — con 20 bytes hay 2¹⁶⁰ posibilidades, así que en la práctica nunca ocurre). Las claves reales hashean las coordenadas X·Y de secp256k1 (<b>64 bytes</b>, sin el prefijo 0x04).",
  "eth.kc.idsH": "Keccak por todo Ethereum — un vistazo rápido",
  "eth.kc.idsLead":
    "Ethereum usa Keccak en muchos sitios. Cada uso <b>hashea una entrada distinta</b> y luego <b>se queda solo con la parte que necesita</b>. Por ahora, haz clic por ahí y quédate con la sensación de que \"Keccak aparece por todas partes\" — qué son exactamente los selectores, topics y direcciones de contrato se cubre en las pestañas siguientes.",
  "eth.kc.selH": "① Selector de función — los <b>primeros 4 bytes</b> del hash de la firma",
  "eth.kc.selLead":
    "El id que dice \"¿qué función?\" en una llamada. Es el prefijo que se usa cuando llamas buy()/transfer() en la pestaña 3.",
  "eth.kc.selIn": "Firma de la función",
  "eth.kc.selOut":
    "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ selector <b class=\"mono\">0x{sel}</b> <span class=\"muted\">(primeros 8 hex = 4 bytes)</span>",
  "eth.kc.topicH": "② topic0 del evento — los <b>32 bytes completos</b> del hash de la firma",
  "eth.kc.topicLead":
    "El valor que marca un log como \"esto es un evento Transfer\". Es el topic0 de los logs de eventos de las pestañas 3 y 4.",
  "eth.kc.topicIn": "Firma del evento",
  "eth.kc.topicOut":
    "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">(se conservan los 32 bytes completos)</span>",
  "eth.kc.caH": "③ Dirección de contrato — últimos 20 bytes de keccak(<b>dirección del deployer + nonce</b>)",
  "eth.kc.caLead":
    "Cada deploy sube el nonce, así que la dirección cambia cada vez. Desplegar la máquina expendedora en la pestaña 3 usa exactamente esta regla.",
  "eth.kc.caDeployer": "Deployer (nombre)",
  "eth.kc.caNonce": "nonce",
  "eth.kc.caOut":
    "keccak(\"{pre}\")<br>→ dirección del contrato <b class=\"mono\">{addr}</b> <span class=\"muted\">(últimos 20 bytes)</span>",
  "eth.kc.when":
    "<b>Resumen — la misma <u>función</u> hash en muchos sitios</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>Dirección</b> ← hash de la <b>clave pública</b> → últimos 20 bytes</li><li><b>Dirección de contrato</b> ← hash de <b>deployer+nonce</b> → últimos 20 bytes</li><li><b>Selector de función</b> ← hash de la <b>firma</b> → primeros 4 bytes</li><li><b>topic0 del evento</b> ← hash de la <b>firma</b> → 32 bytes completos</li></ul>",
  "eth.kc.deeperH": "Más a fondo: ubicación de storage de un mapping · CREATE2 · direcciones con checksum",
  "eth.kc.deeperBody":
    "<p><b>Ubicación de storage de un mapping:</b> dónde vive <code>balanceOf[Alice]</code> en storage también lo decide <code>keccak(key ‖ slot#)</code> — la matemática real de direcciones detrás de la \"tabla de storage del token\" de la pestaña 4.</p><p><b>CREATE2:</b> en vez del nonce, la dirección es <code>keccak(0xff ‖ deployer ‖ salt ‖ keccak(código))</code> — calculable antes del deploy, así que las L2 y las billeteras dependen de ello.</p><p><b>Direcciones con checksum (EIP-55):</b> las mayúsculas y minúsculas de una dirección se derivan hasheando la propia dirección. Es un checksum que atrapa errores, así que las mayúsculas mezcladas de <code>0xAbC…</code> realmente significan algo.</p>",

  // Tarjeta 2.5 — creación de billetera (BTC↔ETH)
  "eth.kc.genH": "Entonces, ¿de dónde sale la clave pública? — 3 pasos hasta una billetera",
  "eth.kc.genLead":
    "Crear una billetera es solo <b>número aleatorio (clave privada) → multiplicación de curva elíptica → clave pública → hash → dirección</b>. Los dos primeros pasos (privada→pública) son <b>idénticos a Bitcoin</b> (misma curva secp256k1); <b>solo difiere la función hash de la dirección</b>. Para ver visualizada esta \"multiplicación de curva elíptica (salto)\", mira la <b>pestaña 4 de Bitcoin</b>.",
  "eth.kc.genCol1": "Paso",
  "eth.kc.genCol2": "Bitcoin",
  "eth.kc.genCol3": "Ethereum",
  "eth.kc.genRows":
    "<tr><td class=\"k\">① Clave privada</td><td><b>Aleatorio</b> de 256 bits</td><td><b>Aleatorio</b> de 256 bits <span class=\"same\">igual</span></td></tr><tr><td class=\"k\">② Clave pública</td><td class=\"mono\">privkey × G (secp256k1)</td><td class=\"mono\">privkey × G <span class=\"same\">misma curva</span></td></tr><tr><td class=\"k\">③ Dirección</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) últimos 20B → 0x… <span class=\"diff\">hash distinto</span></td></tr><tr><td class=\"k\">Firma</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">igual</span></td></tr><tr><td class=\"k\">Frase semilla</td><td>BIP-39 (12/24 palabras)</td><td>BIP-39 <span class=\"same\">igual</span></td></tr><tr><td class=\"k\">Ruta de cuenta</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">solo el número</span></td></tr><tr><td class=\"k\">Dónde se guarda</td><td>wallet.dat · chip de hardware</td><td>extensión del navegador (cifrada) · chip de hardware</td></tr>",
  "eth.kc.genKey":
    "<b>🔑 Punto clave:</b> los <b>fundamentos (claves, firmas, semilla) son casi iguales en ambas cadenas.</b> Por eso <b>una sola billetera de hardware puede gestionar BTC y ETH a la vez</b>. La diferencia visible es básicamente solo la <b>codificación de la dirección (el hash)</b>.",
  "eth.kc.genStoreH": "¿Dónde se guarda la clave privada? · frase semilla · dónde ocurre la firma",
  "eth.kc.genStore":
    "<p><b>La clave privada no está en la blockchain.</b> La cadena solo contiene direcciones, saldos, transacciones y firmas. La clave privada vive <b>solo en tu billetera</b> — los nodos nunca la ven (si la vieran, cualquiera podría robar tus fondos).</p><ul class=\"tight\"><li><b>MetaMask</b> — guardada en el almacenamiento de la extensión del navegador, <b>cifrada con tu contraseña</b>, descifrada solo cuando hace falta.</li><li><b>Billetera de hardware (Ledger·Trezor)</b> — encerrada en un chip seguro, <b>nunca sale del dispositivo</b>; la firma ocurre en el propio dispositivo.</li><li><b>Frase semilla (12 palabras)</b> — la <b>semilla</b> de todas tus claves privadas. Ella sola puede recuperar todas las cuentas → si se filtra, lo pierdes todo.</li></ul><p><b>La firma ocurre \"dentro de tu dispositivo\".</b> La billetera firma la tx localmente con la clave privada → solo la <b>firma + tx</b> van a la cadena → los nodos <b>solo verifican con la clave pública</b>. La asimetría de \"firmar = solo yo, verificar = cualquiera\".</p>",

  "eth.acc.contrastEth": "ETH nativo (gestionado por el protocolo)",
  "eth.acc.contrastEthHint": "El campo balance del objeto de cuenta · no es UTXO · igual que la pestaña 1",
  "eth.acc.contrastTok": "Libro de la app · {token} (storage)",
  "eth.acc.contrastTokHint": "La cantidad de token (value) no es ETH · pero el gas de ejecución se paga en ETH",
  "eth.acc.tokAmt": "Cantidad",
  "eth.acc.tokOk":
    "Storage actualizado: {from} → {to} · {amt} {token}. Lo que se movió es {token}, no ETH — pero <b>el gas se sigue pagando en ETH</b>.",
  "eth.logH": "Registro del motor",

  // ---------- 8 · Ejecutor EVM ----------
  "eth.evm.h1": "EVM — la CPU que ejecuta Ethereum",
  "eth.evm.lead":
    "Un contrato inteligente es en última instancia <b>bytecode</b>, y la CPU virtual que lo ejecuta instrucción a instrucción (opcode) es la <b>EVM</b>. Mete una tx (instrucción) en el world state (datos), y la EVM quema gas para ejecutarla y producir un <b>nuevo estado</b>. Como la JVM, es una <b>máquina virtual basada en pila</b>, y como el event loop de JS, <b>corre en un solo hilo hasta completarse</b>.",
  "eth.evm.mapCol1": "Computadora",
  "eth.evm.mapCol2": "Ethereum",
  "eth.evm.mapCol3": "Qué es",
  "eth.evm.mapRows":
    "<tr><td class=\"k\">Disco / DB (todo)</td><td>world state</td><td>Todos los saldos de cuentas + todo el storage de contratos</td></tr><tr><td class=\"k\">Un archivo / tabla dentro</td><td>storage</td><td>Las casillas persistentes de un contrato (parte del world state)</td></tr><tr><td class=\"k\">RAM (volátil)</td><td>stack · memory</td><td>Desaparece al terminar la tx</td></tr><tr><td class=\"k\">Programa a ejecutar</td><td>tx</td><td>Quién · qué función · argumentos</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>Ejecuta el bytecode opcode a opcode</td></tr><tr><td class=\"k\">Electricidad / reloj</td><td>gas</td><td>Costo y límite de la ejecución</td></tr><tr><td class=\"k\">Checksum de toda la DB</td><td>stateRoot</td><td>Huella de todo el world state</td></tr>",
  "eth.evm.analogy":
    "<b>Parecido a la JVM:</b> ambas son <b>máquinas de pila</b> — calculas apilando valores en una pila, no en registros. <code>PUSH 3, PUSH 4, ADD</code> → 7 en la pila. <b>Parecido al event loop de JS:</b> un solo hilo, <b>corre hasta completarse</b> (nunca se interrumpe), y termina o hace revert por completo.",
  "eth.evm.determinism":
    "<b>La diferencia clave:</b> la EVM debe ser <b>totalmente determinista</b> — sin <code>random</code>, sin reloj, sin I/O de red. Cada nodo del mundo ejecuta la misma tx y debe obtener <b>exactamente la misma pila, storage y gas</b>, o el consenso se rompe. Por eso también existe el gas (para frenar bucles infinitos / DoS).",
  "eth.evm.runH": "Ejecútalo paso a paso, un opcode a la vez",
  "eth.evm.runLead":
    "Elige un programa y pulsa <b>Siguiente paso</b>: cada vez que corre un opcode, observa cómo cambian la <b>pila, el storage y el gas</b> — igual que un visualizador del event loop.",
  "eth.evm.program": "Programa",
  "eth.evm.calldata": "Entrada v (calldata)",
  "eth.evm.calldataPrice": "Precio price (calldata)",
  "eth.evm.exSstoreEscrow":
    "<b>SSTORE</b> — actualización del storage del escrow: <b>{slot} ← {val}</b>. Los state/price/locked de la pestaña 7 son exactamente estas escrituras de slot.",
  "eth.evm.stepBack": "◀ Atrás",
  "eth.evm.step": "▶ Siguiente paso",
  "eth.evm.runAll": "⏩ Ejecutar todo",
  "eth.evm.reset": "↺ Reiniciar",
  "eth.evm.bytecodeH": "Bytecode · PC",
  "eth.evm.stackH": "Stack (tope ↑ · volátil)",
  "eth.evm.memoryH": "Memory (volátil)",
  "eth.evm.storageH": "Storage (casillas de este contrato · parte del world state)",
  "eth.evm.gasH": "Gas",
  "eth.evm.gasUsed": "usado",
  "eth.evm.gasLeft": "restante",
  "eth.evm.emptyStack": "La pila está vacía",
  "eth.evm.emptyMem": "Sin memoria usada",
  "eth.evm.emptyStorage": "Aún no se ha escrito nada en storage",
  "eth.evm.exInit": "Estado inicial antes de la ejecución — pila, memoria y storage vacíos, gas lleno. Pulsa <b>Siguiente paso</b> para ejecutar los opcodes uno a uno.",
  "eth.evm.exPush": "<b>PUSH1 {v}</b> — empuja el valor inmediato {v} al tope de la pila.",
  "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — lee la entrada de la tx (v) y la empuja a la pila. (el offset que estaba en la pila se consume)",
  "eth.evm.exAdd": "<b>ADD</b> — saca los dos valores del tope, los suma y devuelve el resultado a la pila.",
  "eth.evm.exMul": "<b>MUL</b> — saca los dos valores del tope, los multiplica y empuja el resultado.",
  "eth.evm.exSub": "<b>SUB</b> — saca los dos valores del tope, los resta y empuja el resultado.",
  "eth.evm.exSstore":
    "<b>SSTORE</b> — saca (slot, valor) y lo <b>escribe permanentemente en storage</b>. ¡Este es el momento en que cambia el world state! Por eso es tan caro en gas (20000 para 0→valor).",
  "eth.evm.exSload": "<b>SLOAD</b> — lee un valor de un slot de storage y lo empuja a la pila.",
  "eth.evm.exMstore": "<b>MSTORE</b> — escribe un valor en la memoria volátil. (desaparece al terminar la tx)",
  "eth.evm.exStop": "<b>STOP</b> — la ejecución termina ✅. El storage final de esta tx queda confirmado y se produce un nuevo stateRoot que lo refleja.",
  "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — la ejecución se detiene y <b>todos los cambios de estado se revierten</b>. Pero el gas gastado hasta aquí no se devuelve.",
  "eth.evm.gitH": "World state ↔ stateRoot — como git",
  "eth.evm.gitLead":
    "A la izquierda está el <b>storage</b> de este contrato (una pieza del world state); a la derecha, un <b>stateRoot educativo</b> hasheado a partir de él. En una cadena real el stateRoot hashea <b>todos los saldos de cuentas + todo el storage de contratos</b>. Cuando SSTORE cambia un valor, se añade un commit — y <b>el historial se queda</b> aunque cambies de programa.",
  "eth.evm.gitTree": "storage (parte del world state)",
  "eth.evm.gitRoot": "stateRoot · hash del commit",
  "eth.evm.gitHistH": "Historial de commits",
  "eth.evm.clearHist": "Borrar historial",
  "eth.evm.gitEmpty": "Aún no hay commits — avanza pasos hasta llegar a un SSTORE.",
  "eth.evm.gitRootFirst": "Primer snapshot (hash del estado vacío)",
  "eth.evm.gitRootChanged": "Cambió ↑ distinto del commit anterior {prev} — prueba de que el storage se movió",
  "eth.evm.gitRootSame": "Igual que el commit anterior — sin cambios en storage",
  "eth.evm.commitGenesis": "génesis · storage vacío",
  "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
  "eth.evm.commitStop": "STOP · {prog} completado",
  "eth.evm.commitSnap": "Snapshot",
  "eth.evm.whyH": "Por qué esto es el verdadero núcleo de Ethereum",
  "eth.evm.why1":
    "<b>ERC-20, oráculos y DeFi son todos apps que corren encima de esto.</b> Código del contrato = clase, dirección desplegada = una instancia, storage = los campos de esa instancia, llamada a función = llamada a método. La EVM es el motor que realmente ejecuta esos métodos.",
  "eth.evm.why2":
    "<b>Por qué SSTORE es caro:</b> la pila y la memoria son como la RAM y desaparecen al terminar la tx, pero <b>el storage es como el disco — permanente</b> y parte del world state, así que cada nodo debe conservarlo para siempre. Por eso una escritura en storage (20000 gas) empequeñece a la aritmética (3 gas).",
  "eth.evm.why3":
    "<b>La esencia:</b> <code>new_state = EVM.execute(state, tx)</code> y luego <code>stateRoot = hash(new_state)</code>. Cuando entiendes esta máquina de transición de estados, todo lo demás parece 'instancias corriendo encima de ella'.",

  "eth.sc.h1": "Contratos inteligentes — despliega una máquina expendedora",
  "eth.sc.lead":
    "Abajo hay una <b>SnackMachine</b> real en Solidity. Despliégala y su código queda congelado en la cadena; cualquiera puede llamar <code>buy()</code>. <b>Ni siquiera el owner puede cambiar las reglas.</b>",
  "eth.sc.acctTypesH": "Primero — Ethereum tiene dos tipos de cuentas",
  "eth.sc.eoaN": "Cuenta de billetera (EOA)",
  "eth.sc.eoaT": "Alice · Bob · tu MetaMask",
  "eth.sc.eoaD":
    "Dirección = últimos 20 bytes de keccak(<b>clave pública</b>). <b>Tiene clave privada</b>, así que puede iniciar transacciones firmando.",
  "eth.sc.caN": "Cuenta de contrato",
  "eth.sc.caT": "SnackMachine · SAND · Uniswap",
  "eth.sc.caD":
    "Dirección = últimos 20 bytes de keccak(<b>dirección del deployer + nonce</b>). <b>Sin clave privada</b> — en su lugar tiene código y storage, y solo actúa cuando la llaman.",
  "eth.sc.txKinds":
    "<b>Transferir, desplegar y llamar son todos \"la misma tx\" — cada una sube el nonce en +1.</b> Todo lo que una EOA envía es una transacción; solo difieren <code>to</code>/<code>data</code>. Así que un deploy consume un nonce igual que una transferencia, y ese nonce se convierte en el ingrediente de la dirección de contrato de arriba.<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>Acción</th><th>Cómo se ve la tx</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">Transferencia simple</td><td><code>to</code>=destinatario · value · sin <code>data</code></td><td>+1</td></tr><tr><td class=\"k\">Deploy de contrato</td><td><code>to</code>=<b>vacío (null)</b> · <code>data</code>=<b>bytecode</b></td><td>+1</td></tr><tr><td class=\"k\">Llamada a contrato</td><td><code>to</code>=dirección del contrato · <code>data</code>=<b>función+argumentos</b></td><td>+1</td></tr></tbody></table>",
  "eth.sc.deriveH": "Cómo se creó esta dirección (calculada en vivo ahora mismo)",
  "eth.sc.derive1": "Dirección de billetera de {who} — últimos 20 bytes de keccak(clave pública de {who}*)",
  "eth.sc.derive2": "Preimagen = dirección de billetera + el nonce de ese momento ({nonce}) — este nonce es <b>el mismísimo contador que viste en la pestaña 2</b>",
  "eth.sc.derive3": "keccak-256(preimagen) — se conservan solo los últimos 40 de los 64 hex",
  "eth.sc.derive4": "→ dirección del contrato",
  "eth.sc.deriveMatch": "✓ coincide con la cabecera de arriba",
  "eth.sc.deriveNote":
    "* Este simulador hashea un nombre en vez de una clave pública (regla de la pestaña 1). El Ethereum real hashea RLP([dirección, nonce]) — mismos ingredientes. Las direcciones de billetera y de contrato se parecen, pero se construyen con ingredientes distintos.",
  "eth.sc.historyH": "Historial de estado — nada se edita, se apilan líneas nuevas",
  "eth.sc.historyLead":
    "Piensa en un libro escrito con bolígrafo. Las entradas pasadas no se borran ni se sobrescriben — <b>solo una transacción exitosa añade la siguiente línea (una nueva versión vN)</b>. Si hace revert, <b>no se crea ninguna versión nueva</b> — abajo solo verás un marcador ⛔ de 'intentado pero rechazado', y el estado nunca cambia a medias (atomicidad). Eso sí, el gas se gasta igual.",
  "eth.sc.histRevert": "Sin versión nueva (atómico) · gas gastado igualmente — {reason}",
  "eth.sc.histNoChange": "Sin cambios en storage (solo se movió el saldo)",
  "eth.sc.storageLead":
    "storage = el <b>cajón privado</b> de este contrato. Contiene los <b>valores actuales</b> de las variables declaradas al inicio del código Solidity (<code>price</code>, <code>stock</code>…). Solo las llamadas a funciones pueden cambiarlo.",
  "eth.tok.storageLead":
    "Piensa en esto como el <b>libro de SAND</b> de The Sandbox. Los valores de <code>mapping(address → uint256) balanceOf</code> son lo que una billetera muestra como \"saldo de token\" — una <b>casilla distinta</b> del ETH. (Versión mini educativa — no es el contrato SAND de mainnet.)",

  "eth.ws.h1": "¿Y dónde se guarda todo esto? — bloques vs DB del nodo",
  "eth.ws.lead":
    "Esperarías que el código, el storage y los saldos vivieran dentro de los bloques — pero <b>los bloques solo registran \"hojas de pedido\"</b>. Los resultados los calcula cada nodo y los guarda en su propia DB.",
  "eth.ws.blockN": "Bloque (en la cadena, para siempre)",
  "eth.ws.blockT": "El registro compartido",
  "eth.ws.blockD":
    "<b>Lista de transacciones</b> — hojas de pedido como \"Bob llamó buy() con 0.5 ETH\" + <b>stateRoot</b> — un hash de 32 bytes que resume todo el estado tras la ejecución. <b>Sin el estado en sí.</b>",
  "eth.ws.dbN": "DB de estado (cada nodo, local)",
  "eth.ws.dbT": "El resultado de reproducir las hojas de pedido",
  "eth.ws.dbD":
    "Cada cuenta es <span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>. Las cuentas de billetera tienen el código vacío; las cuentas de contrato llevan <b>bytecode + storage</b>.",
  "eth.ws.why":
    "<b>¿Por qué esto funciona?</b> La transición de estado es una función pura (<span class=\"mono\">nuevoEstado = f(estadoAnterior, tx)</span>), así que registrar <b>solo las entradas (txs)</b> permite a cualquiera reproducir desde el génesis y llegar al mismo estado. Los nodos se verifican entre sí <b>comparando stateRoots de 32 bytes</b> — el mismo truco que la raíz de Merkle de la pestaña 5 de Bitcoin.",
  "eth.ws.tableH": "La DB de estado de este simulador, en vivo",
  "eth.ws.tableLead":
    "Aparece <b>cada cuenta</b> de este mundo simulado — los contratos que usan otras pestañas (SAND → pestaña 4 Tokens, ETH/USD Feed → pestaña 5 Oráculos) están pre-desplegados en el génesis. Igual que la DB de estado del Ethereum real ya contiene USDT y Uniswap.",
  "eth.ws.originTok": "deploy en el génesis · usado en la pestaña 3",
  "eth.ws.originFeed": "deploy en el génesis · usado en la pestaña 4",
  "eth.ws.originGenesis": "deploy en el génesis",
  "eth.ws.originYou": "recién desplegado por {who}",
  "eth.ws.colAcct": "Cuenta",
  "eth.ws.codeNone": "ninguno (billetera)",
  "eth.ws.codeYes": "sí · bytecode de {kind}",
  "eth.ws.srcNote":
    "<b>El código fuente Solidity NO está en la cadena.</b> Solo el <b>bytecode</b> compilado va a la cadena. Las fuentes aparecen en Etherscan porque los desarrolladores las envían y Etherscan las recompila y las compara contra el bytecode en cadena — un <b>servicio fuera de la cadena</b>. Que esta página muestre Solidity sigue la misma idea.",
  "eth.sc.deployer": "Deployer",
  "eth.sc.price": "Precio (ETH)",
  "eth.sc.stock": "Existencias",
  "eth.sc.deploy": "🚀 Desplegar",
  "eth.sc.deployOk":
    "Desplegado → dirección <b class=\"mono\">{addr}</b> (keccak(deployer, nonce {nonce})) · gas {gas}",
  "eth.sc.deployedBy": "desplegado por {by} · nonce {nonce}",
  "eth.sc.callH": "Llámalo",
  "eth.sc.caller": "Llamante",
  "eth.sc.value": "ETH a enviar (msg.value)",
  "eth.sc.storageH": "storage (estado del contrato)",
  "eth.sc.storageEmpty": "Sin storage",
  "eth.sc.eventsH": "Registro de eventos",
  "eth.sc.eventsEmpty": "Aún no hay eventos — llama a una función",
  "eth.sc.codeH": "Código Solidity (la función llamada se ilumina)",
  "eth.sc.revertNote":
    "revert: el estado se revirtió y no se movió ningún value, pero las comisiones de gas se gastaron y el nonce avanzó — exactamente como en el Ethereum real.",
  "eth.sc.why":
    "<b>En corto:</b> un contrato es una cuenta con <b>dirección, saldo y nonce</b> — más <b>código y storage</b>. El dinero solo se mueve como dice el código. Prueba <code>withdraw()</code> como Bob — hace <b>revert</b>, pero el gas se paga igual.",
  "eth.sc.asideH": "Por qué \"el código es la ley\" es un asunto serio",
  "eth.sc.asideBody":
    "<p><b>Depósito bancario:</b> las condiciones, el personal y los tribunales pueden intervenir. <b>Depósito en un contrato:</b> nada puede mover el dinero salvo las condiciones del código desplegado.</p><p>Que la dirección sea <b>keccak(deployer, nonce)</b> y que el <b>topic0 del evento = keccak(firma)</b> son las mismas reglas de hash de la pestaña 1.</p><p>La desventaja nace del mismo principio — un contrato con bugs <b>no se puede parchear</b> (mira el hackeo de The DAO).</p>",

  "eth.tok.h1": "ERC-20 — el saldo de ETH y el saldo de token viven en lugares distintos",
  "eth.tok.lead":
    "El <b>ETH</b> lo gestiona el protocolo como el <b>balance</b> del objeto de cuenta (pestaña 1 — un número de cuenta, no UTXOs de Bitcoin). El <b>SAND</b> de The Sandbox o USDT no son ese campo — son una <b>tabla en el storage de ese contrato de token</b> en Ethereum (dirección → cantidad). ERC-20 es el <b>estándar</b> de esa tabla; el <b>SAND</b> de abajo es un mini token educativo con esa estructura.",
  "eth.tok.std":
    "<b>Mismo world state, casillas distintas.</b> Ethereum gestiona el <code>balance</code> de las cuentas (ETH). Los tokens de app como SAND y USDT gestionan sus propias tablas de storage. (El SAND real suele negociarse en Polygon por el gas más barato, pero el token en sí es un activo de la familia ERC-20 de Ethereum.)",
  "eth.tok.why":
    "<b>Comprueba:</b> ① Transfer con <b>value=50 SAND</b> no envía ETH a Bob — solo cambia la tabla de storage ② ejecutar la tx sigue costando <b>gas en ETH</b> (el ETH de Alice puede bajar un poco) ③ el <b>topic0</b> del evento es igual al hash del Transfer ERC-20 real de mainnet.",

  "eth.or.h1": "Oráculos — la cadena no puede ver el mundo",
  "eth.or.lead":
    "Los contratos no pueden usar internet ni APIs, porque cada nodo debe <b>reproducir el mismo cómputo</b> — p. ej., si cada uno consulta una API del clima, unos tendrán éxito y otros fallarán, o unos recibirán el dato A y otros el B, así que el <b>resultado se bifurcaría</b>. Los datos externos (precios, clima, resultados) deben <b>empujarlos los nodos oracle como transacciones</b>. Así funciona Chainlink.",
  "eth.or.reportH": "① Los nodos oracle reportan un precio",
  "eth.or.nodesLead":
    "Piensa que cada nodo publica como tx <b>el precio que vio en la API de un exchange</b>. (Los nodos reales de Chainlink no son los exchanges — son <b>operadores independientes</b> que consultan varias APIs de exchanges/agregadores; aquí los etiquetamos por fuente.)",
  "eth.or.reported": "reportado",
  "eth.or.why":
    "<b>¿Por qué la mediana?</b> Un solo nodo manipulado <b>no puede mover la mediana</b>. Mete un número absurdo en Coinbase — latestAnswer aguanta. Un diseño de oracle único cae al instante (un clásico de los hackeos DeFi).",
  "eth.ins.h1": "② Un contrato que consume el oracle — seguro de precio",
  "eth.ins.lead":
    "Despliega un seguro que paga 1 ETH si el ETH cae <b>por debajo de $3,000</b>. El pago lo decide la <b>mediana del feed</b>, no una persona. Observa cómo el <b>saldo de Bob</b> abajo sube tras un settle exitoso.",
  "eth.ins.ledgerH": "Saldos de las cuentas (sigue el pago)",
  "eth.ins.ledgerLead": "Mira cómo cambia el ETH de Bob desde el principio — al contratar y al liquidar.",
  "eth.ins.role.underwriter": "Asegurador (fondea el pool)",
  "eth.ins.role.insured": "Asegurado",
  "eth.ins.role.pool": "Pool de pagos",
  "eth.ins.threshold": "Umbral (USD)",
  "eth.ins.deploy": "Alice despliega el seguro (fondea un pool de 1 ETH)",
  "eth.ins.buy": "Bob contrata buyPolicy() — 0.1 ETH",
  "eth.ins.condRule": "Regla de pago: mediana < {threshold} (igual = expirado)",
  "eth.ins.condNoFeed": "El feed aún no tiene respuesta — primero un report() del oracle arriba",
  "eth.ins.condMet": "Mediana actual {median} < {threshold} → settle() pagará ✅",
  "eth.ins.condUnmet": "Mediana actual {median} ≥ {threshold} → settle() NO pagará (expirado)",
  "eth.ins.warn":
    "<b>El problema del oráculo:</b> un código de contrato perfecto sigue fallando si <b>los datos que lo alimentan están envenenados</b>. Descentralizar los datos en sí — muchos nodos, medianas, penalizaciones basadas en stake — es lo que hacen redes de oracles como Chainlink.",
  "eth.or.deeperH": "Más a fondo: el problema del oráculo · third-party vs first-party · recompensas y slashing",
  "eth.or.deeperBody":
    "<p><b>El problema del oráculo, replanteado:</b> los datos en cadena siguen siendo confiables porque los miembros se verifican entre sí, pero <b>los datos fuera de la cadena no pueden verificarse como verdaderos/falsos con reglas en cadena</b>. Como los viajeros pasando el <b>control migratorio</b>, los datos externos necesitan un examinador — pero entregar ese trabajo a una sola empresa vuelve a centralizarlo todo. Ese dilema es el problema del oráculo.</p><p><b>Oracles third-party</b> (Chainlink, Band): muchos nodos verificadores obtienen los datos de forma independiente y llegan a un acuerdo (la mediana de arriba es una versión mini). Los nodos precisos ganan <b>recompensas (LINK)</b>; los que fallan <b>pierden las monedas en staking y reputación</b>, recibiendo menos trabajos futuros. Descentralizado, pero más lento y las recompensas se reparten.</p><p><b>Oracles first-party</b> (PYTH, etc.): los exchanges/proveedores de datos <b>firman y publican directamente</b>, con staking para desincentivar mentiras. Rápido y eficiente, pero debes confiar en el proveedor — se inclina hacia lo centralizado.</p><p><b>Por qué importa:</b> cuando los oráculos aseguran la confianza, los contratos inteligentes pueden manejar <b>activos del mundo real (RWA)</b> como inmuebles y acciones. Nota que la moneda LINK no es la tecnología en sí — es la <b>recompensa que se paga a los nodos verificadores</b>.</p>",

  "eth.pos.h1": "Proof of Stake — quién crea los bloques y cuándo son finales",
  "eth.pos.lead":
    "Desde The Merge (2022) no hay minería al estilo Bitcoin. El tiempo se corta en <b>slots</b> (celdas de 12 segundos en la realidad); en cada slot, un validator es elegido por un <b>sorteo aleatorio ponderado por stake</b> (RANDAO en la realidad) para <b>proponer</b> un bloque. Los demás validators lo comprueban y emiten una <b>attestation (voto a favor)</b>. Un paquete de slots (8 aquí, 32 en la realidad) es un <b>epoch</b> — los votos se cuentan por epoch para avanzar la finality.",
  "eth.pos.statsLead":
    "Cómo leerlo: <b>Slot</b> = en qué celda de tiempo estamos · <b>Epoch</b> = número del paquete de slots · <b>Justified/Finalized</b> = hasta dónde ha avanzado la finality en dos fases de abajo (<b>—</b> = ningún epoch finalizado aún).",
  "eth.pos.chainLead":
    "Cada bloque lleva un <b>stateRoot</b> — la huella del world state en ese momento. Haz una transferencia o llamada a contrato en otra pestaña y luego avanza un slot: la huella cambia. Esto es exactamente lo que los validators re-ejecutan y comparan antes de hacer attest. La <b>línea attest</b> de cada bloque lista los validators que votaron por él (✓ votó · ✗ offline).",
  "eth.pos.liveHead": "slot {slot} — <b>{p}</b> propone un bloque → el resto hace attest",
  "eth.pos.liveOk": "alcanzó 2/3 ✓ (cuenta para la finality)",
  "eth.pos.liveFail": "por debajo de 2/3 ✗ (finality retrasada)",
  "eth.pos.advance": "⏭ Siguiente slot",
  "eth.pos.advance5": "×5 slots",
  "eth.pos.epoch": "Hasta el fin del epoch",
  "eth.pos.offline": "Fracción de validators offline",
  "eth.pos.reset": "Reiniciar",
  "eth.pos.chainH": "Cadena (justified → finalized)",
  "eth.pos.twoPhase":
    "<b>¿Por qué finality en dos fases?</b> Piensa en firmar un contrato — cuando los votos de un epoch reúnen <b>2/3 del stake</b>, ese epoch queda <b>justified (rubricado)</b>. Cuando el siguiente epoch también reúne 2/3, el justified anterior asciende a <b>finalized (notariado)</b> — eso es Casper FFG. Revertir un checkpoint finalized exige que los validators firmen votos contradictorios, lo que al instante <b>quema 1/3+ de todo el stake vía slashing</b>. Por eso es final \"económicamente\".",
  "eth.pos.convey":
    "<b>Unidad y ritmo de la finality:</b> la finality avanza por <b>epoch</b>, no por bloque. Normalmente es una cinta transportadora — cuando el epoch 5 reúne 2/3, el epoch 5 queda justified y <b>el epoch 4 anterior queda finalized</b> — justified siempre marchando un paso por delante (en la realidad un bloque se finaliza ~2 epochs ≈ 13 minutos después de crearse). Pero la finality es <b>retroactiva a todos los ancestros</b>: si un estancamiento (validators offline) congela la finality durante unos epochs y luego la participación se recupera, el tramo congelado <b>se pone al día de golpe</b> — prueba a bajar el deslizador en el experimento de abajo y mira cómo salta Finalized.",
  "eth.pos.tryOffline":
    "<b>Experimento:</b> sube el deslizador de offline al <b>34%+</b> y avanza un epoch — los votos no llegan a 2/3 y <b>justified/finalized se estancan</b>. Los bloques se siguen apilando, pero nada se finaliza. El Ethereum real maneja un estancamiento prolongado drenando lentamente el stake de los validators offline (<b>inactivity leak</b>) hasta recuperar los 2/3.",
  "eth.pos.vsBtc":
    "<b>vs Bitcoin:</b> la finality de PoW es probabilística (\"más confirmaciones = más seguro\"). El Gasper de PoS es finality económica — revertir un checkpoint firmado por 2/3 quema <b>1/3+ de todo el stake vía slashing</b>.",
  "eth.pos.proposeCheck":
    "<b>¿Puede un proposer manipular las txs?</b> Puede elegir <b>qué txs incluir y en qué orden</b> desde el mempool, pero cambiar la cantidad/destinatario de una tx ajena <b>rompe la firma → rechazada</b> (pestañas 1–2). Puede incluir sus propias txs recién firmadas, pero solo dentro de <b>sus propios fondos</b>. Los demás validators re-ejecutan las txs del bloque y comprueban que el <b>stateRoot coincida</b> (pestaña 8) — attest si sí, rechazo si no.",
  "eth.st.h1": "Ciclo de vida del validator — staking · slashing",
  "eth.st.lead":
    "Para proponer y votar haces staking de <b>32 ETH</b> y activas. Las infracciones como firmar dos veces reciben <b>slashing</b> — defensa Sybil vía colateral en vez de la electricidad de PoW.",
  "eth.st.label": "Nombre del validator",
  "eth.st.amt": "Stake (ETH)",
  "eth.st.deposit": "Depositar",
  "eth.st.activate": "Activar último depósito",
  "eth.st.slashId": "ID objetivo",
  "eth.st.slash": "Doble firma → slashing",
  "eth.st.offline": "Penalización por estar offline",
  "eth.st.listH": "Validators",
  "eth.st.slashScale":
    "<b>¿Por qué solo un recorte parcial en vez de la confiscación total?</b> La penalización inmediata del Ethereum real es sorprendentemente pequeña (alrededor de <b>1 ETH</b> de 32). En cambio, el validator es <b>expulsado permanentemente</b> (aquí también, un Slashed no puede reactivarse), y lo crucial es que hay una <b>penalización por correlación</b> — cuanto más stake reciba slashing en la misma ventana, mayor la multa. En el momento en que <b>1/3+ del stake se confabula</b> para revertir un checkpoint finalized, lo pierden <b>todo</b>. Un error solitario (accidente de gestión de claves) se castiga suavemente; un ataque coordinado, catastróficamente.",
  "eth.st.depOk": "Depositado · validator #{id} (Pending)",
  "eth.st.actOk": "Activado — participa en propuestas/attestations desde el próximo slot",
  "eth.st.slashOk": "Slashing ejecutado — parte del stake quemado · estado Slashed",
  "eth.st.offOk": "Penalización por inactividad aplicada",
  "eth.at.h1": "Prueba un ataque — fork · propuesta doble",
  "eth.at.lead":
    "Un validator al que le toca proponer <b>firma dos bloques distintos para el mismo slot</b>, mostrando a cada mitad de la red una versión diferente (un intento de doble gasto — la versión PoS de la \"cadena secreta\" de la pestaña 7 de BTC). Resultado: ① la cadena se bifurca, pero ② el peso de voto de la mayoría honesta mantiene la cadena original como cabeza, y ③ <b>dos firmas para el mismo slot son prueba matemática</b> de trampa — sin excusas, <b>slashing</b> automático. A diferencia de BTC, un ataque fallido quema el colateral, así que no puede reintentarse.",
  "eth.at.sigLayers":
    "<b>La \"firma\" aquí no es una firma de tx — hay tres capas.</b> ① <b>firma de tx</b> = \"soy yo quien envía este dinero\" (clave de billetera del remitente, pestañas 1·2) ② <b>firma de bloque</b> = \"soy yo quien construyó este bloque\" (el proposer firma la cabecera del bloque terminado con su clave de validator) ③ <b>firma de attestation</b> = \"soy yo quien vota por este bloque\". La evidencia de equivocación es que existan dos de ② para el mismo slot. Nota: las claves de validator usan <b>firmas BLS</b> (a diferencia del ECDSA de billetera) — miles de ellas pueden fusionarse en una (agregación), y así un millón de validators puede votar en cada epoch y aun así caber en un bloque.",
  "eth.at.attacker": "ID del validator atacante",
  "eth.at.fork": "Ataque de fork (propuesta doble)",
  "eth.at.warn":
    "<b>vs 51%:</b> los dobles gastos de Bitcoin son una carrera de \"cadena secreta más larga\" — se reintenta mientras haya electricidad. Atacar un checkpoint finalized de PoS <b>quema el colateral</b>, así que el mismo ataque no puede repetirse.",
};
