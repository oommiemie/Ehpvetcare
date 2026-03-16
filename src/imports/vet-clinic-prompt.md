Below is a **detailed English system prompt** you can use to design and develop a **Modern Veterinary Clinic Management System** with a strong focus on UX/UI, usability, and scalability.

---

# 🐾 Veterinary Clinic Management System

## Comprehensive System Design & UX/UI Prompt

---

## 1️⃣ System Overview

Design and develop a **Modern, Cloud-Based Veterinary Clinic Management System (VCMS)** that is:

* User-friendly and intuitive for veterinarians and staff
* Clean, modern, and professional
* Fast and responsive
* Optimized for daily clinical workflow
* Scalable for multi-doctor clinics
* Secure and role-based

The system must support:

* Pet registration
* Owner management
* EMR (Electronic Medical Record)
* Visit workflow (SOAP-based)
* Vaccine management
* Lab/X-ray ordering
* Medication prescribing
* Billing & financial system
* Appointment scheduling (real-time calendar)
* Grooming service
* Reporting & analytics
* Notification system
* Role-based access control

---

# 🎨 UX/UI DESIGN PRINCIPLES

## Design Style

* Clean, minimal, modern medical aesthetic
* Soft neutral background (light gray / white)
* Primary color: Blue (trust & healthcare)
* Secondary color: Green (success / vaccination)
* Accent color: Orange (alerts / pending items)
* Rounded corners (8–12px radius)
* Soft shadows
* Clear typography hierarchy
* Icon-based navigation
* Spacious layout (avoid clutter)

## Layout Structure

* Left Sidebar Navigation (collapsible)
* Top Header Bar (User info, search, notifications)
* Main Content Area (Card-based layout)
* Sticky PetInfo Header when inside Visit

---

# 📊 1. DASHBOARD

## Features:

* Total revenue today / month
* Total cases
* Vaccines today
* No-show rate
* Sales of medicine
* Profit summary
* Appointment summary
* Real-time counters

## UI Design:

* Card-based metric summary (4–6 top cards)
* Revenue graph (line chart)
* Cases by species (pie chart)
* Disease analysis (bar chart)
* Quick action buttons:

  * New Visit
  * New Appointment
  * New Registration

Export buttons:

* Excel
* PDF

---

# 👤 2. OWNER MANAGEMENT SYSTEM

## Features:

* Search owner (Name / Phone / ID Card)
* Add / Edit / Delete
* Multiple pets per owner

## Required Fields:

* Full Name (Required)
* Nickname
* Mobile Phone (Required)
* Line ID / Email
* Address (structured format)
* ID Card

## UX Flow:

* Split layout:

  * Left: Owner list with search
  * Right: Owner details form
* “Add New Owner” button (Modal or Slide Panel)
* Quick pet linking section

---

# 🐶 3. PET MANAGEMENT SYSTEM

## Features:

* Add / Edit / Delete pet
* Auto-generate HN (Year + Running number, no duplicate)
* Link multiple pets to one owner

## Required Fields:

* HN (Auto)
* Pet Name (Required)
* Species (Required)
* Breed (Required)
* Gender
* Weight
* Age
* Microchip ID
* Allergies
* Chronic disease
* Vaccine history
* Sterilization status
* Attach multiple images

## UI Design:

* Tab-based layout:

  * General Info
  * Medical Info
  * Vaccine
  * Surgery
  * Attachments
* Button: “Print Pet Card”
* Button: “Print OPD Card”

---

# 🏥 4. VISIT SYSTEM (Core Medical Workflow)

When selecting a pet → show **Sticky PetInfo Header**:

Pet Name | Species | Breed | Owner | Phone | HN

Use Tab Layout:

---

## 4.1 Visit Registration

* Symptoms
* Room selection (multi-room support)
* Doctor auto-filled from login
* Save & Print Visit Form
* Template support

---

## 4.2 Vital Signs

* Temperature
* Pulse
* Respiration
* Weight
* Chief Complaint (Template supported)
* Present Illness
* Duration
* Behavior notes
* Staff name auto-filled

---

## 4.3 Physical Examination

Section 1:

* Eyes (Normal/Abnormal + Text)
* Ears
* Nose
* Mouth/Gum
* General Notes
* Template creation
* Print Summary button

Section 2:

* Upload medical images
* Drawing tool over image
* Preloaded animal anatomy template

---

## 4.4 Diagnosis

* Differential Diagnosis
* Disease Code
* Re-diagnose previous condition
* Template support

---

## 4.5 Vaccination System

Separate screen for fast workflow.

* Vaccine name
* Batch No
* Expiry date
* Vet name
* Time
* Adverse reaction
* Auto next appointment calculation:

  * 21–30 days (puppy)
  * 1 year (adult)
* Send Line notification
* Print vaccine card

---

## 4.6 Lab / X-ray

* Free text test entry
* Note section
* Status:

  * Waiting
  * Sent
  * Pending result
  * Completed

---

## 4.7 Prescription System

* Drug search (Generic + Trade)
* Quantity
* Instruction text
* Indication
* Show price
* Re-med from history
* Template prescription
* Print:

  * Drug sticker
  * Prescription
  * PDF Preview

---

## 4.8 Service Charge System

* Service search
* Quantity
* Unit price
* Discount
* Doctor DF calculation
* Template service
* Real-time bill summary
* Print treatment summary

---

# 📅 5. APPOINTMENT SYSTEM

## Calendar Views:

* Daily
* Weekly
* Monthly

Color coding:

* Treatment = Blue
* Vaccine = Green
* Grooming = Purple
* Boarding = Orange

## Features:

* Create / Edit / Cancel / Reschedule
* Show No-show history
* Dashboard summary
* Filter by doctor
* Search by HN / Owner / Phone
* Send Line reminder (1–3 days before)
* Print appointment card
* Real-time availability check

---

# 💰 6. FINANCIAL SYSTEM

## Payment Methods:

* Cash
* Credit Card
* Bank Transfer
* Membership credit
* QR PromptPay

## Features:

* VAT 7%
* Invoice
* Tax Invoice
* Receipt preview
* Send via Line
* Refund / Deposit handling

## UI:

* Split layout:

  * Left: Treatment items
  * Right: Payment panel
* Real-time total calculation

---

# ✂️ 7. GROOMING SYSTEM

## Sections:

* Style selection
* Length (mm)
* Service type
* Animal size
* Extra charges
* Before/After images
* Behavior notes
* Difficulty level
* Next appointment
* Direct link to billing

---

# 📊 8. REPORT SYSTEM

## Operational Reports:

* Patients by species
* Vaccine report
* Drug usage
* Daily/Weekly/Monthly

## Management Reports:

* Profit & Loss
* Vet performance
* Loyal customers
* No-show rate

Export:

* Excel
* PDF

---

# 🔔 9. NOTIFICATION SYSTEM

Auto alerts:

* Vaccine due
* Drug near expiry
* Appointment today
* Boarding check-out

Send via:

* Line API
* In-app notification

---

# ⚙️ 10. BASIC DATA MANAGEMENT

* Drug master
* Service master
* Vaccine master
* Species master
* Breed master

Editable by Admin only.

---

# 👥 11. USER ROLE SYSTEM

Roles:

* Admin
* Veterinarian
* Staff

Permissions:

* Room access
* Financial access
* Edit/Delete permission
* View-only options

---

# 📱 PERFORMANCE & TECH REQUIREMENTS

* Responsive Web Application
* Cloud-ready
* Fast search (indexed database)
* Auto-save draft during visit
* Secure authentication (JWT or OAuth)
* Activity logs
* Data encryption

---

# ✨ UX ENHANCEMENT IDEAS

* Smart templates for faster workflow
* Recent pets quick access
* Keyboard shortcuts
* Color status indicators
* Drag & drop uploads
* Floating save button
* Confirmation dialog before delete
* Toast success notifications

---

# 🎯 Final Goal

Build a veterinary clinic system that:

* Reduces consultation time
* Minimizes billing errors
* Improves patient tracking
* Prevents duplicate HN
* Enhances customer satisfaction
* Reduces no-show rate
* Provides clear financial visibility

---

If you’d like, I can also:

* Convert this into a Product Requirement Document (PRD)
* Break into Agile sprint tasks
* Design database schema
* Create wireframe structure
* Create system flow diagram
* Design UI component library
* Or tailor it specifically for your health-system-style app architecture 😊
