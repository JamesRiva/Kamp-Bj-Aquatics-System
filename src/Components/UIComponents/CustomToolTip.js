export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label}`}</p>
          <p className="value">{`₱ ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };


export const CustomToolTipForRestockVsSales = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    const sales = payload.find(p => p.dataKey === 'sales');
    const restock = payload.find(p => p.dataKey === 'restock');
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`Date: ${label}`}</p>
        <p className="intro">{`Sales: ₱ ${sales ? sales.value.toLocaleString() : 0}`}</p>
        <p className="intro">{`Restock: ₱ ${restock ? restock.value.toLocaleString() : 0}`}</p>
      </div>
    );
  }
  return null;
};

export const CustomToolTipForTurnOverRatio = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    // Find the specific dataKey and extract its value
    const ratio = payload.find(p => p.dataKey === 'Inventory_Turnover_Ratio');

    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Turn Over Ratio: ${ratio.value}`}</p>
      </div>
    );
  }

  return null;
};

export const CustomToolTipForSellingTime = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    // Find the specific dataKey and extract its value
    const time = payload.find(p => p.dataKey === 'Average_Selling_Time_Days');

    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Average Selling Time: ${time.value} Days`}</p>
      </div>
    );
  }

  return null;
};

export const CustomToolTipForGrossProfit = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    // Find the specific dataKey and extract its value
    const grossMargin = payload.find(p => p.dataKey === 'Total_Gross_Margin');

    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Total Gross Margin: ₱ ${grossMargin.value}`}</p>
      </div>
    );
  }

  return null;
};

export const CustomToolTipForGmroi = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    // Find the specific dataKey and extract its value
    const multiplier = payload.find(p => p.dataKey === 'Gross_Margin_Multiplier');

    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Gross Margin Multiplier: ${multiplier.value}`}</p>
      </div>
    );
  }

  return null;
};

export const CustomToolTipForReminders = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="value">{`₱ ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }
  return null;
};

export const CustomToolTipForLedgerGraph = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p className="label">{`Credit: ₱ ${payload[1]?.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        <p className="label">{`Debit: ₱ ${payload[2]?.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        <p className="value">{`Balance: ₱ ${payload[0]?.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }
  return null;
};