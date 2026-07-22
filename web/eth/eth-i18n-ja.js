// Visual Ethereum Engine i18n — 日本語
export const ETH_I18N_JA = {
  "eth.header.title": "Visual Ethereum Engine",
  "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · 教育用シミュレーター",
  "eth.header.tagline":
    "Rustで書いた<b>イーサリアムエンジン</b>（アカウント · スマートコントラクト · PoS）をWebAssemblyにコンパイルし、ブラウザでそのまま動かして学べるツール",
  "eth.meta.title": "Visual Ethereum Engine — イーサリアムの仕組みを学べるインタラクティブ・シミュレーター",
  "eth.tabs.overview": "概要",
  "eth.tabs.keccak": "1 · Keccak · アドレス",
  "eth.tabs.account": "2 · アカウント · Gas",
  "eth.tabs.contracts": "3 · スマートコントラクト",
  "eth.tabs.tokens": "4 · トークン (ERC-20)",
  "eth.tabs.oracles": "5 · オラクル",
  "eth.tabs.pos": "6 · PoS 合意",
  "eth.tabs.realestate": "7 · 不動産取引",
  "eth.tabs.evm": "8 · EVM 実行機",

  // ---------- 7 · 不動産 escrow ----------
  "eth.re.h1": "不動産の売買をイーサリアムで — escrowコントラクト",
  "eth.re.lead":
    "これまで学んだことを<b>1つの実際の取引</b>としてつなげてみます。従来の不動産取引では<b>escrow会社・登記所・仲介業者</b>が信頼を担いますが、ここでは<b>コード（コントラクト）</b>がその役割を果たします — 代金をロックし、条件が確認されて初めて売り手に渡します。各ステップで<b>tx · nonce · gas · storage · ブロック · stateRoot</b>がどう動くかを見てください。",
  "eth.re.name": "物件名",
  "eth.re.seller": "売り手",
  "eth.re.buyer": "買い手",
  "eth.re.inspector": "確認者",
  "eth.re.price": "価格（ETH）",
  "eth.re.fee": "確認者手数料（ETH）",
  "eth.re.reset": "リセット",
  "eth.re.step1": "① 物件を登録 (deploy)",
  "eth.re.step2": "② 代金を預託 (deposit)",
  "eth.re.step3": "③ 登記・瑕疵を確認 (confirm)",
  "eth.re.step4": "④ 残金を支払い (release)",
  "eth.re.stepRefund": "取引中止・返金 (refund)",
  "eth.re.role.buyer": "買い手",
  "eth.re.role.seller": "売り手",
  "eth.re.role.inspector": "確認者",
  "eth.re.role.contract": "escrowコントラクト",
  "eth.re.flow.deposit": "① 代金預託",
  "eth.re.flow.confirm": "② 確認",
  "eth.re.flow.release": "③ 残金支払い",
  "eth.re.priceLbl": "物件価格",
  "eth.re.feeLbl": "確認者手数料",
  "eth.re.state.None": "未登録",
  "eth.re.state.Listed": "登録済み（代金待ち）",
  "eth.re.state.Funded": "代金ロック中（確認待ち）",
  "eth.re.state.Confirmed": "確認完了（支払い待ち）",
  "eth.re.state.Released": "取引完了 ✅",
  "eth.re.state.Refunded": "取引中止（返金）",
  "eth.re.hintStart":
    "<b>スタート:</b> 売り手（<b>Bob</b>）が<b>① 物件を登録</b>を押すと、Escrowコントラクトが<b>デプロイ</b>されます。これがすなわち「この取引専用の口座 + ルール」です。",
  "eth.re.hintListed":
    "<b>次:</b> 買い手（<b>Alice</b>）が<b>② 代金を預託</b>します。代金は売り手ではなく<b>コントラクトにロックされます</b> — 条件が満たされるまで誰も取り出せません。（msg.value は物件価格と正確に一致する必要があります）",
  "eth.re.hintFunded":
    "<b>次:</b> 中立の<b>確認者（Carol）</b>が<b>③ 登記・瑕疵を確認</b>します。確認者だけが呼び出せて（コードが強制）、確認前には残金は動きません。Aliceがconfirmを押しても<b>revert</b>されます。",
  "eth.re.hintConfirmed":
    "<b>最後:</b> <b>④ 残金を支払い</b>を押すと、コントラクトがロックしていた代金を<b>分割して</b>支払います — <b>確認者に手数料</b>、残りは<b>売り手へ</b>。働いた確認者はコードによって自動的に報酬を受け取ります。",
  "eth.re.hintReleased":
    "<b>完了 ✅</b> 売り手と<b>確認者（手数料）</b>の残高が増え、コントラクトのロックは0になりました。台帳で確認者の残高が増えたこと、ブロックエクスプローラーでstateRootが変わったことを確かめてください。新しい取引は<b>リセット</b>から。",
  "eth.re.hintRefunded":
    "<b>中止されました:</b> 確認前だったので、代金は<b>買い手にアトミックに返金</b>されました。中途半端に処理されることなく全額が戻ります。新しい取引は<b>リセット</b>から。",
  "eth.re.msgDeployed": "Escrow デプロイ完了 · {addr} · nonce {nonce}",
  "eth.re.stateH": "現在のコントラクト・アカウント状態",
  "eth.re.stateLead":
    "左は実際の残高・コントラクトのstorage・イベント、右はそのルールを定めたSolidityコードです。いま呼び出した関数がコードの中で光ります。",
  "eth.re.ledgerH": "アカウント残高（取引当事者）",
  "eth.re.blocksH": "ブロックに積み上がる過程 — tx + stateRoot",
  "eth.re.blocksLead":
    "各ステップは<b>トランザクション</b>で、ブロックに入ると全体状態の指紋である<b>stateRoot</b>が変わります。gitのコミットのように、過去を書き換えるのではなく<b>新しいブロックが前へ積み上がります</b>。（stateRootはこのシミュレーターのアカウント+コントラクトのスナップショットをkeccak-256した値です）",
  "eth.re.blocksNote":
    "<b>読み方:</b> 各ブロックには含まれるtx（誰が・どの関数）と、その直後の<code>stateRoot</code>が表示されます。txが状態を変えるとstateRootは<b>完全に別物</b>になり、revertされたtxは状態を変えないのでstateRootもそのままです。",
  "eth.re.blocksEmpty": "まだブロックがありません — ステップを進めてみてください。",
  "eth.re.genesisTx": "ジェネシス状態（取引開始前）",
  "eth.re.srDiff": "stateRoot 変化",
  "eth.re.srSame": "stateRoot そのまま (revert)",
  "eth.re.vsH": "従来の不動産取引 ↔ イーサリアムのescrow",
  "eth.re.vsCol1": "役割",
  "eth.re.vsCol2": "従来の不動産取引",
  "eth.re.vsCol3": "イーサリアムのescrow",
  "eth.re.vsRows":
    "<tr><td class=\"k\">代金の保管</td><td>escrow会社・銀行口座</td><td><b>コントラクトがロック</b>（誰も持ち出せない）</td></tr><tr><td class=\"k\">条件の確認</td><td>登記所・司法書士・仲介業者</td><td><b>確認者のtx</b> (confirm)</td></tr><tr><td class=\"k\">支払いの実行</td><td>人が送金処理（遅延・ミス）</td><td><b>コードが自動実行</b>（条件を満たしたときだけ）</td></tr><tr><td class=\"k\">中止・返金</td><td>紛争・訴訟の可能性</td><td><b>refund()でアトミックに返金</b></td></tr><tr><td class=\"k\">信頼の対象</td><td>複数の機関・人</td><td><b>デプロイ済みのコード</b>（変更不可）</td></tr><tr><td class=\"k\">記録</td><td>機関ごとの台帳（分散・不透明）</td><td><b>ブロック · stateRoot</b>（公開・検証可能）</td></tr>",
  "eth.re.vsWhy":
    "<b>ポイント:</b> 変わったのは「誰を信じるか」です。複数の機関・人に散らばっていた信頼が、<b>デプロイ後は変更できない1つのコード</b>に集まります。その代わり<b>コードにバグがあればそれもルール</b>になるので（タブ3）、実際のサービスは監査（audit）を受けます。",

  // ---------- 概要 ----------
  "eth.ov.h1": "イーサリアムは「コードを実行する台帳」です",
  "eth.ov.lead":
    "ビットコインが<b>お金の台帳</b>なら、イーサリアムはそこに<b>プログラム（スマートコントラクト）</b>を載せられる台帳です。一度デプロイされたコードは誰にも変えられず、条件が合えば<b>自動的に実行</b>されます。合意はThe Merge以降<b>Proof of Stake</b> — validatorが32 ETHをstakingしてブロックを提案・attestします。",
  "eth.ov.btcN": "Bitcoin",
  "eth.ov.btcT": "PoW · UTXO · お金の台帳",
  "eth.ov.btcD": "「誰がいくら持っているか」を記録。スクリプトは最小限。セキュリティとシンプルさに全振り。",
  "eth.ov.ethN": "Ethereum",
  "eth.ov.ethT": "PoS · アカウント · コード実行台帳",
  "eth.ov.ethD":
    "残高 + <b>コントラクトのコード・storage</b>まで記録。トークン・取引所・保険がすべて「チェーン上のプログラム」。",
  "eth.ov.why":
    "<b>一言で:</b> スマートコントラクト = <b>「あらかじめ書かれたルール通りにしか動かない金庫」</b>。銀行の約款は銀行が変えられますが、デプロイされたコントラクトは<b>作った本人でも変えられません</b>。このサイトで実際にデプロイして呼び出してみてください。",
  "eth.ov.cross":
    "← 検証の原理はBitcoinタブと同じです: 各ノードが<b>単独でルールを採点</b>します。違うのはシビル対策 — PoWは電気、PoSは担保（32 ETH + slashing）で防ぎます。",
  "eth.ov.orderH": "おすすめの学習順序",
  "eth.ov.o1": "<b>1 · Keccak · アドレス</b> — ハッシュからアドレスが作られる過程（SHA-256との対比）",
  "eth.ov.o2": "<b>2 · アカウント · Gas</b> — 残高 · nonce · EIP-1559手数料（UTXOとの対比）",
  "eth.ov.o3": "<b>3 · スマートコントラクト</b> — デプロイ → 呼び出し → storage · イベント · gas（メイン）",
  "eth.ov.o4": "<b>4 · トークン (ERC-20)</b> — トークン = コントラクトの残高表（SANDの例）",
  "eth.ov.o5": "<b>5 · オラクル</b> — チェーンは外の世界を知らない · Chainlink式のprice feed · 保険",
  "eth.ov.o6": "<b>6 · PoS 合意</b> — slot → attest → justified/finalized · slashing",
  "eth.ov.o7": "<b>7 · 不動産取引</b> — 学んだことを全部つなぐescrow実践（総まとめ）",
  "eth.ov.o8": "<b>8 · EVM 実行機</b> — バイトコードが実際に実行される過程を1ステップずつ",

  // ---------- 1 · アカウント · Gas ----------
  "eth.acc.h1": "アカウントは残高を「数字として直接」保存（UTXOとは別の選択）",
  "eth.acc.lead":
    "ビットコインはコインの断片（UTXO）を集めて残高を<i>計算</i>していましたね。イーサリアムは<b>銀行口座のように残高の数字を直接</b>保存します。送ると<b>自分の数字が減って相手の数字が増える</b>だけ — お釣りもUTXOの断片もありません。実際に送ってみてください。",
  "eth.acc.feeBoxH": "手数料の計算式を開く（EIP-1559）",
  "eth.acc.feeBoxBody":
    "<p><b>単位:</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>。tipの入力はETHではなく<b>Gwei/gas</b>です。</p><p><b>なぜ ×21,000？</b> Gweiはgasあたりの単価で、単純なETH送金のgas usedはプロトコル固定の<span class=\"mono\">21,000</span>です。（トークン・コントラクトはもっと大きい）</p><ul class=\"tight\"><li><b>gas used</b> = 21,000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">（このシミュレーターでは固定）</span> → burn（焼却）</li><li><b>tip</b> = 入力 T Gwei/gas → ブロックproposer</li></ul><pre class=\"mono eth-fee-formula\">burn = 21,000 × 10 × 10⁻⁹ = 0.000210 ETH\ntip  = 21,000 × T × 10⁻⁹ ETH → proposer\n支払額 = value + burn + tip</pre><p class=\"small muted\">例: T=5 → tip = 0.000105 ETH。「5 ETHのtip」ではありません。</p>",
  "eth.acc.shortWhy":
    "<b>一言で:</b> <b>value → 受け取る人</b>、<b>tip → ブロックproposer</b>、<b>base fee → burn（焼却）</b>。残高がそのまま増減し、右側の<b>n=</b>の値（nonce）が1ずつ上がるのを見てください。",
  "eth.acc.vsH": "ビットコインのUTXO ↔ イーサリアムのアカウント",
  "eth.acc.vsCol1": "項目",
  "eth.acc.vsCol2": "ビットコイン (UTXO)",
  "eth.acc.vsCol3": "イーサリアム（アカウント）",
  "eth.acc.vsRows":
    "<tr><td class=\"k\">残高</td><td>コイン（UTXO）断片の合計 — 直接は保存しない</td><td>数字として<b>直接保存</b></td></tr><tr><td class=\"k\">送るとき</td><td>UTXOを丸ごと消費 + <b>お釣り</b>を新規作成</td><td>自分の残高<b>−</b>、相手の残高<b>+</b>（お釣りなし）</td></tr><tr><td class=\"k\">再利用防止</td><td>UTXOは一度使うと<b>消滅</b>（自動）</td><td><b>nonce</b>番号で防止（下のカード）</td></tr><tr><td class=\"k\">並列性</td><td>別々のUTXOは同時処理しやすい</td><td>1つのアカウントはnonce順で<b>直列</b></td></tr><tr><td class=\"k\">コントラクトの状態</td><td>表現が難しい</td><td>残高+storageで<b>自然</b></td></tr>",
  "eth.acc.vsWhy":
    "<b>なぜ分かれたの？</b> ビットコインは「お金」に集中して<b>シンプルさ・並列性・プライバシー</b>に有利なUTXOを選び、イーサリアムは<b>プログラム（コントラクト）の状態</b>を扱う必要があったので、「このアドレスが今いくら・どんな値を持つか」をすぐ読める<b>アカウントモデル</b>が便利でした。良し悪しではなく<b>目的が違う設計</b>です。",
  "eth.acc.whereH": "ところでこの残高、正確にはどこに保存されるの？",
  "eth.acc.whereBody":
    "<p>「直接保存」と言いましたが、残高が<b>ブロックの中</b>に書かれるわけではありません。各ノードが管理する<b>world state</b> — <code>アドレス → アカウントオブジェクト</code>という巨大なマップ — の中にあります。アカウント1つはたった4つのフィールドです。</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>フィールド</th><th>意味</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>そのアカウントが送ったtxの数（下のカードのあの番号）</td></tr><tr><td class=\"k\">balance</td><td><b>残高（wei単位）</b> ← ここ</td></tr><tr><td class=\"k\">storageRoot</td><td>コントラクトstorageの要約ハッシュ（ウォレットEOAは空）</td></tr><tr><td class=\"k\">codeHash</td><td>コントラクトコードのハッシュ（ウォレットEOAは空）</td></tr></tbody></table><p>ウォレット（EOA）もコントラクトも<b>構造は同じ</b>で、ウォレットは後ろ2つのフィールドが空なだけです。</p><p><b>ブロックには何が入るのか:</b> このマップ全体をハッシュツリーでまとめた頂点のハッシュ1つ = <b>state root</b>だけが<b>ブロックヘッダー</b>に書き込まれます。残高の数字そのものは、各ノードがトランザクションを実行しながら自分のDBを更新して保持します。つまりブロック = <b>「この時点の状態の指紋（state root）」+「そのブロックのtxたち」</b>です。</p><p class=\"small muted\"><b>↔ ビットコイン:</b> ビットコインには残高を保存する場所がそもそもなく、ノードが<b>UTXO集合</b>を持っていて「自分のアドレスで使えるUTXOの合計」をその都度計算します。イーサリアムは<b>アドレスごとのbalanceの数字</b>を直接持っているので、参照は1回で済みます。</p>",
  "eth.acc.nonceH": "nonce — アカウントモデルの「再利用防止番号」",
  "eth.acc.nonceLead":
    "nonceは<b>アカウントごとに付けるトランザクションの連番</b>（0, 1, 2, …）です。なぜこれが不可欠なのか、まず見てみましょう。",
  "eth.acc.nonceProblem":
    "<b>問題:</b> ETHの残高はただの<b>数字</b>です。自分が署名した「Bobに1 ETH」のtxを誰かが<b>10回コピペしてブロードキャスト</b>したら？ ビットコインならそのUTXOは既に消滅していて自動的に防がれますが、アカウントには残高しかないので<b>止めるものがありません。</b>",
  "eth.acc.nonceBox":
    "<span class=\"who\">{who}</span><span class=\"note\">の現在のnonce</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ 次のtxは#{cur}、成功すると</span> <span class=\"nxt\">{next}</span></span>",
  "eth.acc.nonceRoles":
    "<b>解決 — nonceが2つの役割を同時に:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① 再利用（replay）防止</b> — 各番号は一度きり。使用済みnonceのtxは拒否されます。だからコピペのブロードキャストは通りません。</li><li><b>② 順序の保証</b> — 必ず0 → 1 → 2の順で。途中を飛ばしたtxは前の番号が処理されるまで待機（pending）します。</li></ul>",
  "eth.acc.nonceSig":
    "<b>🔑 タブ1の署名とのつながり:</b> nonceは署名対象（sighash）に<b>含まれます</b>。だから内容が同じ送金でも<b>nonceが違えば署名は完全に別物</b>になります → 古い署名をコピペしてもそのnonceは既に消費済みで拒否。「署名が内容をロックする」がここで再利用防止につながります。",
  "eth.acc.nonceDeeperH": "さらに深く: pending・stuck tx · nonce gap · コントラクトアドレス",
  "eth.acc.nonceDeeperBody":
    "<p><b>stuck tx:</b> nonce 5を低い手数料で送って処理されないと、nonce 6・7は<b>どんなに急ぎでも待機</b>します（順序のため）。解決策は同じnonce 5をより高い手数料で送り直して<b>上書き</b>すること。</p><p><b>nonce gap:</b> 5の次にうっかり7を送ると、6が来るまで7は<b>永遠に待機</b>。mempoolで6を待ち続けます。</p><p><b>コントラクトアドレスとの関係:</b> タブ1で見たように、コントラクトアドレス = <code>keccak(デプロイヤーのアドレス + nonce)</code>。だから<b>同じ人がデプロイしてもnonceが上がって毎回違うアドレス</b>になります。</p>",
  "eth.acc.gasH": "Gas · EIP-1559 — 手数料はどう分かれるのか",
  "eth.acc.gasLead":
    "送るときにtipの値を変えると、上のプレビュー（burn・tip・支払額）がリアルタイムで変わります。その数字がどこから来るのか整理しましょう。",
  "eth.acc.gasWhat":
    "<b>gasって何？</b> すべての演算・保存はノードのリソースを使います。その<b>作業量を測る単位がgas</b>です。単純なETH送金はプロトコルが<b>21,000 gas</b>に固定（トークン・コントラクトはもっと大きい）。<b>手数料 = gas × gasあたりの単価</b> — スパムを防ぎ、validatorに報酬を与える仕組みです。",
  "eth.acc.gasEip":
    "<b>EIP-1559 — 単価は2つのパーツ:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — ネットワークが<b>混雑度に応じて自動</b>で決定。このサイトでは<b>10 Gwei/gas固定</b>。→ 誰にも渡らず<b>burn（焼却）</b>。</li><li><b>priority tip</b> — 自分で決める上乗せ（上の入力欄）。→ ブロックの<b>proposer（validator）</b>へ。</li></ul>",
  "eth.acc.burnWhy":
    "<b>🔥 burn（焼却）の意味:</b> base feeとして払ったETHは<b>永遠に消えます。</b>ネットワークが混むほどburnが増えて<b>ETHの総量が減るデフレ圧力</b>が生まれます。ビットコインの「新規発行を半減期で減らす」のと方向は似ていますが、イーサリアムは<b>すでにあるコインを燃やす</b>方式です。",
  "eth.acc.propTag": "proposer",
  "eth.acc.burnLbl": "burn",
  "eth.acc.from": "送る人",
  "eth.acc.to": "受け取る人",
  "eth.acc.amt": "金額（ETH）",
  "eth.acc.gas": "tip (Gwei/gas)",
  "eth.acc.feePreview": "burn {burn} · tip {tip} → {prop} · {from} 支払い {paid}",
  "eth.acc.send": "送金",
  "eth.acc.sendFail": "送金失敗",

  // ---------- 1 · Keccak · アドレス ----------
  "eth.kc.h1": "Keccak-256 — イーサリアムが「id」を作るハッシュ",
  "eth.kc.lead":
    "イーサリアムで出会うほぼすべてのid — アドレス・関数セレクター・イベントtopic・コントラクトアドレス — はこの1つのハッシュから生まれます。ビットコインがSHA-256を使うのと同じ用途ですが、イーサリアムは<b>Keccak-256</b>を使います。まずは自分でハッシュしてみてください。",
  "eth.kc.playIn": "入力（自由な文字列）",
  "eth.kc.playOutLbl": "Keccak-256（任意長の入力 → 常に32バイト = 64 hex）",
  "eth.kc.avalanche":
    "<b>雪崩効果:</b> 1文字変えるだけで結果の半分ほどのビットが反転します。逆算（ハッシュ→入力）は不可能で、入力が同じなら結果は常に同じ — SHA-256と同じ性質です。",
  "eth.kc.sha3H": "落とし穴: Keccak-256 ≠ NIST SHA3-256",
  "eth.kc.sha3Body":
    "<p>イーサリアムが使うのは標準確定<b>前</b>のオリジナルのKeccakなので、NISTが確定したSHA3-256とは<b>パディングバイト1つ</b>が違います。同じ入力なのに結果は完全に別物です。</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (パディング 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (パディング 0x06)</pre><p class=\"small muted\">ライブラリで<code>sha3_256</code>を呼んでもイーサリアムのアドレスが出てこない理由です。必ず<code>keccak256</code>を使う必要があります。</p>",
  "eth.kc.addrH": "アドレス = keccak(公開鍵)の「末尾20バイト」",
  "eth.kc.addrLead":
    "ウォレットのアドレスは、公開鍵をKeccakした後<b>末尾20バイト</b>だけを切り出して作ります。（このデモは公開鍵の代わりに名前をハッシュ — ルールは同じ）",
  "eth.kc.addrIn": "入力（デモ: 名前 → ハッシュ → アドレス）",
  "eth.kc.hashLbl": "① Keccak-256全体（32バイト）— 先頭12バイトはグレー、末尾20バイトだけ使用",
  "eth.kc.addrLbl": "② アドレス = 末尾20バイト + 0x",
  "eth.kc.addrWhy":
    "<b>なぜ先頭12バイトを捨てるの？</b> ハッシュは32バイトですが、アドレスは<b>20バイト（160ビット）</b>で十分です — 短くして保存スペースを節約しつつ、<b>別々の2人が偶然同じアドレスを持つ確率は事実上ゼロ</b>のままです（この偶然を「ハッシュ衝突」と呼びます — 20バイトなら組み合わせが2¹⁶⁰通りあるので、実際にはまず起きません）。実際の公開鍵はsecp256k1のX・Y座標<b>64バイト</b>（プレフィックス0x04は除く）をハッシュします。",
  "eth.kc.idsH": "イーサリアムのあちこちで使われるKeccak — さっと見てみる",
  "eth.kc.idsLead":
    "イーサリアムはいろいろな場所でKeccakを使います。用途ごとに<b>入力が異なり</b>、ハッシュ結果から<b>必要な部分だけを切り出して</b>使います。今は下をクリックしながら「なるほど、あちこちでKeccakを使っているんだな」と感じるだけで十分です — セレクター・topic・コントラクトアドレスが正確に何なのかは次のタブで扱います。",
  "eth.kc.selH": "① 関数セレクター — シグネチャハッシュの<b>先頭4バイト</b>",
  "eth.kc.selLead":
    "コントラクト呼び出し時に「どの関数？」を指すid。タブ3でbuy()・transfer()を呼ぶときに先頭に付く値です。",
  "eth.kc.selIn": "関数シグネチャ",
  "eth.kc.selOut":
    "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ セレクター <b class=\"mono\">0x{sel}</b> <span class=\"muted\">（先頭8 hex = 4バイト）</span>",
  "eth.kc.topicH": "② イベントtopic0 — シグネチャハッシュの<b>全32バイト</b>",
  "eth.kc.topicLead":
    "ログの中で「これはTransferイベント」と区別する値。タブ3・4のイベントログのtopic0がまさにこれです。",
  "eth.kc.topicIn": "イベントシグネチャ",
  "eth.kc.topicOut":
    "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">（全32バイトをそのまま使用）</span>",
  "eth.kc.caH": "③ コントラクトアドレス — keccak(<b>デプロイヤーのアドレス + nonce</b>)の末尾20バイト",
  "eth.kc.caLead":
    "デプロイするたびにnonceが上がるので、アドレスは毎回変わります。タブ3で自動販売機をデプロイすると、このルールでアドレスが決まります。",
  "eth.kc.caDeployer": "デプロイヤー（名前）",
  "eth.kc.caNonce": "nonce",
  "eth.kc.caOut":
    "keccak(\"{pre}\")<br>→ コントラクトアドレス <b class=\"mono\">{addr}</b> <span class=\"muted\">（末尾20バイト）</span>",
  "eth.kc.when":
    "<b>まとめ — 同じハッシュ<u>関数</u>をいろいろな場所で</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>アドレス</b> ← <b>公開鍵</b>をハッシュ → 末尾20バイト</li><li><b>コントラクトアドレス</b> ← <b>デプロイヤー+nonce</b>をハッシュ → 末尾20バイト</li><li><b>関数セレクター</b> ← <b>シグネチャ</b>をハッシュ → 先頭4バイト</li><li><b>イベントtopic0</b> ← <b>シグネチャ</b>をハッシュ → 全32バイト</li></ul>",
  "eth.kc.deeperH": "さらに深く: mappingの保存位置 · CREATE2 · チェックサムアドレス",
  "eth.kc.deeperBody":
    "<p><b>mappingの保存位置:</b> <code>balanceOf[Alice]</code>がstorageのどこに置かれるかも<code>keccak(key ‖ slot番号)</code>で決まります — タブ4「トークンstorage表」の実際のアドレス計算方式です。</p><p><b>CREATE2:</b> nonceの代わりに<code>keccak(0xff ‖ デプロイヤー ‖ salt ‖ keccak(コード))</code>でアドレスを事前計算 — デプロイ前にアドレスが分かるので、L2・ウォレットでよく使われます。</p><p><b>チェックサムアドレス（EIP-55）:</b> アドレスの大文字・小文字は、アドレス自体をkeccakした値で決まります。タイプミスを捕まえるチェックサムなので、<code>0xAbC…</code>のような大文字小文字の混在には意味があります。</p>",

  // カード 2.5 — ウォレット生成（BTC↔ETH 対比）
  "eth.kc.genH": "では公開鍵はどこから来るの — ウォレット生成の3ステップ",
  "eth.kc.genLead":
    "ウォレット作りは<b>乱数（秘密鍵）→ 楕円曲線の掛け算 → 公開鍵 → ハッシュ → アドレス</b>がすべてです。前半2ステップ（秘密鍵→公開鍵）は<b>ビットコインと完全に同じ</b>で（同じsecp256k1曲線）、<b>アドレスを作るときのハッシュ関数だけ</b>が違います。この「楕円曲線の掛け算（ジャンプ）」を図で見たければ<b>Bitcoinタブ4</b>をどうぞ。",
  "eth.kc.genCol1": "ステップ",
  "eth.kc.genCol2": "ビットコイン",
  "eth.kc.genCol3": "イーサリアム",
  "eth.kc.genRows":
    "<tr><td class=\"k\">① 秘密鍵</td><td>256ビットの<b>乱数</b></td><td>256ビットの<b>乱数</b> <span class=\"same\">同じ</span></td></tr><tr><td class=\"k\">② 公開鍵</td><td class=\"mono\">秘密鍵 × G (secp256k1)</td><td class=\"mono\">秘密鍵 × G <span class=\"same\">同じ曲線</span></td></tr><tr><td class=\"k\">③ アドレス</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) 末尾20B → 0x… <span class=\"diff\">ハッシュだけ違う</span></td></tr><tr><td class=\"k\">署名</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">同じ</span></td></tr><tr><td class=\"k\">シードフレーズ</td><td>BIP-39（12/24単語）</td><td>BIP-39 <span class=\"same\">同じ</span></td></tr><tr><td class=\"k\">アカウントパス</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">数字だけ違う</span></td></tr><tr><td class=\"k\">保存場所</td><td>wallet.dat · ハードウェアチップ</td><td>ブラウザ拡張（暗号化）· ハードウェアチップ</td></tr>",
  "eth.kc.genKey":
    "<b>🔑 ポイント:</b> ウォレットの<b>土台（鍵・署名・シード）は両チェーンでほぼ同じです。</b>実際に<b>1つのハードウェアウォレットでBTC・ETHを一緒に管理</b>できる理由です。目に見える違いは実質<b>アドレスの表記（ハッシュ）</b>だけです。",
  "eth.kc.genStoreH": "秘密鍵はどこに保存される？ · シードフレーズ · 署名はどこで？",
  "eth.kc.genStore":
    "<p><b>秘密鍵はブロックチェーン上にはありません。</b>チェーンに載るのはアドレス・残高・トランザクション・署名だけです。秘密鍵は<b>自分のウォレットの中</b>にだけあります — ノードも秘密鍵を知りません（知られたら誰でもお金を盗めてしまうので）。</p><ul class=\"tight\"><li><b>MetaMask</b> — ブラウザ拡張のストレージに<b>パスワードで暗号化</b>して保管、使うときだけ復号。</li><li><b>ハードウェアウォレット（Ledger・Trezor）</b> — 機器内のセキュアチップに閉じ込められて<b>外に出ません</b>。署名も機器の中で。</li><li><b>シードフレーズ（12単語）</b> — 秘密鍵たちの<b>種</b>。これ1つで全アカウントを復元可能 → 漏れたら全部盗まれます。</li></ul><p><b>署名は「自分の機器の中で」行われます。</b>ウォレットがローカルで秘密鍵を使ってtxに署名 → チェーンには<b>署名 + txだけ</b>を送信 → ノードは<b>公開鍵で検証だけ</b>。「署名は自分だけ、検証は誰でも」という非対称性です。</p>",

  "eth.acc.contrastEth": "ネイティブETH（プロトコルが管理）",
  "eth.acc.contrastEthHint": "アカウントオブジェクトのbalanceフィールド · UTXOではない · タブ1と同じ",
  "eth.acc.contrastTok": "アプリの台帳 · {token} (storage)",
  "eth.acc.contrastTokHint": "トークンの数量（value）はETHではない · ただし実行のgasはETHで支払い",
  "eth.acc.tokAmt": "数量",
  "eth.acc.tokOk":
    "storageだけ更新: {from} → {to} · {amt} {token}。相手に渡ったのは{token}であってETHではありません — ただし<b>gasはETHで差し引かれます</b>。",
  "eth.logH": "エンジンログ",

  // ---------- 8 · EVM 実行機 ----------
  "eth.evm.h1": "EVM — イーサリアムを動かすCPU",
  "eth.evm.lead":
    "スマートコントラクトは結局<b>バイトコード</b>で、それを1命令（opcode）ずつ実行する仮想CPUが<b>EVM</b>です。world state（データ）にtx（命令）を入れると、EVMがgasを消費しながら実行して<b>新しい状態</b>を作ります。JVMのように<b>スタックベースの仮想マシン</b>で、JSのイベントループのように<b>シングルスレッドで最後まで実行</b>されます。",
  "eth.evm.mapCol1": "コンピューター",
  "eth.evm.mapCol2": "イーサリアム",
  "eth.evm.mapCol3": "何なのか",
  "eth.evm.mapRows":
    "<tr><td class=\"k\">ディスク / DB（全体）</td><td>world state</td><td>すべてのアカウント残高 + すべてのコントラクトstorage</td></tr><tr><td class=\"k\">その中の1ファイル・テーブル</td><td>storage</td><td>コントラクト1つ分の永続スロット（world stateの一部）</td></tr><tr><td class=\"k\">RAM（揮発性）</td><td>stack · memory</td><td>txが終わると消える</td></tr><tr><td class=\"k\">実行するプログラム</td><td>tx</td><td>誰が・どの関数・引数（動作）</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>バイトコードをopcodeずつ実行</td></tr><tr><td class=\"k\">電気代・クロック</td><td>gas</td><td>実行コスト・上限</td></tr><tr><td class=\"k\">DB全体のチェックサム</td><td>stateRoot</td><td>world state全体の指紋</td></tr>",
  "eth.evm.analogy":
    "<b>JVMと似ている点:</b> どちらも<b>スタックマシン</b> — レジスタではなくスタックに値を積んで計算します。<code>PUSH 3, PUSH 4, ADD</code> → スタックに7。<b>JSのイベントループと似ている点:</b> シングルスレッドで<b>最後まで実行</b>（途中で中断されない）、完了するか丸ごとrevertするか。",
  "eth.evm.determinism":
    "<b>決定的に違う点:</b> EVMは<b>完全に決定的</b>でなければなりません — <code>random</code>・現在時刻・ネットワークI/Oは<b>ありません</b>。世界中のノードが同じtxをそれぞれ実行して<b>まったく同じstack・storage・gas</b>にならないと合意が成立しないからです。gasが存在するのも同じ理由です（無限ループ・DoS防止）。",
  "eth.evm.runH": "1ステップずつ実行してみる",
  "eth.evm.runLead":
    "プログラムを選んで<b>次のステップ</b>を押すと、opcodeが1つ実行されるたびに<b>stack・storage・gas</b>がどう変わるかを表示します。イベントループの可視化ツールのように。",
  "eth.evm.program": "プログラム",
  "eth.evm.calldata": "入力 v (calldata)",
  "eth.evm.calldataPrice": "物件価格 price (calldata)",
  "eth.evm.exSstoreEscrow":
    "<b>SSTORE</b> — escrowのstorage更新: <b>{slot} ← {val}</b>。タブ7のstate/price/lockedがまさにこういうslotへの書き込みです。",
  "eth.evm.stepBack": "◀ 前へ",
  "eth.evm.step": "▶ 次のステップ",
  "eth.evm.runAll": "⏩ 全部実行",
  "eth.evm.reset": "↺ リセット",
  "eth.evm.bytecodeH": "バイトコード · PC",
  "eth.evm.stackH": "Stack (top ↑ · 揮発性)",
  "eth.evm.memoryH": "Memory（揮発性）",
  "eth.evm.storageH": "Storage（このコントラクトのスロット · world stateの一部）",
  "eth.evm.gasH": "Gas",
  "eth.evm.gasUsed": "使用",
  "eth.evm.gasLeft": "残り",
  "eth.evm.emptyStack": "スタックは空です",
  "eth.evm.emptyMem": "使用したメモリなし",
  "eth.evm.emptyStorage": "まだstorageに書いた値なし",
  "eth.evm.exInit": "実行前の初期状態 — stack・memory・storageはすべて空で、gasは満タン。<b>次のステップ</b>を押してopcodeを1つずつ実行してみてください。",
  "eth.evm.exPush": "<b>PUSH1 {v}</b> — 即値{v}をスタックの一番上に積みます。",
  "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — txが渡した入力値（v）を読んでスタックに積みます。（スタックにあったoffsetは消費）",
  "eth.evm.exAdd": "<b>ADD</b> — スタックの上2つの値を取り出して足し、結果をまた積みます。",
  "eth.evm.exMul": "<b>MUL</b> — スタックの上2つの値を取り出して掛け、結果を積みます。",
  "eth.evm.exSub": "<b>SUB</b> — スタックの上2つの値を引いて、結果を積みます。",
  "eth.evm.exSstore":
    "<b>SSTORE</b> — スタックから（slot, 値）を取り出して<b>storageに永久に記録</b>します。ここがworld stateが変わる瞬間！ だからgasが圧倒的に高いのです（0→値は20000）。",
  "eth.evm.exSload": "<b>SLOAD</b> — storageのslotから値を読んでスタックに積みます。",
  "eth.evm.exMstore": "<b>MSTORE</b> — 揮発性のメモリに値を書きます。（txが終わると消えます）",
  "eth.evm.exStop": "<b>STOP</b> — 実行終了 ✅。このtxの最終storageが確定し、それを反映した新しいstateRootが作られます。",
  "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — 実行が中断され、<b>状態の変更はすべてロールバック</b>されます。ただし、ここまでに使ったgasは返ってきません。",
  "eth.evm.gitH": "World state ↔ stateRoot — gitのように見る",
  "eth.evm.gitLead":
    "左はこのコントラクトの<b>storage</b>（world stateのひとかけら）、右はそれをハッシュした<b>教育用のstateRoot</b>です。実際のチェーンのstateRootは<b>すべてのアカウント残高 + すべてのコントラクトstorage</b>を合わせてハッシュします。SSTOREで値が変わるとコミットが積まれ、プログラムを切り替えても<b>履歴は残ります</b>。",
  "eth.evm.gitTree": "storage（world stateの一部）",
  "eth.evm.gitRoot": "stateRoot · commit hash",
  "eth.evm.gitHistH": "コミット履歴",
  "eth.evm.clearHist": "履歴を消す",
  "eth.evm.gitEmpty": "まだコミットなし — ステップを進めてSSTOREに出会ってみてください。",
  "eth.evm.gitRootFirst": "最初のスナップショット（空の状態のハッシュ）",
  "eth.evm.gitRootChanged": "変化 ↑ 前のコミット {prev} と異なる — storageが変わった証拠",
  "eth.evm.gitRootSame": "前のコミットと同じ — storageの変化なし",
  "eth.evm.commitGenesis": "genesis · 空のstorage",
  "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
  "eth.evm.commitStop": "STOP · {prog} 実行完了",
  "eth.evm.commitSnap": "スナップショット",
  "eth.evm.whyH": "これがなぜイーサリアムの本体なのか",
  "eth.evm.why1":
    "<b>ERC-20・オラクル・DeFiは全部この上で動くアプリ</b>です。コントラクトのコード=class、デプロイされたアドレス=1つのインスタンス、storage=そのインスタンスのフィールド、関数呼び出し=メソッド呼び出し。EVMはそのメソッドを実際に回すエンジンです。",
  "eth.evm.why2":
    "<b>SSTOREはなぜ高い？</b> stack・memoryはRAMのようにtxが終わると消えますが、<b>storageはディスクのように永続</b>でworld stateの一部なので、すべてのノードが永遠に持ち続けなければなりません。だからstorageへの書き込み（20000 gas）は算術演算（3 gas）より圧倒的に高いのです。",
  "eth.evm.why3":
    "<b>本質:</b> <code>new_state = EVM.execute(state, tx)</code> して <code>stateRoot = hash(new_state)</code>。この状態遷移マシンを理解すれば、残りはすべて「このマシンの上のインスタンスたち」に見えてきます。",

  // ---------- 2 · スマートコントラクト ----------
  "eth.sc.h1": "スマートコントラクト — 自動販売機をデプロイしてみよう",
  "eth.sc.lead":
    "下は本物のSolidityで書いた<b>自動販売機（SnackMachine）</b>です。デプロイするとコードはチェーンに固定され、誰でも<code>buy()</code>を呼び出せます。<b>ownerでもルールを変えられません。</b>",
  "eth.sc.acctTypesH": "まず — イーサリアムのアカウントは2種類",
  "eth.sc.eoaN": "ウォレットアカウント (EOA)",
  "eth.sc.eoaT": "Alice · Bob · あなたのMetaMask",
  "eth.sc.eoaD":
    "アドレス = keccak(<b>公開鍵</b>)の末尾20バイト。<b>秘密鍵があるので</b>署名でトランザクションを開始できます。",
  "eth.sc.caN": "コントラクトアカウント",
  "eth.sc.caT": "SnackMachine · SAND · Uniswap",
  "eth.sc.caD":
    "アドレス = keccak(<b>デプロイヤーのアドレス + nonce</b>)の末尾20バイト。<b>秘密鍵はなく</b>、コード・storageが付いています — 呼び出されたときだけ動きます。",
  "eth.sc.txKinds":
    "<b>送金・デプロイ・呼び出しはすべて「同じtx」— どれもnonceを+1します。</b>EOAが外に送るものは結局すべてトランザクションで、<code>to</code>・<code>data</code>が何かで名前が変わるだけです。だからデプロイも送金と同じようにnonceを消費し、そのnonceが上のコントラクトアドレスの材料になります。<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>やること</th><th>txの見た目</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">単純な送金</td><td><code>to</code>=受け取る人 · value · <code>data</code>なし</td><td>+1</td></tr><tr><td class=\"k\">コントラクトのデプロイ</td><td><code>to</code>=<b>空 (null)</b> · <code>data</code>=<b>バイトコード</b></td><td>+1</td></tr><tr><td class=\"k\">コントラクトの呼び出し</td><td><code>to</code>=コントラクトアドレス · <code>data</code>=<b>関数+引数</b></td><td>+1</td></tr></tbody></table>",
  "eth.sc.deriveH": "このアドレスができた過程（たった今実際に計算された値）",
  "eth.sc.derive1": "{who}のウォレットアドレス — keccak({who}の公開鍵*)の末尾20バイト",
  "eth.sc.derive2": "材料 = ウォレットアドレス + その時点のnonce（{nonce}）を連結 — このnonceは<b>タブ2で見たデプロイヤーアカウントのあの番号</b>です",
  "eth.sc.derive3": "keccak-256(材料) — 64 hexのうち末尾40 hexだけ残す",
  "eth.sc.derive4": "→ コントラクトアドレス",
  "eth.sc.deriveMatch": "✓ 上のヘッダーのアドレスと一致",
  "eth.sc.deriveNote":
    "* このシミュレーターは公開鍵の代わりに名前をハッシュします（タブ1のルール）。実際のイーサリアムはRLP([アドレス, nonce])をハッシュしますが材料は同じ — だからウォレットアドレスとコントラクトアドレスは、見た目は同じでも作られる材料が違います。",
  "eth.sc.historyH": "状態の履歴 — 書き換えるのではなく新しい行を積む",
  "eth.sc.historyLead":
    "ボールペンで書く台帳だと考えてください。過去の記録は消したり上書きしたりできず、<b>トランザクションが成功したときだけ次の行（新しいバージョンv番号）が追加</b>されます。条件が合わずrevertされると<b>新しいバージョンは作られず</b>、下には⛔で「試みたが拒否された」だけが残ります — 状態が中途半端に変わることはありません（アトミック性）。ただしgasは消費されます。",
  "eth.sc.histRevert": "新バージョンは積まれない（アトミック性）· gasだけ消費 — {reason}",
  "eth.sc.histNoChange": "storageの変化なし（残高だけ変動）",
  "eth.sc.storageLead":
    "storage = このコントラクト<b>専用の引き出し</b>。右のSolidityコードの上部に宣言された変数たち（<code>price</code>, <code>stock</code>…）の<b>現在の値</b>がここに入ります。関数を呼び出したときだけ変わります。",
  "eth.tok.storageLead":
    "The Sandboxの<b>SAND台帳</b>がこんな形だと考えてください。右の<code>mapping(address → uint256) balanceOf</code> — ウォレットが表示する「トークン残高」の正体です。ETHアカウントのbalanceとは<b>別のスロット</b>です。（教育用ミニ版 · メインネットのSANDコントラクトではありません）",

  // ---------- 保存場所（ブロック vs 状態DB） ----------
  "eth.ws.h1": "ところでこれ全部どこに保存されるの？ — ブロック vs ノードDB",
  "eth.ws.lead":
    "作ったばかりのコード・storage・残高がブロックの中に書かれそうな気がしますが、<b>ブロックには「注文書」だけが書かれます</b>。結果は各ノードが自分で計算して自分のDBに保管します。",
  "eth.ws.blockN": "ブロック（チェーンに永遠に）",
  "eth.ws.blockT": "みんなで共有する記録",
  "eth.ws.blockD":
    "<b>トランザクション一覧</b> — 「Bobがbuy()を0.5 ETHと一緒に呼んだ」のような注文書たち + <b>stateRoot</b> — 実行後の状態全体を要約した32バイトのハッシュ。<b>状態そのものはない。</b>",
  "eth.ws.dbN": "状態DB（各ノードのローカル）",
  "eth.ws.dbT": "注文書を再生して作った結果",
  "eth.ws.dbD":
    "アカウントごとに<span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>。ウォレットアカウントはコードが空で、コントラクトアカウントには<b>バイトコード + storage</b>が付いています。",
  "eth.ws.why":
    "<b>なぜこれで大丈夫？</b> 状態遷移が純粋関数（<span class=\"mono\">新しい状態 = f(前の状態, tx)</span>）なので、ブロックに<b>入力（tx）だけ</b>書いておけば、誰でも最初から再生して同じ状態にたどり着けます。ノード同士は<b>stateRoot 32バイトの比較</b>1回で「計算が同じだね」を検証します — ビットコインのタブ5のマークルルートと同じ原理です。",
  "eth.ws.tableH": "今このシミュレーターの状態DB（リアルタイム）",
  "eth.ws.tableLead":
    "このシミュレーター世界の<b>すべてのアカウント</b>が表示されます — 他のタブで使うコントラクト（SANDはタブ4のトークン、ETH/USD Feedはタブ5のオラクル）は開始時にあらかじめデプロイされています。実際のイーサリアムの状態DBにUSDT・Uniswapが最初から入っているのと同じです。",
  "eth.ws.originTok": "ジェネシスデプロイ · タブ3で使用",
  "eth.ws.originFeed": "ジェネシスデプロイ · タブ4で使用",
  "eth.ws.originGenesis": "ジェネシスデプロイ",
  "eth.ws.originYou": "{who}がたった今デプロイ",
  "eth.ws.colAcct": "アカウント",
  "eth.ws.codeNone": "なし（ウォレット）",
  "eth.ws.codeYes": "あり · {kind} バイトコード",
  "eth.ws.srcNote":
    "<b>Solidityのソースはチェーン上にありません。</b>チェーンに載るのはコンパイル済みの<b>バイトコード</b>だけです。Etherscanでソースが見えるのは、開発者がソースを提出するとEtherscanが再コンパイルしてオンチェーンのバイトコードと照合してくれる<b>チェーン外のサービス</b>のおかげです。このページがSolidityを表示しているのも同じ趣旨です。",
  "eth.sc.deployer": "デプロイヤー",
  "eth.sc.price": "価格（ETH）",
  "eth.sc.stock": "在庫",
  "eth.sc.deploy": "🚀 デプロイ (deploy)",
  "eth.sc.deployOk":
    "デプロイ完了 → アドレス <b class=\"mono\">{addr}</b> (keccak(デプロイヤー, nonce {nonce})) · gas {gas}",
  "eth.sc.deployedBy": "デプロイ: {by} · nonce {nonce}",
  "eth.sc.callH": "呼び出してみる",
  "eth.sc.caller": "呼び出す人",
  "eth.sc.value": "送るETH (msg.value)",
  "eth.sc.storageH": "storage（コントラクトの状態）",
  "eth.sc.storageEmpty": "storageなし",
  "eth.sc.eventsH": "イベントログ",
  "eth.sc.eventsEmpty": "まだイベントなし — 関数を呼び出してみてください",
  "eth.sc.codeH": "Solidityコード（呼び出した関数が光ります）",
  "eth.sc.revertNote":
    "revert: 状態は元に戻りvalueも動きませんでしたが、gas代は消費され、nonceも上がりました — 実際のイーサリアムと同じです。",
  "eth.sc.why":
    "<b>一言で:</b> コントラクトも<b>アドレス・残高・nonce</b>を持つアカウントです。違うのは<b>コードとstorage</b>が付いていて、そのコード通りにしかお金が動かないこと。<code>withdraw()</code>をBobで呼んでみてください — <b>revert</b>されますが、gasは支払われます。",
  "eth.sc.asideH": "なぜ「コードこそがルール」が大ごとなのか",
  "eth.sc.asideBody":
    "<p><b>銀行への預金:</b> 約款・行員・裁判所が介入できます。<b>コントラクトへの預金:</b> デプロイされたコードの条件以外、何もお金を動かせません。</p><p>アドレスが<b>keccak(デプロイヤー, nonce)</b>で決まることも、イベントの<b>topic0 = keccak(シグネチャ)</b>であることも、すべてタブ1で見たハッシュのルールそのままです。</p><p>短所も同じ原理から生まれます — コードにバグがあっても<b>直せません</b>（The DAOハッキングがその例）。</p>",

  // ---------- 4 · トークン ----------
  "eth.tok.h1": "ERC-20 — ETH残高とトークン残高は保存場所が違う",
  "eth.tok.lead":
    "<b>ETH</b>はタブ1のようにプロトコルがアカウントオブジェクトの<b>balance</b>で直接管理します（ビットコインのUTXOではなく口座の数字）。The Sandboxの<b>SAND</b>やUSDTはそのフィールドではなく、イーサリアム上の<b>そのトークンコントラクトのstorageにある表</b>（アドレス→数量）です。ERC-20はその表の<b>標準</b>で、下の<b>SAND</b>はその構造を触ってみる教育用ミニトークンです。",
  "eth.tok.std":
    "<b>同じworld state、別のスロット。</b>イーサリアムが管理するのはアカウントの<code>balance</code>（ETH）。SAND・USDTのようなアプリのトークンは自分のstorageの表。（実際のSANDはgas代の関係でPolygonでも多く取引されますが、トークン自体はイーサリアムのERC-20系です）",
  "eth.tok.why":
    "<b>チェックポイント:</b> ① Transferの<b>value=50 SAND</b>はBobにETHをあげたのではない — storageの表だけが変わる ② それでもtxを実行するには<b>gasはETH</b>で払う（だからAliceのETHはほんの少し減ることがある）③ イベントの<b>topic0</b>は実際のメインネットERC-20 Transferと同じkeccak値。",

  // ---------- 4 · オラクル ----------
  "eth.or.h1": "オラクル — チェーンは外の世界を知らない",
  "eth.or.lead":
    "コントラクトはインターネットもAPIも使えません。すべてのノードが<b>同じ計算を再現</b>できなければならないからです — 例えば天気APIを直接叩くと、あるノードは成功・あるノードは失敗したり、あるノードはA・あるノードはBを受け取ったりして<b>結果が割れます</b>。だから外のデータ（価格・天気・試合結果）は<b>oracleノードたちがトランザクションとして入れてあげる</b>必要があります。Chainlinkがこの方式です。",
  "eth.or.reportH": "① oracleノードが価格を報告",
  "eth.or.nodesLead":
    "各ノードが<b>取引所APIで見た価格</b>をtxとして上げると考えてください。（実際のChainlinkノードは取引所そのものではなく、複数の取引所・集計APIを照会する<b>独立したオペレーター</b>です — ここでは出典名で表示しています）",
  "eth.or.reported": "報告値",
  "eth.or.why":
    "<b>なぜmedian？</b> ノード1つが価格を操作しても<b>中央値は動きません</b>。Coinbaseにとんでもない値を入れてみてください — latestAnswerは持ちこたえます。単一のoracleならそのまま突破されます（実際のDeFiハッキングの定番の原因）。",
  "eth.ins.h1": "② oracleを使うコントラクト — 価格保険",
  "eth.ins.lead":
    "「ETHが<b>3,000ドルを下回ったら</b>1 ETHを支払う」という保険をデプロイしてみてください。支払うかどうかは人ではなく<b>feedのmedian</b>が決めます。下の<b>Bobの残高</b>がsettle後に増えるか見てください。",
  "eth.ins.ledgerH": "アカウント残高（支払いの追跡）",
  "eth.ins.ledgerLead": "加入・清算のたびにBobのETHがどう変わるかを最初から見せます。",
  "eth.ins.role.underwriter": "引受（プール預託）",
  "eth.ins.role.insured": "加入者",
  "eth.ins.role.pool": "支払いプール",
  "eth.ins.threshold": "基準価格（USD）",
  "eth.ins.deploy": "Aliceが保険をデプロイ（支払いプールに1 ETH預託）",
  "eth.ins.buy": "Bobが加入 buyPolicy() — 0.1 ETH",
  "eth.ins.condRule": "支払い条件: median < {threshold}（同じなら満期終了）",
  "eth.ins.condNoFeed": "feedにまだ回答なし — まず上でoracleのreport()を",
  "eth.ins.condMet": "現在のmedian {median} < {threshold} → settle()すると支払い ✅",
  "eth.ins.condUnmet": "現在のmedian {median} ≥ {threshold} → settle()しても支払いなし（満期終了）",
  "eth.ins.warn":
    "<b>オラクル問題:</b> コントラクトのコードがどんなに完璧でも、<b>食わせるデータが汚染されていたら終わり</b>です。だから多数ノード・median・ステーク型ペナルティでデータ自体を分散化するのが、Chainlinkのようなoracleネットワークの仕事です。",
  "eth.or.deeperH": "さらに深く: オラクル問題 · サードパーティ vs ファーストパーティ · 報酬とslashing",
  "eth.or.deeperBody":
    "<p><b>オラクル問題とは何だったか:</b> オンチェーンのデータはメンバー同士が検証し合って信頼を保ちますが、<b>外部（オフチェーン）データはオンチェーンの方法で真偽を検証できません</b>。海外からの旅行者が<b>入国審査</b>を通るように、外のデータにも審査役が必要です — でもその審査を1社に任せると、また中央集権に戻ってしまいます。このジレンマがオラクル問題です。</p><p><b>サードパーティoracle</b>（Chainlink・Band）: 複数の検証ノードがそれぞれデータを取ってきて比較・合意します（上のmedianはそのミニ版）。正確に報告したノードは<b>報酬（LINK）</b>をもらい、間違って報告したノードは<b>stakingしたコインを失い評判が下がって</b>次の検証機会が減ります。分散的ですが、ノードが多いので<b>遅く、報酬も分散</b>します。</p><p><b>ファーストパーティoracle</b>（PYTHなど）: 取引所・データ提供者が<b>直接署名して公開します</b>。stakingで虚偽報告を抑止します。速く効率的ですが、提供者を信じる必要があり<b>中央集権寄り</b>です。</p><p><b>なぜ重要か:</b> オラクルが信頼を確保してくれて初めて、不動産・株式のような<b>実物資産（RWA）</b>もスマートコントラクトで扱えるようになります。LINKコイン自体が技術なのではなく、<b>検証ノードに払う報酬の手段</b>だという点もポイントです。</p>",

  // ---------- 5 · PoS ----------
  "eth.pos.h1": "Proof of Stake — 誰がブロックを作り、いつ確定するのか",
  "eth.pos.lead":
    "The Merge（2022）以降、イーサリアムにはビットコインのようなマイニングはありません。時間が<b>slot</b>（実際は12秒のマス）に細かく区切られ、slotごとに<b>ステーク比例の無作為抽選</b>（実際はRANDAO）でvalidatorが1人選ばれてブロックを<b>提案</b>します。残りのvalidatorたちはそのブロックが正しいか確認して<b>attest（賛成票）</b>を投じます。slotをいくつか（ここでは8個、実際は32個）まとめたものが<b>epoch</b>で、epoch単位で票を集計して確定を進めます。",
  "eth.pos.statsLead":
    "読み方: <b>Slot</b> = 今何番目の時間マスか · <b>Epoch</b> = slotのまとまりの番号 · <b>Justified/Finalized</b> = 下の「2段階の確定」がどのepochまで進んだか（<b>—</b> = まだ確定したepochなし）。",
  "eth.pos.chainLead":
    "ブロックごとに<b>stateRoot</b>（その時点のworld stateの指紋）が載ります。他のタブで送金・コントラクト呼び出しをしてからslotを進めてみてください — 指紋が変わります。validatorがattestの前に再実行して照合する値がまさにこれです。ブロックの<b>attest行</b>は、このブロックに賛成票を投じたvalidatorの名簿です（✓ 投票 · ✗ オフライン）。",
  "eth.pos.liveHead": "slot {slot} — <b>{p}</b> がブロックを提案 → 残りがattest投票",
  "eth.pos.liveOk": "2/3到達 ✓（このepochの確定に貢献）",
  "eth.pos.liveFail": "2/3未達 ✗（確定が遅延）",
  "eth.pos.advance": "⏭ 次のslot",
  "eth.pos.advance5": "×5 slot",
  "eth.pos.epoch": "epochの終わりまで",
  "eth.pos.offline": "オフラインvalidatorの割合",
  "eth.pos.reset": "リセット",
  "eth.pos.chainH": "チェーン (justified → finalized)",
  "eth.pos.twoPhase":
    "<b>なぜ確定が2段階？</b> 契約書に例えると — epochの票が<b>ステークの2/3</b>を集めるとそのepochは<b>justified（仮サイン）</b>。次のepochも2/3を集めると、直前のjustifiedが<b>finalized（公証完了）</b>に昇格します（Casper FFG）。finalizedを覆すにはvalidatorたちが互いに矛盾する投票に署名しなければならず、その瞬間<b>全ステークの1/3+がslashingで焼却</b>されます。だから「経済的に」最終なのです。",
  "eth.pos.convey":
    "<b>確定の単位とリズム:</b> 確定はブロック単位ではなく<b>epoch単位</b>で進みます。普段はベルトコンベアのように — epoch 5が2/3を集めるとepoch 5がjustified + <b>直前のepoch 4がfinalized</b> — 常にjustifiedが1マス先を行きながら並んで前進します（実際にはブロック生成から約2 epoch ≈ 13分後に確定）。ただしfinalizedは<b>祖先まで遡って適用</b>されるので、オフライン障害で確定が数epoch止まった後に投票率が回復すると、止まっていた区間が<b>一気に追いつきます</b> — 下の実験でスライダーを下げると、Finalizedの数字がポンと跳ねるのが見られます。",
  "eth.pos.tryOffline":
    "<b>実験:</b> オフラインのスライダーを<b>34%以上</b>に上げてepochを進めてみてください — 票が2/3に届かず<b>justified/finalizedが止まります</b>。ブロックは積み上がり続けるのに、確定だけされない状態です。実際のイーサリアムはこの状態が長引くと、オフラインvalidatorのステークを少しずつ削って（<b>inactivity leak</b>）2/3を回復させます。",
  "eth.pos.vsBtc":
    "<b>Bitcoinとの比較:</b> PoWの確定は確率的（「承認が積まれるほど安全」）ですが、PoSのGasperは、2/3のステークが署名したcheckpointを覆すには<b>ステークの1/3+がslashingで燃える</b>という経済的なfinalityです。",
  "eth.pos.proposeCheck":
    "<b>提案者はtxを改ざんできる？</b> mempoolから<b>どのtxを入れるか・順序</b>は選べますが、他人が署名したtxの金額・受取人をいじると<b>署名が壊れて拒否</b>されます（タブ1・2）。自分のtxは新しく署名して入れられますが、<b>自分のお金の範囲</b>だけ。validatorはブロック内のtxを再実行して<b>stateRootが一致するか</b>を確かめ（タブ8）、合っていればattest・違えば拒否します。",
  "eth.st.h1": "validatorのライフサイクル — staking · slashing",
  "eth.st.lead":
    "ブロックを提案・投票するには<b>32 ETH</b>をstakingして有効化する必要があります。二重署名のような違反は<b>slashing</b>で担保が削られます — PoWの電気の代わりに担保でシビルを防ぐ構造です。",
  "eth.st.label": "validator名",
  "eth.st.amt": "stake (ETH)",
  "eth.st.deposit": "預託",
  "eth.st.activate": "直前の預託分を有効化",
  "eth.st.slashId": "対象ID",
  "eth.st.slash": "二重署名 → slashing",
  "eth.st.offline": "オフラインペナルティ",
  "eth.st.listH": "validator一覧",
  "eth.st.slashScale":
    "<b>なぜ全額没収ではなく一部だけ削られるの？</b> 実際のイーサリアムの即時罰金は意外と小さいです（32 ETHのうち約<b>1 ETH</b>）。その代わり<b>資格が永久に剥奪され</b>（ここでもSlashedは再有効化不可）、決定的なのは、同じ期間にslashingされたステークが多いほど罰金が大きくなる<b>相関ペナルティ</b>があること — ステークの<b>1/3+が共謀</b>してfinalizedを覆そうとした瞬間、<b>全額焼却</b>されます。1人のミス（鍵管理の事故）は軽く、組織的な攻撃は破滅的に罰する設計です。",
  "eth.st.depOk": "預託完了 · validator #{id} (Pending)",
  "eth.st.actOk": "有効化完了 — 次のslotから提案・attestに参加",
  "eth.st.slashOk": "slashing実行 — stakeの一部を焼却 · 状態はSlashed",
  "eth.st.offOk": "inactivityペナルティを適用",
  "eth.at.h1": "攻撃してみる — フォーク · 二重提案",
  "eth.at.lead":
    "提案の当番になったvalidatorが<b>同じslotに別々のブロック2つに署名</b>し、ネットワークの半分ずつに違うバージョンを見せる攻撃です（二重支払いの試み — BTCタブ7の「秘密のチェーン」のPoS版）。結果: ① チェーンは二股に分かれますが ② 正直な多数派の投票の重みが元のチェーンをheadとして守り ③ <b>同じslotへの署名2つ = 数学的な証拠</b>なので言い逃れ不可能 — 自動的に<b>slashing</b>されます。BTCと違い、失敗した攻撃は担保を失うので再挑戦できません。",
  "eth.at.sigLayers":
    "<b>ここでの「署名」はtxの署名ではありません — 署名には3つの層があります。</b>① <b>tx署名</b> = 「このお金を送るのは私だ」（送る人のウォレット鍵、タブ1・2）② <b>ブロック署名</b> = 「このブロックを作ったのは私だ」（提案者が完成したブロックヘッダーにvalidator鍵で署名）③ <b>attest署名</b> = 「このブロックに賛成したのは私だ」（投票者の署名）。二重提案の証拠は、②が同じslotに2つ存在すること。ちなみにvalidator鍵はウォレット鍵（ECDSA）とは別の<b>BLS署名</b>を使い、数千の署名を1つにまとめられるので（集約）、100万のvalidatorがepochごとに全員投票してもブロックに収まります。",
  "eth.at.attacker": "攻撃者のvalidator ID",
  "eth.at.fork": "フォーク攻撃（二重提案）",
  "eth.at.warn":
    "<b>51%との違い:</b> BTCの二重支払いは「より長い秘密のチェーン」の競争なので、電気さえあれば再挑戦できます。PoSでfinalizedなcheckpointを攻撃すると<b>担保が焼却</b>され、同じ攻撃を繰り返せません。",
};
