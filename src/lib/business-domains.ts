export interface BusinessDomain {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  defaultTableName: string;
  columns: string[];
  sampleData: Record<string, string>[];
  suggestedQueries: { label: string; sql: string }[];
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  taxId: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  fiscalYearEnd: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "Apex Global Solutions",
  legalName: "Apex Global Solutions Inc.",
  taxId: "12-3456789",
  industry: "Enterprise SaaS & Logistics",
  website: "https://apexsolutions.io",
  email: "ops@apexsolutions.io",
  phone: "+1 (555) 987-6543",
  address: "100 Innovation Parkway, Suite 400",
  city: "San Francisco, CA 94105",
  country: "United States",
  currency: "USD",
  fiscalYearEnd: "December 31",
};

export const BUSINESS_DOMAINS: BusinessDomain[] = [
  {
    id: "companies",
    name: "Company Directory & Legal Entities",
    shortName: "Companies",
    icon: "Building2",
    description: "Legal entities, Tax IDs/EIN, headquarters addresses, and enterprise corporate profiles.",
    defaultTableName: "tbl_companies",
    columns: [
      "Company_ID",
      "Company_Name",
      "Legal_Entity",
      "Tax_ID",
      "Industry",
      "Website",
      "HQ_Address",
      "Annual_Revenue",
      "Employee_Count",
      "Status"
    ],
    sampleData: [
      {
        Company_ID: "CORP-101",
        Company_Name: "  apex enterprise software  ",
        Legal_Entity: "Apex Enterprise Software LLC",
        Tax_ID: "123456789",
        Industry: "Cloud Software / SaaS",
        Website: "apex-software.io",
        HQ_Address: "450 mission st floor 14, san francisco, ca",
        Annual_Revenue: "14500000",
        Employee_Count: "125",
        Status: "active"
      },
      {
        Company_ID: "CORP-102",
        Company_Name: "VORTEX LOGISTICS & SUPPLY",
        Legal_Entity: "VORTEX LOGISTICS CORP",
        Tax_ID: "98-7654321",
        Industry: "Freight & Transportation",
        Website: "http://vortexfreight.com",
        HQ_Address: "1200 HARBOR BLVD, LONG BEACH, CA 90802",
        Annual_Revenue: "$48,200,000.00",
        Employee_Count: "420",
        Status: "ACTIVE"
      },
      {
        Company_ID: "CORP-103",
        Company_Name: "bioGenix lab solutions",
        Legal_Entity: "BioGenix Lab Solutions Inc.",
        Tax_ID: "45-6789012",
        Industry: "Biotechnology & Healthcare",
        Website: "https://biogenixlabs.org/",
        HQ_Address: "88 Bio Parkway, Cambridge, MA",
        Annual_Revenue: "22000000.50",
        Employee_Count: "85",
        Status: "Active"
      },
      {
        Company_ID: "CORP-104",
        Company_Name: "quantum cybersecurity group",
        Legal_Entity: "Quantum Cyber Security Group LLC",
        Tax_ID: "551234567",
        Industry: "Information Security",
        Website: "quantumcyber.net",
        HQ_Address: "700 K Street NW, Washington, DC",
        Annual_Revenue: "$ 9,800,000",
        Employee_Count: "64",
        Status: "active"
      },
      {
        Company_ID: "CORP-105",
        Company_Name: "  apex enterprise software  ",
        Legal_Entity: "Apex Enterprise Software LLC",
        Tax_ID: "12-3456789",
        Industry: "Cloud Software",
        Website: "https://apex-software.io",
        HQ_Address: "450 Mission St, San Francisco, CA",
        Annual_Revenue: "14500000",
        Employee_Count: "125",
        Status: "Active"
      },
      {
        Company_ID: "CORP-106",
        Company_Name: "test shell company",
        Legal_Entity: "fake corp",
        Tax_ID: "00-0000000",
        Industry: "Testing",
        Website: "asdf.fake",
        HQ_Address: "none",
        Annual_Revenue: "$0.00",
        Employee_Count: "0",
        Status: "dissolved"
      }
    ],
    suggestedQueries: [
      {
        label: "Top Companies by Revenue",
        sql: "SELECT Company_Name, Industry, Annual_Revenue, Employee_Count FROM tbl_companies WHERE Status != 'Dissolved' ORDER BY CAST(REPLACE(REPLACE(Annual_Revenue, '$', ''), ',', '') AS FLOAT) DESC;"
      },
      {
        label: "Count Companies by Industry",
        sql: "SELECT Industry, count(*) as Total_Companies FROM tbl_companies GROUP BY Industry;"
      }
    ]
  },
  {
    id: "invoices",
    name: "Invoices & Accounts Payable",
    shortName: "Invoices",
    icon: "Receipt",
    description: "Vendor bills, accounts payable, tax calculations, and payment tracking.",
    defaultTableName: "tbl_invoices",
    columns: [
      "Invoice_ID",
      "Vendor_Name",
      "Tax_ID",
      "Issue_Date",
      "Due_Date",
      "Subtotal",
      "Tax_Rate",
      "Tax_Amount",
      "Total_Amount",
      "Payment_Status"
    ],
    sampleData: [
      {
        Invoice_ID: "inv_2025_001",
        Vendor_Name: "  apex enterprise software  ",
        Tax_ID: "123456789",
        Issue_Date: "04/01/2025",
        Due_Date: "2025-05-01",
        Subtotal: "12500.00",
        Tax_Rate: "8.5%",
        Tax_Amount: "1062.50",
        Total_Amount: "$13,562.50",
        Payment_Status: "paid"
      },
      {
        Invoice_ID: "INV-2025-002",
        Vendor_Name: "VORTEX LOGISTICS & SUPPLY",
        Tax_ID: "98-7654321",
        Issue_Date: "2025-04-05",
        Due_Date: "05/05/2025",
        Subtotal: "$4,200.00",
        Tax_Rate: "0.0%",
        Tax_Amount: "$0.00",
        Total_Amount: "4200",
        Payment_Status: "PENDING"
      },
      {
        Invoice_ID: "inv2025003",
        Vendor_Name: "BIOGENIX LAB SOLUTIONS",
        Tax_ID: "45-6789012",
        Issue_Date: "03-28-2025",
        Due_Date: "2025/04/28",
        Subtotal: "8950.50",
        Tax_Rate: "6%",
        Tax_Amount: "537.03",
        Total_Amount: "$ 9,487.53",
        Payment_Status: "overdue"
      },
      {
        Invoice_ID: "INV-2025-004",
        Vendor_Name: "quantum cybersecurity group",
        Tax_ID: "551234567",
        Issue_Date: "2025-04-10",
        Due_Date: "2025-05-10",
        Subtotal: "$15,000.00",
        Tax_Rate: "8.5%",
        Tax_Amount: "1275.00",
        Total_Amount: "16275",
        Payment_Status: "Paid"
      },
      {
        Invoice_ID: "INV-2025-005",
        Vendor_Name: "  apex enterprise software  ",
        Tax_ID: "123456789",
        Issue_Date: "04/01/2025",
        Due_Date: "2025-05-01",
        Subtotal: "12500.00",
        Tax_Rate: "8.5%",
        Tax_Amount: "1062.50",
        Total_Amount: "$13,562.50",
        Payment_Status: "PAID"
      }
    ],
    suggestedQueries: [
      {
        label: "Cross-Table JOIN: Invoices & Company HQ",
        sql: "SELECT i.Invoice_ID, i.Vendor_Name, c.Industry, c.HQ_Address, i.Total_Amount, i.Payment_Status FROM tbl_invoices i LEFT JOIN tbl_companies c ON lower(trim(i.Vendor_Name)) = lower(trim(c.Company_Name));"
      },
      {
        label: "Total Spend by Payment Status",
        sql: "SELECT Payment_Status, count(*) as Invoice_Count, sum(CAST(REPLACE(REPLACE(Total_Amount, '$', ''), ',', '') AS FLOAT)) as Total_Spend FROM tbl_invoices GROUP BY Payment_Status;"
      }
    ]
  },
  {
    id: "inventory",
    name: "Products & Warehouse Inventory",
    shortName: "Inventory",
    icon: "Package",
    description: "Catalog management, SKUs, inventory counts, unit economics, and reorder levels.",
    defaultTableName: "tbl_inventory",
    columns: [
      "SKU",
      "Product_Name",
      "Category",
      "Supplier_Name",
      "Unit_Cost",
      "Retail_Price",
      "In_Stock",
      "Reorder_Point",
      "Warehouse_Location"
    ],
    sampleData: [
      {
        SKU: "sku_hw_001",
        Product_Name: "  enterprise rack server 2u  ",
        Category: "Hardware",
        Supplier_Name: "Apex Enterprise Software",
        Unit_Cost: "$1,850.00",
        Retail_Price: "2499.00",
        In_Stock: "14",
        Reorder_Point: "20",
        Warehouse_Location: "aisle 4, bay b"
      },
      {
        SKU: "SKU-NET-042",
        Product_Name: "48-PORT GIGABIT POE SWITCH",
        Category: "NETWORKING",
        Supplier_Name: "Quantum Cybersecurity Group",
        Unit_Cost: "450.00",
        Retail_Price: "$699.50",
        In_Stock: "48",
        Reorder_Point: "15",
        Warehouse_Location: "AISLE 2, BAY A"
      },
      {
        SKU: "sku-bio-88",
        Product_Name: "micro centrifuge vial pack (500ct)",
        Category: "Lab Consumables",
        Supplier_Name: "BioGenix Lab Solutions",
        Unit_Cost: "$ 42.50",
        Retail_Price: "85.00",
        In_Stock: "350",
        Reorder_Point: "100",
        Warehouse_Location: "Cold Room 1"
      },
      {
        SKU: "SKU-CAB-102",
        Product_Name: "Cat6A Shielded Patch Cable 10ft",
        Category: "Cables & Access",
        Supplier_Name: "Vortex Logistics & Supply",
        Unit_Cost: "4.20",
        Retail_Price: "$12.00",
        In_Stock: "8",
        Reorder_Point: "50",
        Warehouse_Location: "Aisle 1, Bin 12"
      },
      {
        SKU: "sku_hw_001",
        Product_Name: "Enterprise Rack Server 2U",
        Category: "Hardware",
        Supplier_Name: "Apex Enterprise Software",
        Unit_Cost: "$1,850.00",
        Retail_Price: "$2,499.00",
        In_Stock: "14",
        Reorder_Point: "20",
        Warehouse_Location: "Aisle 4, Bay B"
      }
    ],
    suggestedQueries: [
      {
        label: "Low Stock Alert (Need Reorder)",
        sql: "SELECT SKU, Product_Name, Supplier_Name, In_Stock, Reorder_Point FROM tbl_inventory WHERE CAST(In_Stock AS INT) <= CAST(Reorder_Point AS INT);"
      },
      {
        label: "Inventory Asset Valuation",
        sql: "SELECT Category, count(*) as Items, sum(CAST(In_Stock AS INT) * CAST(REPLACE(REPLACE(Unit_Cost, '$', ''), ',', '') AS FLOAT)) as Inventory_Asset_Value FROM tbl_inventory GROUP BY Category;"
      }
    ]
  },
  {
    id: "employees",
    name: "HR Directory & Employee Payroll",
    shortName: "HR & Payroll",
    icon: "Users",
    description: "Personnel directory, departments, salary bands, job titles, and hire dates.",
    defaultTableName: "tbl_employees",
    columns: [
      "Employee_ID",
      "Full_Name",
      "Department",
      "Job_Title",
      "Work_Email",
      "Phone_Number",
      "Salary",
      "Hire_Date",
      "Status"
    ],
    sampleData: [
      {
        Employee_ID: "EMP-401",
        Full_Name: "  SARAH CONNOR  ",
        Department: "engineering",
        Job_Title: "Principal Security Architect",
        Work_Email: "sarah.connor@apexsolutions.io",
        Phone_Number: "555.234.5678",
        Salary: "$165,000.00",
        Hire_Date: "03/15/2021",
        Status: "active"
      },
      {
        Employee_ID: "EMP-402",
        Full_Name: "marcus vANCE",
        Department: "FINANCE",
        Job_Title: "director of financial planning",
        Work_Email: "m.vance@apexsolutions.io",
        Phone_Number: "(555) 345-6789",
        Salary: "142000",
        Hire_Date: "2020-08-10",
        Status: "ACTIVE"
      },
      {
        Employee_ID: "EMP-403",
        Full_Name: "PRIYA PATEL",
        Department: "Product Management",
        Job_Title: "Sr. Group Product Lead",
        Work_Email: "priya@apexsolutions.io",
        Phone_Number: "5554567890",
        Salary: "$ 155,500.00",
        Hire_Date: "2022/05/18",
        Status: "Active"
      },
      {
        Employee_ID: "EMP-404",
        Full_Name: "alexander kim",
        Department: "sales & enterprise",
        Job_Title: "account executive enterprise",
        Work_Email: "alex.kim@apexsolutions.io",
        Phone_Number: "+1 (555) 567-8901",
        Salary: "110000.00",
        Hire_Date: "01-10-2023",
        Status: "active"
      },
      {
        Employee_ID: "EMP-405",
        Full_Name: "SARAH CONNOR",
        Department: "Engineering",
        Job_Title: "Principal Security Architect",
        Work_Email: "sarah.connor@apexsolutions.io",
        Phone_Number: "+1 (555) 234-5678",
        Salary: "$165,000.00",
        Hire_Date: "2021-03-15",
        Status: "Active"
      }
    ],
    suggestedQueries: [
      {
        label: "Department Headcount & Average Salary",
        sql: "SELECT Department, count(*) as Headcount, round(avg(CAST(REPLACE(REPLACE(Salary, '$', ''), ',', '') AS FLOAT)), 2) as Avg_Salary, sum(CAST(REPLACE(REPLACE(Salary, '$', ''), ',', '') AS FLOAT)) as Total_Payroll FROM tbl_employees GROUP BY Department;"
      }
    ]
  },
  {
    id: "leads",
    name: "B2B CRM & Customer Accounts",
    shortName: "CRM & Leads",
    icon: "Briefcase",
    description: "Sales pipelines, deal stages, account representatives, and contract value.",
    defaultTableName: "tbl_leads",
    columns: [
      "Lead_ID",
      "Customer_Name",
      "Company",
      "Work_Email",
      "Phone",
      "Deal_Value",
      "Stage",
      "Assigned_Rep",
      "Created_Date"
    ],
    sampleData: [
      {
        Lead_ID: "LEAD-701",
        Customer_Name: "BRUCE WAYNE",
        Company: "Wayne Enterprises",
        Work_Email: "bruce@wayne.org",
        Phone: "555.789.0123",
        Deal_Value: "$250,000.00",
        Stage: "negotiation",
        Assigned_Rep: "Alex Kim",
        Created_Date: "04/02/2025"
      },
      {
        Lead_ID: "LEAD-702",
        Customer_Name: "tony stark",
        Company: "STARK INDUSTRIES",
        Work_Email: "tony@stark.io",
        Phone: "(555) 890-1234",
        Deal_Value: "500000",
        Stage: "PROPOSAL SENT",
        Assigned_Rep: "Alex Kim",
        Created_Date: "2025-04-11"
      },
      {
        Lead_ID: "LEAD-703",
        Customer_Name: "DIANA PRINCE",
        Company: "Themyscira Cultural Trust",
        Work_Email: "diana@themyscira.gov",
        Phone: "5559012345",
        Deal_Value: "$ 75,000.00",
        Stage: "discovery",
        Assigned_Rep: "Marcus Vance",
        Created_Date: "2025/03/29"
      }
    ],
    suggestedQueries: [
      {
        label: "Pipeline Value by Deal Stage",
        sql: "SELECT Stage, count(*) as Deals, sum(CAST(REPLACE(REPLACE(Deal_Value, '$', ''), ',', '') AS FLOAT)) as Pipeline_Value FROM tbl_leads GROUP BY Stage;"
      }
    ]
  },
  {
    id: "students",
    name: "School & Academic Registry",
    shortName: "School Registry",
    icon: "GraduationCap",
    description: "Student roster, guardian details, grade levels, tuition payments, and enrollment status.",
    defaultTableName: "tbl_school_students",
    columns: [
      "Student_ID",
      "Student_Name",
      "Grade",
      "Parent_Name",
      "Parent_Email",
      "Parent_Phone",
      "Date_Of_Birth",
      "Tuition_Fee",
      "Status"
    ],
    sampleData: [
      {
        Student_ID: "STU-201",
        Student_Name: "  EMILY WATSON  ",
        Grade: "Grade 10",
        Parent_Name: "ROBERT WATSON",
        Parent_Email: "robert.watson@gmail.com",
        Parent_Phone: "(555) 321-4567",
        Date_Of_Birth: "05/14/2010",
        Tuition_Fee: "$1200.00",
        Status: "enrolled"
      },
      {
        Student_ID: "STU-202",
        Student_Name: "lUcas gARCIA",
        Grade: "10th",
        Parent_Name: "MARIA GARCIA",
        Parent_Email: "  maria.garcia@outlook.com  ",
        Parent_Phone: "555.432.5678",
        Date_Of_Birth: "2010-09-22",
        Tuition_Fee: "1200",
        Status: "ENROLLED"
      },
      {
        Student_ID: "STU-203",
        Student_Name: "LIAM JOHNSON",
        Grade: "Grade 9",
        Parent_Name: "DAVID JOHNSON",
        Parent_Email: "david.j@yahoo.com",
        Parent_Phone: "5555436789",
        Date_Of_Birth: "03-12-2011",
        Tuition_Fee: "$ 850.50",
        Status: "pending"
      },
      {
        Student_ID: "STU-204",
        Student_Name: "sophia CHEN",
        Grade: "9th",
        Parent_Name: "WEI CHEN",
        Parent_Email: "wei.chen@techcorp.io",
        Parent_Phone: "555-654-7890",
        Date_Of_Birth: "2011/11/05",
        Tuition_Fee: "$850.00",
        Status: "enrolled"
      },
      {
        Student_ID: "STU-205",
        Student_Name: "EMILY WATSON",
        Grade: "10th Grade",
        Parent_Name: "ROBERT WATSON",
        Parent_Email: "robert.watson@gmail.com",
        Parent_Phone: "(555) 321-4567",
        Date_Of_Birth: "05/14/2010",
        Tuition_Fee: "$1200.00",
        Status: "ENROLLED"
      }
    ],
    suggestedQueries: [
      {
        label: "Tuition Breakdown by Grade",
        sql: "SELECT Grade, count(*) as Students, sum(CAST(REPLACE(REPLACE(Tuition_Fee, '$', ''), ',', '') AS FLOAT)) as Total_Tuition FROM tbl_school_students GROUP BY Grade;"
      }
    ]
  }
];
