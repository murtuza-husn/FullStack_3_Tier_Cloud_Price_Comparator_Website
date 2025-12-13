// history.js
$(document).ready(async function() {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  if (!token) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }
  document.getElementById("welcomeText").textContent = "Welcome, " + userName;
  document.getElementById("signOutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    alert("Signed out!");
    window.location.href = "login.html";
  });
  try {
    const response = await fetch(`${BASE_URL}/api/pricing/history?userName=` + encodeURIComponent(userName), {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!response.ok) throw new Error("Failed to fetch history");
    const history = await response.json();
    const container = document.getElementById("historyTableContainer");
    if (!history.length) {
      container.innerHTML = '<div class="alert alert-info">No comparison history found.</div>';
      return;
    }
    history.forEach((entry, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "mb-4 position-relative";
      const table = document.createElement("table");
      table.className = "table table-bordered";
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const thService = document.createElement("th");
      thService.textContent = "Service Category";
      headerRow.appendChild(thService);
      entry.platforms.forEach(platform => {
        const th = document.createElement("th");
        th.textContent = platform;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      entry.services.forEach(service => {
        const row = document.createElement("tr");
        const tdService = document.createElement("td");
        tdService.textContent = service;
        row.appendChild(tdService);
        const prices = entry.platforms.map(platform => entry.pricingData[service][platform]);
        const validPrices = prices.filter(p => p !== null && p !== undefined);
        const minPrice = validPrices.length ? Math.min(...validPrices) : null;
        const maxPrice = validPrices.length ? Math.max(...validPrices) : null;
        entry.platforms.forEach((platform, index) => {
          const td = document.createElement("td");
          const price = prices[index];
          if (price !== null && price !== undefined) {
            td.textContent = "$" + price.toFixed(3);
            if (price === minPrice) td.style.backgroundColor = "#d4edda";
            else if (price === maxPrice) td.style.backgroundColor = "#f8d7da";
            else td.style.backgroundColor = "#fff3cd";
          } else {
            td.textContent = "N/A";
            td.style.backgroundColor = "#f8d7da";
          }
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      const caption = document.createElement("caption");
      caption.textContent = `Saved on: ${new Date(entry.createdAt).toLocaleString()}`;
      table.appendChild(caption);
      // Delete button (above the table)
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger btn-sm mb-2";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async () => {
        if (confirm("Are you sure you want to delete this comparison?")) {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/api/pricing/history/${entry._id}`, {
              method: "DELETE",
              headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) {
              wrapper.remove();
            } else {
              alert("Failed to delete comparison.");
            }
          } catch {
            alert("Error deleting comparison.");
          }
        }
      };
      wrapper.appendChild(deleteBtn);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
    });
  } catch (error) {
    alert("Error loading history.");
  }
});
