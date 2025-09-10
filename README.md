# 🛡️ Fire Gear Tracker - Digital Inventory System

**Professional fire department equipment management system built with React and Supabase**

## ✅ **SUPABASE INTEGRATION COMPLETE**

**Status: CONNECTED & OPERATIONAL** 🟢
- **Project ID**: `xibhmevisztsdlpueutj`
- **Database**: PostgreSQL with Row Level Security
- **Tables**: `stations_fd2024`, `equipment_fd2024`, `inspections_fd2024`
- **Real-time**: Enabled for live updates

---

## 🚀 **Quick Start**

### **Live Demo**
The application is now running with full Supabase integration:
- ✅ **Real-time database** with PostgreSQL
- ✅ **Secure data storage** with RLS policies  
- ✅ **Multi-user support** with instant sync
- ✅ **Professional-grade backup** and reliability

### **Features**
- 📦 **Equipment Inventory** - Track all gear with serial numbers and history
- 📅 **NFPA Compliance** - Automated inspection scheduling and tracking
- 🏢 **Multi-Station** - Manage equipment across multiple locations
- 📊 **Analytics** - Equipment utilization and maintenance insights
- 🔔 **Smart Alerts** - Overdue inspections and critical notifications
- 📱 **Mobile Ready** - Access from any device, anywhere

---

## 🛠️ **Technical Stack**

### **Frontend**
- **React 18** with modern hooks and context
- **Tailwind CSS** with custom mission-control theme
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **React Icons** for consistent iconography

### **Backend**
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Enterprise-grade data protection
- **Edge Functions** - Serverless API endpoints
- **Automatic Backups** - Built-in data protection

### **Database Schema**
```sql
-- Stations (Fire Department Locations)
stations_fd2024 (id, name, address, phone, created_at, updated_at)

-- Equipment (Individual Items)
equipment_fd2024 (id, name, serial_number, manufacturer, model, 
                  category, subcategory, station_id, status, 
                  notes, history, created_at, updated_at)

-- Inspections (Compliance Tracking)
inspections_fd2024 (id, name, equipment_id, category, station_id,
                    template_id, due_date, last_completed, status,
                    notes, external_vendor, vendor_contact,
                    created_at, updated_at)
```

---

## 🎯 **Key Features**

### **Equipment Management**
- **Complete Inventory** - Name, serial number, manufacturer, model
- **Status Tracking** - In service, out of service, repair, training
- **Location Management** - Station assignments with transfer history
- **Maintenance History** - Full audit trail of all changes
- **Category Organization** - NFPA-compliant equipment categories

### **Inspection Compliance**
- **NFPA Templates** - Pre-built inspection schedules for all equipment types
- **Automated Alerts** - Smart notifications for upcoming and overdue inspections
- **Category Rules** - Bulk inspections for equipment categories
- **Vendor Management** - Track external inspection services
- **Compliance Reports** - Generate inspection checklists and documentation

### **Multi-Station Support**
- **Centralized Management** - Oversee all locations from one dashboard
- **Station-Specific Views** - Filter by location for focused management
- **Equipment Transfers** - Track movement between stations
- **Distributed Access** - Station-level permissions and access control

---

## 🔐 **Security & Compliance**

### **Data Protection**
- ✅ **Row Level Security** - Database-level access control
- ✅ **HTTPS Encryption** - All data encrypted in transit
- ✅ **Automatic Backups** - Point-in-time recovery available
- ✅ **Audit Trails** - Complete history of all changes

### **NFPA Compliance**
- ✅ **NFPA 1851** - Structural firefighting protective ensembles
- ✅ **NFPA 1852** - Selection, care, and maintenance of SCBA
- ✅ **NFPA 1911** - Inspection, maintenance, testing of fire apparatus
- ✅ **NFPA 1932** - Use, maintenance, and service testing of ladders
- ✅ **NFPA 1962** - Inspection, care, and use of fire hose

---

## 📊 **Dashboard Overview**

The main dashboard provides real-time insights:
- **Equipment Status** - Active, out of service, repair counts
- **Inspection Alerts** - Overdue and upcoming inspections
- **Station Overview** - Equipment distribution across locations
- **Recent Activity** - Latest equipment changes and updates
- **Quick Actions** - Fast access to common tasks

---

## 🚨 **Alert System**

Smart notifications keep you compliant:
- **🔴 Overdue** - Past due inspections requiring immediate attention
- **🟠 Critical** - Due within 1-3 days
- **🟡 Warning** - Due within 4-7 days  
- **🔵 Upcoming** - Due within 8-30 days
- **🟢 Current** - All inspections up to date

---

## 💻 **Development**

### **Local Development**
```bash
# Clone the repository
git clone <repository-url>
cd fire-gear-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Environment Variables**
The application uses Supabase credentials that are automatically configured in the Quest environment. No additional setup required.

---

## 📈 **Roadmap**

### **Upcoming Features**
- 📱 **Mobile App** - Native iOS and Android applications
- 📊 **Advanced Analytics** - Equipment lifecycle and cost analysis
- 🔗 **API Integration** - Connect with existing fire department systems
- 📋 **Custom Forms** - Configurable inspection checklists
- 👥 **User Management** - Role-based access and permissions
- 📄 **Report Builder** - Custom compliance and inventory reports

### **Integration Possibilities**
- **CAD Systems** - Computer-aided dispatch integration
- **Asset Management** - Enterprise asset tracking systems
- **Maintenance Software** - Preventive maintenance scheduling
- **Financial Systems** - Equipment cost and budget tracking

---

## 🏆 **Benefits**

### **For Fire Departments**
- **Reduce Compliance Violations** - Never miss another inspection
- **Save Administrative Time** - Eliminate paper logs and spreadsheets
- **Improve Equipment Readiness** - Real-time status of all gear
- **Enhance Safety** - Ensure all equipment is inspection-current
- **Lower Costs** - Prevent equipment failures through proper maintenance

### **For Fire Chiefs**
- **Complete Visibility** - Department-wide equipment overview
- **Compliance Confidence** - Automated NFPA compliance tracking
- **Budget Planning** - Equipment lifecycle and replacement forecasting
- **Risk Management** - Proactive maintenance and inspection scheduling
- **Operational Excellence** - Data-driven equipment management decisions

---

## 🤝 **Support**

For questions, feature requests, or technical support:
- **Documentation** - Comprehensive guides and tutorials
- **Video Training** - Step-by-step setup and usage videos  
- **Email Support** - Direct access to the development team
- **Community Forum** - Connect with other fire departments

---

**Built with ❤️ for the fire service community**

*Keeping our heroes safe through better equipment management*