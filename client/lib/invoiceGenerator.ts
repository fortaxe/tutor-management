import jsPDF from 'jspdf';
import moment from 'moment';
import { Tutor, Student } from '../types';

export const generateInvoice = async (tutor: Tutor, student: Student, customDate?: string, customDescription?: string, returnBlob: boolean = false, amount?: number) => {
    const doc = new jsPDF();

    // Helper to load font
    const loadFont = async (url: string, filename: string, fontName: string, fontStyle: string) => {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const buffer = await res.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);
                doc.addFileToVFS(filename, base64);
                doc.addFont(filename, fontName, fontStyle);
                return true;
            }
        } catch (e) {
            console.error(`Error loading font ${fontName}:`, e);
        }
        return false;
    };

    // Load High-Quality Static Fonts
    const fontsLoaded = {
        spaceGroteskBold: await loadFont('/fonts/SpaceGrotesk-Bold.ttf', 'SpaceGrotesk-Bold.ttf', 'Space Grotesk', 'bold'),
        geistSemiBold: await loadFont('/fonts/Geist-SemiBold.ttf', 'Geist-SemiBold.ttf', 'Geist', 'semibold'),
        geistNormal: await loadFont(encodeURI('/fonts/Geist[wght].ttf'), 'Geist-Var.ttf', 'Geist', 'normal')
    };

    // Layout Constants
    const margin = 14;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);
    const startX = margin;
    const endX = margin + contentWidth;

    const displayAmount = amount !== undefined ? amount : student.paidAmount;

    // --- 1. Header (RECEIPT) ---
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);

    if (fontsLoaded.spaceGroteskBold) {
        doc.setFont('Space Grotesk', 'bold');
        doc.text('RECEIPT', startX, 15);
    } else {
        doc.setFont('helvetica', 'bold');
        doc.text('RECEIPT', startX, 15);
    }

    // --- Receipt Info Section ---
    doc.setFontSize(10);
    if (fontsLoaded.geistSemiBold) {
        doc.setFont('Geist', 'semibold');
    } else {
        doc.setFont('helvetica', 'bold');
    }

    const prefix = (tutor.name || 'TP').substring(0, 2).toUpperCase();
    const month = moment(customDate || student.createdAt).format('MM');
    const randomDigits = Math.floor(100 + Math.random() * 900).toString();
    const receiptNo = `${prefix}${month}${randomDigits}`;
    const dateOfIssue = moment(customDate || student.createdAt).format('MMM DD, YYYY');

    // Column 1: Labels (Left Aligned below 'RECEIPT')
    const infoStartY = 25;
    doc.text('Receipt No.', startX, infoStartY);
    doc.text('Date Of Issue', startX, infoStartY + 4.5);

    // Column 2: Values (Aligned slightly right of labels)
    const valuesX = startX + 40;
    doc.text(receiptNo, valuesX, infoStartY);
    doc.text(dateOfIssue, valuesX, infoStartY + 4.5);

    // --- Logo Section (Top Right) ---
    let logoAdded = false;
    if (tutor.logo) {
        try {
            const response = await fetch(tutor.logo, { mode: 'cors', cache: 'no-store' });
            if (!response.ok) throw new Error('Logo fetch failed');
            const blob = await response.blob();

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            await new Promise((resolve) => {
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    const img = new Image();
                    img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        const logoHeight = 15;
                        const logoWidth = logoHeight * aspectRatio;
                        let format = 'PNG';
                        if (base64data.startsWith('data:image/jpeg') || base64data.startsWith('data:image/jpg')) format = 'JPEG';
                        else if (base64data.startsWith('data:image/webp')) format = 'WEBP';

                        doc.addImage(base64data, format, endX - logoWidth, 7, logoWidth, logoHeight, undefined, 'FAST');
                        logoAdded = true;
                        resolve(null);
                    };
                    img.src = base64data;
                };
                reader.onerror = () => resolve(null);
            });
        } catch (e) {
            console.warn('Failed to add logo to PDF:', e);
        }
    }

    if (!logoAdded) {
        doc.setFontSize(14);
        if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
        else doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);

        const textY = 14;
        doc.text(tutor.name.toUpperCase(), endX, textY, { align: 'right' });
    }

    // --- 2. Box Section (Issued By / Billed To) ---
    const borderColor = [226, 232, 240] as [number, number, number];
    doc.setDrawColor(...borderColor);

    const boxY = 40;
    const boxPadding = 6;
    const textStartX = startX + boxPadding;
    const textStartY = boxY + boxPadding + 2.5;

    const address = `${tutor.address || ''} ${tutor.city || ''} ${tutor.state || ''}`.trim();
    const addressLines = address ? doc.splitTextToSize(address, 75) : [];
    const nameY = textStartY + 8;
    const addressY = nameY + 6;

    let currentTutorY = addressY;
    if (addressLines.length > 0) {
        currentTutorY += (addressLines.length * 4.5) + 1.3;
    }

    const tutorPhoneY = currentTutorY;
    let contentBottomY = tutorPhoneY;
    const gstY = tutorPhoneY + 4.5 + 1.3;
    if (tutor.gstNumber) {
        contentBottomY = gstY;
    }

    const studentPhoneY = nameY + 6;
    const contentMaxY = Math.max(contentBottomY, studentPhoneY);
    const boxHeight = (contentMaxY - boxY) + boxPadding;

    doc.roundedRect(startX, boxY, contentWidth, boxHeight, 3, 3);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    doc.text('ISSUED BY', textStartX, textStartY);
    doc.text('BILLED TO', 115, textStartY);

    doc.setFontSize(10);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    doc.text(tutor.name, textStartX, nameY);
    doc.text(student.name, 115, nameY);

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'normal');

    if (addressLines.length > 0) {
        doc.text(addressLines, textStartX, addressY);
    }
    doc.text(tutor.ownerPhone || '', textStartX, tutorPhoneY);
    if (tutor.gstNumber) {
        doc.text(`GSTIN : ${tutor.gstNumber}`, textStartX, gstY);
    }
    doc.text(student.parentPhone, 115, studentPhoneY);

    // --- 3. Paid Amount Header ---
    const dividerY = boxY + boxHeight + 5.5;
    doc.setDrawColor(...borderColor);
    doc.line(startX, dividerY, endX, dividerY);

    const section3Y = dividerY + 9.5;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    const payText = `₹${displayAmount.toFixed(2)} PAID ON ${moment(customDate || student.createdAt).format('MMM DD, YYYY')}`.toUpperCase();
    doc.text(payText, startX, section3Y);

    // --- 4. Table (Line Items) ---
    const startDatev = moment(student.planStart).format('MMM DD, YYYY');
    const endDatev = moment(student.planStart).add((student.planDurationMonths * 30) - 1, 'days').format('MMM DD, YYYY');

    const durationText = student.planDurationMonths > 0 ? `${student.planDurationMonths} ${student.planDurationMonths === 1 ? 'Month' : 'Months'}` : 'N/A';

    const itemBoxY = section3Y + 5;
    const itemBoxPadding = 2.6;
    const itemBoxHeight = 22;
    const itemBoxRadius = 2.6;

    doc.setDrawColor(...borderColor);
    doc.roundedRect(startX, itemBoxY, contentWidth, itemBoxHeight, itemBoxRadius, itemBoxRadius);

    const itemDividerY = itemBoxY + 11;
    doc.line(startX, itemDividerY, endX, itemDividerY);

    const c1X = startX + 4;
    const c2X = startX + (contentWidth * 0.28) + 4;
    const c3X = startX + (contentWidth * 0.48) + 4;
    const c4X = startX + (contentWidth * 0.68) + 4;
    const c5X = startX + contentWidth - 4;

    const hY = itemBoxY + itemBoxPadding + 4;
    const vY = itemDividerY + itemBoxPadding + 4;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    doc.text('DESCRIPTION', c1X, hY);
    doc.text('DURATION', c2X, hY);
    doc.text('START DATE', c3X, hY);
    doc.text('END DATE', c4X, hY);
    doc.text('AMOUNT', c5X, hY, { align: 'right' });

    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    let description = customDescription || (customDate ? 'Plan renewal' : 'Admission Fee');
    const descLower = description.toLowerCase();
    if (descLower.includes('initial') || descLower.includes('admission') || descLower.includes('registration')) {
        description = 'Admission';
    } else if (descLower.includes('renewal')) {
        description = 'Fee Renewal';
    } else if (descLower.includes('balance') || descLower.includes('cleared')) {
        description = 'Fees Cleared';
    }
    doc.text(description, c1X, vY);
    doc.text(durationText, c2X, vY);
    doc.text(startDatev, c3X, vY);
    doc.text(endDatev, c4X, vY);
    doc.text(`₹${student.feesAmount}`, c5X, vY, { align: 'right' });

    const tableFinalY = itemBoxY + itemBoxHeight;

    // --- 5. Totals ---
    let totalRowY = tableFinalY + 10;
    const labelX = endX - 65;

    doc.setFontSize(10);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    doc.setTextColor(156, 163, 175);
    doc.text('Total', labelX, totalRowY);
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${student.feesAmount.toFixed(2)}`, endX, totalRowY, { align: 'right' });

    totalRowY += 5.5;
    doc.setTextColor(156, 163, 175);
    doc.text('Amount Paid', labelX, totalRowY);
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${displayAmount.toFixed(2)}`, endX, totalRowY, { align: 'right' });

    const due = student.feesAmount - student.paidAmount;
    if (due > 0) {
        totalRowY += 5.5;
        doc.setTextColor(239, 68, 68);
        doc.text('Due', labelX, totalRowY);
        doc.text(`₹${due.toFixed(2)}`, endX, totalRowY, { align: 'right' });
    }

    let finalY = totalRowY;

    // --- 6. Payment Information Section ---
    finalY += 10;
    doc.setDrawColor(...borderColor);
    doc.line(startX, finalY, endX, finalY);

    finalY += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFORMATION', startX, finalY);

    finalY += 5;
    const payBoxY = finalY;
    const payBoxPadding = 2.6;
    const payBoxHeight = 22;
    const payBoxRadius = 2.6;

    doc.setDrawColor(...borderColor);
    doc.roundedRect(startX, payBoxY, contentWidth, payBoxHeight, payBoxRadius, payBoxRadius);

    const dividerY2 = payBoxY + 11;
    doc.line(startX, dividerY2, endX, dividerY2);

    const col1X = startX + 4;
    const col2X = startX + (contentWidth * 0.25) + 4;
    const col3X = startX + (contentWidth * 0.5) + 4;
    const col4X = startX + (contentWidth * 0.75) + 4;

    const labelY = payBoxY + payBoxPadding + 4;
    const valueCenteredY = dividerY2 + payBoxPadding + 4;

    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT METHOD', col1X, labelY);
    doc.text('DATE', col2X, labelY);
    doc.text('AMOUNT PAID', col3X, labelY);
    doc.text('RECEIPT NO.', col4X, labelY);

    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    doc.text(student.paymentMode || 'Cash', col1X, valueCenteredY);
    doc.text(moment(customDate || student.createdAt).format('MMM DD, YYYY'), col2X, valueCenteredY);
    doc.text(`₹${displayAmount}`, col3X, valueCenteredY);
    doc.text(receiptNo, col4X, valueCenteredY);

    // --- 7. Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    const pBy = "POWERED BY ";
    const tutorTxt = "TUTOR ";
    const proTxt = "PRO";
    const totalFooterWidth = doc.getTextWidth(pBy + tutorTxt + proTxt);
    let currentFX = (pageWidth - totalFooterWidth) / 2;
    const footerY = pageHeight - 10;

    doc.setTextColor(156, 163, 175);
    doc.text(pBy, currentFX, footerY);
    currentFX += doc.getTextWidth(pBy);

    doc.setTextColor(0, 0, 0);
    doc.text(tutorTxt, currentFX, footerY);
    currentFX += doc.getTextWidth(tutorTxt);

    doc.setTextColor(250, 204, 21); // Yellow-400 equivalent #FACC15
    doc.text(proTxt, currentFX, footerY);

    if (returnBlob) return doc.output('blob');
    doc.save(`${student.name.replace(/\s+/g, '_')}_Receipt.pdf`);
};
