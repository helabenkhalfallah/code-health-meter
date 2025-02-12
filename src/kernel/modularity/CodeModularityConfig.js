/**
 * Format code modularity html reports
 * @param reports
 * @returns {string}
 */
const formatCodeModularityHtmlReports = (reports) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Modularity Analysis</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-size: 16px; text-align: center; font-family: Arial, sans-serif; margin: 40px auto; max-width: 90%; }
        
        .section-container { width: 100%; margin-bottom: 40px; }
        .section-chart-container { width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: row; gap: 20px; }
        .cyclic-vizualization-container { width: 100%; display: flex; justify-content: center; margin: 30px; }
        
        table { width: 80%; margin: 0 auto; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        .search-box { width: 80%; padding: 12px; font-size: 16px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; }
        
        h1 { font-size: 32px; margin-bottom: 30px; }
        h2 { font-size: 26px; margin: 40px 0 20px; }
        h3 { font-size: 22px; margin-top: 30px; }
                
        .chart-container { width: 40%; }
        .help { font-size: 14px; color: gray; margin-top: 8px; }
        .bad-value { color: red; font-weight: bold; }
        
        .cyclic-vizualization { object-fit: contain; max-width: 85%; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .summary-table { width: 80%; margin: 0 auto; border-collapse: collapse; }
        .summary-table th, .summary-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        .summary-table th { background-color: #f4f4f4; }
    </style>
</head>
<body>
    <h1>Project Modularity Analysis</h1>
    
    <div class="section-container">
      <h2>Summary</h2>
      <table class="summary-table">
          <tr>
              <th>Metric</th>
              <th>Value</th>
          </tr>
          <tr>
              <td><strong>Modularity</strong></td>
              <td id="modularity"></td>
          </tr>
          <tr>
              <td><strong>Density</strong></td>
              <td id="density"></td>
          </tr>
      </table>
    </div>
    
    <h2>Coupling, Centrality and Circular Dependencies Vizualization</h2>
    <div class="cyclic-vizualization-container">
      <img class="cyclic-vizualization" src="${reports.svgFile || ''}" alt="Coupling, Centrality and Circular Dependencies Analysis">
    </div>
    
    <div class="section-container">
      <h2>Communities</h2>
      <input type="text" id="communitySearch" class="search-box" placeholder="Search for a file...">
      <table id="communities-table">
          <tr>
              <th>Community</th>
              <th>Files</th>
          </tr>
      </table>
    </div>

    <div class="section-container">
      <h2>Degree Centrality</h2>
      <input type="text" id="centralitySearch" class="search-box" placeholder="Search for a file...">
      <table id="degree-centrality-table">
          <tr>
              <th>File</th>
              <th>Degree Centrality</th>
              <th>In-Degree</th>
              <th>Out-Degree</th>
          </tr>
      </table>
    </div>
    
    <div class="section-chart-container">
        <div class="chart-container">
            <canvas id="degreeCentralityChart"></canvas>
        </div>
        <div class="chart-container">
            <canvas id="inOutCentralityChart"></canvas>
        </div>
    </div>

    <script>
        const data = {
          modularity: ${reports?.modularity || 0},
          density: ${reports?.density || 0},
          communities: ${JSON.stringify(reports?.communities || {})},
          degreeCentrality: ${JSON.stringify(reports?.degreeCentrality || {})},
          inDegreeCentrality: ${JSON.stringify(reports?.inDegreeCentrality || {})},
          outDegreeCentrality: ${JSON.stringify(reports?.outDegreeCentrality || {})},
        };

        document.getElementById("modularity").textContent = data.modularity;
        document.getElementById("density").textContent = data.density;

        const communitiesTable = document.getElementById("communities-table");
        const groupedCommunities = {};
        for (const [file, community] of Object.entries(data.communities)) {
            if (!groupedCommunities[community]) groupedCommunities[community] = [];
            groupedCommunities[community].push(file);
        }
        for (const [community, files] of Object.entries(groupedCommunities)) {
            const row = communitiesTable.insertRow();
            row.insertCell(0).textContent = community;
            row.insertCell(1).textContent = files.join(", ");
        }
        document.getElementById("communitySearch").addEventListener("input", function () {
            const searchText = this.value.toLowerCase();
            document.querySelectorAll("#communities-table tr").forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchText) ? "" : "none";
            });
        });

        const degreeTable = document.getElementById("degree-centrality-table");
        for (const [file, centrality] of Object.entries(data.degreeCentrality)) {
            const row = degreeTable.insertRow();
            row.insertCell(0).textContent = file;
            const centralityCell = row.insertCell(1);
            centralityCell.textContent = centrality;
            if (centrality < 0.05 || centrality > 0.2) centralityCell.classList.add("bad-value");
            row.insertCell(2).textContent = data.inDegreeCentrality[file] || 0;
            row.insertCell(3).textContent = data.outDegreeCentrality[file] || 0;
        }
        document.getElementById("centralitySearch").addEventListener("input", function () {
            const searchText = this.value.toLowerCase();
            document.querySelectorAll("#degree-centrality-table tr").forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchText) ? "" : "none";
            });
        });
        
        const labels = Object.keys(data.degreeCentrality);
        const degreeValues = Object.values(data.degreeCentrality);
        const inDegreeValues = Object.values(data.inDegreeCentrality);
        const outDegreeValues = Object.values(data.outDegreeCentrality);

        new Chart(document.getElementById("degreeCentralityChart"), {
            type: "bar",
            data: {
                labels,
                datasets: [{ label: "Degree Centrality", data: degreeValues, backgroundColor: "blue" }]
            }
        });

        new Chart(document.getElementById("inOutCentralityChart"), {
            type: "bar",
            data: {
                labels,
                datasets: [
                    { label: "In-Degree", data: inDegreeValues, backgroundColor: "green" },
                    { label: "Out-Degree", data: outDegreeValues, backgroundColor: "red" }
                ]
            }
        });
    </script>
</body>
</html>
`;
};

const CodeModularityConfig = {
  formatCodeModularityHtmlReports
};

export default CodeModularityConfig;