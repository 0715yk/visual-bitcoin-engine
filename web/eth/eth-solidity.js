// ============================================================
// eth-solidity.js — canned 컨트랙트의 실제 Solidity 소스 (표시용)
// ============================================================
// 엔진(Rust)은 이 코드와 같은 규칙으로 동작한다.
// 함수 호출 시 해당 함수 라인을 하이라이트해서 "버튼 = 이 함수"를 잇는다.

export const SOLIDITY_SOURCES = {
  vending: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SnackMachine {
    address public owner;
    uint256 public price;
    uint256 public stock;
    uint256 public totalSold;

    event Purchased(address buyer, uint256 paid);
    event Withdrawn(address owner, uint256 amount);

    constructor(uint256 _price, uint256 _stock) {
        owner = msg.sender;   // 배포자가 주인
        price = _price;
        stock = _stock;
    }

    function buy() external payable {
        require(stock > 0, "sold out");
        require(msg.value >= price, "pay more");
        stock -= 1;
        totalSold += 1;
        emit Purchased(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        uint256 amount = address(this).balance;
        emit Withdrawn(owner, amount);
        payable(owner).transfer(amount);
    }
}`,

  erc20: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MiniERC20 {
    string  public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(string memory _symbol, uint256 _supply) {
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;  // 전량을 배포자에게
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "insufficient");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
}`,

  pricefeed: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PriceFeed {
    mapping(address => bool)   public isOracle;
    mapping(address => int256) public reports;
    address[] public oracles;
    int256 public latestAnswer;  // median

    event AnswerUpdated(int256 report, int256 median, address reporter);

    constructor(address[] memory _oracles) {
        oracles = _oracles;
        for (uint i = 0; i < _oracles.length; i++)
            isOracle[_oracles[i]] = true;
    }

    function report(int256 price) external {
        require(isOracle[msg.sender], "not oracle");
        reports[msg.sender] = price;
        latestAnswer = _median();   // 한 노드가 아니라 중앙값
        emit AnswerUpdated(price, latestAnswer, msg.sender);
    }

    function _median() internal view returns (int256) {
        // 보고값 정렬 후 가운데 값 (구현 생략)
    }
}`,

  insurance: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceFeed { function latestAnswer() external view returns (int256); }

contract PriceProtection {
    IPriceFeed public feed;
    int256  public threshold;   // 이 가격 밑이면 지급
    uint256 public payout;
    uint256 public premium;
    address public insured;
    enum Status { Open, Active, Paid, Expired }
    Status public status;

    event PolicyBought(address insured, uint256 premium);
    event PayoutSent(address insured, uint256 payout, int256 median);

    constructor(IPriceFeed _feed, int256 _threshold,
                uint256 _payout, uint256 _premium) payable {
        require(msg.value >= _payout, "fund the pool");  // 지급 풀 예치
        feed = _feed; threshold = _threshold;
        payout = _payout; premium = _premium;
    }

    function buyPolicy() external payable {
        require(status == Status.Open, "closed");
        require(msg.value >= premium, "premium");
        insured = msg.sender;
        status = Status.Active;
        emit PolicyBought(insured, msg.value);
    }

    function settle() external {
        require(status == Status.Active, "no policy");
        int256 median = feed.latestAnswer();  // oracle 값을 읽는 순간
        if (median < threshold) {
            status = Status.Paid;
            emit PayoutSent(insured, payout, median);
            payable(insured).transfer(payout);
        } else {
            status = Status.Expired;  // 조건 미충족 - 아무도 못 바꿈
        }
    }
}`,

  escrow: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    address public seller;      // 매도자 (배포자)
    address public buyer;       // 매수자
    address public inspector;   // 등기·하자 확인자 (중립 제3자)
    uint256 public price;
    uint256 public inspectorFee; // 확인자 보상 (성공 시 잔금에서 차감)
    enum State { Listed, Funded, Confirmed, Released, Refunded }
    State public state;

    event Deposited(address buyer, uint256 amount);
    event Confirmed(address inspector);
    event Released(address seller, uint256 amount, address inspector, uint256 fee);
    event Refunded(address buyer, uint256 amount);

    constructor(uint256 _price, address _buyer, address _inspector, uint256 _fee) {
        require(_fee < _price, "fee too high");
        seller = msg.sender;   // 매물 등록 = 배포
        price = _price;
        buyer = _buyer;
        inspector = _inspector;
        inspectorFee = _fee;
        state = State.Listed;
    }

    // 매수자가 대금을 컨트랙트에 잠금 (은행 계좌 대신 코드가 보관)
    function deposit() external payable {
        require(state == State.Listed, "already started");
        require(msg.sender == buyer, "not buyer");
        require(msg.value == price, "exact price");
        state = State.Funded;
        emit Deposited(msg.sender, msg.value);
    }

    // 중립 확인자만 등기·하자 확인 (등기소/검수 역할)
    function confirm() external {
        require(state == State.Funded, "not funded");
        require(msg.sender == inspector, "not inspector");
        state = State.Confirmed;
        emit Confirmed(msg.sender);
    }

    // 확인 완료 후에만 지급 — 확인자 수수료를 떼고 나머지를 매도자에게
    function release() external {
        require(state == State.Confirmed, "not confirmed");
        state = State.Released;
        uint256 payToSeller = price - inspectorFee;
        emit Released(seller, payToSeller, inspector, inspectorFee);
        if (inspectorFee > 0) payable(inspector).transfer(inspectorFee);
        payable(seller).transfer(payToSeller);
    }

    // 확인 전이라면 매수자에게 환불 (원자적 파기)
    function refund() external {
        require(msg.sender == seller || msg.sender == buyer, "no right");
        require(state == State.Listed || state == State.Funded, "too late");
        uint256 amount = address(this).balance;
        state = State.Refunded;
        emit Refunded(buyer, amount);
        if (amount > 0) payable(buyer).transfer(amount);
    }
}`,
};

/** 엔진 func 이름 → Solidity 함수 검색 패턴 */
const FUNC_PATTERNS = {
  constructor: /^\s*constructor\(/,
  buy: /^\s*function buy\(/,
  withdraw: /^\s*function withdraw\(/,
  transfer: /^\s*function transfer\(/,
  report: /^\s*function report\(/,
  buy_policy: /^\s*function buyPolicy\(/,
  settle: /^\s*function settle\(/,
  deposit: /^\s*function deposit\(/,
  confirm: /^\s*function confirm\(/,
  release: /^\s*function release\(/,
  refund: /^\s*function refund\(/,
};

const escHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * Solidity 소스를 라인 span 으로 렌더. highlightFunc 가 있으면
 * 해당 함수 블록(함수 시작 ~ 같은 들여쓰기의 `}`)을 하이라이트.
 */
export function renderSolidity(kind, highlightFunc) {
  const src = SOLIDITY_SOURCES[kind];
  if (!src) return "";
  const lines = src.split("\n");
  let hlStart = -1;
  let hlEnd = -1;
  const pat = highlightFunc && FUNC_PATTERNS[highlightFunc];
  if (pat) {
    for (let i = 0; i < lines.length; i++) {
      if (pat.test(lines[i])) {
        hlStart = i;
        const indent = lines[i].match(/^\s*/)[0];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] === indent + "}") {
            hlEnd = j;
            break;
          }
        }
        if (hlEnd === -1) hlEnd = lines.length - 1;
        break;
      }
    }
  }
  return lines
    .map((line, i) => {
      const hl = i >= hlStart && i <= hlEnd && hlStart !== -1 ? " hl" : "";
      return `<span class="sol-line${hl}">${escHtml(line) || " "}</span>`;
    })
    .join("\n");
}
