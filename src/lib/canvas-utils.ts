// Canvas utility functions for PNG generation

interface CanvasConfig {
  width: number;
  height: number;
  padding: number;
  lineHeight: number;
  backgroundColor: string;
  textColor: string;
  scale: number; // For higher resolution
}

interface WellnessContent {
  name: string;
  facts: string[];
}

const DEFAULT_CONFIG: CanvasConfig = {
  width: 2400, // 4:3 aspect ratio at 3x resolution
  height: 1800,
  padding: 120, // Scaled padding
  lineHeight: 90, // Increased for better spacing between lines
  backgroundColor: '#ffffff',
  textColor: '#000000',
  scale: 3, // Higher scale factor for better resolution
};

// Load and wait for a font to be available
const loadFont = async (fontName: string, fontUrl: string): Promise<void> => {
  const font = new FontFace(fontName, `url(${fontUrl})`);
  const loadedFont = await font.load();
  document.fonts.add(loadedFont);
  await document.fonts.ready;
};

// Load and draw the logo
const loadAndDrawLogo = async (ctx: CanvasRenderingContext2D, x: number, y: number, width: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate height while maintaining aspect ratio
      const aspectRatio = img.height / img.width;
      const height = width * aspectRatio;
      ctx.drawImage(img, x, y, width, height);
      resolve();
    };
    img.onerror = reject;
    img.src = '/globe-logo.svg';
  });
};

// Calculate required canvas height based on content
const calculateCanvasHeight = (content: WellnessContent, config: CanvasConfig): number => {
  const headerHeight = 240 * config.scale; // Increased space for header
  const greetingHeight = config.lineHeight;
  const factsHeight = content.facts.length * config.lineHeight;
  const urlHeight = config.lineHeight * 2; // Extra space before URL
  const totalContentHeight = headerHeight + greetingHeight + factsHeight + urlHeight;
  
  return totalContentHeight + (config.padding * 2);
};

// Draw lines pattern similar to the header component
const drawHeaderLines = (ctx: CanvasRenderingContext2D, y: number, width: number): void => {
  const lineCount = 6;
  const lineHeight = 3; // Adjusted for higher resolution
  const lineGap = 6; // Adjusted for higher resolution
  
  ctx.fillStyle = '#000000';
  for (let i = 0; i < lineCount; i++) {
    ctx.fillRect(0, y + (i * (lineHeight + lineGap)), width, lineHeight);
  }
};

// Main function to generate PNG
export const generateWellnessPNG = async (
  content: WellnessContent,
  customConfig?: Partial<CanvasConfig>
): Promise<string> => {
  // Merge default config with custom config
  const config: CanvasConfig = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  try {
    // Load custom font
    await loadFont('Inter', '/fonts/Inter-Regular.woff2');
    await loadFont('Inter-Bold', '/fonts/Inter-Bold.woff2');
    
    // Fill background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw logo
    const logoWidth = 77 * config.scale;
    await loadAndDrawLogo(ctx, config.padding, config.padding, logoWidth);
    
    // Draw title
    ctx.fillStyle = config.textColor;
    ctx.font = `bold ${24 * config.scale}px Inter-Bold`;
    ctx.fillText('Outie Query System Interface (OQSI)', 
      config.padding + (logoWidth + 20), 
      config.padding + (30 * config.scale)
    );
    
    // Draw header lines with more space after
    const headerLinesY = config.padding + (60 * config.scale);
    drawHeaderLines(ctx, headerLinesY, canvas.width);
    
    // Draw greeting with more space after header
    let currentY = headerLinesY + (120 * config.scale);
    ctx.font = `bold ${20 * config.scale}px Inter-Bold`;
    ctx.fillText(`Wellness Facts for ${content.name}.`, config.padding, currentY);
    
    // Draw facts with more space between lines
    currentY += config.lineHeight * 2; // Extra space after greeting
    ctx.font = `${16 * config.scale}px Inter`;
    content.facts.forEach(fact => {
      // Handle text wrapping
      const words = fact.split(' ');
      let line = '';
      const maxWidth = canvas.width - (config.padding * 2);
      let isFirstLine = true;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, config.padding, currentY);
          line = words[i] + ' ';
          currentY += isFirstLine ? config.lineHeight * 0.7 : config.lineHeight * 0.7; // Less space for wrapped lines
          isFirstLine = false;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, config.padding, currentY);
      currentY += config.lineHeight * 1.2; // More space between facts
    });
    
    // Draw URL with button-like background
    currentY += config.lineHeight * 1.5; // Extra space before URL
    ctx.font = `${16 * config.scale}px Inter`;
    
    // Measure text for button sizing
    const urlText = 'YourOutie.is';
    const metrics = ctx.measureText(urlText);
    const buttonPadding = 20 * config.scale;
    const buttonHeight = 40 * config.scale;
    
    // Get font metrics for vertical centering
    const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const buttonY = currentY - (buttonHeight * 0.75);
    
    // Draw black rectangle
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      config.padding,
      buttonY,
      metrics.width + (buttonPadding * 2),
      buttonHeight
    );
    
    // Draw URL text in white, vertically centered
    ctx.fillStyle = '#ffffff';
    const textY = buttonY + (buttonHeight / 2) + (fontHeight / 2);
    ctx.fillText(
      urlText,
      config.padding + buttonPadding,
      textY
    );
    
    // Convert canvas to PNG data URL with maximum quality
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}; 