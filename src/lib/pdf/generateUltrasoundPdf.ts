import { jsPDF } from 'jspdf';
import { RegistroHistorial } from '@/types';

// Helper to convert any image source (Base64 data URL, WebP, PNG, HTTP/HTTPS URL) to a clean JPEG data URL
interface LoadedPhotoData {
  dataUrl: string;
  format: 'JPEG' | 'PNG';
  width: number;
  height: number;
  aspect: number;
}

async function loadImageAsDataUrl(src: string): Promise<LoadedPhotoData | null> {
  if (!src || typeof src !== 'string' || !src.trim()) return null;

  return new Promise((resolve) => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    const timeout = setTimeout(() => {
      // Timeout fallback: if image takes too long, resolve null
      resolve(null);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const naturalW = img.naturalWidth || img.width || 800;
        const naturalH = img.naturalHeight || img.height || 600;
        const aspect = naturalW / naturalH;

        // If it is already a clean JPEG data URL, we can use it directly
        if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/jpg')) {
          resolve({
            dataUrl: src,
            format: 'JPEG',
            width: naturalW,
            height: naturalH,
            aspect,
          });
          return;
        }

        // For PNG, WebP, external URLs, draw to canvas and export as high quality JPEG
        const canvas = document.createElement('canvas');
        canvas.width = naturalW;
        canvas.height = naturalH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: src,
            format: src.startsWith('data:image/png') ? 'PNG' : 'JPEG',
            width: naturalW,
            height: naturalH,
            aspect,
          });
          return;
        }

        // Draw solid dark/medical background for image scans
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve({
          dataUrl,
          format: 'JPEG',
          width: naturalW,
          height: naturalH,
          aspect,
        });
      } catch (err) {
        console.warn('Canvas conversion failed, passing direct:', err);
        const naturalW = img.naturalWidth || img.width || 800;
        const naturalH = img.naturalHeight || img.height || 600;
        resolve({
          dataUrl: src,
          format: src.startsWith('data:image/png') ? 'PNG' : 'JPEG',
          width: naturalW,
          height: naturalH,
          aspect: naturalW / naturalH,
        });
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('Could not load image for PDF:', src.slice(0, 50));
      resolve(null);
    };

    img.src = src;
  });
}

export const generateUltrasoundPdf = async (registro: RegistroHistorial) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const info = registro.informe_ecografico;
  const fecha = info?.fecha_informe || registro.fecha_registro;
  const medico = info?.medico_ecografista || 'Dr. Henry Castañeda Aponte';

  const isEco = registro.especialidad === 'Ecografía';
  const isOzo = registro.especialidad === 'Ozonoterapia';
  const isGineco = registro.especialidad === 'Ginecología';

  let folioPrefix = 'MED';
  let reportTitle = 'INFORME CLÍNICO & RECETA MÉDICA';
  let especialidadLabel = 'CONSULTA GENERAL';
  let docMedicoCargo = 'Médico Cirujano • C&C Salud Callao';
  let cmp = info?.colegiatura_cmp || 'CMP: 48921 • Director Médico C&C Salud';

  let sec1Label = 'MOTIVO DE CONSULTA / EVALUACIÓN:';
  let sec1Value = info?.motivo_indicacion || 'Evaluación médica clínica y diagnóstico integral.';

  let sec2Label = 'TRATAMIENTO MÉDICO & PRESCRIPCIÓN:';
  let sec2Value = registro.tratamiento;

  let sec3Label = 'CONCLUSIÓN DIAGNÓSTICA / EVOLUCIÓN:';
  let sec3Value =
    info?.conclusion_diagnostica ||
    'Paciente evaluado con indicaciones médicas y plan terapéutico establecido.';

  let sec4Label = 'RECOMENDACIONES & PLAN DE MANEJO:';
  let sec4Value =
    registro.notas_adicionales ||
    info?.recomendaciones ||
    'Cumplir con el horario de medicación y medidas generales prescritas.';

  if (isEco) {
    folioPrefix = 'ECO';
    reportTitle = 'INFORME DE ESTUDIO ULTRASONOGRÁFICO';
    especialidadLabel = 'ECOGRAFÍA';
    docMedicoCargo = 'Especialista en Ultrasonografía Diagnóstica';
    cmp = info?.colegiatura_cmp || 'CMP: 48921 • Especialista en Ultrasonografía';
    sec1Label = 'MODALIDAD / TIPO DE EXAMEN:';
    sec1Value = info?.tipo_ecografia || 'Ecografía Diagnóstica Especializada';
    sec2Label = 'HALLAZGOS ECOGRÁFICOS:';
    sec2Value = info?.hallazgos_detallados || registro.tratamiento;
    sec3Label = 'CONCLUSIÓN DIAGNÓSTICA:';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Estudio ecográfico completado acorde a protocolo clínico.';
    sec4Label = 'RECOMENDACIONES & PLAN:';
    sec4Value = info?.recomendaciones || registro.notas_adicionales || '';
  } else if (isOzo) {
    folioPrefix = 'OZO';
    reportTitle = 'INFORME CLÍNICO DE OZONOTERAPIA & REGENERACIÓN';
    especialidadLabel = 'OZONOTERAPIA';
    docMedicoCargo = 'Especialista en Ozonoterapia & Medicina Regenerativa';
    cmp = info?.colegiatura_cmp || 'CMP: 48921 • Especialista en Ozonoterapia Médica';
    sec1Label = 'PROTOCOLO / PROCEDIMIENTO TERAPÉUTICO:';
    sec1Value = info?.tipo_ecografia || 'Protocolo de Ozonoterapia Médica Especializada';
    sec2Label = 'TRATAMIENTO APLICADO & PRESCRIPCIÓN:';
    sec2Value = registro.tratamiento;
    sec3Label = 'CONCLUSIÓN CLÍNICA & EVOLUCIÓN:';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Sesión de ozonoterapia completada con éxito. Paciente tolera adecuadamente el procedimiento sin reacciones adversas.';
    sec4Label = 'INDICACIONES & PRÓXIMA SESIÓN:';
    sec4Value =
      registro.notas_adicionales ||
      info?.recomendaciones ||
      'Abundante hidratación oral (2 litros de agua/día), reposo relativo las primeras 12 horas y continuar con el esquema prescrito.';
  } else if (isGineco) {
    folioPrefix = 'GIN';
    reportTitle = 'INFORME GINECOLÓGICO & SALUD FEMENINA';
    especialidadLabel = 'GINECOLOGÍA';
    docMedicoCargo = 'Médico Especialista en Ginecología & Salud de la Mujer';
    cmp = info?.colegiatura_cmp || 'CMP: 48921 • Especialista en Ginecología';
    sec1Label = 'EVALUACIÓN GINECOLÓGICA / PROCEDIMIENTO:';
    sec1Value =
      info?.motivo_indicacion ||
      info?.tipo_ecografia ||
      'Evaluación ginecológica integral y control clínico preventivo.';
    sec2Label = 'PLAN TERAPÉUTICO & PRESCRIPCIÓN MÉDICA:';
    sec2Value = registro.tratamiento;
    sec3Label = 'DIAGNÓSTICO & CONCLUSIÓN:';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Atención ginecológica finalizada satisfactoriamente con indicaciones y receta prescrita.';
    sec4Label = 'INDICACIONES & RECOMENDACIONES:';
    sec4Value =
      registro.notas_adicionales ||
      info?.recomendaciones ||
      'Cumplir estrictamente el tratamiento indicado y acudir a control médico preventivo.';
  }

  // Pre-load photos
  const rawPhotos: { src: string; label: string }[] = [];
  if (registro.foto_antes && registro.foto_antes.trim()) {
    rawPhotos.push({
      src: registro.foto_antes,
      label: isEco ? 'SCAN 1: CORTE ECOGRÁFICO' : 'FOTO ANTES / INICIAL',
    });
  }
  if (registro.foto_despues && registro.foto_despues.trim()) {
    rawPhotos.push({
      src: registro.foto_despues,
      label: isEco ? 'SCAN 2: CORTE ECOGRÁFICO' : 'FOTO DESPUÉS / CONTROL',
    });
  }

  const loadedPhotos = await Promise.all(
    rawPhotos.map(async (p) => {
      const imgData = await loadImageAsDataUrl(p.src);
      return imgData ? { ...p, ...imgData } : null;
    })
  );
  const photos = loadedPhotos.filter((p): p is NonNullable<typeof p> => p !== null);

  // Helper to draw top branding strip
  const drawTopStrip = () => {
    doc.setFillColor(0, 66, 153); // CYC Salud Royal Blue #004299
    doc.rect(0, 0, 210, 6, 'F');
  };

  // Helper to draw bottom brand strip
  const drawBottomStrip = () => {
    doc.setFillColor(0, 66, 153); // CYC Salud Royal Blue #004299
    doc.rect(0, 292, 210, 5, 'F');
  };

  // 1. Page 1 Header Banner & Top Border
  drawTopStrip();

  // Clinic Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(0, 66, 153);
  doc.text('CONSULTORIO MÉDICO CYC SALUD • CALLAO', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Especialidades: Consulta General • Ginecología • Ecografía • Ozonoterapia',
    15,
    23
  );
  doc.text(
    'Av. Túpac Amaru Mz. "V" Lt. 22, Urb. Santa Cruz - Callao • Tel/WhatsApp: +51 965 732 965 • ¡Tu Salud es Nuestra Prioridad!',
    15,
    27
  );

  // Folio Box (Right top)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(138, 12, 57, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('INFORME MÉDICO OFICIAL', 142, 16.5);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`N° ${folioPrefix}-${registro.dni}`, 142, 21.5);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha: ${fecha}`, 142, 25.5);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 31, 195, 31);

  // Title: INFORME
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle, 15, 39);

  // 2. Patient Data Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 43, 180, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PACIENTE:', 19, 48.5);
  doc.text('DNI / DOC:', 122, 48.5);
  doc.text('EDAD:', 162, 48.5);

  doc.text('TELÉFONO:', 19, 58.5);
  doc.text('CORREO:', 65, 58.5);
  doc.text('ESPECIALIDAD:', 138, 58.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(registro.nombres_completos.toUpperCase(), 19, 53);
  doc.text(registro.dni, 122, 53);
  doc.text(`${registro.edad} años`, 162, 53);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(registro.celular || 'No registrado', 19, 63);
  doc.text(registro.correo || 'No registrado', 65, 63);

  // Specialty Badge color
  if (isOzo) {
    doc.setTextColor(124, 58, 237); // Purple
  } else if (isGineco) {
    doc.setTextColor(230, 0, 126); // Pink
  } else {
    doc.setTextColor(0, 66, 153); // Blue
  }
  doc.setFont('helvetica', 'bold');
  doc.text(especialidadLabel, 138, 63);

  // 3. Treatment / Examination Details
  let currentY = 72;

  // Section 1: Tipo / Modalidad / Motivo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(sec1Label, 15, currentY);
  currentY += 4.5;

  doc.setFontSize(10);
  doc.setTextColor(0, 66, 153);
  const splitSec1 = doc.splitTextToSize(sec1Value, 180);
  doc.text(splitSec1, 15, currentY);
  currentY += splitSec1.length * 4.5 + 3.5;

  // Section 2: Tratamiento / Hallazgos / Prescripción
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 66, 153);
  doc.text(sec2Label, 15, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const splitSec2 = doc.splitTextToSize(sec2Value, 180);
  doc.text(splitSec2, 15, currentY);
  currentY += splitSec2.length * 4.5 + 3.5;

  // Biometry / Measurements (if present)
  if (info?.medidas_biometria) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, currentY, 180, 10.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('MEDICIONES & BIOMETRÍA:', 18, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(info.medidas_biometria, 18, currentY + 8.5);
    currentY += 14;
  }

  // Section 3: Diagnostic Conclusion Box
  doc.setFillColor(240, 247, 255); // Soft Blue 50
  doc.setDrawColor(0, 66, 153); // Brand Royal Blue
  doc.setLineWidth(0.8);

  const splitConclusion = doc.splitTextToSize(sec3Value, 172);
  const boxHeight = Math.max(18, splitConclusion.length * 4.5 + 9);

  doc.roundedRect(15, currentY, 180, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 66, 153);
  doc.text(sec3Label, 19, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(splitConclusion, 19, currentY + 10.5);

  currentY += boxHeight + 4.5;

  // Section 4: Recommendations
  if (sec4Value && sec4Value.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(sec4Label, 15, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitRecom = doc.splitTextToSize(sec4Value, 180);
    doc.text(splitRecom, 15, currentY);
    currentY += splitRecom.length * 4 + 4;
  }

  // 4. IMAGES EMBEDDING (Ultrasound scans or Before/After photos)
  const page1PhotoHeight = 46;
  const signatureSpaceRequired = 36;
  const maxPage1ContentY = 280 - signatureSpaceRequired; // ~244 mm
  const photoSectionHeight = photos.length > 0 ? page1PhotoHeight + 8 : 0;

  const fitsOnPage1 = photos.length === 0 || currentY + photoSectionHeight <= maxPage1ContentY;
  const totalPages = fitsOnPage1 ? 1 : 2;

  // Helper to draw a single image frame
  const drawSinglePhoto = (
    p: (typeof photos)[0],
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    const labelH = 5;
    const pad = 1;
    const availW = w - pad * 2;
    const availH = h - pad * 2 - labelH;

    let renderW = availW;
    let renderH = availW / p.aspect;
    if (renderH > availH) {
      renderH = availH;
      renderW = availH * p.aspect;
    }
    const renderX = x + pad + (availW - renderW) / 2;
    const renderY = y + pad + (availH - renderH) / 2;

    try {
      doc.addImage(p.dataUrl, p.format, renderX, renderY, renderW, renderH, undefined, 'FAST');
    } catch (err) {
      console.warn('Failed to add image to PDF:', err);
    }

    // Label badge at bottom of frame
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 0.5, y + h - labelH, w - 1, labelH - 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0, 159, 227); // Medical Cyan
    doc.text(p.label, x + w / 2, y + h - 1.5, { align: 'center' });
  };

  const drawPhotosAt = (startY: number, frameH: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 66, 153);
    doc.text(
      isEco
        ? 'REGISTRO FOTOGRÁFICO / CAPTURAS ULTRASONOGRÁFICAS:'
        : 'REGISTRO FOTOGRÁFICO DE EVOLUCIÓN CLÍNICA (ANTES / DESPUÉS):',
      15,
      startY
    );

    const imgY = startY + 3.5;

    if (photos.length === 1) {
      const p = photos[0];
      const w = 115;
      const x = (210 - w) / 2;
      drawSinglePhoto(p, x, imgY, w, frameH);
    } else if (photos.length >= 2) {
      const w = 87;
      const x1 = 15;
      const x2 = 108;
      drawSinglePhoto(photos[0], x1, imgY, w, frameH);
      drawSinglePhoto(photos[1], x2, imgY, w, frameH);
    }
  };

  const drawSignatureAt = (sigY: number) => {
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(115, sigY, 185, sigY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(medico, 150, sigY + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(cmp, 150, sigY + 8.5, { align: 'center' });
    doc.text(docMedicoCargo, 150, sigY + 12.5, { align: 'center' });
    doc.text('Firma y Sello Digital Autorizado', 150, sigY + 16.5, { align: 'center' });
  };

  const drawFooter = (pageNum: number) => {
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Documento emitido electrónicamente • ID: ${registro.id} • Fecha: ${fecha}`,
      15,
      285
    );
    doc.text(`Página ${pageNum} de ${totalPages}`, 180, 285);
    drawBottomStrip();
  };

  if (fitsOnPage1) {
    if (photos.length > 0) {
      drawPhotosAt(currentY + 2, page1PhotoHeight);
    }
    drawSignatureAt(248);
    drawFooter(1);
  } else {
    drawFooter(1);

    // Page 2
    doc.addPage();
    drawTopStrip();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 66, 153);
    doc.text('CONSULTORIO MÉDICO CYC SALUD • CALLAO', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      isEco
        ? 'ANEXO FOTOGRÁFICO: REGISTRO DE CAPTURAS ULTRASONOGRÁFICAS'
        : 'ANEXO FOTOGRÁFICO: EVIDENCIA CLÍNICA Y EVOLUCIÓN TERAPÉUTICA',
      15,
      23
    );
    doc.text(
      `PACIENTE: ${registro.nombres_completos.toUpperCase()} • DNI: ${registro.dni} • Fecha: ${fecha}`,
      15,
      27
    );

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 31, 195, 31);

    const page2PhotoHeight = 72;
    drawPhotosAt(38, page2PhotoHeight);

    drawSignatureAt(38 + 3.5 + page2PhotoHeight + 14);
    drawFooter(2);
  }

  // Trigger download with custom filename per specialty
  const cleanName = registro.nombres_completos.replace(/\s+/g, '_');
  let filename = `Informe_Medico_${registro.dni}_${cleanName}.pdf`;
  if (isEco) {
    filename = `Informe_Ecografico_${registro.dni}_${cleanName}.pdf`;
  } else if (isOzo) {
    filename = `Informe_Ozonoterapia_${registro.dni}_${cleanName}.pdf`;
  } else if (isGineco) {
    filename = `Informe_Ginecologia_${registro.dni}_${cleanName}.pdf`;
  }

  doc.save(filename);
};

// Also export alias for semantic clarity
export const generateMedicalPdf = generateUltrasoundPdf;
