// Logic for Legal Calculators

// Make calculations format numbers nicely
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Toggle Calculator Panels
window.showCalculator = function (calcId) {
    // Hide all
    document.querySelectorAll('.calc-panel').forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('block');
    });
    // Remove active styles from buttons
    document.querySelectorAll('.calc-tab-btn').forEach(btn => {
        btn.classList.remove('bg-gold', 'text-white', 'border-gold');
        btn.classList.add('border-gray-300', 'text-gray-600');
    });

    // Show selected
    document.getElementById(`calc-${calcId}`).classList.remove('hidden');
    document.getElementById(`calc-${calcId}`).classList.add('block');

    // Set active style to button
    const activeBtn = document.getElementById(`btn-calc-${calcId}`);
    activeBtn.classList.remove('border-gray-300', 'text-gray-600');
    activeBtn.classList.add('bg-gold', 'text-white', 'border-gold');
}

// 1. Sueldo Neto
window.calcularSueldoNeto = function () {
    const bruto = parseFloat(document.getElementById('inp-bruto').value);

    if (!bruto || isNaN(bruto) || bruto <= 0) {
        alert("Por favor, ingrese un sueldo bruto válido.");
        return;
    }

    const jubilacion = bruto * 0.11;
    const ley = bruto * 0.03;
    const obraSocial = bruto * 0.03;
    const totalDescuentos = jubilacion + ley + obraSocial;
    const neto = bruto - totalDescuentos;

    document.getElementById('out-jubilacion').textContent = `-${formatCurrency(jubilacion)}`;
    document.getElementById('out-ley').textContent = `-${formatCurrency(ley)}`;
    document.getElementById('out-obrasocial').textContent = `-${formatCurrency(obraSocial)}`;
    document.getElementById('out-sueldo-neto').textContent = formatCurrency(neto);

    document.getElementById('res-sueldo').classList.remove('hidden');
}


// 2. Despido
window.calcularDespido = function () {
    const mejorSueldo = parseFloat(document.getElementById('inp-desp-bruto').value);
    const antiguedad = parseInt(document.getElementById('inp-desp-antiguedad').value);
    const preaviso = document.getElementById('inp-desp-preaviso').value;
    const dias = parseInt(document.getElementById('inp-desp-dias').value);

    if (isNaN(mejorSueldo) || isNaN(antiguedad) || isNaN(dias) || dias < 0 || dias > 31) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    // Art 245 LCT: Un mes de sueldo por año de servicio o fracción mayor a 3 meses. 
    // Simplified assumption here: antiguedad represents years directly.
    const indemnizacionAntiguedad = mejorSueldo * antiguedad;

    // Mes integración
    const proporcionMes = (mejorSueldo / 30) * dias;
    const mesIntegracion = mejorSueldo - proporcionMes;

    // SAC Proporcional
    const sacProporcional = mejorSueldo / 12 * (dias / 30); // Very simplified, strictly speaking it's based on semester days. Using roughly monthly logic.

    // Vacaciones no gozadas (simplified: 14 days minimum per year roughly, proportional)
    const vacNoGozadas = (mejorSueldo / 25) * 14 * (dias / 180); // Extremely simplified proxy.

    // Preaviso
    let indPreaviso = 0;
    if (preaviso === 'no') {
        indPreaviso = antiguedad > 5 ? mejorSueldo * 2 : mejorSueldo;
    }

    const liquidacionTotal = indemnizacionAntiguedad + mesIntegracion + sacProporcional + vacNoGozadas + proporcionMes + indPreaviso;

    const desglose = document.getElementById('out-despido-desglose');
    desglose.innerHTML = `
        <li>Días trabajados: ${formatCurrency(proporcionMes)}</li>
        <li>Indemnización Antigüedad (Art. 245): ${formatCurrency(indemnizacionAntiguedad)}</li>
        <li>Integración Mes Despido: ${formatCurrency(mesIntegracion)}</li>
        <li>Substituto Preaviso: ${formatCurrency(indPreaviso)}</li>
        <li>SAC Proporcional: ${formatCurrency(sacProporcional)}</li>
        <li>Vacaciones no gozadas: ${formatCurrency(vacNoGozadas)}</li>
    `;

    document.getElementById('out-despido-total').textContent = formatCurrency(liquidacionTotal);
    document.getElementById('res-despido').classList.remove('hidden');
}

// 3. ART
window.calcularART = function () {
    const ibm = parseFloat(document.getElementById('inp-art-ibm').value);
    const incapacidad = parseFloat(document.getElementById('inp-art-incapacidad').value);
    const edad = parseInt(document.getElementById('inp-art-edad').value);

    if (isNaN(ibm) || isNaN(incapacidad) || isNaN(edad) || incapacidad <= 0 || edad <= 0) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    // Fórmula: 53 x IBM x (65 / Edad) x Porcentaje Incapacidad + 20%
    let base = 53 * ibm * (65.0 / edad) * (incapacidad / 100.0);
    // Asumimos accidente in itinere / en lugar de trabajo (+20% art 3 ley 26773) - aplicamos proxy estándar.
    let total = base * 1.20;

    document.getElementById('out-art-total').textContent = formatCurrency(total);
    document.getElementById('res-art').classList.remove('hidden');
}

// 4. Aguinaldo
window.calcularSAC = function () {
    const mejor = parseFloat(document.getElementById('inp-sac-mejor').value);
    const dias = parseInt(document.getElementById('inp-sac-dias').value);

    if (isNaN(mejor) || isNaN(dias) || dias < 0 || dias > 180) {
        alert("Por favor, ingrese valores válidos. (Días máx 180).");
        return;
    }

    // Aguinaldo es el 50% de la mejor remuneración, proporcional a los días
    const sac = (mejor / 2) * (dias / 180);

    document.getElementById('out-sac-total').textContent = formatCurrency(sac);
    document.getElementById('res-sac').classList.remove('hidden');
}
