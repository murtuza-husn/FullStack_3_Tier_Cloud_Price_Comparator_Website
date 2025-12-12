// Check if user is logged in
const token = localStorage.getItem("token");
if (!token) {
  alert("Please log in first!");
  window.location.href = "login.html";
}

// Display logged-in username
const loggedInUser = localStorage.getItem("userName") || "User";
document.getElementById("welcomeText").textContent = "Welcome, " + loggedInUser;

// Sign Out button
document.getElementById("signOutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  alert("Signed out!");
  window.location.href = "login.html";
});

// Compare button click
document.getElementById("compareBtn").addEventListener("click", async () => {
  const selectedPlatforms = $('#platformSelect').val();
  const selectedServices = $('#serviceSelect').val();

  if (!selectedPlatforms || !selectedServices) {
    alert("Please select at least one platform and one service category.");
    return;
  }

  try {
    // Fetch pricing from backend API with JWT
    const response = await fetch("http://localhost:5000/api/pricing", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ platforms: selectedPlatforms, services: selectedServices })
    });

    if (!response.ok) throw new Error("Failed to fetch pricing data");

    const pricingData = await response.json();

    const container = document.getElementById("resultTableContainer");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "table table-bordered";

    // Table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const thService = document.createElement("th");
    thService.textContent = "Service Category";
    headerRow.appendChild(thService);

    selectedPlatforms.forEach(platform => {
      const th = document.createElement("th");
      th.textContent = platform;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");

    selectedServices.forEach(service => {
      const row = document.createElement("tr");

      const tdService = document.createElement("td");
      tdService.textContent = service;
      row.appendChild(tdService);

      const prices = selectedPlatforms.map(platform => pricingData[service][platform]);

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      selectedPlatforms.forEach((platform, index) => {
        const td = document.createElement("td");
        td.textContent = "$" + prices[index].toFixed(3);

        if (prices[index] === minPrice) td.style.backgroundColor = "#d4edda"; // green
        else if (prices[index] === maxPrice) td.style.backgroundColor = "#f8d7da"; // red
        else td.style.backgroundColor = "#fff3cd"; // yellow

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

  } catch (error) {
    console.error(error);
    alert("Error fetching pricing data. Make sure your server is running and you are logged in.");
  }
});

// PDF generation
document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  const table = document.querySelector("#resultTableContainer table");
  if (!table) {
    alert("Please generate the comparison table first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const headers = [];
  table.querySelectorAll("thead tr th").forEach(th => headers.push(th.textContent));

  const body = [];
  table.querySelectorAll("tbody tr").forEach(tr => {
    const row = [];
    tr.querySelectorAll("td").forEach(td => row.push(td.textContent));
    body.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: body,
    theme: "grid",
    didParseCell: function (data) {
      const originalTd = table
        .querySelectorAll("tbody tr")[data.row.index]
        .querySelectorAll("td")[data.column.index];
      const bg = originalTd.style.backgroundColor;
      if (bg) data.cell.styles.fillColor = bg;
    }
  });

  doc.save("CloudCompare_Report.pdf");
});

// Initialize bootstrap-select
$(".selectpicker").selectpicker();
