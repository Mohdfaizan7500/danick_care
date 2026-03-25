 const generateSpareParts = (categoryName, baseId) => {
    const parts = {
      'Air Conditioner': [
        { id: `${baseId}_1`, name: 'Compressor', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOigkDo6Cd8oWhPGXj2x326YBh8dFY0l1j2g&s', price: '$120.00' },
        { id: `${baseId}_2`, name: 'Condenser', image: 'https://climatrolcorp.com/wp-content/uploads/2024/06/Advances-in-Condenser-and-Evaporator-Technology.webp', price: '$85.00' },
        { id: `${baseId}_3`, name: 'Evaporator', image: 'https://www.valeoservice.in/_next/image?url=https%3A%2F%2Fassets-valeo.keepeek.com%2Fmedias%2Fdomain8143%2Fmedia47%2F7084-feffhu8v0p-preview1.png&w=1080&q=100', price: '$95.00' },
        { id: `${baseId}_4`, name: 'Fan Motor', image: 'https://tiimg.tistatic.com/fp/1/007/818/low-power-consumption-heavy-duty-high-speed-air-conditioner-fan-motor-489.jpg' },
        { id: `${baseId}_5`, name: 'Thermostat', image: 'https://m.media-amazon.com/images/I/61t3vQ4zjNL._AC_UF1000,1000_QL80_.jpg', price: '$25.00' },
        { id: `${baseId}_6`, name: 'Capacitor', image: 'https://5.imimg.com/data5/MI/CI/LE/SELLER-49057668/air-condition-coil-500x500.jpg', price: '$15.00' },
        { id: `${baseId}_7`, name: 'Refrigerant Gas', image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQDZBdvgqOR4U2fsWmcyEmBhwhae8NDoLuO9DiPwGlXO9hKKjMtY8NsSoEFOgSmkTKLwQS69XlWN1Wl93cEYKmZuEIEymHp', price: '$60.00' },
        { id: `${baseId}_8`, name: 'Air Filter', image: 'https://5.imimg.com/data5/SELLER/Default/2023/8/332371450/UE/DF/RM/1382784/woven-air-conditioner-pp-filter-mesh-500x500.jpg', price: '$12.00' },
        { id: `${baseId}_9`, name: 'Remote Control', image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSveI1CaBtW5x-Q9izkxXfznZmjdCQVvMPNdkrv0YRdj9_GsY63dYlxF24Qeh_Sd3n_Xc7ga0Tshlm_zUjbVuqvb1n-5pLGMozPp0cheUfAPrzkgO3kmdr44g', price: '$20.00' },
        { id: `${baseId}_10`, name: 'PCB Board', image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRg3uwouzVUetdTbyhweJOOcjvSDASjxJZ-1c7KCjS-nm3QumE_Gwx7CqKkjJ5um6EvN9xyjCr-wp4spe8wJJzWc9Jw5VDdaSCdX0LkaRc6EwRguaEEXj1Y', price: '$75.00' },
      ],
      'Washing Machine': [
        { id: `${baseId}_1`, name: 'Drum', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Drum', price: '$150.00' },
        { id: `${baseId}_2`, name: 'Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Motor', price: '$110.00' },
        { id: `${baseId}_3`, name: 'Control Board', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Control+Board', price: '$85.00' },
        { id: `${baseId}_4`, name: 'Water Inlet Valve', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Inlet+Valve', price: '$30.00' },
        { id: `${baseId}_5`, name: 'Drain Pump', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Drain+Pump', price: '$45.00' },
        { id: `${baseId}_6`, name: 'Belt', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Belt', price: '$18.00' },
        { id: `${baseId}_7`, name: 'Door Lock', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Door+Lock', price: '$25.00' },
        { id: `${baseId}_8`, name: 'Suspension Spring', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Spring', price: '$22.00' },
        { id: `${baseId}_9`, name: 'Timer', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Timer', price: '$35.00' },
        { id: `${baseId}_10`, name: 'Inverter Board', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Inverter', price: '$95.00' },
      ],
      'Refrigerator': [
        { id: `${baseId}_1`, name: 'Compressor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Compressor', price: '$140.00' },
        { id: `${baseId}_2`, name: 'Thermostat', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Thermostat', price: '$28.00' },
        { id: `${baseId}_3`, name: 'Door Gasket', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Gasket', price: '$35.00' },
        { id: `${baseId}_4`, name: 'Evaporator Fan', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Evap+Fan', price: '$55.00' },
        { id: `${baseId}_5`, name: 'Condenser Coils', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Coils', price: '$75.00' },
        { id: `${baseId}_6`, name: 'Start Relay', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Relay', price: '$22.00' },
        { id: `${baseId}_7`, name: 'Defrost Timer', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Timer', price: '$30.00' },
        { id: `${baseId}_8`, name: 'Ice Maker', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Ice+Maker', price: '$95.00' },
        { id: `${baseId}_9`, name: 'Water Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Filter', price: '$40.00' },
        { id: `${baseId}_10`, name: 'Temperature Sensor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Sensor', price: '$18.00' },
      ],
      'Microwave Oven': [
        { id: `${baseId}_1`, name: 'Magnetron', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Magnetron', price: '$85.00' },
        { id: `${baseId}_2`, name: 'High Voltage Diode', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Diode', price: '$12.00' },
        { id: `${baseId}_3`, name: 'Capacitor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Capacitor', price: '$18.00' },
        { id: `${baseId}_4`, name: 'Turntable Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Turntable', price: '$25.00' },
        { id: `${baseId}_5`, name: 'Door Switch', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Switch', price: '$10.00' },
        { id: `${baseId}_6`, name: 'Control Panel', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Panel', price: '$55.00' },
        { id: `${baseId}_7`, name: 'Waveguide Cover', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Waveguide', price: '$8.00' },
        { id: `${baseId}_8`, name: 'Fuse', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Fuse', price: '$5.00' },
        { id: `${baseId}_9`, name: 'Light Bulb', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Bulb', price: '$7.00' },
        { id: `${baseId}_10`, name: 'Transformer', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Transformer', price: '$65.00' },
      ],
      'Oven / Cooktop': [
        { id: `${baseId}_1`, name: 'Heating Element', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Heating', price: '$45.00' },
        { id: `${baseId}_2`, name: 'Oven Thermostat', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Thermostat', price: '$38.00' },
        { id: `${baseId}_3`, name: 'Igniter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Igniter', price: '$22.00' },
        { id: `${baseId}_4`, name: 'Gas Valve', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Gas+Valve', price: '$60.00' },
        { id: `${baseId}_5`, name: 'Control Knob', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Knob', price: '$12.00' },
        { id: `${baseId}_6`, name: 'Temperature Sensor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Sensor', price: '$28.00' },
        { id: `${baseId}_7`, name: 'Bake Element', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Bake', price: '$55.00' },
        { id: `${baseId}_8`, name: 'Broil Element', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Broil', price: '$55.00' },
        { id: `${baseId}_9`, name: 'Oven Light', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Light', price: '$10.00' },
        { id: `${baseId}_10`, name: 'Door Hinge', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Hinge', price: '$18.00' },
      ],
      'Dishwasher': [
        { id: `${baseId}_1`, name: 'Pump Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Pump', price: '$90.00' },
        { id: `${baseId}_2`, name: 'Spray Arm', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Spray+Arm', price: '$25.00' },
        { id: `${baseId}_3`, name: 'Heating Element', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Heater', price: '$65.00' },
        { id: `${baseId}_4`, name: 'Detergent Dispenser', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Dispenser', price: '$20.00' },
        { id: `${baseId}_5`, name: 'Rinse Aid Dispenser', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Rinse', price: '$18.00' },
        { id: `${baseId}_6`, name: 'Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Filter', price: '$15.00' },
        { id: `${baseId}_7`, name: 'Door Seal', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Seal', price: '$30.00' },
        { id: `${baseId}_8`, name: 'Control Board', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Board', price: '$110.00' },
        { id: `${baseId}_9`, name: 'Float Switch', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Float', price: '$22.00' },
        { id: `${baseId}_10`, name: 'Drain Hose', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Hose', price: '$25.00' },
      ],
      'Vacuum Cleaner': [
        { id: `${baseId}_1`, name: 'Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Motor', price: '$75.00' },
        { id: `${baseId}_2`, name: 'Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Filter', price: '$12.00' },
        { id: `${baseId}_3`, name: 'Brush Roll', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Brush', price: '$28.00' },
        { id: `${baseId}_4`, name: 'Belt', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Belt', price: '$8.00' },
        { id: `${baseId}_5`, name: 'Hose', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Hose', price: '$20.00' },
        { id: `${baseId}_6`, name: 'Power Cord', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Cord', price: '$15.00' },
        { id: `${baseId}_7`, name: 'Dust Bag', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Bag', price: '$10.00' },
        { id: `${baseId}_8`, name: 'Cyclone Assembly', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Cyclone', price: '$45.00' },
        { id: `${baseId}_9`, name: 'On/Off Switch', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Switch', price: '$8.00' },
        { id: `${baseId}_10`, name: 'Handle', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Handle', price: '$18.00' },
      ],
      'Water Heater': [
        { id: `${baseId}_1`, name: 'Heating Element', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Element', price: '$45.00' },
        { id: `${baseId}_2`, name: 'Thermostat', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Thermostat', price: '$28.00' },
        { id: `${baseId}_3`, name: 'Anode Rod', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Rod', price: '$35.00' },
        { id: `${baseId}_4`, name: 'Pressure Relief Valve', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Valve', price: '$22.00' },
        { id: `${baseId}_5`, name: 'Dip Tube', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Dip+Tube', price: '$12.00' },
        { id: `${baseId}_6`, name: 'Gas Valve', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Gas+Valve', price: '$85.00' },
        { id: `${baseId}_7`, name: 'Pilot Light', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Pilot', price: '$15.00' },
        { id: `${baseId}_8`, name: 'Burner Assembly', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Burner', price: '$95.00' },
        { id: `${baseId}_9`, name: 'Temperature Sensor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Sensor', price: '$18.00' },
        { id: `${baseId}_10`, name: 'Control Board', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Board', price: '$110.00' },
      ],
      'Air Purifier': [
        { id: `${baseId}_1`, name: 'HEPA Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=HEPA', price: '$45.00' },
        { id: `${baseId}_2`, name: 'Pre-Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Pre', price: '$20.00' },
        { id: `${baseId}_3`, name: 'Carbon Filter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Carbon', price: '$28.00' },
        { id: `${baseId}_4`, name: 'Fan Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Fan', price: '$55.00' },
        { id: `${baseId}_5`, name: 'UV Lamp', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=UV', price: '$30.00' },
        { id: `${baseId}_6`, name: 'Ionizer', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Ionizer', price: '$25.00' },
        { id: `${baseId}_7`, name: 'Control Board', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Board', price: '$75.00' },
        { id: `${baseId}_8`, name: 'Air Quality Sensor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Sensor', price: '$22.00' },
        { id: `${baseId}_9`, name: 'Power Adapter', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Adapter', price: '$18.00' },
        { id: `${baseId}_10`, name: 'Replacement Filters', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Filter+Set', price: '$60.00' },
      ],
      'Ceiling Fan': [
        { id: `${baseId}_1`, name: 'Motor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Motor', price: '$65.00' },
        { id: `${baseId}_2`, name: 'Blades', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Blades', price: '$25.00' },
        { id: `${baseId}_3`, name: 'Blade Irons', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Blade+Irons', price: '$15.00' },
        { id: `${baseId}_4`, name: 'Capacitor', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Capacitor', price: '$12.00' },
        { id: `${baseId}_5`, name: 'Remote Control', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Remote', price: '$28.00' },
        { id: `${baseId}_6`, name: 'Light Kit', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Light', price: '$35.00' },
        { id: `${baseId}_7`, name: 'Downrod', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Downrod', price: '$18.00' },
        { id: `${baseId}_8`, name: 'Canopy', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Canopy', price: '$12.00' },
        { id: `${baseId}_9`, name: 'Mounting Bracket', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Bracket', price: '$10.00' },
        { id: `${baseId}_10`, name: 'Speed Controller', image: 'https://via.placeholder.com/150/58A890/FFFFFF?text=Controller', price: '$20.00' },
      ],
    };
    return parts[categoryName] || [];
  };


  //   const fetchAttendance = async () => {
  //   if (!user?.id) return;
  //   const monthStr = formatMonth(displayMonth, displayYear);
  //   setIsLoading(true);
  //   try {
  //     const response = await getAttendanceApi(user.id, monthStr);
  //     console.log('Fetched Attendance:', response);

  //     // Extract dates array safely
  //     let dates = [];
  //     const responseData = response?.data;

  //     if (Array.isArray(responseData)) {
  //       dates = responseData;
  //     } else if (responseData && typeof responseData === 'object') {
  //       // Try common keys
  //       if (Array.isArray(responseData.data)) {
  //         dates = responseData.data;
  //       } else if (Array.isArray(responseData.dates)) {
  //         dates = responseData.dates;
  //       } else if (Array.isArray(responseData.attendance_dates)) {
  //         dates = responseData.attendance_dates;
  //       } else {
  //         console.warn('Unexpected data structure:', responseData);
  //       }
  //     }

  //     console.log('Extracted dates:', dates);
  //     setSelectedDates(dates);
  //     setError(null);
  //   } catch (err) {
  //     console.error('Error fetching attendance:', err);
  //     setError(err.message);
  //     toast.error('Failed to load attendance. Please try again.');
  //     setSelectedDates([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };