# Menu des commandes utiles - Galerie des Souvenirs
# Usage: .\Menu.PS1

function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Galerie des Souvenirs - Menu" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Consulter la base (db:inspect)"
    Write-Host "  2. Initialiser le schéma (db:init)"
    Write-Host "  3. Publier (publish)"
    Write-Host "  4. Lancer le serveur de dev (dev)"
    Write-Host "  5. Build"
    Write-Host "  6. Lint (ESLint)"
    Write-Host "  7. Tests unitaires (test:unit)"
    Write-Host "  8. Tests BDD (test:bdd)"
    Write-Host "  9. Tests E2E (test:e2e)"
    Write-Host " 10. Convertir HEIC → WebP (convert:heic)"
    Write-Host "  0. Quitter"
    Write-Host ""
}

function Run-Choice {
    param ([string]$choice)
    $cmd = switch ($choice) {
        "1"  { "npm run db:inspect" }
        "2"  { "npm run db:init" }
        "3"  { "npm run publish" }
        "4"  { "npm run dev" }
        "5"  { "npm run build" }
        "6"  { "npm run lint" }
        "7"  { "npm run test:unit" }
        "8"  { "npm run test:bdd" }
        "9"  { "npm run test:e2e" }
        "10" { "npm run convert:heic" }
        default { $null }
    }
    if ($cmd) {
        Write-Host "`n>>> $cmd`n" -ForegroundColor Yellow
        Invoke-Expression $cmd
    }
}

# Boucle principale
do {
    Show-Menu
    $input = Read-Host "Choix (0-10)"
    if ($input -eq "0") { break }
    Run-Choice -choice $input
    if ($input -ne "0") {
        Write-Host "`n[Appuyez sur Entrée pour revenir au menu...]"
        Read-Host
    }
} while ($true)

Write-Host "Au revoir." -ForegroundColor Cyan
