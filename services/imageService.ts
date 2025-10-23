export const embedLogoOnImage = (
    baseImageSrc: string,
    logoImageSrc: string,
    placement: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        const baseImage = new Image();
        const logoImage = new Image();

        let baseImageLoaded = false;
        let logoImageLoaded = false;

        const drawImages = () => {
            if (!baseImageLoaded || !logoImageLoaded) return;

            // Set canvas dimensions
            canvas.width = baseImage.naturalWidth;
            canvas.height = baseImage.naturalHeight;

            // Draw base image
            ctx.drawImage(baseImage, 0, 0);

            // Calculate logo size (e.g., 15% of base image width)
            const logoAspectRatio = logoImage.naturalWidth / logoImage.naturalHeight;
            const logoWidth = canvas.width * 0.15;
            const logoHeight = logoWidth / logoAspectRatio;
            const padding = canvas.width * 0.02; // 2% padding

            let x = 0;
            let y = 0;

            // Determine placement
            switch (placement) {
                case 'top-left':
                    x = padding;
                    y = padding;
                    break;
                case 'top-right':
                    x = canvas.width - logoWidth - padding;
                    y = padding;
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvas.height - logoHeight - padding;
                    break;
                case 'center':
                    x = (canvas.width - logoWidth) / 2;
                    y = (canvas.height - logoHeight) / 2;
                    break;
                case 'bottom-right':
                default:
                    x = canvas.width - logoWidth - padding;
                    y = canvas.height - logoHeight - padding;
                    break;
            }

            // Draw logo image
            ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);

            // Resolve with the new image data
            resolve(canvas.toDataURL('image/jpeg', 0.9)); // 90% quality
        };

        baseImage.onload = () => {
            baseImageLoaded = true;
            drawImages();
        };
        baseImage.onerror = (err) => reject(new Error('Failed to load base image'));

        logoImage.onload = () => {
            logoImageLoaded = true;
            drawImages();
        };
        logoImage.onerror = (err) => reject(new Error('Failed to load logo image'));
        
        baseImage.crossOrigin = "anonymous";
        logoImage.crossOrigin = "anonymous";
        
        baseImage.src = baseImageSrc;
        logoImage.src = logoImageSrc;
    });
};
