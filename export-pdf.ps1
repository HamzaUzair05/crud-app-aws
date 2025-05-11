# Export submission document to PDF

Write-Host "To export your submission to PDF:" -ForegroundColor Green
Write-Host ""
Write-Host "Option 1: Using Visual Studio Code" -ForegroundColor Cyan
Write-Host "  1. Install the 'Markdown PDF' extension" -ForegroundColor Yellow
Write-Host "  2. Open SUBMISSION.md" -ForegroundColor Yellow
Write-Host "  3. Right-click and select 'Markdown PDF: Export (pdf)'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 2: Using Online Services" -ForegroundColor Cyan
Write-Host "  1. Open SUBMISSION.md in GitHub" -ForegroundColor Yellow
Write-Host "  2. Copy the content" -ForegroundColor Yellow
Write-Host "  3. Paste into a service like https://md2pdf.netlify.app/" -ForegroundColor Yellow
Write-Host "  4. Download the PDF" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 3: Using Pandoc (if installed)" -ForegroundColor Cyan
Write-Host "  Run: pandoc SUBMISSION.md -o SUBMISSION.pdf" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure all your screenshots are included in the PDF!" -ForegroundColor Red
