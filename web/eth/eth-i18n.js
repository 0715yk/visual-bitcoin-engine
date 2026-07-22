// Visual Ethereum Engine i18n keys (merged into i18n.js T table)
// 고유명사는 영어 그대로: validator · The Merge · slashing · staking · finality
import { ETH_I18N_JA } from "./eth-i18n-ja.js";
import { ETH_I18N_ES } from "./eth-i18n-es.js";
import { ETH_I18N_FR } from "./eth-i18n-fr.js";
import { ETH_I18N_DE } from "./eth-i18n-de.js";

export const ETH_I18N = {
  ko: {
    "eth.header.title": "Visual Ethereum Engine",
    "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · 교육용 시뮬레이터",
    "eth.header.tagline":
      "Rust로 만든 <b>이더리움 엔진</b>(계정 · 스마트 컨트랙트 · PoS)을 WebAssembly로 브라우저에서 직접 돌려보는 학습 도구",
    "eth.meta.title": "Visual Ethereum Engine — 이더리움 원리 인터랙티브 시뮬레이터",
    "eth.tabs.overview": "둘러보기",
    "eth.tabs.keccak": "1 · Keccak · 주소",
    "eth.tabs.account": "2 · 계정 · Gas",
    "eth.tabs.contracts": "3 · 스마트 컨트랙트",
    "eth.tabs.tokens": "4 · 토큰 (ERC-20)",
    "eth.tabs.oracles": "5 · 오라클",
    "eth.tabs.pos": "6 · PoS 합의",
    "eth.tabs.realestate": "7 · 부동산 거래",
    "eth.tabs.evm": "8 · EVM 실행기",

    // ---------- 7 · 부동산 에스크로 ----------
    "eth.re.h1": "부동산 거래를 이더리움으로 — 에스크로 컨트랙트",
    "eth.re.lead":
      "지금까지 배운 걸 <b>하나의 실제 거래</b>로 꿰어 봅니다. 전통 부동산은 <b>에스크로 회사·등기소·중개인</b>이 신뢰를 맡죠. 여기선 <b>코드(컨트랙트)</b>가 그 역할을 대신해요 — 대금을 잠그고, 조건이 확인돼야만 매도자에게 넘깁니다. 단계마다 <b>tx·nonce·gas·storage·블록·stateRoot</b>가 어떻게 움직이는지 보세요.",
    "eth.re.name": "매물명",
    "eth.re.seller": "매도자",
    "eth.re.buyer": "매수자",
    "eth.re.inspector": "확인자",
    "eth.re.price": "가격(ETH)",
    "eth.re.fee": "확인자 수수료(ETH)",
    "eth.re.reset": "리셋",
    "eth.re.step1": "① 매물 등록 (deploy)",
    "eth.re.step2": "② 대금 예치 (deposit)",
    "eth.re.step3": "③ 등기·하자 확인 (confirm)",
    "eth.re.step4": "④ 잔금 지급 (release)",
    "eth.re.stepRefund": "파기·환불 (refund)",
    "eth.re.role.buyer": "매수자",
    "eth.re.role.seller": "매도자",
    "eth.re.role.inspector": "확인자",
    "eth.re.role.contract": "에스크로 컨트랙트",
    "eth.re.flow.deposit": "① 대금 예치",
    "eth.re.flow.confirm": "② 확인",
    "eth.re.flow.release": "③ 잔금 지급",
    "eth.re.priceLbl": "매물가",
    "eth.re.feeLbl": "확인자 수수료",
    "eth.re.state.None": "미등록",
    "eth.re.state.Listed": "등록됨 (대금 대기)",
    "eth.re.state.Funded": "대금 잠김 (확인 대기)",
    "eth.re.state.Confirmed": "확인 완료 (지급 대기)",
    "eth.re.state.Released": "거래 완료 ✅",
    "eth.re.state.Refunded": "거래 파기 (환불)",
    "eth.re.hintStart":
      "<b>시작:</b> 매도자(<b>Bob</b>)가 <b>① 매물 등록</b>을 누르면 Escrow 컨트랙트가 <b>배포</b>됩니다. 이게 곧 '이 거래 전용 계좌 + 규칙'이에요.",
    "eth.re.hintListed":
      "<b>다음:</b> 매수자(<b>Alice</b>)가 <b>② 대금 예치</b>. 대금은 매도자가 아니라 <b>컨트랙트에 잠깁니다</b> — 조건이 충족되기 전엔 아무도 못 빼가요. (msg.value = 매물가와 정확히 일치해야 함)",
    "eth.re.hintFunded":
      "<b>다음:</b> 중립 <b>확인자(Carol)</b>가 <b>③ 등기·하자 확인</b>. 확인자만 호출할 수 있고(코드가 강제), 확인 전엔 잔금이 안 나갑니다. Alice가 confirm을 눌러도 <b>revert</b>돼요.",
    "eth.re.hintConfirmed":
      "<b>마지막:</b> <b>④ 잔금 지급</b>을 누르면 컨트랙트가 잠갔던 대금을 <b>쪼개서</b> 지급합니다 — <b>확인자에게 수수료</b>, 나머지는 <b>매도자에게</b>. 일한 확인자가 코드에 의해 자동으로 보상받아요.",
    "eth.re.hintReleased":
      "<b>완료 ✅</b> 매도자와 <b>확인자(수수료)</b> 잔액이 늘고 컨트랙트 잠금은 0이 됐어요. 원장에서 확인자 잔액이 오른 걸, 블록 익스플로러에서 stateRoot가 바뀐 걸 확인하세요. 새 거래는 <b>리셋</b>.",
    "eth.re.hintRefunded":
      "<b>파기됨:</b> 확인 전이라 대금이 <b>매수자에게 원자적으로 환불</b>됐습니다. 반쯤 처리되는 일 없이 전액 되돌아가요. 새 거래는 <b>리셋</b>.",
    "eth.re.msgDeployed": "Escrow 배포 완료 · {addr} · nonce {nonce}",
    "eth.re.stateH": "지금 컨트랙트 · 계정 상태",
    "eth.re.stateLead":
      "왼쪽은 실제 잔액·컨트랙트 storage·이벤트, 오른쪽은 그 규칙을 정한 Solidity 코드예요. 방금 호출한 함수가 코드에서 빛납니다.",
    "eth.re.ledgerH": "계정 잔액 (거래 당사자)",
    "eth.re.blocksH": "블록에 쌓이는 과정 — tx + stateRoot",
    "eth.re.blocksLead":
      "각 단계는 <b>트랜잭션</b>이고, 블록에 담기면 전체 상태의 지문 <b>stateRoot</b>가 바뀝니다. git 커밋처럼 이전 걸 고치는 게 아니라 <b>새 블록이 앞으로 쌓여요</b>. (stateRoot는 이 시뮬의 계정+컨트랙트 스냅샷을 keccak-256 한 값입니다.)",
    "eth.re.blocksNote":
      "<b>읽는 법:</b> 블록마다 담긴 tx(누가·무슨 함수)와 그 직후의 <code>stateRoot</code>가 보여요. tx가 상태를 바꾸면 stateRoot가 <b>완전히 달라지고</b>, revert된 tx는 상태를 안 바꾸니 stateRoot도 그대로입니다.",
    "eth.re.blocksEmpty": "아직 블록이 없습니다 — 단계를 진행해 보세요.",
    "eth.re.genesisTx": "제네시스 상태 (거래 시작 전)",
    "eth.re.srDiff": "stateRoot 바뀜",
    "eth.re.srSame": "stateRoot 그대로 (revert)",
    "eth.re.vsH": "전통 부동산 ↔ 이더리움 에스크로",
    "eth.re.vsCol1": "역할",
    "eth.re.vsCol2": "전통 부동산 거래",
    "eth.re.vsCol3": "이더리움 에스크로",
    "eth.re.vsRows":
      "<tr><td class=\"k\">대금 보관</td><td>에스크로 회사·은행 계좌</td><td><b>컨트랙트가 잠금</b> (아무도 못 빼감)</td></tr><tr><td class=\"k\">조건 확인</td><td>등기소·법무사·중개인</td><td><b>확인자 tx</b> (confirm)</td></tr><tr><td class=\"k\">지급 실행</td><td>사람이 송금 처리 (지연·실수)</td><td><b>코드가 자동</b> (조건 충족 시만)</td></tr><tr><td class=\"k\">파기·환불</td><td>분쟁·소송 가능</td><td><b>refund로 원자적 환불</b></td></tr><tr><td class=\"k\">신뢰 주체</td><td>여러 기관·사람</td><td><b>배포된 코드</b> (변경 불가)</td></tr><tr><td class=\"k\">기록</td><td>기관별 장부 (분산·불투명)</td><td><b>블록·stateRoot</b> (공개·검증가능)</td></tr>",
    "eth.re.vsWhy":
      "<b>핵심:</b> 바뀐 건 '누구를 믿느냐'예요. 여러 기관·사람에게 흩어졌던 신뢰가 <b>배포 후 못 바꾸는 코드 한 조각</b>으로 모입니다. 대신 <b>코드에 버그가 있으면 그것도 규칙</b>이 되므로(탭 3), 실제 서비스는 감사(audit)를 거칩니다.",

    // ---------- Overview ----------
    "eth.ov.h1": "이더리움은 \"코드를 실행하는 장부\"예요",
    "eth.ov.lead":
      "비트코인이 <b>돈의 장부</b>라면, 이더리움은 거기에 <b>프로그램(스마트 컨트랙트)</b>을 올려 두는 장부입니다. 한번 배포된 코드는 아무도 못 바꾸고, 조건이 맞으면 <b>자동으로 실행</b>돼요. 합의는 The Merge 이후 <b>Proof of Stake</b> — validator가 32 ETH를 걸고 블록을 제안·검증합니다.",
    "eth.ov.btcN": "Bitcoin",
    "eth.ov.btcT": "PoW · UTXO · 돈의 장부",
    "eth.ov.btcD": "\"누가 얼마를 가졌나\"를 기록. 스크립트는 최소한. 보안·단순함에 올인.",
    "eth.ov.ethN": "Ethereum",
    "eth.ov.ethT": "PoS · 계정 · 코드 실행 장부",
    "eth.ov.ethD":
      "잔액 + <b>컨트랙트 코드·storage</b>까지 기록. 토큰·거래소·보험이 전부 \"체인 위 프로그램\".",
    "eth.ov.why":
      "<b>핵심 한 줄:</b> 스마트 컨트랙트 = <b>\"미리 써둔 규칙대로만 움직이는 금고\"</b>. 은행 약관은 은행이 바꿀 수 있지만, 배포된 컨트랙트는 <b>만든 사람도 못 바꿉니다</b>. 이 사이트에서 직접 배포하고 호출해 보세요.",
    "eth.ov.cross":
      "← 검증 원리는 Bitcoin 탭과 같아요: 각 노드가 <b>혼자서 규칙을 채점</b>합니다. 다른 건 시빌 방어 — PoW는 전기, PoS는 담보(32 ETH + slashing)로 막습니다.",
    "eth.ov.orderH": "추천 학습 순서",
    "eth.ov.o1": "<b>1 · Keccak · 주소</b> — 해시에서 주소가 만들어지는 과정 (SHA-256과 대비)",
    "eth.ov.o2": "<b>2 · 계정 · Gas</b> — 잔액·nonce·EIP-1559 수수료 (UTXO와 대비)",
    "eth.ov.o3": "<b>3 · 스마트 컨트랙트</b> — 배포 → 호출 → storage · 이벤트 · gas (메인)",
    "eth.ov.o4": "<b>4 · 토큰 (ERC-20)</b> — 토큰 = 컨트랙트의 잔액 표 (SAND 예시)",
    "eth.ov.o5": "<b>5 · 오라클</b> — 체인은 바깥세상을 모른다 · Chainlink식 price feed · 보험",
    "eth.ov.o6": "<b>6 · PoS 합의</b> — slot → attest → justified/finalized · slashing",
    "eth.ov.o7": "<b>7 · 부동산 거래</b> — 배운 걸 전부 묶는 에스크로 실전 (총정리)",
    "eth.ov.o8": "<b>8 · EVM 실행기</b> — 바이트코드가 실제로 실행되는 과정을 한 스텝씩",

    // ---------- 1 · Accounts · Gas ----------
    "eth.acc.h1": "계정 = 잔액을 \"숫자로 직접\" 저장 (UTXO와 다른 선택)",
    "eth.acc.lead":
      "비트코인은 동전 조각(UTXO)을 모아 잔액을 <i>계산</i>했죠. 이더리움은 <b>계좌처럼 잔액 숫자를 직접</b> 저장해요. 보내면 <b>내 숫자가 줄고 상대 숫자가 늘</b> 뿐 — 거스름돈도, UTXO 조각도 없습니다. 직접 보내 보세요.",
    "eth.acc.feeBoxH": "수수료 계산식 펼치기 (EIP-1559)",
    "eth.acc.feeBoxBody":
      "<p><b>단위:</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>. tip 입력은 ETH가 아니라 <b>Gwei/gas</b>.</p><p><b>왜 ×21,000?</b> Gwei는 칸당 단가이고, 단순 ETH 전송의 gas used는 프로토콜 고정 <span class=\"mono\">21,000</span>입니다. (토큰·컨트랙트는 더 큼.)</p><ul class=\"tight\"><li><b>gas used</b> = 21,000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">(시뮬 고정)</span> → 소각</li><li><b>tip</b> = 입력 T Gwei/gas → 블록 proposer</li></ul><pre class=\"mono eth-fee-formula\">소각 = 21,000 × 10 × 10⁻⁹ = 0.000210 ETH\ntip  = 21,000 × T × 10⁻⁹ ETH → proposer\n차감 = value + 소각 + tip</pre><p class=\"small muted\">예: T=5 → tip = 0.000105 ETH. \"5 ETH tip\"이 아님.</p>",
    "eth.acc.shortWhy":
      "<b>한 줄:</b> <b>value → 받는 사람</b>, <b>tip → 블록 proposer</b>, <b>base fee → 소각</b>. 잔액이 그대로 증감하고, 오른쪽 <b>n=</b> 값(nonce)이 1씩 오르는 걸 보세요.",
    "eth.acc.vsH": "비트코인 UTXO ↔ 이더리움 계정",
    "eth.acc.vsCol1": "항목",
    "eth.acc.vsCol2": "비트코인 (UTXO)",
    "eth.acc.vsCol3": "이더리움 (계정)",
    "eth.acc.vsRows":
      "<tr><td class=\"k\">잔액</td><td>동전(UTXO) 조각들의 합 — 직접 저장 안 함</td><td>숫자로 <b>직접 저장</b></td></tr><tr><td class=\"k\">보낼 때</td><td>UTXO 통째 소비 + <b>거스름돈</b> 새로 생성</td><td>내 잔액 <b>−</b>, 상대 잔액 <b>+</b> (거스름돈 없음)</td></tr><tr><td class=\"k\">재사용 방지</td><td>UTXO가 한 번 쓰면 <b>소멸</b> (자동)</td><td><b>nonce</b> 번호로 방지 (아래 카드)</td></tr><tr><td class=\"k\">병렬성</td><td>서로 다른 UTXO는 동시 처리 쉬움</td><td>한 계정은 nonce 순서라 <b>직렬</b></td></tr><tr><td class=\"k\">컨트랙트 상태</td><td>표현이 까다로움</td><td>잔액+storage로 <b>자연스러움</b></td></tr>",
    "eth.acc.vsWhy":
      "<b>왜 이렇게 갈렸나?</b> 비트코인은 \"돈\"에 집중해 <b>단순·병렬·프라이버시</b>에 유리한 UTXO를 골랐고, 이더리움은 <b>프로그램(컨트랙트) 상태</b>를 다뤄야 해서 \"이 주소가 지금 얼마·무슨 값을 갖는가\"를 바로 읽는 <b>계정 모델</b>이 편했어요. 좋고 나쁨이 아니라 <b>목적이 다른 설계</b>입니다.",
    "eth.acc.whereH": "그런데 이 잔액은 정확히 어디에 저장돼요?",
    "eth.acc.whereBody":
      "<p>\"직접 저장\"이라 했지만 <b>블록 안</b>에 잔액이 적히는 건 아니에요. 각 노드가 관리하는 <b>월드 스테이트(world state)</b> — <code>주소 → 계정 객체</code> 라는 거대한 맵 — 안에 있습니다. 계정 하나는 딱 4개 필드예요.</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>필드</th><th>뜻</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>그 계정이 보낸 tx 수 (아래 카드의 그 번호)</td></tr><tr><td class=\"k\">balance</td><td><b>잔액 (wei 단위)</b> ← 여기</td></tr><tr><td class=\"k\">storageRoot</td><td>컨트랙트 storage의 요약 해시 (지갑 EOA는 빈 값)</td></tr><tr><td class=\"k\">codeHash</td><td>컨트랙트 코드의 해시 (지갑 EOA는 빈 값)</td></tr></tbody></table><p>지갑(EOA)이든 컨트랙트든 <b>구조는 똑같고</b>, 지갑은 뒤 두 필드가 비어 있을 뿐이에요.</p><p><b>블록에는 뭐가 들어가나:</b> 이 맵 전체를 해시 트리로 묶은 꼭대기 해시 하나 = <b>state root</b> 만 <b>블록 헤더</b>에 박힙니다. 잔액 숫자 자체는 노드가 트랜잭션을 실행하며 자기 DB를 갱신해 유지해요. 즉 블록 = <b>\"이 시점 상태의 지문(state root)\" + \"그 블록의 tx들\"</b>.</p><p class=\"small muted\"><b>↔ 비트코인:</b> 비트코인은 잔액을 저장하는 곳이 아예 없고, 노드가 <b>UTXO 집합</b>을 들고 있다가 \"내 주소로 쓸 수 있는 UTXO 합\"으로 그때그때 계산. 이더리움은 <b>주소별 balance 숫자</b>를 직접 들고 있어 조회 한 번이면 끝.</p>",
    "eth.acc.nonceH": "nonce — 계정 모델의 \"재사용 방지 번호\"",
    "eth.acc.nonceLead":
      "nonce는 <b>계정마다 따로 매기는 트랜잭션 순번</b>(0, 1, 2, …)이에요. 왜 이게 꼭 필요한지 먼저 보죠.",
    "eth.acc.nonceProblem":
      "<b>문제:</b> 이더 잔액은 그냥 <b>숫자</b>예요. 내가 서명한 \"Bob에게 1 ETH\" tx를 누가 <b>10번 복붙해 방송</b>하면? 비트코인이면 그 UTXO가 이미 소멸돼 자동으로 막히지만, 계정은 잔액만 있어서 <b>막을 게 없습니다.</b>",
    "eth.acc.nonceBox":
      "<span class=\"who\">{who}</span><span class=\"note\">의 현재 nonce</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ 다음 tx는 #{cur}, 성공하면</span> <span class=\"nxt\">{next}</span></span>",
    "eth.acc.nonceRoles":
      "<b>해결 — nonce가 두 가지를 동시에:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① 재사용(replay) 방지</b> — 각 번호는 딱 한 번만. 이미 쓴 nonce의 tx는 거부돼요. 그래서 복붙 방송이 안 통함.</li><li><b>② 순서 보장</b> — 반드시 0 → 1 → 2 순으로. 중간을 건너뛴 tx는 앞 번호가 처리될 때까지 대기(pending).</li></ul>",
    "eth.acc.nonceSig":
      "<b>🔑 탭 1 서명과 연결:</b> nonce는 서명 대상(sighash)에 <b>포함</b>돼요. 그래서 내용이 똑같은 송금이라도 <b>nonce가 다르면 서명이 완전히 달라집니다</b> → 옛 서명을 복붙해도 그 nonce는 이미 소비돼 거부. \"서명이 내용을 잠근다\"가 여기서 재사용 방지로 이어져요.",
    "eth.acc.nonceDeeperH": "더 깊이: pending·stuck tx · nonce gap · 컨트랙트 주소",
    "eth.acc.nonceDeeperBody":
      "<p><b>stuck tx:</b> nonce 5를 낮은 수수료로 보내 안 처리되면, nonce 6·7은 <b>아무리 급해도 대기</b>해요(순서 때문). 해결은 같은 nonce 5를 더 높은 수수료로 다시 보내 <b>덮어쓰기</b>.</p><p><b>nonce gap:</b> 5 다음에 실수로 7을 보내면, 6이 올 때까지 7은 <b>영원히 대기</b>. mempool에서 6을 기다려요.</p><p><b>컨트랙트 주소와의 관계:</b> 탭 1에서 봤듯 컨트랙트 주소 = <code>keccak(배포자 주소 + nonce)</code>. 그래서 <b>같은 사람이 배포해도 nonce가 올라가 매번 다른 주소</b>가 나와요.</p>",
    "eth.acc.gasH": "Gas · EIP-1559 — 수수료는 어떻게 나뉘나",
    "eth.acc.gasLead":
      "보낼 때 tip 값을 바꾸면 위 미리보기(소각·tip·차감)가 실시간으로 바뀌어요. 그 숫자가 어디서 오는지 정리합니다.",
    "eth.acc.gasWhat":
      "<b>gas가 뭔가요?</b> 모든 연산·저장은 노드의 자원을 씁니다. 그 <b>작업량을 재는 단위가 gas</b>예요. 단순 ETH 전송은 프로토콜이 <b>21,000 gas</b>로 고정(토큰·컨트랙트는 더 큼). <b>수수료 = gas × gas당 단가</b> — 스팸을 막고 검증자에게 보상하는 장치죠.",
    "eth.acc.gasEip":
      "<b>EIP-1559 — 단가가 두 조각:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — 네트워크가 <b>혼잡도에 따라 자동</b>으로 정함. 이 사이트는 <b>10 Gwei/gas 고정</b>. → 아무에게도 안 가고 <b>소각(burn)</b>.</li><li><b>priority tip</b> — 내가 정하는 웃돈(위 입력칸). → 블록 <b>proposer(검증자)</b>에게.</li></ul>",
    "eth.acc.burnWhy":
      "<b>🔥 소각(burn)의 의미:</b> base fee로 낸 ETH는 <b>영원히 사라져요.</b> 네트워크가 붐빌수록 소각이 늘어 <b>ETH 총량이 줄어드는 디플레 압력</b>이 생깁니다. 비트코인이 \"새 코인 발행을 반감기로 줄이는\" 것과 방향은 비슷하지만, 이더는 <b>이미 있는 코인을 태우는</b> 방식이에요.",
    "eth.acc.propTag": "proposer",
    "eth.acc.burnLbl": "소각",
    "eth.acc.from": "보내는 사람",
    "eth.acc.to": "받는 사람",
    "eth.acc.amt": "금액(ETH)",
    "eth.acc.gas": "tip (Gwei/gas)",
    "eth.acc.feePreview": "소각 {burn} · tip {tip} → {prop} · {from} 차감 {paid}",
    "eth.acc.send": "전송",
    "eth.acc.sendFail": "전송 실패",

    // ---------- 1 · Keccak · 주소 ----------
    "eth.kc.h1": "Keccak-256 — 이더리움이 \"id\"를 만드는 해시",
    "eth.kc.lead":
      "이더리움에서 만나는 거의 모든 id — 주소·함수 셀렉터·이벤트 topic·컨트랙트 주소 — 는 이 해시 하나에서 나옵니다. 비트코인이 SHA-256을 쓰는 것과 같은 용도인데, 이더는 <b>Keccak-256</b>을 써요. 먼저 직접 해시해 보세요.",
    "eth.kc.playIn": "입력 (아무 글자나)",
    "eth.kc.playOutLbl": "Keccak-256 (임의 길이 입력 → 항상 32바이트 = 64 hex)",
    "eth.kc.avalanche":
      "<b>눈사태 효과:</b> 한 글자만 바꿔도 결과의 절반쯤 비트가 뒤집힙니다. 되돌리기(해시→입력)는 불가능하고, 입력이 같으면 결과는 항상 같아요 — SHA-256과 같은 성질입니다.",
    "eth.kc.sha3H": "함정: Keccak-256 ≠ NIST SHA3-256",
    "eth.kc.sha3Body":
      "<p>이더리움이 쓰는 건 표준 확정 <b>이전</b>의 원조 Keccak이라, NIST가 확정한 SHA3-256과 <b>패딩 바이트 하나</b>가 다릅니다. 같은 입력인데 결과가 완전히 달라요.</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (패딩 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (패딩 0x06)</pre><p class=\"small muted\">라이브러리에서 <code>sha3_256</code>을 부르면 이더리움 주소가 안 나오는 이유예요. 반드시 <code>keccak256</code>을 써야 합니다.</p>",
    "eth.kc.addrH": "주소 = keccak(공개키)의 \"끝 20바이트\"",
    "eth.kc.addrLead":
      "지갑 주소는 공개키를 Keccak한 뒤 <b>끝 20바이트</b>만 잘라 만듭니다. (이 데모는 공개키 대신 이름을 해시 — 규칙은 동일)",
    "eth.kc.addrIn": "입력 (데모: 이름 → 해시 → 주소)",
    "eth.kc.hashLbl": "① Keccak-256 전체 (32바이트) — 앞 12바이트는 회색, 끝 20바이트만 씀",
    "eth.kc.addrLbl": "② 주소 = 끝 20바이트 + 0x",
    "eth.kc.addrWhy":
      "<b>왜 앞 12바이트를 버리나?</b> 해시는 32바이트인데 주소는 <b>20바이트(160비트)</b>면 충분해요 — 짧게 줄여 저장 공간은 아끼되, <b>서로 다른 두 사람이 우연히 같은 주소를 갖게 될 확률은 사실상 0</b>입니다(이런 우연을 \"해시 충돌\"이라고 불러요 — 20바이트면 경우의 수가 2¹⁶⁰개라 사실상 안 생깁니다). 실제 공개키는 secp256k1의 X·Y 좌표 <b>64바이트</b>(압축 접두사 0x04는 떼고)를 해시합니다.",
    "eth.kc.idsH": "이더리움 곳곳에서 쓰는 Keccak — 미리 둘러보기",
    "eth.kc.idsLead":
      "이더리움은 여러 곳에서 Keccak을 씁니다. 쓰임새마다 <b>입력이 다르고</b>, 해시한 결과에서 <b>필요한 부분만 잘라</b> 써요. 지금은 아래를 눌러 보며 \"아, 여기저기서 Keccak을 쓰는구나\" 정도만 느끼면 충분합니다 — 셀렉터·topic·컨트랙트 주소가 정확히 뭔지는 다음 탭들에서 다뤄요.",
    "eth.kc.selH": "① 함수 셀렉터 — 시그니처 해시의 <b>앞 4바이트</b>",
    "eth.kc.selLead":
      "컨트랙트 호출 때 \"어떤 함수?\"를 가리키는 id. 탭 3에서 buy()·transfer()를 부를 때 앞에 붙는 값이에요.",
    "eth.kc.selIn": "함수 시그니처",
    "eth.kc.selOut":
      "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ 셀렉터 <b class=\"mono\">0x{sel}</b> <span class=\"muted\">(앞 8 hex = 4바이트)</span>",
    "eth.kc.topicH": "② 이벤트 topic0 — 시그니처 해시 <b>전체 32바이트</b>",
    "eth.kc.topicLead":
      "로그에서 \"이건 Transfer 이벤트\"라고 구분하는 값. 탭 3·4 이벤트 로그의 topic0가 바로 이거예요.",
    "eth.kc.topicIn": "이벤트 시그니처",
    "eth.kc.topicOut":
      "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">(전체 32바이트를 그대로 사용)</span>",
    "eth.kc.caH": "③ 컨트랙트 주소 — keccak(<b>배포자 주소 + nonce</b>)의 끝 20바이트",
    "eth.kc.caLead":
      "배포할 때마다 nonce가 올라가서 주소가 매번 달라집니다. 탭 3에서 자판기를 배포하면 이 규칙으로 주소가 정해져요.",
    "eth.kc.caDeployer": "배포자 (이름)",
    "eth.kc.caNonce": "nonce",
    "eth.kc.caOut":
      "keccak(\"{pre}\")<br>→ 컨트랙트 주소 <b class=\"mono\">{addr}</b> <span class=\"muted\">(끝 20바이트)</span>",
    "eth.kc.when":
      "<b>정리 — 같은 해시 <u>함수</u>를 여러 곳에서</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>주소</b> ← <b>공개키</b>를 해시 → 끝 20바이트</li><li><b>컨트랙트 주소</b> ← <b>배포자+nonce</b>를 해시 → 끝 20바이트</li><li><b>함수 셀렉터</b> ← <b>시그니처</b>를 해시 → 앞 4바이트</li><li><b>이벤트 topic0</b> ← <b>시그니처</b>를 해시 → 전체 32바이트</li></ul>",
    "eth.kc.deeperH": "더 깊이: mapping 저장 위치 · CREATE2 · 체크섬 주소",
    "eth.kc.deeperBody":
      "<p><b>mapping 저장 위치:</b> <code>balanceOf[Alice]</code>가 storage 어디에 놓이는지도 <code>keccak(key ‖ slot번호)</code>로 정해집니다 — 탭 4 \"토큰 storage 표\"의 실제 주소 계산 방식이에요.</p><p><b>CREATE2:</b> nonce 대신 <code>keccak(0xff ‖ 배포자 ‖ salt ‖ keccak(코드))</code>로 주소를 미리 계산 — 배포 전에 주소를 알 수 있어 L2·지갑에서 많이 씁니다.</p><p><b>체크섬 주소(EIP-55):</b> 주소의 대소문자는 주소 자체를 keccak한 값으로 정해져요. 오타를 잡는 체크섬이라, <code>0xAbC…</code> 처럼 섞인 대소문자에 의미가 있습니다.</p>",

    // 카드 2.5 — 지갑 생성 (BTC↔ETH 대비)
    "eth.kc.genH": "그럼 공개키는 어디서 오나 — 지갑 생성 3단계",
    "eth.kc.genLead":
      "지갑 만들기는 <b>난수(개인키) → 타원곡선 곱 → 공개키 → 해시 → 주소</b>가 전부예요. 앞 두 단계(개인키→공개키)는 <b>비트코인과 완전히 동일</b>하고(같은 secp256k1 곡선), <b>주소 만들 때 해시 함수만</b> 달라요. 이 \"타원곡선 곱(점프)\"을 그림으로 보고 싶으면 <b>Bitcoin 탭 4</b>를 보세요.",
    "eth.kc.genCol1": "단계",
    "eth.kc.genCol2": "비트코인",
    "eth.kc.genCol3": "이더리움",
    "eth.kc.genRows":
      "<tr><td class=\"k\">① 개인키</td><td>256비트 <b>난수</b></td><td>256비트 <b>난수</b> <span class=\"same\">동일</span></td></tr><tr><td class=\"k\">② 공개키</td><td class=\"mono\">개인키 × G (secp256k1)</td><td class=\"mono\">개인키 × G <span class=\"same\">같은 곡선</span></td></tr><tr><td class=\"k\">③ 주소</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) 끝 20B → 0x… <span class=\"diff\">해시만 다름</span></td></tr><tr><td class=\"k\">서명</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">동일</span></td></tr><tr><td class=\"k\">시드 문구</td><td>BIP-39 (12/24단어)</td><td>BIP-39 <span class=\"same\">동일</span></td></tr><tr><td class=\"k\">계정 경로</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">숫자만 다름</span></td></tr><tr><td class=\"k\">저장 위치</td><td>wallet.dat · 하드웨어 칩</td><td>브라우저 확장(암호화) · 하드웨어 칩</td></tr>",
    "eth.kc.genKey":
      "<b>🔑 핵심:</b> 지갑의 <b>근본(키·서명·시드)은 두 체인이 거의 같아요.</b> 실제로 <b>하드웨어 지갑 하나로 BTC·ETH를 같이 관리</b>할 수 있는 이유죠. 눈에 보이는 차이는 사실상 <b>주소 표기(해시)</b>뿐입니다.",
    "eth.kc.genStoreH": "개인키는 어디에 저장되나? · 시드 문구 · 서명은 어디서?",
    "eth.kc.genStore":
      "<p><b>개인키는 블록체인에 없어요.</b> 체인엔 주소·잔액·트랜잭션·서명만 올라갑니다. 개인키는 <b>내 지갑 안</b>에만 있어요 — 노드도 내 개인키를 모릅니다(알면 누구나 내 돈을 훔치니까).</p><ul class=\"tight\"><li><b>메타마스크</b> — 브라우저 확장 저장소에 <b>비밀번호로 암호화</b>돼 보관, 쓸 때만 복호화.</li><li><b>하드웨어 지갑(Ledger·Trezor)</b> — 기기 안 보안 칩에 갇혀 <b>밖으로 안 나옴</b>. 서명도 기기 안에서.</li><li><b>시드 문구(12단어)</b> — 개인키들의 <b>씨앗</b>. 이거 하나로 모든 계정 복구 가능 → 유출되면 전부 털림.</li></ul><p><b>서명은 \"내 기기 안에서\" 일어나요.</b> 지갑이 로컬에서 개인키로 tx에 서명 → 체인엔 <b>서명 + tx만</b> 전송 → 노드는 <b>공개키로 검증만</b>. \"서명은 나만, 검증은 누구나\"의 비대칭이죠.</p>",

    "eth.acc.contrastEth": "네이티브 ETH (프로토콜이 관리)",
    "eth.acc.contrastEthHint": "계정 객체의 balance 필드 · UTXO 아님 · 1번 탭과 동일",
    "eth.acc.contrastTok": "앱 장부 · {token} (storage)",
    "eth.acc.contrastTokHint": "토큰 수량(value)은 ETH가 아님 · 다만 실행 gas는 ETH로 지불",
    "eth.acc.tokAmt": "수량",
    "eth.acc.tokOk":
      "storage만 갱신: {from} → {to} · {amt} {token}. 상대에게 넘어간 건 {token}이지 ETH가 아님 — 단 <b>gas는 ETH로 차감</b>됩니다.",
    "eth.logH": "엔진 로그",

    // ---------- 8 · EVM 실행기 ----------
    "eth.evm.h1": "EVM — 이더리움을 돌리는 CPU",
    "eth.evm.lead":
      "스마트 컨트랙트는 결국 <b>바이트코드</b>고, 그걸 한 명령(opcode)씩 실행하는 가상 CPU가 <b>EVM</b>이에요. world state(데이터)에 tx(명령)를 넣으면, EVM이 gas를 태우며 실행해 <b>새 상태</b>를 만듭니다. JVM처럼 <b>스택 기반 가상머신</b>이고, JS 이벤트 루프처럼 <b>단일 스레드로 끝까지 실행</b>돼요.",
    "eth.evm.mapCol1": "컴퓨터",
    "eth.evm.mapCol2": "이더리움",
    "eth.evm.mapCol3": "뭐냐",
    "eth.evm.mapRows":
      "<tr><td class=\"k\">디스크 / DB (전체)</td><td>world state</td><td>모든 계정 잔액 + 모든 컨트랙트 storage</td></tr><tr><td class=\"k\">그중 한 파일·테이블</td><td>storage</td><td>컨트랙트 하나분의 영구 칸 (world state의 일부)</td></tr><tr><td class=\"k\">RAM (휘발)</td><td>stack · memory</td><td>tx 끝나면 사라짐</td></tr><tr><td class=\"k\">실행할 프로그램</td><td>tx</td><td>누가·어떤 함수·인자 (동작)</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>바이트코드를 opcode씩 실행</td></tr><tr><td class=\"k\">전기요금·클럭</td><td>gas</td><td>실행 비용·상한</td></tr><tr><td class=\"k\">전체 DB 체크섬</td><td>stateRoot</td><td>world state 전체의 지문</td></tr>",
    "eth.evm.analogy":
      "<b>JVM 닮은 점:</b> 둘 다 <b>스택 머신</b> — 레지스터가 아니라 스택에 값을 쌓아 계산해요. <code>PUSH 3, PUSH 4, ADD</code> → 스택에 7. <b>JS 이벤트 루프 닮은 점:</b> 단일 스레드로 <b>끝까지 실행</b>(중간에 안 끊김), 끝나거나 통째로 revert.",
    "eth.evm.determinism":
      "<b>결정적으로 다른 점:</b> EVM은 <b>완전 결정적</b>이어야 해요 — <code>random</code>·현재시각·네트워크 I/O가 <b>없음</b>. 전 세계 노드가 같은 tx를 각자 실행해 <b>똑같은 스택·스토리지·gas</b>가 나와야 합의가 되니까요. gas도 이래서 존재해요(무한루프·DoS 방지).",
    "eth.evm.runH": "한 스텝씩 실행해 보기",
    "eth.evm.runLead":
      "프로그램을 고르고 <b>다음 스텝</b>을 누르면, opcode 하나가 실행될 때마다 <b>스택·스토리지·gas</b>가 어떻게 변하는지 보여줘요. 이벤트 루프 시각화처럼요.",
    "eth.evm.program": "프로그램",
    "eth.evm.calldata": "입력 v (calldata)",
    "eth.evm.calldataPrice": "매물가 price (calldata)",
    "eth.evm.exSstoreEscrow":
      "<b>SSTORE</b> — 에스크로 storage 갱신: <b>{slot} ← {val}</b>. 7번 탭의 state/price/locked 가 바로 이런 슬롯 쓰기예요.",
    "eth.evm.stepBack": "◀ 이전",
    "eth.evm.step": "▶ 다음 스텝",
    "eth.evm.runAll": "⏩ 전부 실행",
    "eth.evm.reset": "↺ 리셋",
    "eth.evm.bytecodeH": "바이트코드 · PC",
    "eth.evm.stackH": "Stack (top ↑ · 휘발성)",
    "eth.evm.memoryH": "Memory (휘발성)",
    "eth.evm.storageH": "Storage (이 컨트랙트 칸 · world state의 일부)",
    "eth.evm.gasH": "Gas",
    "eth.evm.gasUsed": "사용",
    "eth.evm.gasLeft": "남음",
    "eth.evm.emptyStack": "스택 비어 있음",
    "eth.evm.emptyMem": "사용한 메모리 없음",
    "eth.evm.emptyStorage": "아직 storage에 쓴 값 없음",
    "eth.evm.exInit": "실행 전 초기 상태 — 스택·메모리·스토리지 모두 비어 있고 gas는 가득. <b>다음 스텝</b>을 눌러 opcode를 하나씩 실행해 보세요.",
    "eth.evm.exPush": "<b>PUSH1 {v}</b> — 즉시값 {v} 를 스택 맨 위에 올려요.",
    "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — tx가 넣어준 입력값(v)을 읽어 스택에 올려요. (스택에 있던 offset은 소비)",
    "eth.evm.exAdd": "<b>ADD</b> — 스택 위 두 값을 꺼내 더한 뒤 결과를 다시 올려요.",
    "eth.evm.exMul": "<b>MUL</b> — 스택 위 두 값을 꺼내 곱한 뒤 결과를 올려요.",
    "eth.evm.exSub": "<b>SUB</b> — 스택 위 두 값을 빼서 결과를 올려요.",
    "eth.evm.exSstore":
      "<b>SSTORE</b> — 스택에서 (slot, 값)을 꺼내 <b>storage에 영구 기록</b>. 여기가 world state가 바뀌는 순간! 그래서 gas가 압도적으로 비싸요(0→값은 20000).",
    "eth.evm.exSload": "<b>SLOAD</b> — storage 슬롯에서 값을 읽어 스택에 올려요.",
    "eth.evm.exMstore": "<b>MSTORE</b> — 휘발성 메모리에 값을 써요. (tx 끝나면 사라짐)",
    "eth.evm.exStop": "<b>STOP</b> — 실행 종료 ✅. 이 tx의 최종 스토리지가 확정되고, 이걸 반영한 새 stateRoot가 만들어져요.",
    "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — 실행이 중단되고 <b>상태 변경은 전부 롤백</b>돼요. 단, 여기까지 쓴 gas는 돌려받지 못합니다.",
    "eth.evm.gitH": "World state ↔ stateRoot — git처럼 보기",
    "eth.evm.gitLead":
      "왼쪽은 이 컨트랙트의 <b>storage</b>(world state의 한 조각), 오른쪽은 그걸 해시한 <b>교육용 stateRoot</b>예요. 실제 체인의 stateRoot는 <b>모든 계정 잔액 + 모든 컨트랙트 storage</b>를 합쳐 해시합니다. SSTORE로 값이 바뀌면 커밋이 쌓이고, 프로그램을 바꿔도 <b>히스토리는 남습니다</b>.",
    "eth.evm.gitTree": "storage (world state의 일부)",
    "eth.evm.gitRoot": "stateRoot · commit hash",
    "eth.evm.gitHistH": "커밋 히스토리",
    "eth.evm.clearHist": "히스토리 지우기",
    "eth.evm.gitEmpty": "아직 커밋 없음 — 스텝을 진행해 SSTORE를 만나보세요.",
    "eth.evm.gitRootFirst": "첫 스냅샷 (비어 있는 상태의 해시)",
    "eth.evm.gitRootChanged": "바뀜 ↑ 이전 커밋 {prev} 와 다름 — storage가 달라진 증거",
    "eth.evm.gitRootSame": "이전 커밋과 동일 — storage 변화 없음",
    "eth.evm.commitGenesis": "genesis · 빈 storage",
    "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
    "eth.evm.commitStop": "STOP · {prog} 실행 완료",
    "eth.evm.commitSnap": "스냅샷",
    "eth.evm.whyH": "이게 왜 이더리움의 본체인가",
    "eth.evm.why1":
      "<b>ERC-20·오라클·DeFi는 전부 이 위에서 도는 앱</b>이에요. 컨트랙트 코드=class, 배포된 주소=인스턴스 하나, storage=그 인스턴스의 필드, 함수 호출=메서드 호출. EVM은 그 메서드를 실제로 굴리는 엔진이고요.",
    "eth.evm.why2":
      "<b>SSTORE가 왜 비싼가:</b> 스택·메모리는 RAM처럼 tx 끝나면 사라지지만, <b>storage는 디스크처럼 영구</b>이고 world state의 일부라 모든 노드가 영원히 들고 있어야 해요. 그래서 스토리지 쓰기(20000 gas)가 산술(3 gas)보다 압도적으로 비쌉니다.",
    "eth.evm.why3":
      "<b>핵심:</b> <code>new_state = EVM.execute(state, tx)</code> 하고 <code>stateRoot = hash(new_state)</code>. 이 상태 전이 기계를 이해하면, 나머지는 전부 '이 기계 위의 인스턴스들'로 보입니다.",

    // ---------- 2 · Smart Contracts ----------
    "eth.sc.h1": "스마트 컨트랙트 — 자판기를 배포해 보세요",
    "eth.sc.lead":
      "아래는 진짜 Solidity로 쓴 <b>자판기(SnackMachine)</b>입니다. 배포하면 코드가 체인에 박제되고, 누구든 <code>buy()</code>를 호출할 수 있어요. <b>owner도 규칙을 못 바꿉니다.</b>",
    "eth.sc.acctTypesH": "먼저 — 이더리움 계정은 두 종류",
    "eth.sc.eoaN": "지갑 계정 (EOA)",
    "eth.sc.eoaT": "Alice · Bob · 당신의 MetaMask",
    "eth.sc.eoaD":
      "주소 = keccak(<b>공개키</b>)의 끝 20바이트. <b>개인키가 있어서</b> 서명으로 트랜잭션을 시작할 수 있음.",
    "eth.sc.caN": "컨트랙트 계정",
    "eth.sc.caT": "SnackMachine · SAND · Uniswap",
    "eth.sc.caD":
      "주소 = keccak(<b>배포자 주소 + nonce</b>)의 끝 20바이트. <b>개인키가 없고</b> 코드·storage가 붙어 있음 — 호출당할 때만 움직임.",
    "eth.sc.txKinds":
      "<b>전송·배포·호출은 전부 \"같은 tx\" — 하나같이 nonce를 +1 합니다.</b> EOA가 밖으로 보내는 건 결국 다 트랜잭션이고, <code>to</code>·<code>data</code>가 뭐냐로 이름만 갈려요. 그래서 배포도 전송처럼 nonce를 먹고, 그 nonce가 위 컨트랙트 주소의 재료가 됩니다.<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>하는 일</th><th>tx 생김새</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">단순 전송</td><td><code>to</code>=받는 사람 · value · <code>data</code> 없음</td><td>+1</td></tr><tr><td class=\"k\">컨트랙트 배포</td><td><code>to</code>=<b>비어있음(null)</b> · <code>data</code>=<b>바이트코드</b></td><td>+1</td></tr><tr><td class=\"k\">컨트랙트 호출</td><td><code>to</code>=컨트랙트 주소 · <code>data</code>=<b>함수+인자</b></td><td>+1</td></tr></tbody></table>",
    "eth.sc.deriveH": "이 주소가 만들어진 과정 (방금 실제로 계산된 값)",
    "eth.sc.derive1": "{who}의 지갑 주소 — keccak({who}의 공개키*) 끝 20바이트",
    "eth.sc.derive2": "재료 = 지갑 주소 + 그때의 nonce({nonce})를 이어붙임 — 이 nonce가 <b>탭 2에서 본 배포자 계정의 그 번호</b>예요",
    "eth.sc.derive3": "keccak-256(재료) — 64 hex 중 끝 40 hex만 남김",
    "eth.sc.derive4": "→ 컨트랙트 주소",
    "eth.sc.deriveMatch": "✓ 위 헤더의 주소와 일치",
    "eth.sc.deriveNote":
      "* 이 시뮬은 공개키 대신 이름을 해시합니다(1번 탭 규칙). 실제 이더리움은 RLP([주소, nonce])를 해시하지만 재료는 동일 — 그래서 지갑 주소와 컨트랙트 주소는 생김새는 같아도 만들어지는 재료가 다릅니다.",
    "eth.sc.historyH": "상태 히스토리 — 고치는 게 아니라 새 줄을 쌓아요",
    "eth.sc.historyLead":
      "볼펜으로 쓰는 장부라고 생각하세요. 이전 기록을 지우거나 덮어쓸 수 없고, <b>트랜잭션이 성공할 때만 다음 줄(새 버전 v번호)이 추가</b>됩니다. 조건이 안 맞아 revert되면 <b>새 버전은 안 생기고</b>, 아래엔 ⛔로 '시도했지만 거부됨'만 남아요 — 상태가 반쯤 바뀌는 일은 없습니다(원자성). 대신 gas는 나갑니다.",
    "eth.sc.histRevert": "새 버전 안 쌓임 (원자성) · gas만 소모 — {reason}",
    "eth.sc.histNoChange": "storage 변화 없음 (잔액만 변동)",
    "eth.sc.storageLead":
      "storage = 이 컨트랙트 <b>전용 서랍</b>. 오른쪽 Solidity 코드 위쪽에 선언된 변수들(<code>price</code>, <code>stock</code>…)의 <b>현재 값</b>이 여기 담깁니다. 함수를 호출해야만 바뀌어요.",
    "eth.tok.storageLead":
      "The Sandbox의 <b>SAND 장부</b>가 이렇게 생겼다고 보면 됩니다. 오른쪽 <code>mapping(address → uint256) balanceOf</code> — 지갑이 보여주는 \"토큰 잔액\"의 정체예요. ETH 계정 balance와는 <b>다른 칸</b>입니다. (교육용 미니 버전 · 메인넷 SAND 컨트랙트 아님)",

    // ---------- 저장 위치 (블록 vs 상태 DB) ----------
    "eth.ws.h1": "그런데 이게 다 어디에 저장되나요? — 블록 vs 노드 DB",
    "eth.ws.lead":
      "방금 만든 코드·storage·잔액이 블록 안에 적힐 것 같지만, <b>블록에는 \"주문서\"만 적힙니다</b>. 결과물은 각 노드가 직접 계산해서 자기 DB에 보관해요.",
    "eth.ws.blockN": "블록 (체인에 영원히)",
    "eth.ws.blockT": "모두가 공유하는 기록",
    "eth.ws.blockD":
      "<b>트랜잭션 목록</b> — \"Bob이 buy()를 0.5 ETH와 호출\" 같은 주문서들 + <b>stateRoot</b> — 실행 후 상태 전체를 요약한 해시 32바이트. <b>상태 자체는 없음.</b>",
    "eth.ws.dbN": "상태 DB (각 노드 로컬)",
    "eth.ws.dbT": "주문서를 재생해서 만든 결과물",
    "eth.ws.dbD":
      "계정마다 <span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>. 지갑 계정은 코드가 비어 있고, 컨트랙트 계정엔 <b>바이트코드 + storage</b>가 붙어 있어요.",
    "eth.ws.why":
      "<b>왜 이래도 되나?</b> 상태 전이가 순수함수(<span class=\"mono\">새 상태 = f(이전 상태, tx)</span>)라서, 블록에 <b>입력(tx)만</b> 적어두면 누구든 처음부터 재생해 같은 상태에 도달합니다. 노드끼리는 <b>stateRoot 32바이트 비교</b> 한 번으로 \"우리 계산 같네\"를 검증해요 — 비트코인 5번 탭의 머클루트와 같은 원리.",
    "eth.ws.tableH": "지금 이 시뮬의 상태 DB (실시간)",
    "eth.ws.tableLead":
      "이 시뮬 세계의 <b>모든 계정</b>이 나옵니다 — 다른 탭에서 쓰는 컨트랙트(SAND는 4번 토큰 탭, ETH/USD Feed는 5번 오라클 탭)는 시작할 때 미리 배포돼 있어요. 실제 이더리움 상태 DB에 USDT·Uniswap이 이미 들어 있는 것과 같습니다.",
    "eth.ws.originTok": "제네시스 배포 · 3번 탭에서 사용",
    "eth.ws.originFeed": "제네시스 배포 · 4번 탭에서 사용",
    "eth.ws.originGenesis": "제네시스 배포",
    "eth.ws.originYou": "{who}가 방금 배포",
    "eth.ws.colAcct": "계정",
    "eth.ws.codeNone": "없음 (지갑)",
    "eth.ws.codeYes": "있음 · {kind} 바이트코드",
    "eth.ws.srcNote":
      "<b>Solidity 소스는 체인에 없습니다.</b> 체인에 올라가는 건 컴파일된 <b>바이트코드</b>뿐이에요. Etherscan에서 소스가 보이는 건 개발자가 소스를 제출하면 다시 컴파일해 바이트코드와 대조해 주는 <b>체인 밖 서비스</b> 덕분입니다. 이 페이지가 Solidity를 보여주는 것도 같은 취지예요.",
    "eth.sc.deployer": "배포자",
    "eth.sc.price": "가격(ETH)",
    "eth.sc.stock": "재고",
    "eth.sc.deploy": "🚀 배포 (deploy)",
    "eth.sc.deployOk":
      "배포 완료 → 주소 <b class=\"mono\">{addr}</b> (keccak(배포자, nonce {nonce})) · gas {gas}",
    "eth.sc.deployedBy": "배포: {by} · nonce {nonce}",
    "eth.sc.callH": "호출하기",
    "eth.sc.caller": "호출자",
    "eth.sc.value": "보낼 ETH (msg.value)",
    "eth.sc.storageH": "storage (컨트랙트의 상태)",
    "eth.sc.storageEmpty": "storage 없음",
    "eth.sc.eventsH": "이벤트 로그",
    "eth.sc.eventsEmpty": "아직 이벤트 없음 — 함수를 호출해 보세요",
    "eth.sc.codeH": "Solidity 코드 (호출한 함수가 빛나요)",
    "eth.sc.revertNote":
      "revert: 상태는 원래대로 돌아가고 value도 안 나갔지만, gas fee는 소모됐고 nonce도 올라갔습니다 — 실제 이더리움과 동일.",
    "eth.sc.why":
      "<b>한 줄:</b> 컨트랙트도 <b>주소·잔액·nonce</b>를 가진 계정입니다. 다른 점은 <b>코드와 storage</b>가 붙어 있고, 그 코드대로만 돈이 움직인다는 것. <code>withdraw()</code>를 Bob으로 호출해 보세요 — <b>revert</b>되지만 gas는 나갑니다.",
    "eth.sc.asideH": "왜 \"코드가 곧 규칙\"이 큰일인가",
    "eth.sc.asideBody":
      "<p><b>은행 예치:</b> 약관·직원·법원이 개입 가능. <b>컨트랙트 예치:</b> 배포된 코드 조건 말고는 그 무엇도 돈을 못 움직입니다.</p><p>주소가 <b>keccak(배포자, nonce)</b>로 결정되는 것, 이벤트의 <b>topic0 = keccak(시그니처)</b>인 것 전부 1번 탭에서 본 해시 규칙 그대로예요.</p><p>단점도 같은 원리에서 나옵니다 — 코드에 버그가 있어도 <b>못 고칩니다</b> (The DAO 해킹이 그 사례).</p>",

    // ---------- 4 · Tokens ----------
    "eth.tok.h1": "ERC-20 — ETH 잔액과 토큰 잔액은 저장 위치가 다름",
    "eth.tok.lead":
      "<b>ETH</b>는 1번 탭처럼 프로토콜이 계정 객체의 <b>balance</b>로 직접 관리합니다 (비트코인 UTXO가 아니라 계좌 숫자). The Sandbox의 <b>SAND</b>나 USDT는 그 필드가 아니라, 이더리움 위 <b>그 토큰 컨트랙트 storage의 표</b>(주소→수량)예요. ERC-20은 그 표의 <b>표준</b>이고, 아래 <b>SAND</b>는 그 구조를 만져 보는 교육용 미니 토큰입니다.",
    "eth.tok.std":
      "<b>같은 world state, 다른 칸.</b> 이더리움이 관리하는 건 계정 <code>balance</code>(ETH). SAND·USDT 같은 앱 토큰은 자기 storage 표. (실제 SAND는 gas 때문에 Polygon에서도 많이 거래되지만, 토큰 자체는 이더리움 ERC-20 계열입니다.)",
    "eth.tok.why":
      "<b>확인 포인트:</b> ① Transfer의 <b>value=50 SAND</b>는 Bob에게 ETH를 준 게 아님 — storage 표만 바뀜 ② 그래도 tx를 실행하려면 <b>gas는 ETH</b>로 냄 (그래서 Alice ETH는 아주 조금 줄 수 있음) ③ 이벤트의 <b>topic0</b>은 실제 메인넷 ERC-20 Transfer와 동일한 keccak 값.",

    // ---------- 4 · Oracles ----------
    "eth.or.h1": "오라클 — 체인은 바깥세상을 모른다",
    "eth.or.lead":
      "컨트랙트는 인터넷도 API도 못 씁니다. 모든 노드가 <b>같은 계산을 재현</b>해야 하니까요 — 예를 들어 날씨 API를 직접 치면, 어떤 노드는 성공·어떤 노드는 실패하거나, 어떤 노드는 A·어떤 노드는 B를 받을 수 있어 <b>결과가 갈라집니다</b>. 그래서 바깥 데이터(가격·날씨·경기 결과)는 <b>oracle 노드들이 트랜잭션으로 넣어줘야</b> 합니다. Chainlink가 이 방식이에요.",
    "eth.or.reportH": "① oracle 노드가 가격 보고",
    "eth.or.nodesLead":
      "각 노드가 <b>거래소 API에서 본 가격</b>을 tx로 올린다고 생각하세요. (실제 Chainlink 노드는 거래소 자체가 아니라, 여러 거래소·집계 API를 조회하는 <b>독립 운영자</b>입니다 — 여기선 출처 이름으로 표시)",
    "eth.or.reported": "보고값",
    "eth.or.why":
      "<b>왜 median?</b> 노드 하나가 가격을 조작해도 <b>중앙값은 안 움직입니다</b>. Coinbase에 터무니없는 값을 넣어보세요 — latestAnswer가 버팁니다. 단일 oracle이면 그대로 뚫려요 (실제 DeFi 해킹 단골 원인).",
    "eth.ins.h1": "② oracle을 쓰는 컨트랙트 — 가격 보험",
    "eth.ins.lead":
      "\"ETH가 <b>3,000달러 아래</b>로 떨어지면 1 ETH를 지급한다\"는 보험을 배포해 보세요. 지급 여부는 사람이 아니라 <b>feed의 median</b>이 결정합니다. 아래 <b>Bob 잔액</b>이 settle 후 늘어나는지 보세요.",
    "eth.ins.ledgerH": "계정 잔액 (지급 추적)",
    "eth.ins.ledgerLead": "가입·정산할 때마다 Bob ETH가 어떻게 바뀌는지 처음부터 보여 줍니다.",
    "eth.ins.role.underwriter": "인수(풀 예치)",
    "eth.ins.role.insured": "가입자",
    "eth.ins.role.pool": "지급 풀",
    "eth.ins.threshold": "기준가(USD)",
    "eth.ins.deploy": "Alice가 보험 배포 (지급 풀 1 ETH 예치)",
    "eth.ins.buy": "Bob 가입 buyPolicy() — 0.1 ETH",
    "eth.ins.condRule": "지급 조건: median < {threshold} (같으면 만료)",
    "eth.ins.condNoFeed": "feed에 아직 답 없음 — 위에서 oracle report() 먼저",
    "eth.ins.condMet": "현재 median {median} < {threshold} → settle() 하면 지급 ✅",
    "eth.ins.condUnmet": "현재 median {median} ≥ {threshold} → settle() 해도 미지급 (만료)",
    "eth.ins.warn":
      "<b>오라클 문제:</b> 컨트랙트 코드가 아무리 완벽해도, <b>먹이는 데이터가 오염되면 끝</b>입니다. 그래서 다중 노드·median·스테이크 기반 페널티로 데이터 자체를 탈중앙화하는 게 Chainlink 같은 oracle 네트워크의 일입니다.",
    "eth.or.deeperH": "더 깊이: 오라클 문제 · 써드파티 vs 퍼스트파티 · 보상과 슬래싱",
    "eth.or.deeperBody":
      "<p><b>오라클 문제가 뭐였나:</b> 온체인 데이터는 구성원들이 서로 검증하며 신뢰를 유지하지만, <b>외부(오프체인) 데이터는 인체인 방식으로 참·거짓을 검증할 방법이 없습니다</b>. 외국 여행객이 <b>입국 심사</b>를 거치듯, 바깥 데이터도 심사자가 필요한데 — 그 심사를 한 업체에 맡기면 다시 중앙화가 되죠. 이 딜레마가 오라클 문제입니다.</p><p><b>써드파티 오라클</b> (Chainlink·Band): 여러 검증 노드가 각자 데이터를 가져와 비교·합의합니다(위 median이 그 축소판). 정확히 보고한 노드는 <b>보상(LINK)</b>을 받고, 틀리게 보고한 노드는 <b>스테이킹한 코인을 잃고 평판이 깎여</b> 다음 검증 기회가 줄어요. 탈중앙적이지만 노드가 많아 <b>느리고 보상이 분산</b>됩니다.</p><p><b>퍼스트파티 오라클</b> (PYTH 등): 거래소·데이터 제공자가 <b>직접 서명해 올립니다</b>. 스테이킹으로 거짓 보고를 억제해요. 빠르고 효율적이지만 제공자를 믿어야 해서 <b>중앙화 쪽으로 기웁니다</b>.</p><p><b>왜 중요한가:</b> 오라클이 신뢰를 확보해줘야 부동산·주식 같은 <b>실물 자산(RWA)</b>도 스마트 컨트랙트로 다룰 수 있게 됩니다. LINK 코인 자체가 기술이 아니라, <b>검증 노드에게 주는 보상 수단</b>이라는 점도 포인트.</p>",

    // ---------- 5 · PoS ----------
    "eth.pos.h1": "Proof of Stake — 누가 블록을 만들고, 언제 확정되나",
    "eth.pos.lead":
      "The Merge(2022) 이후 이더리움엔 비트코인 같은 채굴이 없습니다. 시간이 <b>slot</b>(실제 12초짜리 칸)으로 잘게 나뉘고, 매 slot마다 <b>지분 비례 무작위 추첨</b>(실제는 RANDAO)으로 validator 한 명이 뽑혀 블록을 <b>제안</b>합니다. 나머지 validator들은 그 블록이 맞는지 확인하고 <b>attest(찬성 투표)</b>를 던져요. slot 여러 개(여기선 8개, 실제 32개)를 묶은 게 <b>epoch</b>이고, epoch 단위로 투표를 집계해 확정을 진행합니다.",
    "eth.pos.statsLead":
      "읽는 법: <b>Slot</b> = 지금 몇 번째 시간 칸인지 · <b>Epoch</b> = slot 묶음 번호 · <b>Justified/Finalized</b> = 아래 \"2단계 확정\"이 어느 epoch까지 진행됐는지 (<b>—</b> = 아직 확정된 epoch 없음).",
    "eth.pos.chainLead":
      "블록마다 <b>stateRoot</b>(그 시점 world state의 지문)가 실립니다. 다른 탭에서 송금·컨트랙트 호출을 한 뒤 slot을 진행해 보세요 — 지문이 바뀝니다. 검증자가 attest 전에 재실행으로 대조하는 값이 바로 이거예요. 블록의 <b>attest 줄</b>은 이 블록에 찬성 투표한 validator 명단입니다 (✓ 투표 · ✗ 오프라인).",
    "eth.pos.liveHead": "slot {slot} — <b>{p}</b> 가 블록 제안 → 나머지가 attest 투표",
    "eth.pos.liveOk": "2/3 도달 ✓ (이 epoch 확정에 기여)",
    "eth.pos.liveFail": "2/3 미달 ✗ (확정 지연)",
    "eth.pos.advance": "⏭ 다음 slot",
    "eth.pos.advance5": "×5 slot",
    "eth.pos.epoch": "epoch 끝까지",
    "eth.pos.offline": "오프라인 validator 비율",
    "eth.pos.reset": "리셋",
    "eth.pos.chainH": "체인 (justified → finalized)",
    "eth.pos.twoPhase":
      "<b>왜 확정이 2단계인가?</b> 계약서에 비유하면 — epoch의 투표가 <b>2/3 지분</b>을 모으면 그 epoch은 <b>justified(가서명)</b>. 다음 epoch도 2/3를 모으면 직전 justified가 <b>finalized(공증 완료)</b>로 승격됩니다(Casper FFG). finalized를 뒤집으려면 validator들이 서로 모순된 투표에 서명해야 하는데, 그 순간 <b>전체 지분의 1/3+가 slashing으로 소각</b>돼요. 그래서 \"경제적으로\" 최종입니다.",
    "eth.pos.convey":
      "<b>확정의 단위와 리듬:</b> 확정은 블록 낱개가 아니라 <b>epoch 단위</b>로 진행됩니다. 평상시엔 컨베이어 벨트처럼 — epoch 5가 2/3를 모으면 epoch 5 justified + <b>직전의 epoch 4가 finalized</b> — 항상 justified가 한 칸 앞서 나란히 전진해요 (실제로는 블록 생성 후 약 2 epoch ≈ 13분 뒤 확정). 단, finalized는 <b>조상까지 소급</b>되기 때문에, 오프라인 사태로 확정이 몇 epoch 멈췄다가 투표율이 회복되면 멈춰 있던 구간이 <b>한꺼번에 따라잡힙니다</b> — 아래 실험에서 슬라이더를 내려보면 Finalized 숫자가 훌쩍 뛰는 걸 볼 수 있어요.",
    "eth.pos.tryOffline":
      "<b>실험:</b> 오프라인 슬라이더를 <b>34% 이상</b>으로 올리고 epoch을 진행해 보세요 — 투표가 2/3에 못 미쳐 <b>justified/finalized가 멈춥니다</b>. 블록은 계속 쌓이는데 확정만 안 되는 상태. 실제 이더리움은 이 상태가 길어지면 오프라인 validator의 지분을 서서히 깎아(<b>inactivity leak</b>) 다시 2/3를 회복해요.",
    "eth.pos.vsBtc":
      "<b>Bitcoin 대비:</b> PoW의 확정은 확률적(\"컨펌이 쌓일수록 안전\")이지만, PoS Gasper는 2/3 지분이 서명한 checkpoint를 뒤집으려면 <b>지분 1/3+가 slashing으로 불타는</b> 경제적 파이널리티입니다.",
    "eth.pos.proposeCheck":
      "<b>제안자가 tx를 조작할 수 있나?</b> 멤풀에서 <b>어떤 tx를 넣을지·순서</b>는 고를 수 있지만, 남이 서명한 tx의 금액·수신자를 고치면 <b>서명이 깨져서 거절</b>됩니다(탭 1·2). 본인 tx는 새로 서명해 넣을 수 있지만 <b>자기 돈 범위</b>뿐. 검증자는 블록 안 tx를 다시 실행해 <b>stateRoot가 일치하는지</b> 보고(탭 8), 맞으면 attest · 틀리면 거부합니다.",
    "eth.st.h1": "validator 라이프사이클 — staking · slashing",
    "eth.st.lead":
      "블록을 제안·투표하려면 <b>32 ETH</b>를 staking하고 활성화해야 합니다. 이중서명 같은 위반은 <b>slashing</b>으로 담보가 깎여요 — PoW의 전기 대신 담보로 시빌을 막는 구조입니다.",
    "eth.st.label": "validator 이름",
    "eth.st.amt": "stake (ETH)",
    "eth.st.deposit": "예치",
    "eth.st.activate": "방금 예치분 활성화",
    "eth.st.slashId": "대상 ID",
    "eth.st.slash": "이중서명 → slashing",
    "eth.st.offline": "오프라인 페널티",
    "eth.st.listH": "validator 목록",
    "eth.st.slashScale":
      "<b>왜 전액 몰수가 아니라 일부만 깎이나?</b> 실제 이더리움의 즉시 벌금은 의외로 작아요 (32 ETH 중 약 <b>1 ETH</b>). 대신 <b>자격이 영구 박탈</b>되고(여기서도 Slashed는 재활성화 불가), 결정적으로 같은 기간에 slashing된 지분이 많을수록 벌금이 커지는 <b>상관관계 페널티</b>가 있어서 — 지분 <b>1/3+가 공모</b>해 finalized를 뒤집으려는 순간 <b>전액 소각</b>됩니다. 혼자 한 실수(키 관리 사고)는 가볍게, 조직적 공격은 파멸적으로 벌하는 설계예요.",
    "eth.st.depOk": "예치 완료 · validator #{id} (Pending)",
    "eth.st.actOk": "활성화 완료 — 다음 slot부터 제안·attest에 참여",
    "eth.st.slashOk": "slashing 실행 — stake 일부 소각 · 상태 Slashed",
    "eth.st.offOk": "inactivity 페널티 적용",
    "eth.at.h1": "공격해 보기 — 포크 · 이중 제안",
    "eth.at.lead":
      "제안자 당번이 된 validator가 <b>같은 slot에 서로 다른 블록 2개를 서명</b>해 절반씩 다른 버전을 보여주는 공격입니다(이중지불 시도 — BTC 탭 7의 \"비밀 체인\"의 PoS 버전). 결과: ① 체인이 두 갈래로 갈라지지만 ② 정직한 다수의 투표 가중치가 원래 체인을 헤드로 지키고 ③ <b>같은 slot에 대한 서명 2개 = 수학적 증거</b>라 변명 불가 — 자동으로 <b>slashing</b>됩니다. BTC와 달리 실패한 공격은 담보를 잃어 재시도가 불가능해요.",
    "eth.at.sigLayers":
      "<b>여기서 \"서명\"은 tx 서명이 아니에요 — 서명은 세 층이 있습니다.</b> ① <b>tx 서명</b> = \"이 돈을 보내는 게 나다\" (보낸 사람의 지갑 키, 탭 1·2) ② <b>블록 서명</b> = \"이 블록을 만든 게 나다\" (제안자가 완성된 블록 헤더에 validator 키로 서명) ③ <b>attest 서명</b> = \"이 블록에 찬성한 게 나다\" (투표자의 서명). 이중 제안의 증거는 ②가 같은 slot에 2개 존재하는 것. 참고로 validator 키는 지갑 키(ECDSA)와 다른 <b>BLS 서명</b>을 쓰는데, 수천 개 서명을 하나로 합칠 수 있어서(집계) 100만 validator가 epoch마다 전원 투표해도 블록에 담을 수 있어요.",
    "eth.at.attacker": "공격자 validator ID",
    "eth.at.fork": "포크 공격 (이중 제안)",
    "eth.at.warn":
      "<b>51%와의 차이:</b> BTC의 이중지불은 \"더 긴 비밀 체인\" 경쟁이라 전기만 있으면 재시도 가능. PoS에서 finalized checkpoint를 공격하면 <b>담보가 소각</b>되어 같은 공격을 반복할 수 없습니다.",
  },

  en: {
    "eth.header.title": "Visual Ethereum Engine",
    "eth.footer.text": "Visual Ethereum Engine · Rust → WebAssembly · Educational simulator",
    "eth.header.tagline":
      "An <b>Ethereum engine</b> (accounts · smart contracts · PoS) written in Rust, compiled to WebAssembly, running live in your browser",
    "eth.meta.title": "Visual Ethereum Engine — Interactive Ethereum Simulator",
    "eth.tabs.overview": "Overview",
    "eth.tabs.keccak": "1 · Keccak · Address",
    "eth.tabs.account": "2 · Accounts · Gas",
    "eth.tabs.contracts": "3 · Smart Contracts",
    "eth.tabs.tokens": "4 · Tokens (ERC-20)",
    "eth.tabs.oracles": "5 · Oracles",
    "eth.tabs.pos": "6 · PoS Consensus",
    "eth.tabs.realestate": "7 · Real Estate",
    "eth.tabs.evm": "8 · EVM Runner",

    // ---------- 7 · Real estate escrow ----------
    "eth.re.h1": "A real-estate sale on Ethereum — the escrow contract",
    "eth.re.lead":
      "This ties everything you've learned into <b>one real transaction</b>. In traditional real estate, an <b>escrow company, land registry, and agent</b> hold the trust. Here <b>code (a contract)</b> takes that role — it locks the funds and only hands them to the seller once conditions are confirmed. Watch how <b>tx · nonce · gas · storage · blocks · stateRoot</b> move at each step.",
    "eth.re.name": "Property",
    "eth.re.seller": "Seller",
    "eth.re.buyer": "Buyer",
    "eth.re.inspector": "Inspector",
    "eth.re.price": "Price (ETH)",
    "eth.re.fee": "Inspector fee (ETH)",
    "eth.re.reset": "Reset",
    "eth.re.step1": "① List property (deploy)",
    "eth.re.step2": "② Deposit funds (deposit)",
    "eth.re.step3": "③ Confirm title (confirm)",
    "eth.re.step4": "④ Pay seller (release)",
    "eth.re.stepRefund": "Cancel · refund",
    "eth.re.role.buyer": "Buyer",
    "eth.re.role.seller": "Seller",
    "eth.re.role.inspector": "Inspector",
    "eth.re.role.contract": "Escrow contract",
    "eth.re.flow.deposit": "① deposit",
    "eth.re.flow.confirm": "② confirm",
    "eth.re.flow.release": "③ release",
    "eth.re.priceLbl": "Price",
    "eth.re.feeLbl": "Inspector fee",
    "eth.re.state.None": "Not listed",
    "eth.re.state.Listed": "Listed (awaiting funds)",
    "eth.re.state.Funded": "Funds locked (awaiting confirm)",
    "eth.re.state.Confirmed": "Confirmed (awaiting payout)",
    "eth.re.state.Released": "Deal closed ✅",
    "eth.re.state.Refunded": "Cancelled (refunded)",
    "eth.re.hintStart":
      "<b>Start:</b> when the seller (<b>Bob</b>) clicks <b>① List property</b>, the Escrow contract is <b>deployed</b>. That's a dedicated account + rules for this one deal.",
    "eth.re.hintListed":
      "<b>Next:</b> the buyer (<b>Alice</b>) does <b>② Deposit funds</b>. The money is locked in the <b>contract, not the seller</b> — nobody can take it until conditions are met. (msg.value must exactly equal the price.)",
    "eth.re.hintFunded":
      "<b>Next:</b> the neutral <b>inspector (Carol)</b> does <b>③ Confirm title</b>. Only the inspector can call it (enforced by code), and no funds move before confirmation. If Alice tries confirm, it <b>reverts</b>.",
    "eth.re.hintConfirmed":
      "<b>Last:</b> click <b>④ Pay seller</b> and the contract <b>splits the locked funds</b> — a <b>fee to the inspector</b>, the rest to the <b>seller</b>. The inspector who did the work is paid automatically by code.",
    "eth.re.hintReleased":
      "<b>Done ✅</b> both the seller and the <b>inspector (fee)</b> balances went up and the contract's lock is now 0. See the inspector's balance rise in the ledger and the stateRoot change in the block explorer. Start a new deal with <b>Reset</b>.",
    "eth.re.hintRefunded":
      "<b>Cancelled:</b> since it was before confirmation, the funds were <b>atomically refunded to the buyer</b> — all-or-nothing, no half state. Start a new deal with <b>Reset</b>.",
    "eth.re.msgDeployed": "Escrow deployed · {addr} · nonce {nonce}",
    "eth.re.stateH": "Current contract · account state",
    "eth.re.stateLead":
      "Left: live balances, contract storage, and events. Right: the Solidity code that defines the rules — the function you just called lights up.",
    "eth.re.ledgerH": "Account balances (parties)",
    "eth.re.blocksH": "How it stacks into blocks — tx + stateRoot",
    "eth.re.blocksLead":
      "Each step is a <b>transaction</b>; once in a block, the fingerprint of the whole state — the <b>stateRoot</b> — changes. Like git commits, nothing is edited: <b>new blocks stack forward</b>. (The stateRoot here is a keccak-256 of this sim's account+contract snapshot.)",
    "eth.re.blocksNote":
      "<b>How to read:</b> each block shows its tx (who · which function) and the <code>stateRoot</code> right after. A tx that changes state makes the stateRoot <b>completely different</b>; a reverted tx changes nothing, so the stateRoot stays the same.",
    "eth.re.blocksEmpty": "No blocks yet — run a step.",
    "eth.re.genesisTx": "Genesis state (before the deal)",
    "eth.re.srDiff": "stateRoot changed",
    "eth.re.srSame": "stateRoot unchanged (revert)",
    "eth.re.vsH": "Traditional real estate ↔ Ethereum escrow",
    "eth.re.vsCol1": "Role",
    "eth.re.vsCol2": "Traditional sale",
    "eth.re.vsCol3": "Ethereum escrow",
    "eth.re.vsRows":
      "<tr><td class=\"k\">Fund custody</td><td>Escrow company · bank account</td><td><b>Locked in the contract</b> (no one can grab it)</td></tr><tr><td class=\"k\">Condition check</td><td>Registry · lawyer · agent</td><td><b>Inspector tx</b> (confirm)</td></tr><tr><td class=\"k\">Payout</td><td>A human wires it (delays · mistakes)</td><td><b>Code, automatic</b> (only if condition met)</td></tr><tr><td class=\"k\">Cancel · refund</td><td>Disputes · lawsuits possible</td><td><b>Atomic refund via refund()</b></td></tr><tr><td class=\"k\">Who you trust</td><td>Several institutions & people</td><td><b>Deployed code</b> (immutable)</td></tr><tr><td class=\"k\">Record</td><td>Per-institution ledgers (siloed)</td><td><b>Blocks · stateRoot</b> (public · verifiable)</td></tr>",
    "eth.re.vsWhy":
      "<b>The point:</b> what changed is <i>who you trust</i>. Trust that was scattered across institutions and people now concentrates into <b>one piece of code that can't be changed after deploy</b>. The flip side: <b>if the code has a bug, that's the rule too</b> (tab 3), which is why real services get audited.",

    "eth.ov.h1": "Ethereum is \"a ledger that runs code\"",
    "eth.ov.lead":
      "If Bitcoin is a <b>ledger of money</b>, Ethereum is a ledger you can put <b>programs (smart contracts)</b> on. Once deployed, code can't be changed by anyone, and it <b>executes automatically</b> when conditions are met. Since The Merge, consensus is <b>Proof of Stake</b> — validators stake 32 ETH to propose and attest blocks.",
    "eth.ov.btcN": "Bitcoin",
    "eth.ov.btcT": "PoW · UTXO · money ledger",
    "eth.ov.btcD":
      "Records \"who owns how much.\" Minimal scripting. All-in on security and simplicity.",
    "eth.ov.ethN": "Ethereum",
    "eth.ov.ethT": "PoS · accounts · code-running ledger",
    "eth.ov.ethD":
      "Records balances + <b>contract code & storage</b>. Tokens, exchanges, insurance — all \"programs on chain.\"",
    "eth.ov.why":
      "<b>One line:</b> a smart contract is <b>a vault that only moves by pre-written rules</b>. A bank can amend its terms; a deployed contract can't be changed — <b>not even by its creator</b>. Deploy and call one yourself on this site.",
    "eth.ov.cross":
      "← Validation works exactly like the Bitcoin tabs: every node <b>checks the rules alone</b>. What differs is Sybil defense — PoW uses electricity, PoS uses collateral (32 ETH + slashing).",
    "eth.ov.orderH": "Suggested path",
    "eth.ov.o1": "<b>1 · Keccak · Address</b> — how addresses come from hashes (vs SHA-256)",
    "eth.ov.o2": "<b>2 · Accounts · Gas</b> — balance · nonce · EIP-1559 fees (vs UTXO)",
    "eth.ov.o3": "<b>3 · Smart Contracts</b> — deploy → call → storage · events · gas (the core)",
    "eth.ov.o4": "<b>4 · Tokens (ERC-20)</b> — a token is a contract's balance table (SAND example)",
    "eth.ov.o5": "<b>5 · Oracles</b> — chains can't see the world · Chainlink-style price feed · insurance",
    "eth.ov.o6": "<b>6 · PoS Consensus</b> — slots → attest → justified/finalized · slashing",
    "eth.ov.o7": "<b>7 · Real Estate</b> — an escrow that ties everything together (capstone)",
    "eth.ov.o8": "<b>8 · EVM Runner</b> — step through bytecode as it actually executes",

    "eth.acc.h1": "Accounts store balances \"as a number\" (a different choice from UTXO)",
    "eth.acc.lead":
      "Bitcoin <i>computed</i> your balance by summing coin fragments (UTXOs). Ethereum stores a <b>balance number directly, like a bank account</b>. Sending just <b>lowers your number and raises theirs</b> — no change, no UTXO fragments. Try it.",
    "eth.acc.feeBoxH": "Expand fee formulas (EIP-1559)",
    "eth.acc.feeBoxBody":
      "<p><b>Units:</b> <span class=\"mono\">1 ETH = 10⁹ Gwei = 10¹⁸ wei</span>. Tip is <b>Gwei/gas</b>, not ETH.</p><p><b>Why ×21,000?</b> Gwei is a per-gas unit price; plain ETH transfers use a fixed <span class=\"mono\">21,000</span> gas. (Tokens/contracts use more.)</p><ul class=\"tight\"><li><b>gas used</b> = 21,000</li><li><b>base fee</b> = 10 Gwei/gas <span class=\"muted\">(fixed in this sim)</span> → burned</li><li><b>tip</b> = input T Gwei/gas → block proposer</li></ul><pre class=\"mono eth-fee-formula\">burn = 21,000 × 10 × 10⁻⁹ = 0.000210 ETH\ntip  = 21,000 × T × 10⁻⁹ ETH → proposer\npaid = value + burn + tip</pre><p class=\"small muted\">Example: T=5 → tip = 0.000105 ETH. Not \"5 ETH tip.\"</p>",
    "eth.acc.shortWhy":
      "<b>In short:</b> <b>value → recipient</b>, <b>tip → proposer</b>, <b>base fee → burned</b>. Watch the balances move and the <b>n=</b> value (nonce) tick up by one on the right.",
    "eth.acc.vsH": "Bitcoin UTXO ↔ Ethereum account",
    "eth.acc.vsCol1": "Aspect",
    "eth.acc.vsCol2": "Bitcoin (UTXO)",
    "eth.acc.vsCol3": "Ethereum (account)",
    "eth.acc.vsRows":
      "<tr><td class=\"k\">Balance</td><td>Sum of coin (UTXO) fragments — not stored directly</td><td>Stored <b>directly as a number</b></td></tr><tr><td class=\"k\">Sending</td><td>Consume whole UTXOs + mint fresh <b>change</b></td><td>Your balance <b>−</b>, theirs <b>+</b> (no change)</td></tr><tr><td class=\"k\">Reuse guard</td><td>A UTXO is <b>destroyed</b> once spent (automatic)</td><td>Guarded by a <b>nonce</b> number (card below)</td></tr><tr><td class=\"k\">Parallelism</td><td>Different UTXOs are easy to process at once</td><td>One account is <b>serial</b> (nonce order)</td></tr><tr><td class=\"k\">Contract state</td><td>Awkward to express</td><td><b>Natural</b> via balance + storage</td></tr>",
    "eth.acc.vsWhy":
      "<b>Why the split?</b> Bitcoin focused on \"money\" and chose UTXO for <b>simplicity, parallelism, and privacy</b>; Ethereum had to track <b>program (contract) state</b>, so an <b>account model</b> that directly reads \"how much / what value does this address hold now\" was easier. Not better or worse — <b>designs with different goals</b>.",
    "eth.acc.whereH": "But where exactly is this balance stored?",
    "eth.acc.whereBody":
      "<p>\"Stored directly\" doesn't mean the balance sits <b>inside a block</b>. It lives in the <b>world state</b> that each node maintains — a huge <code>address → account object</code> map. One account is just 4 fields.</p><table class=\"cmp-table\" style=\"margin:10px 0\"><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody><tr><td class=\"k\">nonce</td><td>Number of txs this account has sent (the number in the card below)</td></tr><tr><td class=\"k\">balance</td><td><b>Balance (in wei)</b> ← here</td></tr><tr><td class=\"k\">storageRoot</td><td>Digest hash of contract storage (empty for wallet EOAs)</td></tr><tr><td class=\"k\">codeHash</td><td>Hash of contract code (empty for wallet EOAs)</td></tr></tbody></table><p>Wallets (EOA) and contracts share the <b>same structure</b>; a wallet just leaves the last two fields empty.</p><p><b>What goes in a block:</b> only the single top hash of the whole map's hash tree = the <b>state root</b> is written into the <b>block header</b>. The balance numbers themselves are kept by each node, which updates its own DB as it executes transactions. So a block = <b>\"a fingerprint of the state at this point (state root)\" + \"that block's txs\"</b>.</p><p class=\"small muted\"><b>↔ Bitcoin:</b> Bitcoin has no place that stores a balance at all — nodes keep the <b>UTXO set</b> and compute \"sum of UTXOs spendable by my address\" on the fly. Ethereum keeps a <b>per-address balance number</b> directly, so a lookup is one read.</p>",
    "eth.acc.nonceH": "nonce — the account model's \"anti-reuse number\"",
    "eth.acc.nonceLead":
      "A nonce is a <b>per-account transaction counter</b> (0, 1, 2, …). Let's see why it's essential.",
    "eth.acc.nonceProblem":
      "<b>Problem:</b> an ETH balance is just a <b>number</b>. If someone <b>rebroadcasts your signed \"1 ETH to Bob\" tx 10 times</b>? In Bitcoin the spent UTXO is already gone, so it's blocked automatically — but an account only has a balance, so <b>there's nothing to stop it.</b>",
    "eth.acc.nonceBox":
      "<span class=\"who\">{who}</span><span class=\"note\">'s current nonce</span> <span class=\"seq\"><span class=\"cur\">{cur}</span> <span class=\"arrow\">→ next tx is #{cur}, on success</span> <span class=\"nxt\">{next}</span></span>",
    "eth.acc.nonceRoles":
      "<b>Solution — a nonce does two things at once:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>① Replay protection</b> — each number is used exactly once. A tx with an already-used nonce is rejected, so rebroadcasts fail.</li><li><b>② Ordering</b> — must go 0 → 1 → 2. A tx that skips ahead waits (pending) until the earlier ones land.</li></ul>",
    "eth.acc.nonceSig":
      "<b>🔑 Link to tab 1 signing:</b> the nonce is <b>part of what you sign</b> (the sighash). So even an identical transfer produces a <b>completely different signature when the nonce differs</b> → replaying an old signature fails because that nonce is already spent. \"The signature locks the contents\" becomes reuse protection here.",
    "eth.acc.nonceDeeperH": "Deeper: pending / stuck tx · nonce gap · contract addresses",
    "eth.acc.nonceDeeperBody":
      "<p><b>Stuck tx:</b> if nonce 5 is sent with a low fee and stalls, nonce 6·7 <b>must wait</b> (ordering). Fix: resend the same nonce 5 with a higher fee to <b>overwrite</b> it.</p><p><b>Nonce gap:</b> if you accidentally send 7 after 5, then 7 <b>waits forever</b> until 6 arrives — the mempool holds it for 6.</p><p><b>Relation to contract addresses:</b> as in tab 1, a contract address = <code>keccak(deployer addr + nonce)</code>. So <b>even the same deployer gets a new address each time</b> as the nonce grows.</p>",
    "eth.acc.gasH": "Gas · EIP-1559 — how the fee is split",
    "eth.acc.gasLead":
      "Change the tip when sending and the preview above (burn · tip · paid) updates live. Here's where those numbers come from.",
    "eth.acc.gasWhat":
      "<b>What is gas?</b> Every computation and storage write uses node resources. Gas is the <b>unit that measures that work</b>. A plain ETH transfer is fixed at <b>21,000 gas</b> by the protocol (tokens/contracts cost more). <b>Fee = gas × price per gas</b> — it deters spam and rewards validators.",
    "eth.acc.gasEip":
      "<b>EIP-1559 — the price has two parts:</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>base fee</b> — set <b>automatically by congestion</b>. Fixed at <b>10 Gwei/gas</b> here. → goes to no one and is <b>burned</b>.</li><li><b>priority tip</b> — the extra you choose (the input above). → goes to the block <b>proposer (validator)</b>.</li></ul>",
    "eth.acc.burnWhy":
      "<b>🔥 What burning means:</b> ETH paid as base fee is <b>gone forever</b>. The busier the network, the more is burned, creating <b>deflationary pressure that shrinks total ETH</b>. Direction is similar to Bitcoin \"slowing new issuance via halvings,\" but Ethereum <b>burns coins that already exist</b>.",
    "eth.acc.propTag": "proposer",
    "eth.acc.burnLbl": "burn",
    "eth.acc.from": "From",
    "eth.acc.to": "To",
    "eth.acc.amt": "Amount (ETH)",
    "eth.acc.gas": "tip (Gwei/gas)",
    "eth.acc.feePreview": "burn {burn} · tip {tip} → {prop} · {from} pays {paid}",
    "eth.acc.send": "Send",
    "eth.acc.sendFail": "Send failed",

    // ---------- 1 · Keccak · Address ----------
    "eth.kc.h1": "Keccak-256 — the hash that makes Ethereum's \"ids\"",
    "eth.kc.lead":
      "Almost every id you meet in Ethereum — addresses, function selectors, event topics, contract addresses — comes from this one hash. Same purpose as Bitcoin's SHA-256, but Ethereum uses <b>Keccak-256</b>. Try hashing something first.",
    "eth.kc.playIn": "Input (any text)",
    "eth.kc.playOutLbl": "Keccak-256 (any-length input → always 32 bytes = 64 hex)",
    "eth.kc.avalanche":
      "<b>Avalanche effect:</b> change one character and about half the output bits flip. You can't reverse it (hash→input), and the same input always gives the same output — same properties as SHA-256.",
    "eth.kc.sha3H": "Gotcha: Keccak-256 ≠ NIST SHA3-256",
    "eth.kc.sha3Body":
      "<p>Ethereum uses the original Keccak from <b>before</b> the standard was finalized, so it differs from NIST's SHA3-256 by <b>one padding byte</b>. Same input, completely different output.</p><pre class=\"mono\">Keccak-256(\"\")  = c5d2460186f7233c…5d85a470   (pad 0x01)\nSHA3-256(\"\")    = a7ffc6f8bf1ed766…c5f8dd9a   (pad 0x06)</pre><p class=\"small muted\">That's why calling <code>sha3_256</code> in a library won't produce Ethereum addresses. You must use <code>keccak256</code>.</p>",
    "eth.kc.addrH": "Address = the \"last 20 bytes\" of keccak(public key)",
    "eth.kc.addrLead":
      "A wallet address is the public key Keccak-hashed, then truncated to the <b>last 20 bytes</b>. (This demo hashes a name instead of a pubkey — same rule.)",
    "eth.kc.addrIn": "Input (demo: name → hash → address)",
    "eth.kc.hashLbl": "① Full Keccak-256 (32 bytes) — first 12 bytes grayed, only last 20 used",
    "eth.kc.addrLbl": "② Address = last 20 bytes + 0x",
    "eth.kc.addrWhy":
      "<b>Why drop the first 12 bytes?</b> The hash is 32 bytes but an address only needs <b>20 bytes (160 bits)</b> — the shorter form saves space while keeping <b>the odds of two different people landing on the same address effectively zero</b> (that coincidence is called a \"hash collision\" — with 20 bytes there are 2¹⁶⁰ possibilities, so it practically never happens). Real keys hash the secp256k1 X·Y coordinates (<b>64 bytes</b>, minus the 0x04 prefix).",
    "eth.kc.idsH": "Keccak all over Ethereum — a quick preview",
    "eth.kc.idsLead":
      "Ethereum uses Keccak in many places. Each use <b>hashes a different input</b> and then <b>keeps only the part it needs</b>. For now just click around and get the feel that \"Keccak shows up everywhere\" — what selectors, topics, and contract addresses actually are is covered in the next tabs.",
    "eth.kc.selH": "① Function selector — <b>first 4 bytes</b> of the signature hash",
    "eth.kc.selLead":
      "The id that says \"which function?\" on a call. It's the prefix used when you call buy()/transfer() in tab 3.",
    "eth.kc.selIn": "Function signature",
    "eth.kc.selOut":
      "keccak(\"{sig}\") = <span class=\"mono\">{hash}</span><br>→ selector <b class=\"mono\">0x{sel}</b> <span class=\"muted\">(first 8 hex = 4 bytes)</span>",
    "eth.kc.topicH": "② Event topic0 — the <b>full 32 bytes</b> of the signature hash",
    "eth.kc.topicLead":
      "The value that marks a log as \"this is a Transfer event.\" It's the topic0 in the event logs of tabs 3 & 4.",
    "eth.kc.topicIn": "Event signature",
    "eth.kc.topicOut":
      "keccak(\"{sig}\")<br>→ topic0 <b class=\"mono\">0x{hash}</b> <span class=\"muted\">(all 32 bytes kept as-is)</span>",
    "eth.kc.caH": "③ Contract address — last 20 bytes of keccak(<b>deployer addr + nonce</b>)",
    "eth.kc.caLead":
      "Every deploy bumps the nonce, so the address changes each time. Deploying the vending machine in tab 3 uses exactly this rule.",
    "eth.kc.caDeployer": "Deployer (name)",
    "eth.kc.caNonce": "nonce",
    "eth.kc.caOut":
      "keccak(\"{pre}\")<br>→ contract address <b class=\"mono\">{addr}</b> <span class=\"muted\">(last 20 bytes)</span>",
    "eth.kc.when":
      "<b>Summary — the same hash <u>function</u> in many places</b><ul class=\"tight\" style=\"margin:8px 0 0\"><li><b>Address</b> ← hash the <b>public key</b> → last 20 bytes</li><li><b>Contract address</b> ← hash <b>deployer+nonce</b> → last 20 bytes</li><li><b>Function selector</b> ← hash the <b>signature</b> → first 4 bytes</li><li><b>Event topic0</b> ← hash the <b>signature</b> → full 32 bytes</li></ul>",
    "eth.kc.deeperH": "Deeper: mapping storage location · CREATE2 · checksum addresses",
    "eth.kc.deeperBody":
      "<p><b>mapping storage location:</b> where <code>balanceOf[Alice]</code> lives in storage is also decided by <code>keccak(key ‖ slot#)</code> — the real address math behind tab 4's \"token storage table.\"</p><p><b>CREATE2:</b> instead of nonce, the address is <code>keccak(0xff ‖ deployer ‖ salt ‖ keccak(code))</code> — computable before deploy, so L2s and wallets rely on it.</p><p><b>Checksum addresses (EIP-55):</b> an address's letter casing is derived by hashing the address itself. It's an error-catching checksum, so the mixed case in <code>0xAbC…</code> actually carries meaning.</p>",

    // Card 2.5 — wallet creation (BTC↔ETH)
    "eth.kc.genH": "So where does the public key come from — 3 steps to a wallet",
    "eth.kc.genLead":
      "Making a wallet is just <b>random number (private key) → elliptic-curve multiply → public key → hash → address</b>. The first two steps (private→public) are <b>identical to Bitcoin</b> (same secp256k1 curve); <b>only the hash function for the address differs</b>. To see this \"elliptic-curve multiply (jump)\" visualized, check <b>Bitcoin tab 4</b>.",
    "eth.kc.genCol1": "Step",
    "eth.kc.genCol2": "Bitcoin",
    "eth.kc.genCol3": "Ethereum",
    "eth.kc.genRows":
      "<tr><td class=\"k\">① Private key</td><td>256-bit <b>random</b></td><td>256-bit <b>random</b> <span class=\"same\">same</span></td></tr><tr><td class=\"k\">② Public key</td><td class=\"mono\">privkey × G (secp256k1)</td><td class=\"mono\">privkey × G <span class=\"same\">same curve</span></td></tr><tr><td class=\"k\">③ Address</td><td class=\"mono\">RIPEMD160(SHA256(pub)) → Base58</td><td class=\"mono\">Keccak256(pub) last 20B → 0x… <span class=\"diff\">hash differs</span></td></tr><tr><td class=\"k\">Signature</td><td>ECDSA (secp256k1)</td><td>ECDSA <span class=\"same\">same</span></td></tr><tr><td class=\"k\">Seed phrase</td><td>BIP-39 (12/24 words)</td><td>BIP-39 <span class=\"same\">same</span></td></tr><tr><td class=\"k\">Account path</td><td class=\"mono\">m/44'/0'/…</td><td class=\"mono\">m/44'/60'/… <span class=\"diff\">number only</span></td></tr><tr><td class=\"k\">Where stored</td><td>wallet.dat · hardware chip</td><td>browser ext (encrypted) · hardware chip</td></tr>",
    "eth.kc.genKey":
      "<b>🔑 Key point:</b> the <b>fundamentals (keys, signatures, seed) are nearly the same on both chains.</b> That's why <b>one hardware wallet can manage both BTC and ETH</b>. The visible difference is basically just the <b>address encoding (the hash)</b>.",
    "eth.kc.genStoreH": "Where is the private key stored? · seed phrase · where signing happens",
    "eth.kc.genStore":
      "<p><b>The private key is not on the blockchain.</b> The chain only holds addresses, balances, transactions, and signatures. The private key lives <b>only in your wallet</b> — nodes never see it (if they did, anyone could steal your funds).</p><ul class=\"tight\"><li><b>MetaMask</b> — kept in browser extension storage, <b>encrypted with your password</b>, decrypted only when needed.</li><li><b>Hardware wallet (Ledger·Trezor)</b> — locked inside a secure chip, <b>never leaves the device</b>; signing happens on-device.</li><li><b>Seed phrase (12 words)</b> — the <b>seed</b> for all your private keys. It alone can recover every account → leak it and everything is gone.</li></ul><p><b>Signing happens \"inside your device.\"</b> The wallet signs the tx locally with the private key → only the <b>signature + tx</b> go to the chain → nodes <b>only verify with the public key</b>. The \"sign = only me, verify = anyone\" asymmetry.</p>",

    "eth.acc.contrastEth": "Native ETH (protocol-managed)",
    "eth.acc.contrastEthHint": "Account object's balance field · not UTXO · same as tab 1",
    "eth.acc.contrastTok": "App ledger · {token} (storage)",
    "eth.acc.contrastTokHint": "Token amount (value) is not ETH · but execution gas is paid in ETH",
    "eth.acc.tokAmt": "Amount",
    "eth.acc.tokOk":
      "Storage updated: {from} → {to} · {amt} {token}. What moved is {token}, not ETH — but <b>gas is still paid in ETH</b>.",
    "eth.logH": "Engine log",

    // ---------- 8 · EVM Runner ----------
    "eth.evm.h1": "EVM — the CPU that runs Ethereum",
    "eth.evm.lead":
      "A smart contract is ultimately <b>bytecode</b>, and the virtual CPU that executes it one instruction (opcode) at a time is the <b>EVM</b>. Feed a tx (instruction) into the world state (data), and the EVM burns gas to execute it and produce a <b>new state</b>. Like the JVM it's a <b>stack-based virtual machine</b>, and like the JS event loop it <b>runs single-threaded to completion</b>.",
    "eth.evm.mapCol1": "Computer",
    "eth.evm.mapCol2": "Ethereum",
    "eth.evm.mapCol3": "What it is",
    "eth.evm.mapRows":
      "<tr><td class=\"k\">Disk / DB (whole)</td><td>world state</td><td>All account balances + all contract storage</td></tr><tr><td class=\"k\">One file / table inside it</td><td>storage</td><td>One contract's persistent slots (part of world state)</td></tr><tr><td class=\"k\">RAM (volatile)</td><td>stack · memory</td><td>Gone when the tx ends</td></tr><tr><td class=\"k\">Program to run</td><td>tx</td><td>Who · which function · args</td></tr><tr><td class=\"k\">CPU</td><td><b>EVM</b></td><td>Runs bytecode opcode by opcode</td></tr><tr><td class=\"k\">Electricity / clock</td><td>gas</td><td>Cost and ceiling of execution</td></tr><tr><td class=\"k\">Checksum of the whole DB</td><td>stateRoot</td><td>Fingerprint of the entire world state</td></tr>",
    "eth.evm.analogy":
      "<b>Like the JVM:</b> both are <b>stack machines</b> — you compute by pushing onto a stack, not registers. <code>PUSH 3, PUSH 4, ADD</code> → 7 on the stack. <b>Like the JS event loop:</b> single-threaded, <b>runs to completion</b> (never preempted), then finishes or reverts wholesale.",
    "eth.evm.determinism":
      "<b>The key difference:</b> the EVM must be <b>fully deterministic</b> — no <code>random</code>, no wall clock, no network I/O. Every node in the world runs the same tx and must get the <b>exact same stack, storage and gas</b>, or consensus breaks. That's also why gas exists (to stop infinite loops / DoS).",
    "eth.evm.runH": "Step through it, one opcode at a time",
    "eth.evm.runLead":
      "Pick a program and press <b>Next step</b>: each time one opcode runs, watch how the <b>stack, storage and gas</b> change — just like an event-loop visualizer.",
    "eth.evm.program": "Program",
    "eth.evm.calldata": "Input v (calldata)",
    "eth.evm.calldataPrice": "Price (calldata)",
    "eth.evm.exSstoreEscrow":
      "<b>SSTORE</b> — escrow storage update: <b>{slot} ← {val}</b>. Tab 7's state/price/locked are exactly these slot writes.",
    "eth.evm.stepBack": "◀ Back",
    "eth.evm.step": "▶ Next step",
    "eth.evm.runAll": "⏩ Run all",
    "eth.evm.reset": "↺ Reset",
    "eth.evm.bytecodeH": "Bytecode · PC",
    "eth.evm.stackH": "Stack (top ↑ · volatile)",
    "eth.evm.memoryH": "Memory (volatile)",
    "eth.evm.storageH": "Storage (this contract's slots · part of world state)",
    "eth.evm.gasH": "Gas",
    "eth.evm.gasUsed": "used",
    "eth.evm.gasLeft": "left",
    "eth.evm.emptyStack": "Stack is empty",
    "eth.evm.emptyMem": "No memory used",
    "eth.evm.emptyStorage": "Nothing written to storage yet",
    "eth.evm.exInit": "Initial state before execution — stack, memory and storage all empty, gas full. Press <b>Next step</b> to run opcodes one by one.",
    "eth.evm.exPush": "<b>PUSH1 {v}</b> — push the immediate value {v} onto the top of the stack.",
    "eth.evm.exCalldata": "<b>CALLDATALOAD</b> — read the tx's input (v) and push it on the stack. (the offset on the stack is consumed)",
    "eth.evm.exAdd": "<b>ADD</b> — pop the top two values, add them, push the result back.",
    "eth.evm.exMul": "<b>MUL</b> — pop the top two values, multiply, push the result.",
    "eth.evm.exSub": "<b>SUB</b> — pop the top two values, subtract, push the result.",
    "eth.evm.exSstore":
      "<b>SSTORE</b> — pop (slot, value) and <b>write it permanently to storage</b>. This is the moment world state changes! That's why it's so expensive in gas (20000 for 0→value).",
    "eth.evm.exSload": "<b>SLOAD</b> — read a value from a storage slot and push it on the stack.",
    "eth.evm.exMstore": "<b>MSTORE</b> — write a value to volatile memory. (gone when the tx ends)",
    "eth.evm.exStop": "<b>STOP</b> — execution ends ✅. This tx's final storage is committed and a new stateRoot reflecting it is produced.",
    "eth.evm.exRevert": "⛔ <b>revert: {reason}</b> — execution halts and <b>all state changes roll back</b>. But the gas spent up to here is not refunded.",
    "eth.evm.gitH": "World state ↔ stateRoot — like git",
    "eth.evm.gitLead":
      "Left is this contract's <b>storage</b> (one piece of world state); right is an <b>educational stateRoot</b> hashed from it. On a real chain the stateRoot hashes <b>all account balances + all contract storage</b>. When SSTORE changes a value, a commit is appended — and <b>history stays</b> even if you switch programs.",
    "eth.evm.gitTree": "storage (part of world state)",
    "eth.evm.gitRoot": "stateRoot · commit hash",
    "eth.evm.gitHistH": "Commit history",
    "eth.evm.clearHist": "Clear history",
    "eth.evm.gitEmpty": "No commits yet — step forward until you hit SSTORE.",
    "eth.evm.gitRootFirst": "First snapshot (hash of empty state)",
    "eth.evm.gitRootChanged": "Changed ↑ different from previous commit {prev} — proof storage moved",
    "eth.evm.gitRootSame": "Same as previous commit — no storage change",
    "eth.evm.commitGenesis": "genesis · empty storage",
    "eth.evm.commitSstore": "SSTORE · slot {slot} ← {val}",
    "eth.evm.commitStop": "STOP · finished {prog}",
    "eth.evm.commitSnap": "Snapshot",
    "eth.evm.whyH": "Why this is the real core of Ethereum",
    "eth.evm.why1":
      "<b>ERC-20, oracles, DeFi are all apps running on top of this.</b> Contract code = class, deployed address = one instance, storage = that instance's fields, function call = method call. The EVM is the engine that actually runs those methods.",
    "eth.evm.why2":
      "<b>Why SSTORE is expensive:</b> stack and memory are like RAM and vanish when the tx ends, but <b>storage is like disk — permanent</b> and part of world state, so every node must keep it forever. That's why a storage write (20000 gas) dwarfs arithmetic (3 gas).",
    "eth.evm.why3":
      "<b>The essence:</b> <code>new_state = EVM.execute(state, tx)</code> then <code>stateRoot = hash(new_state)</code>. Once you get this state-transition machine, everything else looks like 'instances running on top of it'.",

    "eth.sc.h1": "Smart contracts — deploy a vending machine",
    "eth.sc.lead":
      "Below is a real Solidity <b>SnackMachine</b>. Deploy it and its code is frozen on chain; anyone can call <code>buy()</code>. <b>Not even the owner can change the rules.</b>",
    "eth.sc.acctTypesH": "First — Ethereum has two kinds of accounts",
    "eth.sc.eoaN": "Wallet account (EOA)",
    "eth.sc.eoaT": "Alice · Bob · your MetaMask",
    "eth.sc.eoaD":
      "Address = last 20 bytes of keccak(<b>public key</b>). <b>Has a private key</b>, so it can start transactions by signing.",
    "eth.sc.caN": "Contract account",
    "eth.sc.caT": "SnackMachine · SAND · Uniswap",
    "eth.sc.caD":
      "Address = last 20 bytes of keccak(<b>deployer address + nonce</b>). <b>No private key</b> — has code & storage instead, and only acts when called.",
    "eth.sc.txKinds":
      "<b>Transfer, deploy, and call are all \"the same tx\" — each one bumps the nonce by +1.</b> Everything an EOA sends out is a transaction; only <code>to</code>/<code>data</code> differ. So a deploy consumes a nonce just like a transfer, and that nonce becomes the ingredient for the contract address above.<table class=\"cmp-table\" style=\"margin:10px 0 0\"><thead><tr><th>Action</th><th>What the tx looks like</th><th>nonce</th></tr></thead><tbody><tr><td class=\"k\">Plain transfer</td><td><code>to</code>=recipient · value · no <code>data</code></td><td>+1</td></tr><tr><td class=\"k\">Contract deploy</td><td><code>to</code>=<b>empty (null)</b> · <code>data</code>=<b>bytecode</b></td><td>+1</td></tr><tr><td class=\"k\">Contract call</td><td><code>to</code>=contract address · <code>data</code>=<b>function+args</b></td><td>+1</td></tr></tbody></table>",
    "eth.sc.deriveH": "How this address was made (computed live just now)",
    "eth.sc.derive1": "{who}'s wallet address — last 20 bytes of keccak({who}'s public key*)",
    "eth.sc.derive2": "Preimage = wallet address + the nonce at that moment ({nonce}) — this nonce is <b>the very counter you saw in tab 2</b>",
    "eth.sc.derive3": "keccak-256(preimage) — keep only the last 40 of 64 hex",
    "eth.sc.derive4": "→ contract address",
    "eth.sc.deriveMatch": "✓ matches the header above",
    "eth.sc.deriveNote":
      "* This sim hashes a name instead of a public key (tab 1 rule). Real Ethereum hashes RLP([address, nonce]) — same ingredients. Wallet and contract addresses look alike, but they're built from different ingredients.",
    "eth.sc.historyH": "State history — nothing is edited, new lines stack up",
    "eth.sc.historyLead":
      "Think of a ledger written in pen. Past entries can't be erased or overwritten — <b>only a successful transaction adds the next line (a new version vN)</b>. If it reverts, <b>no new version is created</b> — below you'll just see a ⛔ 'attempted but rejected' marker, and the state never changes halfway (atomicity). Gas is still spent, though.",
    "eth.sc.histRevert": "No new version (atomic) · gas still spent — {reason}",
    "eth.sc.histNoChange": "No storage change (only balance moved)",
    "eth.sc.storageLead":
      "storage = this contract's <b>private drawer</b>. It holds the <b>current values</b> of the variables declared at the top of the Solidity code (<code>price</code>, <code>stock</code>…). Only function calls can change it.",
    "eth.tok.storageLead":
      "Think of this as The Sandbox's <b>SAND ledger</b>. The values in <code>mapping(address → uint256) balanceOf</code> are what a wallet shows as a \"token balance\" — a <b>different slot</b> from ETH. (Educational mini version — not the mainnet SAND contract.)",

    "eth.ws.h1": "So where is all of this stored? — blocks vs node DB",
    "eth.ws.lead":
      "You'd expect the code, storage and balances to live inside blocks — but <b>blocks only record \"order slips\"</b>. The results are computed by every node and kept in its own DB.",
    "eth.ws.blockN": "Block (on chain, forever)",
    "eth.ws.blockT": "The shared record",
    "eth.ws.blockD":
      "<b>Transaction list</b> — order slips like \"Bob called buy() with 0.5 ETH\" + <b>stateRoot</b> — a 32-byte hash summarizing the entire state after execution. <b>No state itself.</b>",
    "eth.ws.dbN": "State DB (each node, local)",
    "eth.ws.dbT": "The result of replaying the slips",
    "eth.ws.dbD":
      "Each account is <span class=\"mono\">{ nonce, balance, storageRoot, codeHash }</span>. Wallet accounts have empty code; contract accounts carry <b>bytecode + storage</b>.",
    "eth.ws.why":
      "<b>Why is this OK?</b> The state transition is a pure function (<span class=\"mono\">newState = f(oldState, tx)</span>), so recording <b>only the inputs (txs)</b> lets anyone replay from genesis to the same state. Nodes verify each other by <b>comparing 32-byte stateRoots</b> — the same trick as the Merkle root in Bitcoin tab 5.",
    "eth.ws.tableH": "This sim's state DB, live",
    "eth.ws.tableLead":
      "<b>Every account</b> in this sim world shows up — contracts used by other tabs (SAND → tab 4 Tokens, ETH/USD Feed → tab 5 Oracles) are pre-deployed at genesis. Just like the real Ethereum state DB already containing USDT and Uniswap.",
    "eth.ws.originTok": "genesis deploy · used in tab 3",
    "eth.ws.originFeed": "genesis deploy · used in tab 4",
    "eth.ws.originGenesis": "genesis deploy",
    "eth.ws.originYou": "just deployed by {who}",
    "eth.ws.colAcct": "Account",
    "eth.ws.codeNone": "none (wallet)",
    "eth.ws.codeYes": "yes · {kind} bytecode",
    "eth.ws.srcNote":
      "<b>Solidity source is NOT on chain.</b> Only compiled <b>bytecode</b> goes on chain. Sources on Etherscan appear because developers submit them and Etherscan recompiles and matches them against the on-chain bytecode — an <b>off-chain service</b>. This page showing Solidity is the same idea.",
    "eth.sc.deployer": "Deployer",
    "eth.sc.price": "Price (ETH)",
    "eth.sc.stock": "Stock",
    "eth.sc.deploy": "🚀 Deploy",
    "eth.sc.deployOk":
      "Deployed → address <b class=\"mono\">{addr}</b> (keccak(deployer, nonce {nonce})) · gas {gas}",
    "eth.sc.deployedBy": "deployed by {by} · nonce {nonce}",
    "eth.sc.callH": "Call it",
    "eth.sc.caller": "Caller",
    "eth.sc.value": "ETH to send (msg.value)",
    "eth.sc.storageH": "storage (contract state)",
    "eth.sc.storageEmpty": "No storage",
    "eth.sc.eventsH": "Event log",
    "eth.sc.eventsEmpty": "No events yet — call a function",
    "eth.sc.codeH": "Solidity code (called function lights up)",
    "eth.sc.revertNote":
      "revert: state rolled back and no value moved, but gas fees were spent and the nonce advanced — exactly like real Ethereum.",
    "eth.sc.why":
      "<b>In short:</b> a contract is an account with an <b>address, balance and nonce</b> — plus <b>code and storage</b>. Money moves only as the code says. Try <code>withdraw()</code> as Bob — it <b>reverts</b>, yet gas is still paid.",
    "eth.sc.asideH": "Why \"code is law\" is a big deal",
    "eth.sc.asideBody":
      "<p><b>Bank deposit:</b> terms, staff, and courts can intervene. <b>Contract deposit:</b> nothing can move the money except the deployed code's conditions.</p><p>The address being <b>keccak(deployer, nonce)</b> and event <b>topic0 = keccak(signature)</b> are the same hash rules from tab 1.</p><p>The downside comes from the same principle — a buggy contract <b>can't be patched</b> (see The DAO hack).</p>",

    "eth.tok.h1": "ERC-20 — ETH balance and token balance live in different places",
    "eth.tok.lead":
      "<b>ETH</b> is managed by the protocol as the account object's <b>balance</b> (tab 1 — an account number, not Bitcoin UTXOs). The Sandbox's <b>SAND</b> or USDT are not that field — they're a <b>table in that token contract's storage</b> on Ethereum (addr → amount). ERC-20 is the <b>standard</b> for that table; <b>SAND</b> below is an educational mini token with that structure.",
    "eth.tok.std":
      "<b>Same world state, different slots.</b> Ethereum manages account <code>balance</code> (ETH). App tokens like SAND and USDT manage their own storage tables. (Real SAND often trades on Polygon for cheaper gas, but the token itself is an Ethereum ERC-20-family asset.)",
    "eth.tok.why":
      "<b>Check:</b> ① Transfer <b>value=50 SAND</b> does not send ETH to Bob — only the storage table changes ② running the tx still costs <b>gas in ETH</b> (Alice's ETH may drop a little) ③ the event's <b>topic0</b> equals the real mainnet ERC-20 Transfer hash.",

    "eth.or.h1": "Oracles — the chain can't see the world",
    "eth.or.lead":
      "Contracts can't use the internet or APIs, because every node must <b>replay the same computation</b> — e.g. if they each hit a weather API, some succeed and some fail, or some get data A and others B, so the <b>result would fork</b>. External data (prices, weather, scores) must be <b>pushed in by oracle nodes as transactions</b>. That's how Chainlink works.",
    "eth.or.reportH": "① Oracle nodes report a price",
    "eth.or.nodesLead":
      "Think of each node as posting <b>the price it saw on an exchange API</b> as a tx. (Real Chainlink nodes aren't the exchanges themselves — they're <b>independent operators</b> querying several exchange/aggregator APIs; we label them by source here.)",
    "eth.or.reported": "reported",
    "eth.or.why":
      "<b>Why median?</b> One manipulated node <b>can't move the median</b>. Feed Coinbase an absurd number — latestAnswer holds. A single-oracle design gets owned instantly (a classic DeFi hack).",
    "eth.ins.h1": "② A contract that consumes the oracle — price insurance",
    "eth.ins.lead":
      "Deploy insurance that pays 1 ETH if ETH drops <b>below $3,000</b>. The payout is decided by the <b>feed's median</b>, not a person. Watch <b>Bob's balance</b> below rise after a successful settle.",
    "eth.ins.ledgerH": "Account balances (track the payout)",
    "eth.ins.ledgerLead": "See how Bob's ETH changes from the start — on join and on settle.",
    "eth.ins.role.underwriter": "Underwriter (funds pool)",
    "eth.ins.role.insured": "Insured",
    "eth.ins.role.pool": "Payout pool",
    "eth.ins.threshold": "Threshold (USD)",
    "eth.ins.deploy": "Alice deploys insurance (funds 1 ETH pool)",
    "eth.ins.buy": "Bob joins buyPolicy() — 0.1 ETH",
    "eth.ins.condRule": "Payout rule: median < {threshold} (equal = expired)",
    "eth.ins.condNoFeed": "Feed has no answer yet — oracle report() first",
    "eth.ins.condMet": "Current median {median} < {threshold} → settle() will pay ✅",
    "eth.ins.condUnmet": "Current median {median} ≥ {threshold} → settle() will NOT pay (expired)",
    "eth.ins.warn":
      "<b>The oracle problem:</b> perfect contract code still fails if <b>the data feeding it is poisoned</b>. Decentralizing the data itself — many nodes, medians, stake-based penalties — is what oracle networks like Chainlink do.",
    "eth.or.deeperH": "Deeper: the oracle problem · third-party vs first-party · rewards and slashing",
    "eth.or.deeperBody":
      "<p><b>The oracle problem, restated:</b> on-chain data stays trustworthy because members verify each other, but <b>off-chain data can't be verified true/false by on-chain rules</b>. Like travelers passing <b>immigration control</b>, outside data needs an examiner — yet handing that job to one company re-centralizes everything. That dilemma is the oracle problem.</p><p><b>Third-party oracles</b> (Chainlink, Band): many verifier nodes fetch data independently and reach agreement (the median above is a mini version). Accurate nodes earn <b>rewards (LINK)</b>; wrong ones <b>lose staked coins and reputation</b>, getting fewer future jobs. Decentralized, but slower and rewards are split.</p><p><b>First-party oracles</b> (PYTH etc.): exchanges/data providers <b>sign and publish directly</b>, with staking to deter lies. Fast and efficient, but you must trust the provider — it leans centralized.</p><p><b>Why it matters:</b> once oracles secure trust, smart contracts can handle <b>real-world assets (RWA)</b> like real estate and stocks. Note that the LINK coin isn't the tech itself — it's the <b>reward paid to verifier nodes</b>.</p>",

    "eth.pos.h1": "Proof of Stake — who makes blocks, and when are they final",
    "eth.pos.lead":
      "Since The Merge (2022) there is no Bitcoin-style mining. Time is cut into <b>slots</b> (12-second cells in reality); each slot one validator is picked by a <b>stake-weighted random draw</b> (RANDAO in reality) to <b>propose</b> a block. The other validators check it and cast an <b>attestation (yes vote)</b>. A bundle of slots (8 here, 32 in reality) is an <b>epoch</b> — votes are tallied per epoch to advance finality.",
    "eth.pos.statsLead":
      "How to read: <b>Slot</b> = which time cell we're on · <b>Epoch</b> = slot-bundle number · <b>Justified/Finalized</b> = how far the two-phase finality below has progressed (<b>—</b> = no epoch finalized yet).",
    "eth.pos.chainLead":
      "Each block carries a <b>stateRoot</b> — the fingerprint of world state at that moment. Make a transfer or contract call in another tab, then advance a slot: the fingerprint changes. This is exactly what validators re-execute and compare before attesting. The <b>attest line</b> on each block lists the validators who voted for it (✓ voted · ✗ offline).",
    "eth.pos.liveHead": "slot {slot} — <b>{p}</b> proposes a block → the rest attest",
    "eth.pos.liveOk": "reached 2/3 ✓ (counts toward finality)",
    "eth.pos.liveFail": "below 2/3 ✗ (finality delayed)",
    "eth.pos.advance": "⏭ Next slot",
    "eth.pos.advance5": "×5 slots",
    "eth.pos.epoch": "To epoch end",
    "eth.pos.offline": "Offline validator fraction",
    "eth.pos.reset": "Reset",
    "eth.pos.chainH": "Chain (justified → finalized)",
    "eth.pos.twoPhase":
      "<b>Why two-phase finality?</b> Think of a contract signing — when an epoch's votes gather <b>2/3 of stake</b>, that epoch is <b>justified (initialed)</b>. When the next epoch also gathers 2/3, the previous justified one is promoted to <b>finalized (notarized)</b> — that's Casper FFG. Reverting a finalized checkpoint requires validators to sign contradictory votes, which instantly <b>burns 1/3+ of all stake via slashing</b>. That's why it's \"economically\" final.",
    "eth.pos.convey":
      "<b>Finality's unit and rhythm:</b> finality advances per <b>epoch</b>, not per block. Normally it's a conveyor belt — when epoch 5 gathers 2/3, epoch 5 becomes justified and <b>the previous epoch 4 becomes finalized</b> — justified always marching one step ahead (in reality a block finalizes ~2 epochs ≈ 13 minutes after it's made). But finality is <b>retroactive to all ancestors</b>: if a stall (offline validators) freezes finality for a few epochs and participation then recovers, the frozen stretch <b>catches up all at once</b> — try lowering the slider in the experiment below and watch Finalized jump.",
    "eth.pos.tryOffline":
      "<b>Experiment:</b> push the offline slider to <b>34%+</b> and advance an epoch — votes fall short of 2/3 and <b>justified/finalized stall</b>. Blocks keep stacking, but nothing finalizes. Real Ethereum handles a prolonged stall by slowly bleeding offline validators' stake (<b>inactivity leak</b>) until 2/3 is restored.",
    "eth.pos.vsBtc":
      "<b>vs Bitcoin:</b> PoW finality is probabilistic (\"more confirmations = safer\"). PoS Gasper is economic finality — reverting a 2/3-signed checkpoint burns <b>1/3+ of all stake via slashing</b>.",
    "eth.pos.proposeCheck":
      "<b>Can a proposer tamper with txs?</b> They can choose <b>which txs to include and in what order</b> from the mempool, but changing someone else's amount/recipient <b>breaks the signature → rejected</b> (tabs 1–2). They can include their own freshly signed txs, but only within <b>their own funds</b>. Other validators re-execute the block's txs and check that the <b>stateRoot matches</b> (tab 8) — attest if yes, reject if not.",
    "eth.st.h1": "Validator lifecycle — staking · slashing",
    "eth.st.lead":
      "To propose and vote you stake <b>32 ETH</b> and activate. Violations like double-signing get <b>slashed</b> — Sybil defense via collateral instead of PoW's electricity.",
    "eth.st.label": "Validator name",
    "eth.st.amt": "Stake (ETH)",
    "eth.st.deposit": "Deposit",
    "eth.st.activate": "Activate last deposit",
    "eth.st.slashId": "Target ID",
    "eth.st.slash": "Double-sign → slashing",
    "eth.st.offline": "Offline penalty",
    "eth.st.listH": "Validators",
    "eth.st.slashScale":
      "<b>Why only a partial cut instead of full confiscation?</b> Real Ethereum's immediate penalty is surprisingly small (about <b>1 ETH</b> out of 32). Instead, the validator is <b>permanently ejected</b> (here too, Slashed can't be reactivated), and crucially there's a <b>correlation penalty</b> — the more stake slashed in the same window, the bigger the fine. The moment <b>1/3+ of stake colludes</b> to revert a finalized checkpoint, they lose <b>everything</b>. A lone mistake (key-management accident) is punished lightly; a coordinated attack, catastrophically.",
    "eth.st.depOk": "Deposited · validator #{id} (Pending)",
    "eth.st.actOk": "Activated — joins proposals/attestations next slot",
    "eth.st.slashOk": "Slashed — part of stake burned · status Slashed",
    "eth.st.offOk": "Inactivity penalty applied",
    "eth.at.h1": "Try an attack — fork · double proposal",
    "eth.at.lead":
      "A validator whose turn it is to propose <b>signs two different blocks for the same slot</b>, showing each half of the network a different version (a double-spend attempt — the PoS version of BTC tab 7's \"secret chain\"). Result: ① the chain forks, but ② honest majority vote weight keeps the original chain as head, and ③ <b>two signatures for the same slot are mathematical proof</b> of cheating — no excuses, automatic <b>slashing</b>. Unlike BTC, a failed attack burns collateral, so it can't be retried.",
    "eth.at.sigLayers":
      "<b>The \"signature\" here is not a tx signature — there are three layers.</b> ① <b>tx signature</b> = \"I'm the one sending this money\" (sender's wallet key, tabs 1·2) ② <b>block signature</b> = \"I'm the one who built this block\" (proposer signs the finished block header with their validator key) ③ <b>attestation signature</b> = \"I'm the one voting for this block\". The equivocation evidence is two of ② existing for the same slot. Note: validator keys use <b>BLS signatures</b> (unlike wallet ECDSA) — thousands of them can be merged into one (aggregation), which is how a million validators can all vote every epoch and still fit in a block.",
    "eth.at.attacker": "Attacker validator ID",
    "eth.at.fork": "Fork attack (double proposal)",
    "eth.at.warn":
      "<b>vs 51%:</b> Bitcoin double-spends are a \"longer secret chain\" race — retry as long as you have electricity. Attacking a finalized PoS checkpoint <b>burns the collateral</b>, so the same attack can't be repeated.",
  },

  ja: ETH_I18N_JA,
  es: ETH_I18N_ES,
  fr: ETH_I18N_FR,
  de: ETH_I18N_DE,
};
