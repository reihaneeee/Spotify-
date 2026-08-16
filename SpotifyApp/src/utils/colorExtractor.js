export const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve('#1db954');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // افزودن پارامتر زمان برای دور زدن کش مرورگر در CORS
    const cacheBustedUrl = imageUrl.includes('data:') || imageUrl.includes('blob:') 
      ? imageUrl 
      : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;

    img.src = cacheBustedUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 40;

        ctx.drawImage(img, 0, 0, 40, 40);
        const imageData = ctx.getImageData(0, 0, 40, 40).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.length; i += 16) {
          // نادیده گرفتن پیکسل‌های خیلی روشن یا خیلی تاریک برای رنگ بهتر
          const red = imageData[i];
          const green = imageData[i + 1];
          const blue = imageData[i + 2];
          
          const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
          if (brightness > 30 && brightness < 220) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }

        if (count === 0) {
          resolve('#1db954');
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        // در صورت خطای CORS مرورگر
        console.warn("CORS issue when extracting color, using fallback.", e);
        resolve('#1db954');
      }
    };

    img.onerror = () => {
      resolve('#1db954');
    };
  });
};