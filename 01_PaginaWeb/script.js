document.addEventListener('DOMContentLoaded', function() {
    let allTableData = []; // Store all data for filtering
    let currentSort = 'asc'; // Track current sort order

    // Theme handling
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Function to check if a string is a valid URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Function to get domain name from URL
    function getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch (_) {
            return '';
        }
    }

    // Function to create tooltip content
    function createTooltipContent(url) {
        const domain = getDomainFromUrl(url);
        return `Visit ${domain}`;
    }

    // Function to convert cell content to link if it's a URL
    function createCellContent(content, columnIndex, rowData) {
        // If it's the first column and there's a URL in the second column
        if (columnIndex === 0 && rowData.length > 1 && isValidUrl(rowData[1])) {
            const tooltipContent = createTooltipContent(rowData[1]);
            return `
                <div class="tooltip-container">
                    <a href="${rowData[1]}" target="_blank">${content}</a>
                    <span class="tooltip-content">${tooltipContent}</span>
                </div>`;
        }
        // If it's the second column (URL column), we'll hide it with CSS
        if (columnIndex === 1) {
            return `<span class="url-column">${content}</span>`;
        }
        // For all other columns, return content as is
        return content;
    }

    // Function to sort data
    function sortData(data, order) {
        return [...data].sort((a, b) => {
            const nameA = (a[0] || '').toString().toLowerCase();
            const nameB = (b[0] || '').toString().toLowerCase();
            return order === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }

    // Function to filter and sort table rows
    function filterAndSortTable(searchTerm, sortOrder) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear current table content

        // First filter the data
        let filteredData = searchTerm 
            ? allTableData.filter(row => {
                const cellValue = row[0] ? row[0].toString().toLowerCase() : '';
                const search = searchTerm.toLowerCase();
                return cellValue.includes(search);
            })
            : allTableData;

        // Then sort the filtered data
        filteredData = sortData(filteredData, sortOrder);

        // Rebuild table with filtered and sorted data
        filteredData.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach((cell, columnIndex) => {
                const td = document.createElement('td');
                td.innerHTML = createCellContent(cell, columnIndex, rowData);
                if (columnIndex === 1) {
                    td.classList.add('url-column');
                }
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        });

        // Show no results message if no matches found
        if (filteredData.length === 0 && searchTerm) {
            const noResultsRow = document.createElement('tr');
            const noResultsCell = document.createElement('td');
            noResultsCell.colSpan = allTableData[0]?.length || 1;
            noResultsCell.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-search mb-2 d-block" style="font-size: 1.5rem;"></i>
                    No results found for "${searchTerm}"
                </div>`;
            noResultsRow.appendChild(noResultsCell);
            tableBody.appendChild(noResultsRow);
        }
    }

    // Function to read and process the Excel file
    async function processExcel() {
        try {
            const response = await fetch('datos.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert the worksheet to JSON with header: 1 to get array format
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
                throw new Error('No data found in the Excel file');
            }

            // Get the headers (first row)
            const headers = jsonData[0];
            
            // Create the header row
            const headerRow = document.createElement('tr');
            headers.forEach((header, index) => {
                const th = document.createElement('th');
                th.textContent = header;
                if (index === 1) {
                    th.classList.add('url-column');
                }
                headerRow.appendChild(th);
            });
            document.getElementById('tableHead').appendChild(headerRow);
            
            // Store data for filtering (excluding header row)
            allTableData = jsonData.slice(1);
            
            // Initial table render with default sorting (ascending)
            filterAndSortTable('', 'asc');

            // Add search input event listener
            const searchInput = document.getElementById('searchInput');
            const sortSelect = document.getElementById('sortOrder');
            let debounceTimeout;

            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    filterAndSortTable(e.target.value.trim(), currentSort);
                }, 300);
            });

            // Add sort select event listener
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                filterAndSortTable(searchInput.value.trim(), currentSort);
            });

        } catch (error) {
            console.error('Error processing Excel file:', error);
            document.querySelector('.container').innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Data</h4>
                    <p>Unable to load the Excel data. Please make sure the file exists and is in the correct format.</p>
                </div>`;
        }
    }

    // Start processing the Excel file
    processExcel();
}); 