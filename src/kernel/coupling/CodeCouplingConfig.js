
const buildTableHtmlData = ({
  reports,
  circular,
}) => {
  const columnsNames = [
    'file',
    'Efferent Coupling',
    'Afferent Coupling',
    'Instability Index'
  ];

  const tableHeaders = columnsNames.map(key => `<th scope="col">${key}</th>`).join('\n');

  const tableRows = reports
    .map(report => `
      <tr>
        <td>
           ${report.file}
        </td>
        <td>
           ${report.efferentCoupling}
        </td>
        <td>
           ${report.afferentCoupling}
        </td>
        <td>
           ${report.instabilityIndex}
        </td>                        
      </tr>`)
    .join('\n');

  return({
    tableHeaders,
    tableRows,
  });
};

const formatCodeCouplingHtmlReports = ({
  reports,
  circularDependencies,
  svgFile,
}) => {
  const {
    tableHeaders,
    tableRows,
  } = buildTableHtmlData({
    reports,
    circularDependencies,
  });

  return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Audit Reports</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <style>
        body {
          font-family: "Gill Sans", sans-serif;
          font-size: 0.9rem;
        }

        h1 {
           font-size: 2rem;
        }

        h2 {
           font-size: 1.5rem;
        }

        span {
           font-size: 0.9rem;
        }
        
        .modal-body{
           font-size: 1.1rem;
        }
    </style>
</head>
<body>
<h1 class="text-center mb-4 mt-4">Coupling and Circular Dependencies Analysis</h1>

<div class="container text-end mt-3 mb-3">
    <button
            type="button"
            class="btn btn-outline-danger border-0"
            data-bs-toggle="modal"
            data-bs-target="#helpMessage"
    >
        More details about indicators
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-question-fill" viewBox="0 0 16 16">
            <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627"/>
        </svg>
    </button>
</div>

<div class="container text-center mb-4 mt-4">
    <img class="img-fluid" src="${svgFile}" alt="Coupling and Circular Dependencies Analysis">
</div>

<!-- Modal -->
<div class="modal fade" id="helpMessage" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="helpModalLabel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-question-fill" viewBox="0 0 16 16">
                        <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627"/>
                    </svg>
                    <strong>More details about the various indicators</strong>
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="container mb-2 mt-2">
- <strong>Afferent Coupling (Ca):</strong> This refers to the number of external modules that depend on the given module.
It’s a measure of how much responsibility a module has. <br />
<i>For instance, if you have a module A that provides utility functions used by modules B, C, and D, then the Afferent Coupling of module A is 3 (since three modules are depending on it).</i><br />
<br />
- <strong>Efferent Coupling (Ce):</strong> This is the opposite of Afferent Coupling.
It measures how many other modules a given module depends on.<br /> 
<i>For example, if module A uses utility functions from modules B, C, and D, then the Efferent Coupling of module A is 3 (since it depends on three other modules).</i><br />
<br />
- <strong>Instability Index:</strong> This is a measure of the module’s resilience to change, calculated as I = Ce / (Ca + Ce). <br />
The range for this metric is 0 to 1. A value of 0 indicates a completely stable module (highly depended upon, but doesn’t depend on others), and a value of 1 indicates a completely unstable module (depends on many others, but isn’t depended upon). <br />
<i>For instance, if module A has an Efferent Coupling of 3 and an Afferent Coupling of 1, its Instability Index would be I = 3 / (1 + 3) = 0.75, indicating it’s more unstable than stable.</i><br />
<br />
These metrics are useful in software design for understanding dependencies and the impact of potential changes. <br />
They can help identify modules that might be problematic to maintain or evolve due to high coupling or instability.<br />
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<div class="container text-left mb-4 mt-4">
  <div class="text-start">
    <table class="table table-striped table-responsive caption-top table-bordered border-primary-subtle">
      <caption>Analysis Details</caption>
      <thead class="table-light text-uppercase">
        <tr>
            ${tableHeaders}
        </tr>
      </thead>
      <tbody class="table-group-divider">
        ${tableRows}
      </tbody>
    </table>
  </div>
</div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>
</html>
    `;
};

const CodeCouplingConfig = {
  formatCodeCouplingHtmlReports,
};

export default CodeCouplingConfig;