# OpenText Partner Scraper

This project scrapes partners from the [OpenText Partner Directory](https://www.opentext.com/partners/partner-directory) and solutions from the [OpenText Partner Solutions Catalog](https://www.opentext.com/products-and-solutions/partners-and-alliances/partner-solutions-catalog).  
It then joins them by partner name (using fuzzy matching) and outputs JSON.

## Installation

```bash
npm install

npm start


---

## **Step 5 — Create example output.json**

```bash
cat > output.json << 'EOF'
[
  {
    "partner": "Accenture",
    "solution": "SAP Integration Suite"
  },
  {
    "partner": "Infosys Technologies",
    "solution": "Document Management Solution"
  },
  {
    "partner": "Cognizant Technology Solutions",
    "solution": "Cloud Migration Accelerator"
  },
  {
    "partner": "PwC",
    "solution": "Compliance Automation"
  }
]
