export async function render() {

  const res = await apiGet("/restaurant-wallet/bank");
  const b = res.data || {};

  document.getElementById("content").innerHTML = `
    <div class="wallet-bank">

      <div class="bank-card">

        <h3>Bank Details</h3>

        <div class="form-group">
          <label>UPI ID</label>
          <input id="upi" value="${b.upi_id || ""}" placeholder="Enter UPI ID">
        </div>

        <div class="form-group">
          <label>Account Number</label>
          <input id="acc" value="${b.account_no || ""}" placeholder="Enter account number">
        </div>

        <div class="form-group">
          <label>IFSC Code</label>
          <input id="ifsc" value="${b.ifsc || ""}" placeholder="Enter IFSC code">
        </div>

        <div class="form-group">
          <label>Account Holder Name</label>
          <input id="name" value="${b.holder_name || ""}" placeholder="Enter name">
        </div>

        <div class="bank-actions">
          <button onclick="saveBank()" class="btn-save">Save</button>
          <button onclick="back()" class="btn-back">Back</button>
        </div>

      </div>

    </div>
  `;
}


// ✅ SAVE
window.saveBank = async () => {

  await apiPost("/restaurant-wallet/bank", {
    upi_id: document.getElementById("upi").value,
    account_no: document.getElementById("acc").value,
    ifsc: document.getElementById("ifsc").value,
    holder_name: document.getElementById("name").value
  });

  alert("Saved");
};


// ✅ BACK
window.back = () => {
  loadPage("wallet");
};
