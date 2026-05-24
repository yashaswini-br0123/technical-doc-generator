import MarkdownIt from 'markdown-it';

// Helper to generate a timestamp for filenames
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}`;
}

// 1. Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      return false;
    }
  }
  return false;
}

// 2. Download Markdown file
export function downloadMarkdown(markdownContent: string): void {
  const timestamp = getTimestamp();
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `doc_${timestamp}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Custom styled CSS template for HTML and PDF exports
const exportStyles = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0F172A;
    line-height: 1.6;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    background-color: #FFFFFF;
  }
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #0F172A;
    margin-top: 0;
    margin-bottom: 24px;
    border-bottom: 2px solid #E2E8F0;
    padding-bottom: 12px;
  }
  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1E293B;
    margin-top: 32px;
    margin-bottom: 16px;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 8px;
  }
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #334155;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  p {
    margin-bottom: 16px;
    font-size: 14px;
  }
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  li {
    margin-bottom: 6px;
    font-size: 14px;
  }
  code {
    font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
    font-size: 12.5px;
    background-color: #F1F5F9;
    color: #0F172A;
    padding: 3px 6px;
    border-radius: 4px;
  }
  pre {
    background-color: #1E293B;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    overflow-x: auto;
    border: 1px solid #334155;
  }
  pre code {
    background-color: transparent;
    color: #F8FAFC;
    padding: 0;
    font-size: 12.5px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 13.5px;
  }
  th {
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 10px 12px;
    text-align: left;
    font-weight: 700;
    color: #334155;
  }
  td {
    border: 1px solid #E2E8F0;
    padding: 10px 12px;
    color: #475569;
  }
  tr:nth-child(even) {
    background-color: #FAFAFA;
  }
  blockquote {
    border-left: 4px solid #3B82F6;
    background-color: #F8FAFC;
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 0 6px 6px 0;
  }
  blockquote p {
    margin-bottom: 0;
    color: #475569;
    font-style: italic;
  }
`;

// 3. Download HTML file
export function downloadHtml(markdownContent: string): void {
  const timestamp = getTimestamp();
  const md = new MarkdownIt({ html: true, linkify: true });
  const renderedContent = md.render(markdownContent);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Technical Documentation - ${timestamp}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    ${exportStyles}
  </style>
</head>
<body>
  ${renderedContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `doc_${timestamp}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 4. Download PDF file using browser client html2pdf.js dynamically
export async function downloadPdf(markdownContent: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Dynamic import to prevent SSR bundling issues
    const html2pdf = (await import('html2pdf.js')).default;
    const md = new MarkdownIt({ html: true, linkify: true });
    const renderedContent = md.render(markdownContent);
    const timestamp = getTimestamp();

    // Create a temporary beautiful wrapper element for PDF generation
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.className = 'pdf-export-container';

    // Inject styles and content
    tempContainer.innerHTML = `
      <style>
        ${exportStyles}
        body {
          padding: 30px;
        }
        pre {
          white-space: pre-wrap;
          word-break: break-all;
        }
        h1, h2, h3, p, table, pre, blockquote {
          page-break-inside: avoid;
        }
      </style>
      <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">
        <span style="font-weight: 800; font-size: 14px; color: #3B82F6;">📄 DocGen</span>
        <span style="font-size: 10px; color: #94A3B8;">Technical Documentation | Generated ${new Date().toLocaleDateString()}</span>
      </div>
      <div>
        ${renderedContent}
      </div>
    `;

    document.body.appendChild(tempContainer);

    const options = {
      margin: 15,
      filename: `doc_${timestamp}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4' as const, orientation: 'portrait' as const }
    };

    await html2pdf().from(tempContainer).set(options).save();
    document.body.removeChild(tempContainer);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
}
