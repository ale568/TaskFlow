// renderer/utils/pdfmakeFonts.js
const PdfPrinter = require('pdfmake');
const path = require('path');

// Usa font open source DejaVu se preferisci, oppure Noto
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../../assets/fonts/Roboto-Bold.ttf'),
    italics: path.join(__dirname, '../../assets/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../assets/fonts/Roboto-BoldItalic.ttf')
  }
};

module.exports = new PdfPrinter(fonts);