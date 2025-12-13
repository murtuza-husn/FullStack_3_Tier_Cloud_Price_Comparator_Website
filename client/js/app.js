// Ensure Comparison History button is always registered
document.getElementById("historyBtn").addEventListener("click", () => {
  window.location.href = "history.html";
});
// Store last comparison data in memory for storing
let lastComparison = null;

// Compare, Store, and Download PDF buttons
const compareBtn = document.getElementById("compareBtn");
const storeBtn = document.getElementById("storeComparisonBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
// Show message if clicking disabled buttons (mousedown catches before browser blocks click)
function addDisabledButtonMessage(btn, message) {
  if (btn) {
    btn.addEventListener('mousedown', function(e) {
      if (btn.disabled) {
        e.preventDefault();
        alert(message);
      }
    }, true);
  }
}
addDisabledButtonMessage(compareBtn, 'Please select at least one platform and one service category.');
addDisabledButtonMessage(storeBtn, 'Please run a comparison first.');
addDisabledButtonMessage(downloadPdfBtn, 'Please run a comparison first.');

// Helper to check dropdowns
function checkDropdownsSelected() {
  const platforms = $('#platformSelect').val();
  const services = $('#serviceSelect').val();
  return platforms && platforms.length > 0 && services && services.length > 0;
}

// Enable/disable Compare button based on dropdowns
function updateCompareBtnState() {
  if (compareBtn) {
    compareBtn.disabled = !checkDropdownsSelected();
  }
}

// Listen for dropdown changes
$('#platformSelect, #serviceSelect').on('changed.bs.select', updateCompareBtnState);
// Initial state
updateCompareBtnState();

// Show message if clicking disabled Compare or Store buttons
if (compareBtn) {
  compareBtn.addEventListener('click', function(e) {
    if (compareBtn.disabled) {
      e.preventDefault();
      alert('Please select at least one platform and one service category.');
    }
  }, true);
}
if (storeBtn) {
  storeBtn.addEventListener('click', function(e) {
    if (storeBtn.disabled) {
      e.preventDefault();
      alert('Please run a comparison first.');
    }
  }, true);
}

// Store Comparison button setup
// Store Comparison button logic
if (storeBtn) {
  storeBtn.disabled = true; // Always start disabled
  storeBtn.addEventListener("click", async function() {
    if (storeBtn.disabled) return; // Prevent double handling
    if (!lastComparison) {
      alert("Please run a comparison first.");
      return;
    }
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    try {
      const response = await fetch(`${BASE_URL}/api/pricing/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          ...lastComparison,
          userName
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Comparison stored successfully!");
      } else {
        alert(data.error || "Failed to store comparison.");
      }
    } catch (err) {
      alert("Error storing comparison.");
    }
  });
}
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
compareBtn.addEventListener("click", async () => {
  const selectedPlatforms = $('#platformSelect').val();
  const selectedServices = $('#serviceSelect').val();

  if (!selectedPlatforms || !selectedServices) {
    alert("Please select at least one platform and one service category.");
    return;
  }

  try {
    // Fetch pricing from backend API with JWT
    const response = await fetch(`${BASE_URL}/api/pricing`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ platforms: selectedPlatforms, services: selectedServices })
    });

    if (!response.ok) throw new Error("Failed to fetch pricing data");

    const pricingData = await response.json();
    // Save last comparison for storing
    lastComparison = {
      platforms: selectedPlatforms,
      services: selectedServices,
      pricingData: pricingData
    };
    // Enable Store Comparison and Download PDF buttons now that table will be created
    if (storeBtn) storeBtn.disabled = false;
    if (downloadPdfBtn) downloadPdfBtn.disabled = false;



// Comparison History button (always available)
document.getElementById("historyBtn").addEventListener("click", () => {
  window.location.href = "history.html";
});


    const container = document.getElementById("resultTableContainer");
    container.innerHTML = "";

    // Add color legend
    let legendDiv = document.getElementById("colorLegendDiv");
    if (!legendDiv) {
      legendDiv = document.createElement("div");
      legendDiv.id = "colorLegendDiv";
      legendDiv.className = "mb-2";
      legendDiv.innerHTML = `
        <span style="display:inline-block;width:18px;height:18px;background:#d4edda;border:1px solid #ccc;margin-right:4px;"></span> Cheapest &nbsp;
        <span style="display:inline-block;width:18px;height:18px;background:#fff3cd;border:1px solid #ccc;margin-right:4px;"></span> Medium &nbsp;
        <span style="display:inline-block;width:18px;height:18px;background:#f8d7da;border:1px solid #ccc;margin-right:4px;"></span> Highest
      `;
      container.appendChild(legendDiv);
    }

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

    // For recommendation: sum up total price per platform
    const platformTotals = {};
    selectedPlatforms.forEach(platform => { platformTotals[platform] = 0; });

    selectedServices.forEach(service => {
      const row = document.createElement("tr");

      const tdService = document.createElement("td");
      tdService.textContent = service;
      row.appendChild(tdService);

      const prices = selectedPlatforms.map(platform => pricingData[service][platform]);
      // Filter out null/undefined for min/max
      const validPrices = prices.filter(p => p !== null && p !== undefined);
      const minPrice = validPrices.length ? Math.min(...validPrices) : null;
      const maxPrice = validPrices.length ? Math.max(...validPrices) : null;

      selectedPlatforms.forEach((platform, index) => {
        const td = document.createElement("td");
        const price = prices[index];
        if (price !== null && price !== undefined) {
          td.textContent = "$" + price.toFixed(3);
          if (price === minPrice) td.style.backgroundColor = "#d4edda"; // green
          else if (price === maxPrice) td.style.backgroundColor = "#f8d7da"; // red
          else td.style.backgroundColor = "#fff3cd"; // yellow
          platformTotals[platform] += price;
        } else {
          td.textContent = "N/A";
          td.style.backgroundColor = "#f8d7da"; // red for missing
          platformTotals[platform] += Number.POSITIVE_INFINITY; // Penalize missing
        }
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // Find recommended platform (lowest total)
    let recommendedPlatform = null;
    let minTotal = Number.POSITIVE_INFINITY;
    for (const [platform, total] of Object.entries(platformTotals)) {
      if (total < minTotal) {
        minTotal = total;
        recommendedPlatform = platform;
      }
    }

    // Display recommendation
    let recommendationDiv = document.getElementById("recommendationDiv");
    if (!recommendationDiv) {
      recommendationDiv = document.createElement("div");
      recommendationDiv.id = "recommendationDiv";
      recommendationDiv.className = "alert alert-success mt-3";
      container.appendChild(recommendationDiv);
    }
    if (recommendedPlatform && minTotal !== Number.POSITIVE_INFINITY) {
      recommendationDiv.textContent = `Recommended Platform: ${recommendedPlatform} (Total: $${minTotal.toFixed(3)})`;
    } else {
      recommendationDiv.textContent = "No clear recommendation (missing data for all platforms).";
    }

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

  // Get user name for report
  const userName = localStorage.getItem("userName") || "User";
  const [firstName, ...rest] = userName.split(" ");
  const lastName = rest.join(" ");

  // Custom message
  const message = `Hello ${firstName} ${lastName},\n\nHere is your report for comparing the services across selected platforms.\n\nLegend: Green = Cheapest, Yellow = Medium, Red = Highest price.`;

  // Add message to PDF
  doc.setFontSize(14);
  doc.text(message, 14, 18, { maxWidth: 180 });

  // Add some spacing before table
  let tableStartY = 36;

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
    startY: tableStartY,
    headStyles: {
      fillColor: [222, 235, 247], // light blue/gray neutral
      textColor: 20,
      fontStyle: 'bold',
    },
    didParseCell: function (data) {
      // Only color data cells, not header
      if (data.section === 'body') {
        const originalTd = table
          .querySelectorAll("tbody tr")[data.row.index]
          .querySelectorAll("td")[data.column.index];
        const bg = originalTd.style.backgroundColor;
        if (bg) {
          if (bg === "rgb(212, 237, 218)" || bg === "#d4edda") data.cell.styles.fillColor = [212,237,218]; // green
          else if (bg === "rgb(255, 243, 205)" || bg === "#fff3cd") data.cell.styles.fillColor = [255,243,205]; // yellow
          else if (bg === "rgb(248, 215, 218)" || bg === "#f8d7da") data.cell.styles.fillColor = [248,215,218]; // red
        }
      }
    }
  });

  // Add color legend at bottom
  doc.setFontSize(11);
  doc.text("Legend:", 14, doc.lastAutoTable.finalY + 10);
  doc.setFillColor(212,237,218); doc.rect(32, doc.lastAutoTable.finalY + 5, 6, 6, 'F'); doc.text("Cheapest", 40, doc.lastAutoTable.finalY + 10);
  doc.setFillColor(255,243,205); doc.rect(70, doc.lastAutoTable.finalY + 5, 6, 6, 'F'); doc.text("Medium", 78, doc.lastAutoTable.finalY + 10);
  doc.setFillColor(248,215,218); doc.rect(110, doc.lastAutoTable.finalY + 5, 6, 6, 'F'); doc.text("Highest", 118, doc.lastAutoTable.finalY + 10);

  doc.save("CloudCompare_Report.pdf");
});

// Initialize bootstrap-select
$(".selectpicker").selectpicker();
