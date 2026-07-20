const dummyAttendanceDates = [
  { date: '2026-07-20' },
  { date: '2026-07-21' },
  { date: '2026-07-22' },
  { date: '2026-07-23' },
  { date: '2026-07-24' },
  { date: '2026-07-27' },
  { date: '2026-07-28' },
];

const dummyData = {
  attendanceData: {
    data: {
      data: dummyAttendanceDates,
      success: true,
    }
  },

  markAttendance: {
    data: {
      success: true,
      msg: 'Attendance marked successfully',
    }
  },

  loginResponse: {
    success: true,
    accessToken: 'dummy_access_token_12345',
    refreshToken: 'dummy_refresh_token_67890',
    data: {
      success: true,
      accessToken: 'dummy_access_token_12345',
      refreshToken: 'dummy_refresh_token_67890',
      user: {
        id: 25863,
        technician_id: 25863,
        city_id: 1,
        technician_name: 'Demo Technician',
        technician_mobile: '9876543210',
        email: 'demo@example.com',
        login_status: 'Online',
        profile_photo: null,
      }
    }
  },

  profileData: {
    data: {
      success: true,
      data: [{
        id: 25863,
        technician_id: 25863,
        city_id: 1,
        technician_name: 'Demo Technician',
        technician_mobile: '9876543210',
        email: 'demo@example.com',
        technician_address: 'B-123, Sector 63, Noida, Uttar Pradesh - 201301',
        date: '2026-01-15',
        login_status: 'Online',
        profile_photo: null,
        technician_type: 'Service Partner',
        technician_flat_value: '500',
        per_product: '60',
        per_service: '40',
        per_amc: '30',
        part_per: '50%',
        aadhar: null,
        dl: null,
        cheque: null,
        stamp: null,
        resume: null,
      }]
    }
  },

  dashboardCount: {
    data: {
      success: true,
      all: 12,
      cancel: 2,
      assign: 3,
      onworking: 4,
      completed: 3,
      amc: 5,
      bucket: 8,
      prebooking: 2,
      payout: 2500,
      wallet_balance: 2500,
      allQr: 20,
      usedQr: 10,
      unusedQr: 10,
      notifications: 3,
    }
  },

  services: {
    data: {
      success: true,
      data: [
        { id: 1, service_name: 'RO', assigned: 1 },
        { id: 2, service_name: 'AC', assigned: 1 },
        { id: 3, service_name: 'Fridge', assigned: 0 },
        { id: 4, service_name: 'Microwave', assigned: 1 },
        { id: 5, service_name: 'Washing Machine', assigned: 0 },
        { id: 6, service_name: 'Geyser', assigned: 1 },
        { id: 7, service_name: 'Chimney', assigned: 1 },
        { id: 8, service_name: 'TV', assigned: 0 },
        { id: 9, service_name: 'Computer', assigned: 1 },
        { id: 10, service_name: 'Water Pump', assigned: 0 },
        { id: 11, service_name: 'Inverter', assigned: 1 },
      ]
    }
  },

  sparePartCategories: {
    data: {
      data: [
        { id: 1, service_name: 'RO', image: 'https://picsum.photos/seed/ro/300/300' },
        { id: 2, service_name: 'AC', image: 'https://picsum.photos/seed/ac/300/300' },
        { id: 3, service_name: 'Fridge', image: 'https://picsum.photos/seed/fridge/300/300' },
        { id: 4, service_name: 'Microwave', image: 'https://picsum.photos/seed/microwave/300/300' },
        { id: 5, service_name: 'Washing Machine', image: 'https://picsum.photos/seed/washing-machine/300/300' },
        { id: 6, service_name: 'Geyser', image: 'https://picsum.photos/seed/geyser/300/300' },
      ]
    }
  },

  spareParts: {
    data: {
      success: true,
      data: [
        { id: 1, part_name: 'RO Membrane', part_price: '1200', part_code: 'RM-001', part_image: 'https://picsum.photos/seed/ro-membrane/200/200', description: 'High-quality RO membrane for water purifiers' },
        { id: 2, part_name: 'AC Compressor', part_price: '3500', part_code: 'AC-002', part_image: 'https://picsum.photos/seed/ac-compressor/200/200', description: '1.5 Ton AC compressor with copper winding' },
        { id: 3, part_name: 'Filter Cartridge', part_price: '450', part_code: 'FC-003', part_image: 'https://picsum.photos/seed/filter-cartridge/200/200', description: 'Universal sediment filter cartridge' },
        { id: 4, part_name: 'Cooling Fan', part_price: '800', part_code: 'CF-004', part_image: 'https://picsum.photos/seed/cooling-fan/200/200', description: 'Replacement cooling fan for AC outdoor unit' },
        { id: 5, part_name: 'Thermostat', part_price: '600', part_code: 'TH-005', part_image: 'https://picsum.photos/seed/thermostat/200/200', description: 'Adjustable mechanical thermostat' },
        { id: 6, part_name: 'Heating Element', part_price: '350', part_code: 'HE-006', part_image: 'https://picsum.photos/seed/heating-element/200/200', description: '1500W heating element for geysers' },
        { id: 7, part_name: 'Door Gasket', part_price: '250', part_code: 'DG-007', part_image: 'https://picsum.photos/seed/door-gasket/200/200', description: 'Magnetic door gasket for refrigerators' },
        { id: 8, part_name: 'Condenser Coil', part_price: '1200', part_code: 'CC-008', part_image: 'https://picsum.photos/seed/condenser-coil/200/200', description: 'Copper condenser coil for AC' },
        { id: 9, part_name: 'Drain Pump', part_price: '900', part_code: 'DP-009', part_image: 'https://picsum.photos/seed/drain-pump/200/200', description: 'Automatic drain pump for washing machines' },
        { id: 10, part_name: 'UV Lamp', part_price: '750', part_code: 'UV-010', part_image: 'https://picsum.photos/seed/uv-lamp/200/200', description: 'UV sterilization lamp for RO systems' },
      ]
    }
  },

  pendingComplaints: {
    data: {
      success: true,
      result: [
        { id: 1, customer_name: 'Rahul Sharma', csn: 'CSN001', service_name: 'RO Service', service: 'RO', service_address: '123, MG Road, Mumbai', slot_date: '2024-01-20', slot_time: '10:00 AM', status: 'pending', tot_amt: '0', customer_mobile: '9876543210' },
        { id: 2, customer_name: 'Priya Patel', csn: 'CSN002', service_name: 'AC Repair', service: 'AC', service_address: '456, Link Road, Delhi', slot_date: '2024-01-21', slot_time: '02:00 PM', status: 'pending', tot_amt: '500', customer_mobile: '8765432109' },
        { id: 3, customer_name: 'Amit Singh', csn: 'CSN003', service_name: 'Fridge Service', service: 'Fridge', service_address: '789, SVP Road, Ahmedabad', slot_date: '2024-01-22', slot_time: '11:00 AM', status: 'pending', tot_amt: '0', customer_mobile: '7654321098' },
      ]
    }
  },

  pendingComplaintCount: {
    data: {
      success: true,
      Pendingcomplaints: 3,
    }
  },

  acceptComplaint: {
    data: {
      success: true,
      msg: 'Complaint accepted successfully',
    }
  },

  complaintsList: {
    data: {
      success: true,
      result: [
        { id: 1, csn: 'CSN001', customer_name: 'Rahul Sharma', service_name: 'RO Service', service: 'RO Water Purifier', status: 'assign', complaint_type: 'Service', slot_date: '20 Jul 2026', slot_time: '10:00 AM', area: 'MG Road', city: 'Mumbai', remark: 'Water purifier not working, no water output', customer_mobile: '9876543210', verify_otp: '0', upload_image: '0', date_time: '2026-07-20 10:00:00', latitude: '19.0760', longitude: '72.8777', tot_amt: '0', days: '2', review: '', image: 'https://picsum.photos/seed/comp-ro/400/300' },
        { id: 2, csn: 'CSN002', customer_name: 'Priya Patel', service_name: 'AC Repair', service: 'AC Split 1.5 Ton', status: 'assign', complaint_type: 'Service', slot_date: '21 Jul 2026', slot_time: '02:00 PM', area: 'Link Road', city: 'Delhi', remark: 'AC not cooling properly, gas leak suspected', customer_mobile: '8765432109', verify_otp: '1', upload_image: '0', date_time: '2026-07-21 14:00:00', latitude: '28.7041', longitude: '77.1025', tot_amt: '500', days: '3', review: '', image: 'https://picsum.photos/seed/comp-ac/400/300' },
        { id: 3, csn: 'CSN003', customer_name: 'Amit Singh', service_name: 'Fridge Service', service: 'Refrigerator Double Door', status: 'assign', complaint_type: 'AMC', slot_date: '22 Jul 2026', slot_time: '11:00 AM', area: 'SVP Road', city: 'Ahmedabad', remark: 'Fridge not cooling, compressor making noise', customer_mobile: '7654321098', verify_otp: '0', upload_image: '1', date_time: '2026-07-22 11:00:00', latitude: '23.0225', longitude: '72.5714', tot_amt: '0', days: '1', review: '', image: 'https://picsum.photos/seed/comp-fridge/400/300' },
        { id: 4, csn: 'CSN004', customer_name: 'Sneha Reddy', service_name: 'Washing Machine', service: 'Front Load Washing Machine', status: 'onworking', complaint_type: 'Service', slot_date: '23 Jul 2026', slot_time: '09:00 AM', area: 'Jubilee Hills', city: 'Hyderabad', remark: 'Drum making noise during spin cycle', customer_mobile: '6543210987', verify_otp: '1', upload_image: '0', date_time: '2026-07-23 09:00:00', latitude: '17.4319', longitude: '78.4096', tot_amt: '1200', days: '0', review: '', image: 'https://picsum.photos/seed/comp-wm/400/300' },
        { id: 5, csn: 'CSN005', customer_name: 'Vikram Joshi', service_name: 'RO Installation', service: 'RO Water Purifier', status: 'onworking', complaint_type: 'Installation', slot_date: '24 Jul 2026', slot_time: '08:00 AM', area: 'BTM Layout', city: 'Bangalore', remark: 'New RO system installation with plumbing', customer_mobile: '5432109876', verify_otp: '0', upload_image: '0', date_time: '2026-07-24 08:00:00', latitude: '12.8910', longitude: '77.6063', tot_amt: '2500', days: '0', review: '', image: 'https://picsum.photos/seed/comp-ro-install/400/300' },
        { id: 6, csn: 'CSN006', customer_name: 'Neha Kapoor', service_name: 'AC Service', service: 'AC Window 1 Ton', status: 'onworking', complaint_type: 'Service', slot_date: '25 Jul 2026', slot_time: '03:00 PM', area: 'Civil Lines', city: 'Jaipur', remark: 'AC not turning on, possible capacitor issue', customer_mobile: '4321098765', verify_otp: '0', upload_image: '0', date_time: '2026-07-25 15:00:00', latitude: '26.9124', longitude: '75.7873', tot_amt: '0', days: '0', review: '', image: 'https://picsum.photos/seed/comp-ac-window/400/300' },
        { id: 7, csn: 'CSN007', customer_name: 'Arun Mehta', service_name: 'Geyser Repair', service: 'Geyser 25L', status: 'onworking', complaint_type: 'Service', slot_date: '26 Jul 2026', slot_time: '10:30 AM', area: 'MG Road', city: 'Pune', remark: 'Water not heating, thermostat may be faulty', customer_mobile: '3210987654', verify_otp: '1', upload_image: '0', date_time: '2026-07-26 10:30:00', latitude: '18.5204', longitude: '73.8567', tot_amt: '350', days: '0', review: '', image: 'https://picsum.photos/seed/comp-geyser/400/300' },
        { id: 8, csn: 'CSN008', customer_name: 'Divya Sharma', service_name: 'Microwave Repair', service: 'Microwave 28L', status: 'success', complaint_type: 'Service', slot_date: '27 Jul 2026', slot_time: '11:00 AM', area: 'Model Town', city: 'Chandigarh', remark: 'Microwave sparking inside, door switch replaced', customer_mobile: '2109876543', verify_otp: '0', upload_image: '1', date_time: '2026-07-27 11:00:00', latitude: '30.7333', longitude: '76.7794', tot_amt: '1800', days: '5', review: 'Excellent service', image: 'https://picsum.photos/seed/comp-microwave/400/300' },
        { id: 9, csn: 'CSN009', customer_name: 'Karan Gupta', service_name: 'WM Repair', service: 'Top Load Washing Machine', status: 'success', complaint_type: 'Service', slot_date: '28 Jul 2026', slot_time: '02:00 PM', area: 'Sector 62', city: 'Noida', remark: 'Water leakage from bottom, drain pump replaced', customer_mobile: '1098765432', verify_otp: '1', upload_image: '1', date_time: '2026-07-28 14:00:00', latitude: '28.5855', longitude: '77.3100', tot_amt: '2200', days: '7', review: 'Good work', image: 'https://picsum.photos/seed/comp-wm-leak/400/300' },
        { id: 10, csn: 'CSN010', customer_name: 'Pooja Verma', service_name: 'RO Service', service: 'RO Water Purifier', status: 'success', complaint_type: 'Service', slot_date: '29 Jul 2026', slot_time: '09:00 AM', area: 'Lake Town', city: 'Kolkata', remark: 'Bad taste in water, membrane and filters changed', customer_mobile: '9988776655', verify_otp: '0', upload_image: '1', date_time: '2026-07-29 09:00:00', latitude: '22.5726', longitude: '88.3639', tot_amt: '3500', days: '10', review: 'Water taste improved', image: 'https://picsum.photos/seed/comp-ro-taste/400/300' },
        { id: 11, csn: 'CSN011', customer_name: 'Rohan Desai', service_name: 'AC Installation', service: 'AC Split 2 Ton', status: 'cancel', complaint_type: 'Installation', slot_date: '30 Jul 2026', slot_time: '08:00 AM', area: 'Banjara Hills', city: 'Hyderabad', remark: 'Customer cancelled due to personal reasons', customer_mobile: '8877665544', verify_otp: '0', upload_image: '0', date_time: '2026-07-30 08:00:00', latitude: '17.4156', longitude: '78.4347', tot_amt: '0', days: '0', review: '', image: 'https://picsum.photos/seed/comp-cancel1/400/300' },
        { id: 12, csn: 'CSN012', customer_name: 'Ananya Iyer', service_name: 'Fridge Repair', service: 'Refrigerator Side-by-Side', status: 'cancel', complaint_type: 'Service', slot_date: '31 Jul 2026', slot_time: '10:00 AM', area: 'Jayanagar', city: 'Bangalore', remark: 'Customer rescheduled, will rebook later', customer_mobile: '7766554433', verify_otp: '0', upload_image: '0', date_time: '2026-07-31 10:00:00', latitude: '12.9250', longitude: '77.5938', tot_amt: '0', days: '2', review: '', image: 'https://picsum.photos/seed/comp-cancel2/400/300' },
      ],
      page: '1',
      limit: 20,
    }
  },

  complaintDetail: {
    data: {
      success: true,
      result: {
        id: 101,
        csn: 'CSN001',
        complaint_id: 101,
        customer_name: 'Rahul Sharma',
        service_name: 'RO Service',
        service: 'RO Service',
        service_address: '123, MG Road, Mumbai - 400001',
        complaint_type: 'Service',
        status: 'assign',
        slot_date: '2026-07-20',
        slot_time: '10:00 AM',
        area: 'MG Road',
        city: 'Mumbai',
        remark: 'Water purifier not working properly',
        customer_mobile: '9876543210',
        verify_otp: '1',
        upload_image: '0',
        date_time: '2026-07-20 10:00:00',
        latitude: '19.0760',
        longitude: '72.8777',
        customer_id: 'CUST001',
        address: '123, MG Road, Mumbai - 400001',
        pincode: '400001',
        warranty_days: 25,
        days: 25,
        product_name: 'RO Water Purifier',
        model_no: 'RO-1000',
        brand_name: 'AquaPure',
        purchase_date: '2025-06-15',
        service_charge: '500',
        parts_charge: '1200',
        total_amount: '1700',
        total_paid_amt: '1600',
        discount: '100',
        net_amount: '1600',
        payment_status: 'paid',
        payment_mode: 'online',
        billing_date: '2026-07-20',
        invoice_no: 'INV-2026-001',
        invoice: 'https://example.com/invoice.pdf',
        pdf_url: 'https://example.com/invoice.pdf',
        attended_by: 'Demo Technician',
        attended_date: '2026-07-20',
        completion_date: '2026-07-20',
        feedback: 'Good service',
        rating: '4.5 / 5',
        review: 'Technician was prompt and professional. Fixed the RO issue quickly.',
        advance_amount: '0',
        pending_amount: '0',
        platform_fee: '50',
        recomplaint: 'No',
        commission: [
          { fund: '1500', tech_fund: '900', admin_fund: '600' },
        ],
        parts: [
          { id: 1, part_name: 'RO Membrane', qr_code: 'QR-RO-001', part_price: '800', part_image: 'https://picsum.photos/seed/ro-membrane/200/200' },
          { id: 2, part_name: 'Filter Cartridge', qr_code: 'QR-FC-002', part_price: '350', part_image: 'https://picsum.photos/seed/filter-cartridge/200/200' },
          { id: 3, part_name: 'Connector Pipe', qr_code: 'QR-CP-003', part_price: '150', part_image: 'https://picsum.photos/seed/connector-pipe/200/200' },
        ],
      }
    }
  },

  sendOTP: {
    data: {
      success: true,
      otp: '12345',
      msg: 'OTP sent successfully',
    }
  },

  verifyOTP: {
    data: {
      success: true,
      msg: 'OTP verified successfully',
      result: [{
        customer_name: 'Rahul Sharma',
        contact_no: '9876543210',
        id: '1',
      }]
    }
  },

  uploadImage: {
    data: {
      success: true,
      msg: 'Image uploaded successfully',
    }
  },

  getComplaintImages: {
    data: {
      success: true,
      result: [
        { id: 1, image: 'https://via.placeholder.com/300', status: '2' },
      ]
    }
  },

  deleteImage: {
    data: {
      success: true,
      msg: 'Image deleted successfully',
    }
  },

  updateRemark: {
    data: {
      success: true,
      msg: 'Remark updated successfully',
    }
  },

  reverseComplaint: {
    data: {
      success: true,
      msg: 'Complaint reversed successfully',
    }
  },

  complaintBilling: {
    data: {
      success: true,
      msg: 'Billing completed successfully',
      billing_id: 'BILL001',
    }
  },

  amcBilling: {
    data: {
      success: true,
      msg: 'AMC billing completed successfully',
      billing_id: 'AMCBILL001',
    }
  },

  technicianParts: [
    { id: 1, part_name: 'RO Membrane', part_code: 'RM-001', quantity: 10, price: '1200' },
    { id: 2, part_name: 'AC Compressor', part_code: 'AC-002', quantity: 5, price: '3500' },
    { id: 3, part_name: 'Filter Cartridge', part_code: 'FC-003', quantity: 20, price: '450' },
    { id: 4, part_name: 'Cooling Fan', part_code: 'CF-004', quantity: 8, price: '800' },
  ],

  bucketPartCount: { total: 12, all: 12, admin: 4, technician: 4, market: 4, transfered: 3, received: 6 },

  partTransfer: {
    data: {
      success: true,
      msg: 'Part transferred successfully',
    }
  },

  bucketParts: {
    data: {
      success: true,
      data: [
        { id: 1, part_name: 'RO Membrane', part_price: '1200', part_image: 'https://picsum.photos/seed/ro-membrane/200/200', qr_code: 'QR-MKT-001', description: 'High quality RO membrane for water purification', transfer_by: 'market', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 2, part_name: 'AC Compressor', part_price: '3500', part_image: 'https://picsum.photos/seed/ac-compressor/200/200', qr_code: 'QR-MKT-002', description: '1.5 ton AC compressor for split AC', transfer_by: 'market', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 3, part_name: 'Carbon Filter', part_price: '450', part_image: 'https://picsum.photos/seed/carbon-filter/200/200', qr_code: 'QR-MKT-003', description: 'Activated carbon filter for RO system', transfer_by: 'market', technician_name: 'Rahul Sharma', part_accept: '0', tech_id: '101', imageUrl: null },
        { id: 4, part_name: 'UV Lamp', part_price: '800', part_image: 'https://picsum.photos/seed/uv-lamp/200/200', qr_code: 'QR-MKT-004', description: 'UV sterilization lamp for water purifier', transfer_by: 'market', technician_name: null, part_accept: '0', tech_id: null, imageUrl: null },
        { id: 5, part_name: 'Cooling Fan', part_price: '650', part_image: 'https://picsum.photos/seed/cooling-fan/200/200', qr_code: 'QR-TECH-001', description: 'Replacement cooling fan for AC outdoor unit', transfer_by: 'technician', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 6, part_name: 'Thermostat', part_price: '350', part_image: 'https://picsum.photos/seed/thermostat/200/200', qr_code: 'QR-TECH-002', description: 'Digital thermostat for refrigerator', transfer_by: 'technician', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 7, part_name: 'Door Gasket', part_price: '280', part_image: 'https://picsum.photos/seed/door-gasket/200/200', qr_code: 'QR-TECH-003', description: 'Magnetic door gasket seal for refrigerator', transfer_by: 'technician', technician_name: 'Priya Patel', part_accept: '0', tech_id: '102', imageUrl: null },
        { id: 8, part_name: 'Heating Element', part_price: '550', part_image: 'https://picsum.photos/seed/heating-element/200/200', qr_code: 'QR-TECH-004', description: 'Heating element for geyser 25L', transfer_by: 'technician', technician_name: null, part_accept: '0', tech_id: null, imageUrl: null },
        { id: 9, part_name: 'Sediment Filter', part_price: '180', part_image: 'https://picsum.photos/seed/sediment-filter/200/200', qr_code: 'QR-ADM-001', description: 'Sediment pre-filter for RO water system', transfer_by: 'admin', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 10, part_name: 'Gas Refill', part_price: '1200', part_image: 'https://picsum.photos/seed/gas-refill/200/200', qr_code: 'QR-ADM-002', description: 'R32 refrigerant gas refill for split AC', transfer_by: 'admin', technician_name: null, part_accept: '1', tech_id: null, imageUrl: null },
        { id: 11, part_name: 'Drain Pump', part_price: '950', part_image: 'https://picsum.photos/seed/drain-pump/200/200', qr_code: 'QR-ADM-003', description: 'Drain pump motor for washing machine', transfer_by: 'admin', technician_name: 'Amit Singh', part_accept: '0', tech_id: '103', imageUrl: null },
        { id: 12, part_name: 'Magnetron', part_price: '1500', part_image: 'https://picsum.photos/seed/magnetron/200/200', qr_code: 'QR-ADM-004', description: 'Magnetron for microwave oven 28L', transfer_by: 'admin', technician_name: null, part_accept: '0', tech_id: null, imageUrl: null },
      ]
    }
  },

  qrCodeList: {
    data: {
      success: true,
      data: [
        { id: 1, qr_id: 'QR001', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr001/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 2, qr_id: 'QR002', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr002/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 3, qr_id: 'QR003', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr003/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 4, qr_id: 'QR004', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr004/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 5, qr_id: 'QR005', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr005/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 6, qr_id: 'QR006', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr006/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 7, qr_id: 'QR007', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr007/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 8, qr_id: 'QR008', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr008/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 9, qr_id: 'QR009', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr009/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 10, qr_id: 'QR010', complaint_id: null, qr_img: 'https://picsum.photos/seed/qr010/200/200', part_name: null, customer_name: null, technician_name: null, assigned_date: null },
        { id: 11, qr_id: 'QR011', complaint_id: 'CMP-101', qr_img: 'https://picsum.photos/seed/qr011/200/200', part_name: 'RO Membrane', customer_name: 'Rahul Sharma', technician_name: 'Demo Technician', assigned_date: '2026-07-01' },
        { id: 12, qr_id: 'QR012', complaint_id: 'CMP-102', qr_img: 'https://picsum.photos/seed/qr012/200/200', part_name: 'AC Compressor', customer_name: 'Priya Patel', technician_name: 'Demo Technician', assigned_date: '2026-07-02' },
        { id: 13, qr_id: 'QR013', complaint_id: 'CMP-103', qr_img: 'https://picsum.photos/seed/qr013/200/200', part_name: 'Carbon Filter', customer_name: 'Amit Singh', technician_name: 'Demo Technician', assigned_date: '2026-07-03' },
        { id: 14, qr_id: 'QR014', complaint_id: 'CMP-104', qr_img: 'https://picsum.photos/seed/qr014/200/200', part_name: 'Cooling Fan', customer_name: 'Sneha Reddy', technician_name: 'Demo Technician', assigned_date: '2026-07-04' },
        { id: 15, qr_id: 'QR015', complaint_id: 'CMP-105', qr_img: 'https://picsum.photos/seed/qr015/200/200', part_name: 'Thermostat', customer_name: 'Vikram Joshi', technician_name: 'Demo Technician', assigned_date: '2026-07-05' },
        { id: 16, qr_id: 'QR016', complaint_id: 'CMP-106', qr_img: 'https://picsum.photos/seed/qr016/200/200', part_name: 'Door Gasket', customer_name: 'Neha Kapoor', technician_name: 'Demo Technician', assigned_date: '2026-07-06' },
        { id: 17, qr_id: 'QR017', complaint_id: 'CMP-107', qr_img: 'https://picsum.photos/seed/qr017/200/200', part_name: 'Heating Element', customer_name: 'Arun Mehta', technician_name: 'Demo Technician', assigned_date: '2026-07-07' },
        { id: 18, qr_id: 'QR018', complaint_id: 'CMP-108', qr_img: 'https://picsum.photos/seed/qr018/200/200', part_name: 'Sediment Filter', customer_name: 'Divya Sharma', technician_name: 'Demo Technician', assigned_date: '2026-07-08' },
        { id: 19, qr_id: 'QR019', complaint_id: 'CMP-109', qr_img: 'https://picsum.photos/seed/qr019/200/200', part_name: 'Gas Refill', customer_name: 'Karan Gupta', technician_name: 'Demo Technician', assigned_date: '2026-07-09' },
        { id: 20, qr_id: 'QR020', complaint_id: 'CMP-110', qr_img: 'https://picsum.photos/seed/qr020/200/200', part_name: 'Drain Pump', customer_name: 'Pooja Verma', technician_name: 'Demo Technician', assigned_date: '2026-07-10' },
      ]
    }
  },

  qrCodeCount: { total: 20, used: 10, unused: 10 },

  notifications: {
    data: {
      success: true,
      result: [
        { id: 1, title: 'New Complaint Assigned', message: 'You have a new complaint at MG Road', type: 'complaint', created_at: '2024-01-20 10:00:00', is_read: '0' },
        { id: 2, title: 'Payment Received', message: 'Your payment of ₹500 has been credited', type: 'payment', created_at: '2024-01-19 14:00:00', is_read: '0' },
        { id: 3, title: 'AMC Reminder', message: 'AMC renewal due for customer Priya Patel', type: 'reminder', created_at: '2024-01-18 09:00:00', is_read: '1' },
      ]
    }
  },

  termsData: {
    data: {
      success: true,
      data: [
        {
          mobile: '+917055880880',
          mobile2: '+917252043100',
          email: 'dainikcare@gmail.com',
          hours: 'Mon-Sat, 9:00 AM - 8:00 PM',
          address: 'B-123, Sector 63, Noida, Uttar Pradesh - 201301',
          terms: 'These are the terms and conditions for using the Dainik Care technician app. All technicians must follow the code of conduct...',
          policy: 'We value your privacy and ensure that your data is protected...',
          terms_conditions: 'These are the terms and conditions for using the Dainik Care technician app. All technicians must follow the code of conduct...',
          about_us: 'Dainik Care is a leading home services platform providing repair and maintenance services.',
          privacy_policy: 'We value your privacy and ensure that your data is protected...',
        }
      ]
    }
  },

  payoutCommission: {
    data: {
      success: true,
      data: [
        { id: 1, fund: '1500', tech_fund: '900', admin_fund: '600', status: 'collect', csn: 'CSN001', name: 'Rahul Sharma', type: 'Service', comp_id: '101', date: '2026-07-15' },
        { id: 2, fund: '2000', tech_fund: '1200', admin_fund: '800', status: 'pending', csn: 'CSN002', name: 'Priya Patel', type: 'AMC', comp_id: '102', date: '2026-07-14' },
        { id: 3, fund: '1200', tech_fund: '720', admin_fund: '480', status: 'collect', csn: 'CSN003', name: 'Amit Singh', type: 'Service', comp_id: '103', date: '2026-07-13' },
        { id: 4, fund: '1800', tech_fund: '1080', admin_fund: '720', status: 'collect', csn: 'CSN004', name: 'Sneha Reddy', type: 'Service', comp_id: '104', date: '2026-07-12' },
        { id: 5, fund: '2200', tech_fund: '1320', admin_fund: '880', status: 'pending', csn: 'CSN005', name: 'Vikram Joshi', type: 'Repair', comp_id: '105', date: '2026-07-11' },
        { id: 6, fund: '1600', tech_fund: '960', admin_fund: '640', status: 'collect', csn: 'CSN006', name: 'Ananya Verma', type: 'Service', comp_id: '106', date: '2026-07-10' },
        { id: 7, fund: '2500', tech_fund: '1500', admin_fund: '1000', status: 'pending', csn: 'CSN007', name: 'Rohit Kumar', type: 'AMC', comp_id: '107', date: '2026-07-09' },
        { id: 8, fund: '1100', tech_fund: '660', admin_fund: '440', status: 'collect', csn: 'CSN008', name: 'Neha Gupta', type: 'Repair', comp_id: '108', date: '2026-07-08' },
        { id: 9, fund: '1900', tech_fund: '1140', admin_fund: '760', status: 'collect', csn: 'CSN009', name: 'Deepak Singh', type: 'Service', comp_id: '109', date: '2026-07-07' },
        { id: 10, fund: '1400', tech_fund: '840', admin_fund: '560', status: 'pending', csn: 'CSN010', name: 'Kavita Sharma', type: 'Service', comp_id: '110', date: '2026-07-06' },
        { id: 11, fund: '3000', tech_fund: '1800', admin_fund: '1200', status: 'collect', csn: 'CSN011', name: 'Manish Yadav', type: 'AMC', comp_id: '111', date: '2026-07-05' },
      ],
      totals: {
        total_fund: 21200,
        total_tech: 12720,
        total_admin_fund: 8480,
        debit_admin: 1200,
      }
    }
  },

  payoutSalary: {
    data: {
      success: true,
      result: [
        { id: '1', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2026-07-14 09:00' },
        { id: '2', login: '08:30', logout: '17:30', hours: 9, amount: 900, datetime: '2026-07-13 08:30' },
        { id: '3', login: '10:00', logout: '19:00', hours: 9, amount: 900, datetime: '2026-07-12 10:00' },
        { id: '4', login: '09:15', logout: '18:15', hours: 9, amount: 900, datetime: '2026-07-11 09:15' },
        { id: '5', login: '08:45', logout: '17:45', hours: 9, amount: 900, datetime: '2026-07-10 08:45' },
        { id: '6', login: '09:30', logout: '18:30', hours: 9, amount: 900, datetime: '2026-07-09 09:30' },
        { id: '7', login: '08:00', logout: '17:00', hours: 9, amount: 900, datetime: '2026-07-08 08:00' },
        { id: '8', login: '09:45', logout: '18:45', hours: 9, amount: 900, datetime: '2026-07-07 09:45' },
        { id: '9', login: '08:15', logout: '17:15', hours: 9, amount: 900, datetime: '2026-07-06 08:15' },
        { id: '10', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2026-07-05 09:00' },
        { id: '11', login: '10:30', logout: '19:30', hours: 9, amount: 900, datetime: '2026-07-04 10:30' },
      ]
    }
  },

  amcList: {
    data: {
      success: true,
      data: [
        {
          id: 1,
          name: 'RO Gold AMC',
          title: 'RO Gold AMC Plan',
          description: 'Complete annual maintenance for your RO water purifier with free filter replacement.',
          image1: 'https://picsum.photos/seed/amc-gold/400/300',
          price: '4999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Free RO Membrane replacement<br><i class="fa fa-check-circle" style="color:green"></i> 4 Free filter changes<br><i class="fa fa-check-circle" style="color:green"></i> Free inspection every 3 months<br><i class="fa fa-check-circle" style="color:green"></i> Priority service booking<br><i class="fa fa-check-circle" style="color:green"></i> 10% discount on spare parts<br>',
          parts: [
            { part_name: 'RO Membrane', part_id: 1 },
            { part_name: 'Sediment Filter', part_id: 2 },
            { part_name: 'Carbon Filter', part_id: 3 },
            { part_name: 'Post Carbon Filter', part_id: 4 },
          ],
          customer_name: 'Rahul Sharma',
          amc_type: 'Gold',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'active',
        },
        {
          id: 2,
          name: 'AC Silver AMC',
          title: 'AC Silver AMC Plan',
          description: 'Annual maintenance contract for your air conditioner with gas top-up.',
          image1: 'https://picsum.photos/seed/amc-silver/400/300',
          price: '2999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Free gas top-up (up to 500g)<br><i class="fa fa-check-circle" style="color:green"></i> Deep cleaning service<br><i class="fa fa-check-circle" style="color:green"></i> Filter cleaning every visit<br><i class="fa fa-check-circle" style="color:green"></i> 15% discount on repairs<br>',
          parts: [
            { part_name: 'AC Filter', part_id: 5 },
            { part_name: 'Gas Refill', part_id: 6 },
          ],
          customer_name: 'Priya Patel',
          amc_type: 'Silver',
          start_date: '2026-02-01',
          end_date: '2026-12-31',
          status: 'active',
        },
        {
          id: 3,
          name: 'Fridge Platinum AMC',
          title: 'Fridge Platinum AMC Plan',
          description: 'Premium annual maintenance for your refrigerator with compressor warranty.',
          image1: 'https://picsum.photos/seed/amc-platinum/400/300',
          price: '7999',
          valid: '2 Years Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Compressor warranty extension<br><i class="fa fa-check-circle" style="color:green"></i> Free gas refill<br><i class="fa fa-check-circle" style="color:green"></i> 6-monthly deep cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Thermostat check & calibration<br><i class="fa fa-check-circle" style="color:green"></i> Priority AMC support<br>',
          parts: [
            { part_name: 'Compressor', part_id: 7 },
            { part_name: 'Thermostat', part_id: 8 },
            { part_name: 'Door Gasket', part_id: 9 },
          ],
          customer_name: 'Amit Singh',
          amc_type: 'Platinum',
          start_date: '2026-03-01',
          end_date: '2027-02-28',
          status: 'active',
        },
        {
          id: 4,
          name: 'Washing Machine Basic AMC',
          title: 'WM Basic AMC Plan',
          description: 'Basic maintenance plan for your washing machine.',
          image1: 'https://picsum.photos/seed/amc-basic/400/300',
          price: '1999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Semi-annual service<br><i class="fa fa-check-circle" style="color:green"></i> Drum cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Belt check & adjustment<br>',
          parts: [
            { part_name: 'Washing Machine Belt', part_id: 10 },
            { part_name: 'Inlet Valve', part_id: 11 },
          ],
          customer_name: 'Sneha Reddy',
          amc_type: 'Basic',
          start_date: '2026-04-01',
          end_date: '2026-12-31',
          status: 'active',
        },
        {
          id: 5,
          name: 'RO Premium AMC',
          title: 'RO Premium AMC Plan',
          description: 'Premium RO maintenance with annual membrane replacement and UV filter cleaning.',
          image1: 'https://picsum.photos/seed/ro-premium/400/300',
          price: '6999',
          valid: '2 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Annual RO Membrane replacement<br><i class="fa fa-check-circle" style="color:green"></i> UV filter cleaning & servicing<br><i class="fa fa-check-circle" style="color:green"></i> 6 Free filter changes<br><i class="fa fa-check-circle" style="color:green"></i> TDS check & calibration<br><i class="fa fa-check-circle" style="color:green"></i> 20% discount on spare parts<br>',
          parts: [
            { part_name: 'RO Membrane', part_id: 12 },
            { part_name: 'UV Lamp', part_id: 13 },
            { part_name: 'Sediment Filter', part_id: 14 },
            { part_name: 'Carbon Filter', part_id: 15 },
            { part_name: 'Post Carbon Filter', part_id: 16 },
          ],
          customer_name: 'Vikram Joshi',
          amc_type: 'Premium',
          start_date: '2026-05-01',
          end_date: '2027-04-30',
          status: 'active',
        },
        {
          id: 6,
          name: 'AC Gold AMC',
          title: 'AC Gold AMC Plan',
          description: 'Gold-level AC maintenance with comprehensive cleaning and gas top-up.',
          image1: 'https://picsum.photos/seed/ac-gold/400/300',
          price: '4999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Full deep cleaning (indoor + outdoor)<br><i class="fa fa-check-circle" style="color:green"></i> Free gas top-up (up to 1kg)<br><i class="fa fa-check-circle" style="color:green"></i> Coil & condenser cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Drain pipe check & cleaning<br><i class="fa fa-check-circle" style="color:green"></i> 20% discount on repairs<br>',
          parts: [
            { part_name: 'AC Filter', part_id: 17 },
            { part_name: 'Gas Refill', part_id: 18 },
            { part_name: 'Coil Cleaner', part_id: 19 },
          ],
          customer_name: 'Neha Kapoor',
          amc_type: 'Gold',
          start_date: '2026-05-15',
          end_date: '2027-05-14',
          status: 'active',
        },
        {
          id: 7,
          name: 'Fridge Annual AMC',
          title: 'Fridge Annual AMC Plan',
          description: 'Comprehensive fridge maintenance with door seal check and thermostat calibration.',
          image1: 'https://picsum.photos/seed/fridge-annual/400/300',
          price: '3999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Thermostat calibration<br><i class="fa fa-check-circle" style="color:green"></i> Door gasket seal check & replacement<br><i class="fa fa-check-circle" style="color:green"></i> Condenser coil cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Drain pan cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Temperature accuracy test<br>',
          parts: [
            { part_name: 'Door Gasket', part_id: 20 },
            { part_name: 'Thermostat', part_id: 21 },
            { part_name: 'Condenser Coil', part_id: 22 },
          ],
          customer_name: 'Arun Mehta',
          amc_type: 'Annual',
          start_date: '2026-06-01',
          end_date: '2027-05-31',
          status: 'active',
        },
        {
          id: 8,
          name: 'Geyser Essential AMC',
          title: 'Geyser Essential AMC Plan',
          description: 'Essential maintenance for your water geyser with heating element check.',
          image1: 'https://picsum.photos/seed/geyser-amc/400/300',
          price: '1499',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Heating element check & cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Thermostat testing<br><i class="fa fa-check-circle" style="color:green"></i> Anode rod inspection<br><i class="fa fa-check-circle" style="color:green"></i> Leakage test<br>',
          parts: [
            { part_name: 'Heating Element', part_id: 23 },
            { part_name: 'Thermostat', part_id: 24 },
            { part_name: 'Anode Rod', part_id: 25 },
          ],
          customer_name: 'Divya Sharma',
          amc_type: 'Essential',
          start_date: '2026-06-15',
          end_date: '2027-06-14',
          status: 'active',
        },
        {
          id: 9,
          name: 'Washing Machine Premium AMC',
          title: 'WM Premium AMC Plan',
          description: 'Premium washing machine maintenance with drum cleaning and motor check.',
          image1: 'https://picsum.photos/seed/wm-premium/400/300',
          price: '3999',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Drum deep cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Motor & belt inspection<br><i class="fa fa-check-circle" style="color:green"></i> Drain pump check<br><i class="fa fa-check-circle" style="color:green"></i> Quarterly servicing<br><i class="fa fa-check-circle" style="color:green"></i> 15% discount on spare parts<br>',
          parts: [
            { part_name: 'Motor Belt', part_id: 26 },
            { part_name: 'Drain Pump', part_id: 27 },
            { part_name: 'Drum Cleaner', part_id: 28 },
          ],
          customer_name: 'Karan Gupta',
          amc_type: 'Premium',
          start_date: '2026-07-01',
          end_date: '2027-06-30',
          status: 'active',
        },
        {
          id: 10,
          name: 'Microwave Complete AMC',
          title: 'Microwave Complete AMC Plan',
          description: 'Complete microwave maintenance including magnetron check and door seal replacement.',
          image1: 'https://picsum.photos/seed/microwave-amc/400/300',
          price: '2499',
          valid: '1 Year Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Magnetron testing & cleaning<br><i class="fa fa-check-circle" style="color:green"></i> Door seal replacement<br><i class="fa fa-check-circle" style="color:green"></i> Turntable motor check<br><i class="fa fa-check-circle" style="color:green"></i> Control panel inspection<br>',
          parts: [
            { part_name: 'Magnetron', part_id: 29 },
            { part_name: 'Door Seal', part_id: 30 },
            { part_name: 'Turntable Motor', part_id: 31 },
          ],
          customer_name: 'Pooja Verma',
          amc_type: 'Complete',
          start_date: '2026-07-10',
          end_date: '2027-07-09',
          status: 'active',
        },
        {
          id: 11,
          name: 'RO-Service Combo AMC',
          title: 'RO + AC Combo AMC Plan',
          description: 'Combined annual maintenance for RO water purifier and AC at a discounted price.',
          image1: 'https://picsum.photos/seed/combo-amc/400/300',
          price: '8999',
          valid: '1 Year Warranty Included (Both)',
          content: '<i class="fa fa-check-circle" style="color:green"></i> RO + AC maintenance combined<br><i class="fa fa-check-circle" style="color:green"></i> Free RO membrane replacement<br><i class="fa fa-check-circle" style="color:green"></i> AC deep cleaning + gas top-up<br><i class="fa fa-check-circle" style="color:green"></i> 4 Free filter changes for RO<br><i class="fa fa-check-circle" style="color:green"></i> Priority support for both<br><i class="fa fa-check-circle" style="color:green"></i> 25% discount on spare parts<br>',
          parts: [
            { part_name: 'RO Membrane', part_id: 32 },
            { part_name: 'Carbon Filter', part_id: 33 },
            { part_name: 'AC Filter', part_id: 34 },
            { part_name: 'Gas Refill', part_id: 35 },
            { part_name: 'AC Coil Cleaner', part_id: 36 },
          ],
          customer_name: 'Rohan Desai',
          amc_type: 'Combo',
          start_date: '2026-08-01',
          end_date: '2027-07-31',
          status: 'active',
        },
        {
          id: 12,
          name: 'Home Appliance Complete AMC',
          title: 'All-in-One Home AMC Plan',
          description: 'Complete coverage for all home appliances - RO, AC, Fridge, Washing Machine, and Microwave.',
          image1: 'https://picsum.photos/seed/home-amc/400/300',
          price: '14999',
          valid: '2 Years Warranty Included',
          content: '<i class="fa fa-check-circle" style="color:green"></i> Covers up to 5 appliances<br><i class="fa fa-check-circle" style="color:green"></i> Free parts replacement up to ₹5000<br><i class="fa fa-check-circle" style="color:green"></i> Quarterly maintenance visits<br><i class="fa fa-check-circle" style="color:green"></i> Dedicated service manager<br><i class="fa fa-check-circle" style="color:green"></i> Emergency service within 4 hours<br><i class="fa fa-check-circle" style="color:green"></i> 30% discount on additional repairs<br>',
          parts: [
            { part_name: 'All Standard Filters', part_id: 37 },
            { part_name: 'AC Filter Kit', part_id: 38 },
            { part_name: 'Fridge Thermostat', part_id: 39 },
            { part_name: 'WM Belt', part_id: 40 },
            { part_name: 'Microwave Door Seal', part_id: 41 },
          ],
          customer_name: 'Ananya Iyer',
          amc_type: 'Complete',
          start_date: '2026-09-01',
          end_date: '2028-08-31',
          status: 'active',
        },
      ]
    }
  },

  amcDetails: {
    data: {
      success: true,
      result: {
        id: 1,
        csn: 'AMC-2026-001',
        customer_name: 'Rahul Sharma',
        amc_type: 'Gold',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        status: 'active',
        price: '5000',
        tot_amt: '5000',
        discount: '500',
        platform_fee: '0',
        address: '123, MG Road, Mumbai',
        service_address: '123, MG Road, Andheri West, Mumbai - 400053',
        mobile: '9876543210',
        service: 'RO Water Purifier',
        service_name: 'Annual Maintenance Contract - Gold',
        slot_date: '15 Jul 2026',
        slot_time: '10:00 AM - 12:00 PM',
        review: '4.5',
        remark: 'Customer requested morning slot. Previous service was satisfactory.',
        upload_image: 'https://picsum.photos/seed/amc-complete/400/300',
        recomplaint: '0',
        commission: [
          { fund: '600', tech_fund: '300', admin_fund: '100' }
        ],
        invoice: 'INV-AMC-001',
        parts: [
          { part_name: 'RO Membrane', part_code: 'RM-001', quantity: 1, price: '1200' },
          { part_name: 'Sediment Filter', part_code: 'SF-002', quantity: 2, price: '350' },
          { part_name: 'Carbon Block Filter', part_code: 'CBF-003', quantity: 1, price: '450' },
        ],
        RelatedComplaint: [
          { id: 101, complaint_no: 'CMP-101', issue: 'Low water pressure', status: 'resolved', date: '10 Jun 2026' },
          { id: 102, complaint_no: 'CMP-102', issue: 'Taste issue in water', status: 'in_progress', date: '05 Jul 2026' },
        ]
      }
    }
  },

  technicianAMC: {
    data: {
      success: true,
      result: [
        {
          id: 1,
          csn: 'AMC-2026-001',
          customer_name: 'Rahul Sharma',
          amc_type: 'Gold',
          service: 'RO Water Purifier',
          amc_name: 'RO Gold AMC Plan',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'active',
          price: '5000',
          tot_amt: '5000',
          discount: '500',
          platform_fee: '0',
          address: '123, MG Road, Mumbai',
          service_address: '123, MG Road, Andheri West, Mumbai - 400053',
          mobile: '9876543210',
          service_name: 'RO',
          slot_date: '15 Jul 2026',
          slot_time: '10:00 AM - 12:00 PM',
          review: '4.5',
          remark: 'Customer requested morning slot.',
          recomplaint: '0',
        },
        {
          id: 2,
          csn: 'AMC-2026-002',
          customer_name: 'Priya Patel',
          amc_type: 'Silver',
          service: 'AC Split 1.5 Ton',
          amc_name: 'AC Silver AMC Plan',
          start_date: '2026-02-01',
          end_date: '2026-12-31',
          status: 'active',
          price: '3000',
          tot_amt: '3000',
          discount: '0',
          platform_fee: '0',
          address: '456, Link Road, Delhi',
          service_address: '456, Link Road, Lajpat Nagar, Delhi - 110024',
          mobile: '8765432109',
          service_name: 'AC',
          slot_date: '18 Jul 2026',
          slot_time: '02:00 PM - 04:00 PM',
          review: '4.0',
          remark: 'Customer asked to check gas level.',
          recomplaint: '0',
        },
        {
          id: 3,
          csn: 'AMC-2026-003',
          customer_name: 'Amit Singh',
          amc_type: 'Platinum',
          service: 'Refrigerator Double Door',
          amc_name: 'Fridge Platinum AMC Plan',
          start_date: '2026-03-01',
          end_date: '2027-02-28',
          status: 'active',
          price: '7999',
          tot_amt: '7999',
          discount: '1000',
          platform_fee: '0',
          address: '789, Park Street, Kolkata',
          service_address: '789, Park Street, Kolkata - 700016',
          mobile: '7654321098',
          service_name: 'Fridge',
          slot_date: '20 Jul 2026',
          slot_time: '09:00 AM - 11:00 AM',
          review: '0',
          remark: 'New installation follow-up.',
          recomplaint: '0',
        },
        {
          id: 4,
          csn: 'AMC-2026-004',
          customer_name: 'Sneha Reddy',
          amc_type: 'Basic',
          service: 'Washing Machine',
          amc_name: 'WM Basic AMC Plan',
          start_date: '2026-04-01',
          end_date: '2026-12-31',
          status: 'active',
          price: '1999',
          tot_amt: '1999',
          discount: '200',
          platform_fee: '0',
          address: '321, Jubilee Hills, Hyderabad',
          service_address: '321, Jubilee Hills, Hyderabad - 500033',
          mobile: '6543210987',
          service_name: 'Washing Machine',
          slot_date: '22 Jul 2026',
          slot_time: '11:00 AM - 01:00 PM',
          review: '5.0',
          remark: 'Excellent customer, previous service completed successfully.',
          recomplaint: '0',
        },
        {
          id: 5,
          csn: 'AMC-2026-005',
          customer_name: 'Vikram Joshi',
          amc_type: 'Premium',
          service: 'RO Water Purifier',
          amc_name: 'RO Premium AMC Plan',
          start_date: '2026-05-01',
          end_date: '2027-04-30',
          status: 'active',
          price: '6999',
          tot_amt: '6999',
          discount: '700',
          platform_fee: '10',
          address: '567, BTM Layout, Bangalore',
          service_address: '567, BTM Layout, Bangalore - 560068',
          mobile: '5432109876',
          service_name: 'RO',
          slot_date: '25 Jul 2026',
          slot_time: '08:00 AM - 10:00 AM',
          review: '4.8',
          remark: 'Needs UV lamp replacement.',
          recomplaint: '0',
        },
        {
          id: 6,
          csn: 'AMC-2026-006',
          customer_name: 'Neha Kapoor',
          amc_type: 'Gold',
          service: 'AC Split 2 Ton',
          amc_name: 'AC Gold AMC Plan',
          start_date: '2026-05-15',
          end_date: '2027-05-14',
          status: 'active',
          price: '4999',
          tot_amt: '4999',
          discount: '300',
          platform_fee: '0',
          address: '890, Civil Lines, Jaipur',
          service_address: '890, Civil Lines, Jaipur - 302006',
          mobile: '4321098765',
          service_name: 'AC',
          slot_date: '27 Jul 2026',
          slot_time: '03:00 PM - 05:00 PM',
          review: '4.2',
          remark: 'Gas leak suspected. Bring extra refrigerant.',
          recomplaint: '0',
        },
        {
          id: 7,
          csn: 'AMC-2026-007',
          customer_name: 'Arun Mehta',
          amc_type: 'Annual',
          service: 'Refrigerator Single Door',
          amc_name: 'Fridge Annual AMC Plan',
          start_date: '2026-06-01',
          end_date: '2027-05-31',
          status: 'active',
          price: '3999',
          tot_amt: '3999',
          discount: '0',
          platform_fee: '0',
          address: '234, MG Road, Pune',
          service_address: '234, MG Road, Camp, Pune - 411001',
          mobile: '3210987654',
          service_name: 'Fridge',
          slot_date: '29 Jul 2026',
          slot_time: '10:30 AM - 12:30 PM',
          review: '0',
          remark: 'First time AMC customer.',
          recomplaint: '0',
        },
        {
          id: 8,
          csn: 'AMC-2026-008',
          customer_name: 'Divya Sharma',
          amc_type: 'Essential',
          service: 'Geyser 25L',
          amc_name: 'Geyser Essential AMC Plan',
          start_date: '2026-06-15',
          end_date: '2027-06-14',
          status: 'active',
          price: '1499',
          tot_amt: '1499',
          discount: '0',
          platform_fee: '0',
          address: '456, Model Town, Chandigarh',
          service_address: '456, Model Town, Chandigarh - 160001',
          mobile: '2109876543',
          service_name: 'Geyser',
          slot_date: '30 Jul 2026',
          slot_time: '09:00 AM - 11:00 AM',
          review: '4.0',
          remark: 'Water heating slow. Check heating element.',
          recomplaint: '0',
        },
        {
          id: 9,
          csn: 'AMC-2026-009',
          customer_name: 'Karan Gupta',
          amc_type: 'Premium',
          service: 'Washing Machine Front Load',
          amc_name: 'WM Premium AMC Plan',
          start_date: '2026-07-01',
          end_date: '2027-06-30',
          status: 'active',
          price: '3999',
          tot_amt: '3999',
          discount: '400',
          platform_fee: '0',
          address: '789, Sector 62, Noida',
          service_address: '789, Sector 62, Noida - 201309',
          mobile: '1098765432',
          service_name: 'Washing Machine',
          slot_date: '01 Aug 2026',
          slot_time: '02:00 PM - 04:00 PM',
          review: '4.6',
          remark: 'Drum making noise. Inspect bearings.',
          recomplaint: '0',
        },
        {
          id: 10,
          csn: 'AMC-2026-010',
          customer_name: 'Pooja Verma',
          amc_type: 'Complete',
          service: 'Microwave 28L',
          amc_name: 'Microwave Complete AMC Plan',
          start_date: '2026-07-10',
          end_date: '2027-07-09',
          status: 'active',
          price: '2499',
          tot_amt: '2499',
          discount: '0',
          platform_fee: '0',
          address: '111, Lake Town, Kolkata',
          service_address: '111, Lake Town, Kolkata - 700089',
          mobile: '9988776655',
          service_name: 'Microwave',
          slot_date: '03 Aug 2026',
          slot_time: '11:00 AM - 01:00 PM',
          review: '4.1',
          remark: 'Heating uneven. Check magnetron.',
          recomplaint: '0',
        },
        {
          id: 11,
          csn: 'AMC-2026-011',
          customer_name: 'Rohan Desai',
          amc_type: 'Combo',
          service: 'RO + AC Combo',
          amc_name: 'RO + AC Combo AMC Plan',
          start_date: '2026-08-01',
          end_date: '2027-07-31',
          status: 'active',
          price: '8999',
          tot_amt: '8999',
          discount: '1000',
          platform_fee: '0',
          address: '222, Banjara Hills, Hyderabad',
          service_address: '222, Banjara Hills, Hyderabad - 500034',
          mobile: '8877665544',
          service_name: 'Combo',
          slot_date: '05 Aug 2026',
          slot_time: '08:00 AM - 12:00 PM',
          review: '0',
          remark: 'Long slot needed. Both appliances to service.',
          recomplaint: '0',
        },
        {
          id: 12,
          csn: 'AMC-2026-012',
          customer_name: 'Ananya Iyer',
          amc_type: 'Complete',
          service: 'All Home Appliances',
          amc_name: 'All-in-One Home AMC Plan',
          start_date: '2026-09-01',
          end_date: '2028-08-31',
          status: 'active',
          price: '14999',
          tot_amt: '14999',
          discount: '2000',
          platform_fee: '0',
          address: '333, Jayanagar, Bangalore',
          service_address: '333, Jayanagar, Bangalore - 560041',
          mobile: '7766554433',
          service_name: 'Complete Home',
          slot_date: '07 Aug 2026',
          slot_time: '09:00 AM - 01:00 PM',
          review: '0',
          remark: 'Premium customer. 5 appliances to cover.',
          recomplaint: '0',
        },
      ],
      page: '1',
      limit: 12,
    }
  },

  proceedAMC: {
    data: {
      success: true,
      msg: 'AMC proceeded successfully',
    }
  },

  amcQRCodeInsert: {
    data: {
      success: true,
      msg: 'QR Code linked successfully',
    }
  },

  amcQRCodeRemove: {
    data: {
      success: true,
      msg: 'QR Code removed successfully',
    }
  },

  changePassword: {
    data: {
      success: true,
      msg: 'Password updated successfully',
    }
  },

  rescheduleComplaint: {
    data: {
      success: true,
      msg: 'Complaint rescheduled successfully',
    }
  },

  contactImport: {
    data: {
      success: true,
      msg: 'Contacts imported successfully',
    }
  },

  replacePartsCount: {
    data: {
      success: true,
      count: 5,
      parts: [
        { id: 1, part_name: 'Old RO Membrane', status: 'pending' },
        { id: 2, part_name: 'Old AC Fan', status: 'replaced' },
      ]
    }
  },

  technicianReplacePart: {
    data: {
      success: true,
      msg: 'Part replaced successfully',
    }
  },

  fetchPartsForReplaced: {
    data: {
      success: true,
      result: [
        { id: 1, part_name: 'RO Membrane', part_code: 'RM-001' },
        { id: 2, part_name: 'Filter Cartridge', part_code: 'FC-003' },
      ]
    }
  },

  amcComplaintDetails: {
    data: {
      success: true,
      result: {
        id: 1,
        csn: 'CSN001',
        customer_name: 'Rahul Sharma',
        service_name: 'RO Service',
        status: 'assign',
        parts: [
          { part_name: 'RO Membrane', qr_code: null, linked: false },
          { part_name: 'Filter Cartridge', qr_code: 'QR001', linked: true },
        ]
      }
    }
  },

  purchaseMarketPart: {
    data: {
      success: true,
      msg: 'Part purchased successfully',
    }
  },

  getPartDetailQRCode: {
    data: {
      success: true,
      type: 'part',
      data: [
        {
          id: 101,
          part_name: 'RO Membrane',
          part_image: 'https://picsum.photos/seed/ro-membrane/300/300',
          part_price: '800',
          qr_code: 'QR-CSN001-001',
          description: 'High-quality RO Membrane for water purifier. Removes dissolved solids and impurities.',
          transfer_by: 'Admin',
          part_accept: 'accepted',
          trans_tech: 'Demo Technician',
          technician_name: 'Demo Technician',
          complaint_id: '101',
          csn: 'CSN001',
        }
      ]
    }
  },

  logoutResponse: {
    data: {
      success: true,
      msg: 'Logged out successfully',
    }
  },
};

export default dummyData;
