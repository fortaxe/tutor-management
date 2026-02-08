import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { Gym, Member } from '../types';

export const generateInvoice = async (gym: Gym, member: Member, customDate?: string, customDescription?: string, returnBlob: boolean = false, amount?: number) => {
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

    const displayAmount = amount !== undefined ? amount : member.paidAmount;

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

    const prefix = (gym.name || 'GS').substring(0, 2).toUpperCase();
    const month = moment(customDate || member.createdAt).format('MM');
    const randomDigits = Math.floor(100 + Math.random() * 900).toString();
    const receiptNo = `${prefix}${month}${randomDigits}`;
    const dateOfIssue = moment(customDate || member.createdAt).format('MMM DD, YYYY');

    // Column 1: Labels (Left Aligned below 'RECEIPT')
    const infoStartY = 25; // 10px gap from RECEIPT title (approx y=15)
    doc.text('Receipt No.', startX, infoStartY);
    doc.text('Date Of Issue', startX, infoStartY + 4.5);

    // Column 2: Values (Aligned slightly right of labels)
    // Column 2: Values (Aligned slightly right of labels)
    const valuesX = startX + 40; // Increased spacing to 40px gap
    doc.text(receiptNo, valuesX, infoStartY); // Removed aliign right to just start at 40
    doc.text(dateOfIssue, valuesX, infoStartY + 4.5);

    // --- Logo Section (Top Right) ---
    let logoAdded = false;
    if (gym.logo) {
        try {
            const response = await fetch(gym.logo, { mode: 'cors', cache: 'no-store' });
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
                        // Detect format from base64 prefix
                        let format = 'PNG';
                        if (base64data.startsWith('data:image/jpeg') || base64data.startsWith('data:image/jpg')) format = 'JPEG';
                        else if (base64data.startsWith('data:image/webp')) format = 'WEBP';

                        doc.addImage(base64data, format, endX - logoWidth, 7, logoWidth, logoHeight, undefined, 'FAST');
                        logoAdded = true;
                        resolve(null);
                    };
                    img.onerror = () => {
                        console.error('Image tag failed to load logo');
                        resolve(null);
                    };
                    img.src = base64data;
                };
                reader.onerror = () => {
                    console.error('FileReader failed');
                    resolve(null);
                }
            });
        } catch (e) {
            console.warn('Failed to add logo to PDF:', e);
        }
    }

    if (!logoAdded) {
        // Fallback: Show Gym Name if logo is missing or failed to load
        doc.setFontSize(14);
        if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
        else doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);

        const textY = 14;
        doc.text(gym.name.toUpperCase(), endX, textY, { align: 'right' });
    }

    // --- 2. Box Section (Issued By / Billed To) ---
    const borderColor = [226, 232, 240] as [number, number, number]; // #E2E8F0
    doc.setDrawColor(...borderColor);

    const boxY = 40; // Increased to 40 to create ~20px gap below Receipt Info (approx y=29.5)
    const boxPadding = 6; // Increased padding
    const textStartX = startX + boxPadding;
    const textStartY = boxY + boxPadding + 2.5;

    // Details logic first to determine height
    const address = `${gym.address || ''} ${gym.city || ''} ${gym.state || ''}`.trim();

    // Only split text if address exists, otherwise empty array
    const addressLines = address ? doc.splitTextToSize(address, 75) : [];

    // Calculate Y positions for dynamic content
    const nameY = textStartY + 8;

    // Position address below name if it exists, otherwise items move up
    const addressY = nameY + 6;

    // If address exists, phone starts after it. If no address, phone acts as next item.
    // However, original design likely wants specific spacing. Let's stack them.
    // If addressLines is empty, we just don't print it.

    let currentGymY = addressY;
    if (addressLines.length > 0) {
        currentGymY += (addressLines.length * 4.5) + 1.3;
    }

    const gymPhoneY = currentGymY;

    let contentBottomY = gymPhoneY;

    const gstY = gymPhoneY + 4.5 + 1.3;
    if (gym.gstNumber) {
        contentBottomY = gstY;
    }

    const memberPhoneY = nameY + 6;

    // Calculate dynamic height based on content + bottom padding
    const contentMaxY = Math.max(contentBottomY, memberPhoneY);
    const boxHeight = (contentMaxY - boxY) + boxPadding;

    // Draw the box
    doc.roundedRect(startX, boxY, contentWidth, boxHeight, 3, 3);

    // Labels style
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    doc.text('ISSUED BY', textStartX, textStartY);
    doc.text('BILLED TO', 115, textStartY);

    // Business Names (10px Geist SemiBold)
    doc.setFontSize(10);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    doc.text(gym.name, textStartX, nameY); // Use calculated Y
    doc.text(member.name, 115, nameY);

    // Details style (Geist SemiBold 10px #9CA3AF)
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'normal');

    if (addressLines.length > 0) {
        doc.text(addressLines, textStartX, addressY);
    }
    doc.text(gym.ownerPhone || '', textStartX, gymPhoneY);
    if (gym.gstNumber) {
        doc.text(`GSTIN : ${gym.gstNumber}`, textStartX, gstY);
    }
    doc.text(member.phone, 115, memberPhoneY);


    // --- 3. Paid Amount Header ---
    // Divider below Box (Top Margin 20px ~ 5.5mm)
    const dividerY = boxY + boxHeight + 5.5;
    doc.setDrawColor(...borderColor);
    doc.line(startX, dividerY, endX, dividerY);

    // Bottom Margin 20px (~5.5mm) + Text Height (~4mm adjustment)
    const section3Y = dividerY + 9.5;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    // Using Rupee Symbol directly. Note: Requires font support in PDF generation.
    // If Space Grotesk TTF has the char, it will render.
    const payText = `₹${displayAmount.toFixed(2)} PAID ON ${moment(customDate || member.createdAt).format('MMM DD, YYYY')}`.toUpperCase();
    doc.text(payText, startX, section3Y);


    // --- 4. Table (Line Items) ---
    const startDatev = moment(member.planStart).format('MMM DD, YYYY');
    const endDatev = moment(member.planStart).add(member.planDurationDays, 'days').format('MMM DD, YYYY');

    let durationText = '';
    const totalDays = member.planDurationDays + 1;
    if (totalDays <= 1) {
        durationText = 'Day Pass';
    } else {
        const months = Math.round(totalDays / 30);
        if (months <= 1) {
            durationText = '1 Month';
        } else {
            durationText = `${months} Months`;
        }
    }

    // --- 4. Line Items Box ---
    const itemBoxY = section3Y + 5;
    const itemBoxPadding = 2.6; // 10px (matches Section 6)
    const itemBoxHeight = 22;
    const itemBoxRadius = 2.6; // 10px

    doc.setDrawColor(...borderColor);
    doc.roundedRect(startX, itemBoxY, contentWidth, itemBoxHeight, itemBoxRadius, itemBoxRadius);

    // Horizontal Divider
    const itemDividerY = itemBoxY + 11;
    doc.line(startX, itemDividerY, endX, itemDividerY);

    // Column Positions
    const c1X = startX + 4;
    const c2X = startX + (contentWidth * 0.28) + 4;
    const c3X = startX + (contentWidth * 0.48) + 4;
    const c4X = startX + (contentWidth * 0.68) + 4;
    const c5X = startX + contentWidth - 4;

    const hY = itemBoxY + itemBoxPadding + 4;
    const vY = itemDividerY + itemBoxPadding + 4;

    // HEADERS (Black, Space Grotesk Bold 10px)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    doc.text('DESCRIPTION', c1X, hY);
    doc.text('DURATION', c2X, hY);
    doc.text('START DATE', c3X, hY);
    doc.text('END DATE', c4X, hY);
    doc.text('AMOUNT', c5X, hY, { align: 'right' });

    // VALUES (Gray #9CA3AF, Geist SemiBold 10px)
    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    // Normalize descriptions to consistent spelling and casing
    let description = customDescription || (customDate ? 'Plan renewal' : 'Registration');
    const descLower = description.toLowerCase();
    if (descLower.includes('initial') || descLower.includes('registration')) {
        description = 'Registration';
    } else if (descLower.includes('renewal')) {
        description = 'Plan renewal';
    } else if (descLower.includes('balance') || descLower.includes('cleared')) {
        description = 'Balance Cleared';
    }
    doc.text(description, c1X, vY);
    doc.text(durationText, c2X, vY);
    doc.text(startDatev, c3X, vY);
    doc.text(endDatev, c4X, vY);
    doc.text(`₹${member.feesAmount}`, c5X, vY, { align: 'right' });

    const tableFinalY = itemBoxY + itemBoxHeight;

    // --- 5. Totals ---
    let totalRowY = tableFinalY + 10;
    const labelX = endX - 65; // Shift left to ensure ~70px gap

    doc.setFontSize(10);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');

    // Total row
    doc.setTextColor(156, 163, 175); // #9CA3AF
    doc.text('Total', labelX, totalRowY);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`₹${member.feesAmount.toFixed(2)}`, endX, totalRowY, { align: 'right' });

    totalRowY += 5.5;
    // Amount Paid row
    doc.setTextColor(156, 163, 175);
    doc.text('Amount Paid', labelX, totalRowY);
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${displayAmount.toFixed(2)}`, endX, totalRowY, { align: 'right' });

    // Amount Due row (Conditional)
    const due = member.feesAmount - member.paidAmount;
    if (due > 0) {
        totalRowY += 5.5;
        doc.setTextColor(239, 68, 68); // Red Color #EF4444
        doc.text('Due', labelX, totalRowY);
        doc.text(`₹${due.toFixed(2)}`, endX, totalRowY, { align: 'right' });
    }

    // Update finalY for next section
    let finalY = totalRowY;


    // --- 6. Payment Information Section ---
    finalY += 10;

    // Divider before Payment Info
    doc.setDrawColor(...borderColor);
    doc.line(startX, finalY, endX, finalY);

    finalY += 10;

    // Title above the box
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFORMATION', startX, finalY);

    // --- 6. Payment Information Box ---
    finalY += 5;

    // Box Configuration
    const payBoxY = finalY;
    const payBoxPadding = 2.6; // 10px
    // Height: PaddingTop + LabelHeight + Gap + Divider + Gap + ValueHeight + PaddingBottom
    // ample space
    const payBoxHeight = 22;
    const payBoxRadius = 2.6; // 10px

    doc.setDrawColor(...borderColor);
    doc.roundedRect(startX, payBoxY, contentWidth, payBoxHeight, payBoxRadius, payBoxRadius);

    // Horizontal Divider
    const dividerY2 = payBoxY + 11; // Middle of box approx
    doc.line(startX, dividerY2, endX, dividerY2);

    // Styling Shared
    doc.setFontSize(10);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    // Column Positions (approx equal distribution)
    // Column Positions (sidewise padding 4mm)
    const col1X = startX + 4;
    const col2X = startX + (contentWidth * 0.25) + 4;
    const col3X = startX + (contentWidth * 0.5) + 4;
    const col4X = startX + (contentWidth * 0.75) + 4;

    const labelY = payBoxY + payBoxPadding + 4; // (Top padding) + ~capHeight adjustment 
    const valueCenteredY = dividerY2 + payBoxPadding + 4; // (Divider padding) + ~capHeight adjustment

    // LABELS (Black)
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT METHOD', col1X, labelY);
    doc.text('DATE', col2X, labelY);
    doc.text('AMOUNT PAID', col3X, labelY);
    doc.text('RECEIPT NO.', col4X, labelY);

    // VALUES (Gray #9CA3AF)
    doc.setTextColor(156, 163, 175);
    if (fontsLoaded.geistSemiBold) doc.setFont('Geist', 'semibold');
    else doc.setFont('helvetica', 'bold');



    doc.text(member.paymentMode || 'Cash', col1X, valueCenteredY);
    doc.text(moment(customDate || member.createdAt).format('MMM DD, YYYY'), col2X, valueCenteredY);
    doc.text(`₹${displayAmount}`, col3X, valueCenteredY);
    doc.text(receiptNo, col4X, valueCenteredY);


    // --- 7. Footer ---
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);
    if (fontsLoaded.spaceGroteskBold) doc.setFont('Space Grotesk', 'bold');
    else doc.setFont('helvetica', 'bold');

    const pBy = "POWERED BY ";
    const gymTxt = "GYM ";
    const stackTxt = "STACK";
    const totalFooterWidth = doc.getTextWidth(pBy + gymTxt + stackTxt);
    let currentFX = (pageWidth - totalFooterWidth) / 2;
    const footerY = pageHeight - 10;

    // "POWERED BY " - #9CA3AF
    doc.setTextColor(156, 163, 175);
    doc.text(pBy, currentFX, footerY);
    currentFX += doc.getTextWidth(pBy);

    // "GYM " - Black
    doc.setTextColor(0, 0, 0);
    doc.text(gymTxt, currentFX, footerY);
    currentFX += doc.getTextWidth(gymTxt);

    // "STACK" - #22C55E
    doc.setTextColor(34, 197, 94);
    doc.text(stackTxt, currentFX, footerY);

    if (returnBlob) {
        return doc.output('blob');
    }
    doc.save(`${member.name.replace(/\s+/g, '_')}_Receipt.pdf`);
};
