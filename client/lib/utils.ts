
export const objectToFormData = (obj: any): FormData => {
    const formData = new FormData();

    Object.keys(obj).forEach(key => {
        const value = obj[key];

        // Skip undefined or null values
        if (value === undefined || value === null) return;

        if (key === 'photo' && typeof value === 'string' && value.startsWith('data:image')) {
            try {
                // Convert base64 to blob
                const byteString = atob(value.split(',')[1]);
                const mimeString = value.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                formData.append('photo', blob, `photo.${mimeString.split('/')[1]}`);
            } catch (e) {
                console.error('Error converting base64 to blob:', e);
                // Fallback: append as string if conversion fails, though likely won't work on server
                formData.append(key, String(value));
            }
        } else {
            // Append other fields as strings
            formData.append(key, String(value));
        }
    });

    return formData;
};
