export interface DataRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  amount: string;
  status: string;
}

export const SAMPLE_MESSY_DATA: DataRow[] = [
  {
    id: "1",
    name: "  john doe  ",
    email: "JOHNDOE@GMAIL.COM",
    phone: "5550192834",
    date: "04/15/2025",
    amount: "$1,250.00",
    status: "active",
  },
  {
    id: "2",
    name: "SARAH CONNOR",
    email: "sarah.c@cyberdyne.org",
    phone: "+1 (555) 234-5678",
    date: "2025-04-15",
    amount: "3400.5",
    status: "PAID",
  },
  {
    id: "3",
    name: "  john doe  ", // Exact duplicate of #1
    email: "johndoe@gmail.com",
    phone: "(555) 019-2834",
    date: "15-Apr-2025",
    amount: "1250",
    status: "active",
  },
  {
    id: "4",
    name: "mIkE wAZOWSKI",
    email: "test@test.com", // Fake anomaly email!
    phone: "555.345.6789",
    date: "04/18/2025",
    amount: "$85.00",
    status: "pending",
  },
  {
    id: "5",
    name: "alice smith",
    email: "alice@acme.co ",
    phone: "15554567890",
    date: "2025/04/20",
    amount: "$450.00",
    status: "Completed",
  },
  {
    id: "6",
    name: "bob johnson",
    email: "bob.j@corp.net",
    phone: "555-567-8901",
    date: "22-04-2025",
    amount: "2100",
    status: "paid",
  },
  {
    id: "7",
    name: "alice smith", // Duplicate email/name of #5
    email: "ALICE@ACME.CO",
    phone: "+1-555-456-7890",
    date: "04/20/2025",
    amount: "$450.00",
    status: "completed",
  },
  {
    id: "8",
    name: "EMILY WATSON",
    email: "emily.w@studio.io",
    phone: "(555) 678-9012",
    date: "2025-04-25",
    amount: "$890.00",
    status: "Active",
  },
];

export const RAW_SAMPLE_CSV = `Name,Email,Phone,Date,Amount,Status
  john doe  ,JOHNDOE@GMAIL.COM,5550192834,04/15/2025,"$1,250.00",active
SARAH CONNOR,sarah.c@cyberdyne.org,+1 (555) 234-5678,2025-04-15,3400.5,PAID
  john doe  ,johndoe@gmail.com,(555) 019-2834,15-Apr-2025,1250,active
mIkE wAZOWSKI,test@test.com,555.345.6789,04/18/2025,$85.00,pending
alice smith,alice@acme.co ,15554567890,2025/04/20,$450.00,Completed
bob johnson,bob.j@corp.net,555-567-8901,22-04-2025,2100,paid
alice smith,ALICE@ACME.CO,+1-555-456-7890,04/20/2025,$450.00,completed
EMILY WATSON,emily.w@studio.io,(555) 678-9012,2025-04-25,$890.00,Active`;
