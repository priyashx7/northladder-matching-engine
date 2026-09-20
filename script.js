let buyerCount = 0;
const buyerDefaults = [
  {name:"Buyer A", bid:5000, cats:["Phone"], mode:"delivery", rto:8, delCost:300, avgCol:0, avgPay:2, retRate:4, dispRate:2, orders:70, active:18, isNew:false},
  {name:"Buyer B", bid:10500, cats:["Phone"], mode:"delivery", rto:25, delCost:400, avgCol:0, avgPay:6, retRate:12, dispRate:2, orders:60, active:12, isNew:false},
  {name:"Buyer C", bid:4800, cats:["Phone","Tablet"], mode:"self", rto:0, delCost:0, avgCol:2, avgPay:1, retRate:2, dispRate:1, orders:60, active:20, isNew:false},
  {name:"Buyer D", bid:4500, cats:["Tablet"], mode:"delivery", rto:10, delCost:250, avgCol:0, avgPay:5, retRate:5, dispRate:5, orders:0, active:50, isNew:true},
  {name:"Buyer E", bid:4700, cats:["Phone"], mode:"self", rto:0, delCost:0, avgCol:1, avgPay:3, retRate:5, dispRate:3, orders:50, active:5, isNew:true}
];

function showCelebrationModal(winnerName, score, onDismiss) {
  let overlay = document.getElementById('celebrationModal');
  if(!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'celebrationModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="celebration-icon">🏆 🎉</div>
        <div class="modal-title">Matching Successful!</div>
        <div class="modal-body">
          Product has been matched to <span class="modal-buyer-name" id="modalBuyerName"></span> with a Final Score of <strong id="modalScore"></strong>.
        </div>
        <div class="modal-timer-bar" id="modalTimerBar"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  document.getElementById('modalBuyerName').textContent = winnerName;
  document.getElementById('modalScore').textContent = score;

  const bar = document.getElementById('modalTimerBar');
  if(bar) {
    bar.style.animation = 'none';
    bar.offsetHeight;
    bar.style.animation = 'shrinkBar 5s linear forwards';
  }

  overlay.classList.add('active');

  let active = true;
  const dismissTimer = setTimeout(() => {
    dismissModal();
  }, 5000);

  function dismissModal() {
    if (!active) return;
    active = false;
    clearTimeout(dismissTimer);
    overlay.classList.remove('active');
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  }

  overlay.onclick = (e) => {
    dismissModal();
  };
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if(!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '🎉' : '⚠️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function buyerCard(b){
  const id = buyerCount++;
  const catBox = c => `<label class="chk"><input type="checkbox" data-cat="${c}" ${b.cats.includes(c)?'checked':''}> ${c}</label>`;
  const seg = b.isNew ? 'Segment ' : '';
  const isSelf = b.mode === 'self';
  const delDisabled = isSelf ? 'disabled' : '';
  const delVal = isSelf ? 0 : (b.delCost !== undefined ? b.delCost : 0);

  return `
  <div class="buyer" id="buyer-${id}" data-id="${id}">
    <button class="remove-btn" onclick="removeBuyer(${id})">remove</button>
    <h3><input type="text" value="${b.name}" data-f="name"></h3>
    <div class="cats">${catBox('Phone')}${catBox('Tablet')}${catBox('Laptop')}</div>
    <div class="row">
      <div><label>Bid price (₹)</label><input type="number" value="${b.bid}" data-f="bid"></div>
      <div><label>Fulfillment mode</label>
        <select data-f="mode" onchange="toggleMode(this)">
          <option value="delivery" ${b.mode==='delivery'?'selected':''}>NorthLadder delivers</option>
          <option value="self" ${b.mode==='self'?'selected':''}>Buyer self collects</option>
        </select>
      </div>
    </div>
    <div class="fulfill-fields">
      <div class="rto-field" style="${isSelf?'display:none':''}"><label>RTO risk (%)</label><input type="number" value="${b.rto}" data-f="rto" min="0" max="100" data-max100="true"></div>
      <div class="col-field" style="${!isSelf?'display:none':''}"><label class="lbl-col">${seg}Avg days to collect</label><input type="number" value="${b.avgCol}" data-f="avgCol"></div>
      <div><label>Delivery cost to buyer (₹)</label><input type="number" value="${delVal}" ${delDisabled} data-f="delCost"></div>
    </div>
    <div class="row">
      <div><label class="lbl-pay">${seg}Avg payment days</label><input type="number" value="${b.avgPay}" data-f="avgPay"></div>
      <div><label class="lbl-ret">${seg}Return rate (%)</label><input type="number" value="${b.retRate}" data-f="retRate" min="0" max="100" data-max100="true"></div>
      <div><label class="lbl-disp">${seg}Dispute rate (%)</label><input type="number" value="${b.dispRate}" data-f="dispRate" min="0" max="100" data-max100="true"></div>
    </div>
    <div class="row">
      <div><label class="lbl-orders">${seg}Completed orders (6mo)</label><input type="number" value="${b.orders}" data-f="orders"></div>
      <div><label>Active orders</label><input type="number" value="${b.active}" data-f="active"></div>
    </div>
    <label class="chk" style="margin-top:6px"><input type="checkbox" ${b.isNew?'checked':''} data-f="isNew" onchange="toggleNewBuyer(this)"> New buyer (cold start eligible)</label>
  </div>`;
}

function toggleNewBuyer(chk){
  const card = chk.closest('.buyer');
  const isNew = chk.checked;
  const prefix = isNew ? 'Segment ' : '';

  const lblCol = card.querySelector('.lbl-col');
  if(lblCol) lblCol.textContent = `${prefix}Avg days to collect`;

  const lblPay = card.querySelector('.lbl-pay');
  if(lblPay) lblPay.textContent = `${prefix}Avg payment days`;

  const lblRet = card.querySelector('.lbl-ret');
  if(lblRet) lblRet.textContent = `${prefix}Return rate (%)`;

  const lblDisp = card.querySelector('.lbl-disp');
  if(lblDisp) lblDisp.textContent = `${prefix}Dispute rate (%)`;

  const lblOrders = card.querySelector('.lbl-orders');
  if(lblOrders) lblOrders.textContent = `${prefix}Completed orders (6mo)`;
}

function toggleMode(sel){
  const card = sel.closest('.buyer');
  const mode = sel.value;
  const isSelf = mode === 'self';
  card.querySelector('.rto-field').style.display = isSelf ? 'none' : '';
  card.querySelector('.col-field').style.display = !isSelf ? 'none' : '';

  const delCostInput = card.querySelector('[data-f="delCost"]');
  if(delCostInput){
    if(isSelf){
      delCostInput.value = 0;
      delCostInput.disabled = true;
    } else {
      delCostInput.disabled = false;
    }
  }
}

document.addEventListener('wheel', (e) => {
  if (document.activeElement && document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: false });

document.addEventListener('input', (e) => {
  if (e.target) {
    if (e.target.classList.contains('input-error') && e.target.value.trim() !== '') {
      e.target.classList.remove('input-error');
    }
    if (e.target.type === 'number' && e.target.hasAttribute('data-max100')) {
      let val = parseFloat(e.target.value);
      if (val > 100) e.target.value = 100;
      else if (val < 0) e.target.value = 0;
    }
  }
});

document.addEventListener('change', (e) => {
  if (e.target) {
    if (e.target.classList.contains('input-error') && e.target.value.trim() !== '') {
      e.target.classList.remove('input-error');
    }
    if (e.target.dataset && e.target.dataset.cat) {
      const card = e.target.closest('.buyer');
      if (card) {
        const catsBox = card.querySelector('.cats');
        if (catsBox && card.querySelectorAll('[data-cat]:checked').length > 0) {
          catsBox.classList.remove('input-error');
        }
      }
    }
  }
});

function updateRunBtnState(){
  const btn = document.getElementById('runBtn');
  const count = document.querySelectorAll('.buyer').length;
  if(btn){
    btn.disabled = count === 0;
  }
}

function addBuyer(defaults){
  const b = defaults || {name:`Buyer ${String.fromCharCode(65+buyerCount)}`, bid:0, cats:["Phone"], mode:"delivery", rto:10, avgCol:0, avgPay:5, retRate:5, dispRate:5, orders:0, active:0, isNew:true};
  document.getElementById('buyers').insertAdjacentHTML('beforeend', buyerCard(b));
  updateRunBtnState();
}

function removeBuyer(id){
  const el = document.getElementById('buyer-'+id);
  if(el) el.remove();
  updateRunBtnState();
}

function readBuyers(){
  return [...document.querySelectorAll('.buyer')].map(card=>{
    const g = f => card.querySelector(`[data-f="${f}"]`);
    const cats = [...card.querySelectorAll('[data-cat]')].filter(c=>c.checked).map(c=>c.dataset.cat);
    return {
      name: g('name').value || 'Unnamed',
      bid: parseFloat(g('bid').value)||0,
      cats: cats,
      mode: g('mode').value,
      rto: parseFloat(g('rto').value)||0,
      avgCol: parseFloat(g('avgCol').value)||0,
      delCost: parseFloat(g('delCost').value)||0,
      avgPay: parseFloat(g('avgPay').value)||0,
      retRate: parseFloat(g('retRate').value)||0,
      dispRate: parseFloat(g('dispRate').value)||0,
      orders: parseFloat(g('orders').value)||0,
      active: parseFloat(g('active').value)||0,
      isNew: g('isNew').checked
    };
  }).filter(b=>b.bid>0);
}

function validateInputs() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  let firstErrorInput = null;
  let errorMsg = '';

  const thresholdInputs = [
    { id: 'owed', name: 'Amount owed to partner' },
    { id: 'swCost', name: 'Store → warehouse cost' },
    { id: 'minMargin', name: 'Minimum profit threshold' },
    { id: 'maxCap', name: 'Max active order capacity' },
    { id: 'targPay', name: 'Target payment window' },
    { id: 'targCol', name: 'Target collection window' },
    { id: 'overrideBand', name: 'Cold start override band' }
  ];

  for (const item of thresholdInputs) {
    const el = document.getElementById(item.id);
    if (el && (el.value.trim() === '' || isNaN(parseFloat(el.value)))) {
      el.classList.add('input-error');
      if (!firstErrorInput) {
        firstErrorInput = el;
        errorMsg = `Please enter a valid value for "${item.name}".`;
      }
    }
  }

  const buyers = document.querySelectorAll('.buyer');
  buyers.forEach((card, index) => {
    const getField = f => card.querySelector(`[data-f="${f}"]`);

    const nameInput = getField('name');
    if (nameInput && nameInput.value.trim() === '') {
      nameInput.classList.add('input-error');
      if (!firstErrorInput) {
        firstErrorInput = nameInput;
        errorMsg = `Please enter a name for Buyer ${index + 1}.`;
      }
    }

    const checkedCats = card.querySelectorAll('[data-cat]:checked');
    if (checkedCats.length === 0) {
      const catsBox = card.querySelector('.cats');
      if (catsBox) catsBox.classList.add('input-error');
      if (!firstErrorInput) {
        firstErrorInput = catsBox || nameInput;
        errorMsg = `Please select at least one category for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
      }
    }

    const bidInput = getField('bid');
    if (bidInput && (bidInput.value.trim() === '' || isNaN(parseFloat(bidInput.value)))) {
      bidInput.classList.add('input-error');
      if (!firstErrorInput) {
        firstErrorInput = bidInput;
        errorMsg = `Please enter a bid price for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
      }
    }

    const mode = getField('mode').value;
    if (mode === 'delivery') {
      const rtoInput = getField('rto');
      if (rtoInput && (rtoInput.value.trim() === '' || isNaN(parseFloat(rtoInput.value)))) {
        rtoInput.classList.add('input-error');
        if (!firstErrorInput) {
          firstErrorInput = rtoInput;
          errorMsg = `Please enter RTO risk for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
        }
      }

      const delCostInput = getField('delCost');
      if (delCostInput && !delCostInput.disabled && (delCostInput.value.trim() === '' || isNaN(parseFloat(delCostInput.value)))) {
        delCostInput.classList.add('input-error');
        if (!firstErrorInput) {
          firstErrorInput = delCostInput;
          errorMsg = `Please enter delivery cost for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
        }
      }
    } else if (mode === 'self') {
      const colInput = getField('avgCol');
      if (colInput && (colInput.value.trim() === '' || isNaN(parseFloat(colInput.value)))) {
        colInput.classList.add('input-error');
        if (!firstErrorInput) {
          firstErrorInput = colInput;
          errorMsg = `Please enter average days to collect for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
        }
      }
    }

    const metricFields = [
      { f: 'avgPay', name: 'Avg payment days' },
      { f: 'retRate', name: 'Return rate' },
      { f: 'dispRate', name: 'Dispute rate' },
      { f: 'orders', name: 'Completed orders' },
      { f: 'active', name: 'Active orders' }
    ];

    for (const mf of metricFields) {
      const inp = getField(mf.f);
      if (inp && (inp.value.trim() === '' || isNaN(parseFloat(inp.value)))) {
        inp.classList.add('input-error');
        if (!firstErrorInput) {
          firstErrorInput = inp;
          errorMsg = `Please enter ${mf.name} for ${nameInput.value || 'Buyer ' + (index + 1)}.`;
        }
      }
    }
  });

  if (firstErrorInput) {
    showToast(errorMsg, 'error');
    firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof firstErrorInput.focus === 'function') {
      firstErrorInput.focus();
    }
    return false;
  }

  return true;
}

function getExcludedReason(b, minMargin, maxCap){
  let reasons = [];
  if(!b.gates.category) reasons.push("category mismatch");
  if(!b.gates.suspicious) reasons.push("suspicious bid check anomaly");
  if(!b.gates.profit) reasons.push(`profit below threshold (margin ₹${b.margin.toFixed(0)} < ₹${minMargin})`);
  if(!b.gates.capacity) reasons.push(`active orders exceed capacity (${b.active} ≥ ${maxCap})`);
  return reasons.join(", ");
}

function run(userTriggered = false){
  if (userTriggered) {
    const isValid = validateInputs();
    if (!isValid) return;
  }

  const deviceType = document.getElementById('deviceType').value;
  const valueTier = document.getElementById('valueTier').value;
  const owed = parseFloat(document.getElementById('owed').value)||0;
  const swCost = parseFloat(document.getElementById('swCost').value)||0;
  const minMargin = parseFloat(document.getElementById('minMargin').value)||0;
  const maxCap = parseFloat(document.getElementById('maxCap').value)||1;
  const targPay = parseFloat(document.getElementById('targPay').value)||1;
  const targCol = parseFloat(document.getElementById('targCol').value)||1;
  const overrideBand = parseFloat(document.getElementById('overrideBand').value)||25;

  let buyers = readBuyers();
  if(buyers.length===0){
    document.getElementById('result').innerHTML = '<div class="empty">Enter at least one buyer with a bid.</div>';
    if (userTriggered) {
      showToast('Enter at least one buyer with a bid.', 'error');
    }
    return;
  }

  buyers.forEach(b=>{
    b.gates = {category: b.cats.includes(deviceType)};
    b.margin = b.bid - owed - swCost - (b.mode==='delivery' ? b.delCost : 0);
  });

  const eligibleForBid = buyers.filter(b=>b.gates.category).sort((a,c)=>c.bid-a.bid);
  let suspiciousName = null;
  if(eligibleForBid.length>=2 && eligibleForBid[0].bid >= 2*eligibleForBid[1].bid){
    suspiciousName = eligibleForBid[0].name;
  }
  buyers.forEach(b=>{ b.gates.suspicious = (b.name!==suspiciousName); });
  buyers.forEach(b=>{ b.gates.profit = b.margin >= minMargin; });
  buyers.forEach(b=>{ b.gates.capacity = b.active < maxCap; });
  buyers.forEach(b=>{ b.passed = b.gates.category && b.gates.suspicious && b.gates.profit && b.gates.capacity; });

  const eligible = buyers.filter(b=>b.passed);
  if(eligible.length===0){ 
    renderNoMatch(buyers); 
    if (userTriggered) {
      showToast('No buyer cleared all gates for this device.', 'error');
      document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return; 
  }

  const margins = eligible.map(b=>b.margin);
  const orders = eligible.map(b=>b.orders);
  const minM = Math.min(...margins), maxM = Math.max(...margins);
  const minO = Math.min(...orders), maxO = Math.max(...orders);

  eligible.forEach(b=>{
    b.sNetMargin = maxM>minM ? (b.margin-minM)/(maxM-minM) : 1;
    b.sFulfill = b.mode==='delivery' ? Math.max(0,1-b.rto/100) : Math.max(0,1-b.avgCol/targCol);
    b.sPayment = Math.max(0,1-b.avgPay/targPay);
    b.sReturn = Math.max(0,1-b.retRate/100);
    b.sOrderFreq = maxO>minO ? (b.orders-minO)/(maxO-minO) : 1;
    b.sDispute = Math.max(0,1-b.dispRate/100);
    b.final = 0.30*b.sNetMargin + 0.25*b.sFulfill + 0.20*b.sPayment + 0.10*b.sReturn + 0.10*b.sOrderFreq + 0.05*b.sDispute;
  });

  eligible.sort((a,c)=>c.final-a.final);

  let overrideBuyer = null;
  if(valueTier==='low'){
    const topMargin = eligible[0].margin;
    const candidate = eligible.find(b=> b.isNew && b.name!==eligible[0].name &&
      topMargin>0 && ((topMargin-b.margin)/topMargin*100) <= overrideBand && b.margin<=topMargin);
    if(candidate) overrideBuyer = candidate;
  }

  renderResult(buyers, eligible, overrideBuyer, deviceType, valueTier, overrideBand);

  if (userTriggered) {
    const finalWinner = overrideBuyer || eligible[0];
    showCelebrationModal(finalWinner.name, finalWinner.final.toFixed(3));
    
    // Smooth scroll to visual graph in parallel while modal displays
    const chartCard = document.querySelector('.chart-card') || document.getElementById('result');
    if (chartCard) {
      chartCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function gateBadge(pass){ return `<span class="badge ${pass?'pass':'fail'}">${pass?'pass':'fail'}</span>`; }

function renderNoMatch(buyers){
  const minMargin = parseFloat(document.getElementById('minMargin').value)||0;
  const maxCap = parseFloat(document.getElementById('maxCap').value)||1;
  const palette = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e'];

  let chartBarsHtml = buyers.map((b, idx) => {
    const barColor = palette[idx % palette.length];
    return `
      <div class="bar-wrapper" style="opacity: 0.7;">
        <div class="bar" style="height: 12%; background-color: ${barColor}; opacity: 0.45;"></div>
        <div class="bar-name" title="${b.name}">${b.name}</div>
        <div class="bar-score"><span style="font-size:10px;color:var(--red);">Excluded</span></div>
      </div>
    `;
  }).join('');

  let chartHtml = `
    <div class="chart-card">
      <div class="chart-title">Buyer Score Ranking</div>
      <div class="chart-bars">${chartBarsHtml}</div>
    </div>
  `;

  let rows = buyers.map(b=>`
    <tr class="excluded">
      <td>${b.name} <span class="badge fail">Excluded</span></td>
      <td style="text-align:left;color:var(--text-dim);" colspan="7">Excluded — ${getExcludedReason(b, minMargin, maxCap)}</td>
    </tr>`).join('');

  document.getElementById('result').innerHTML = `
    <div class="result-head"><span class="winner-line" style="color:var(--red)">No buyer clears all gates</span></div>
    <p class="note">Fallback triggers: re-run auction for this device, or route to manual review.</p>
    ${chartHtml}
    <table>
      <thead><tr><th>Buyer</th><th style="text-align:left;" colspan="7">Status &amp; Reason</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderResult(buyers, eligible, overrideBuyer, deviceType, valueTier, overrideBand){
  const minMargin = parseFloat(document.getElementById('minMargin').value)||0;
  const maxCap = parseFloat(document.getElementById('maxCap').value)||1;
  const rankedWinner = eligible[0];
  const finalWinner = overrideBuyer || rankedWinner;

  const palette = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e'];

  // All buyers in graph: eligible buyers sorted by score first (tallest on left), then excluded buyers
  const allChartBuyers = [
    ...eligible,
    ...buyers.filter(b => !b.passed)
  ];

  const maxScore = Math.max(...eligible.map(b=>b.final), 0.001);

  let chartBarsHtml = allChartBuyers.map((b, idx) => {
    const isEligible = b.passed;
    const isMatched = (b.name === finalWinner.name);
    const isTopRankedNotMatched = (isEligible && !isMatched && b.name === rankedWinner.name);
    const barColor = palette[idx % palette.length];

    let badgeHtml = '';
    if (isMatched) {
      badgeHtml = `<div class="trophy-badge">🏆 Matched</div>`;
    } else if (isTopRankedNotMatched) {
      badgeHtml = `<div class="top-ranked-badge">★ Highest Scorer</div>`;
    }

    const heightPct = isEligible ? Math.max(18, (b.final / maxScore) * 100) : 12;
    const opacityStyle = isEligible ? 'opacity: 1;' : 'opacity: 0.4; background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.12) 4px, rgba(0,0,0,0.12) 8px);';
    const scoreText = isEligible ? b.final.toFixed(3) : '<span style="font-size:10px;color:var(--red);">Excluded</span>';

    return `
      <div class="bar-wrapper">
        ${badgeHtml}
        <div class="bar" style="height: ${heightPct.toFixed(1)}%; background-color: ${barColor}; ${opacityStyle}"></div>
        <div class="bar-name" title="${b.name}">${b.name}</div>
        <div class="bar-score">${scoreText}</div>
      </div>
    `;
  }).join('');

  let chartHtml = `
    <div class="chart-card">
      <div class="chart-title">Buyer Score Ranking</div>
      <div class="chart-bars">${chartBarsHtml}</div>
    </div>
  `;

  let rows = buyers.map(b=>{
    if(!b.passed){
      const reason = getExcludedReason(b, minMargin, maxCap);
      return `<tr class="excluded">
        <td>${b.name} <span class="badge fail">Excluded</span></td>
        <td colspan="7" style="text-align:left;color:var(--text-dim);font-weight:500;">Excluded — ${reason}</td>
      </tr>`;
    }
    let cls = '';
    if(overrideBuyer && b.name===overrideBuyer.name) cls='override';
    else if(!overrideBuyer && b.name===rankedWinner.name) cls='winner';
    const tag = overrideBuyer && b.name===overrideBuyer.name ? ' ◆ override matched' : (b.name===rankedWinner.name ? ' ★ highest scorer' : '');
    return `<tr class="${cls}">
      <td>${b.name}${tag}</td>
      <td>${b.sNetMargin.toFixed(2)}</td>
      <td>${b.sFulfill.toFixed(2)}</td>
      <td>${b.sPayment.toFixed(2)}</td>
      <td>${b.sReturn.toFixed(2)}</td>
      <td>${b.sOrderFreq.toFixed(2)}</td>
      <td>${b.sDispute.toFixed(2)}</td>
      <td><strong>${b.final.toFixed(3)}</strong></td>
    </tr>`;
  }).join('');

  let overrideNote = '';
  if(overrideBuyer){
    const topMargin = rankedWinner.margin;
    const diffPct = topMargin > 0 ? (((topMargin - overrideBuyer.margin) / topMargin) * 100).toFixed(1) : 0;
    overrideNote = `<div class="override-note">
      <strong>Cold Start Override Applied:</strong> Although <strong>${rankedWinner.name}</strong> was the highest overall scorer (Score: ${rankedWinner.final.toFixed(3)}), <strong>${overrideBuyer.name}</strong> (a new buyer) has been prioritized for this ${valueTier.toLowerCase()}-value ${deviceType.toLowerCase()}. 
      This new buyer is prioritized because their net margin (₹${overrideBuyer.margin.toFixed(0)}) is within the <strong>${overrideBand}%</strong> override threshold (actual difference: ${diffPct}%) from the highest scorer's net margin (₹${topMargin.toFixed(0)}). Therefore, to give opportunity to this new buyer, we are allocating this low-value product to build their transactional history.
    </div>`;
  }

  document.getElementById('result').innerHTML = `
    ${overrideNote}
    <div class="result-head">
      <span class="winner-line">Matched to ${finalWinner.name}</span>
      <span style="font-size:12px;color:var(--text-dim)">Final Score ${finalWinner.final.toFixed(3)}</span>
    </div>
    ${chartHtml}
    <table>
      <thead><tr><th>Buyer</th><th>Margin (.30)</th><th>Fulfillment (.25)</th><th>Payment (.20)</th><th>Return (.10)</th><th>Orders (.10)</th><th>Dispute (.05)</th><th>Final</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

document.addEventListener('DOMContentLoaded', () => {
  buyerDefaults.forEach(b=>addBuyer(b));
  updateRunBtnState();
  run();
});
