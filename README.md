# PortfolioWeb
Web page to present personnal projects

## Tailwindcss

Désinstaller Tailwindcss
```bash
npm uninstall tailwindcss @tailwindcss/cli
```

## Build un projet Tailwindcss



Créé le CSS simpleplifié et optimisé après avoir travaillé `<script src="https://cdn.tailwindcss.com"></script>`

Dépendances:
```bash
sudo apt update
sudo apt install -y nodejs npm
```

Installer Tailwindcss aller à la racine du dépot local:
```bash
npm install -D tailwindcss @tailwindcss/cli
```
Cela créer un dossier node_modules

Pour vérifier l'installation
```bash
npm ls tailwindcss
```

Un fichier de configuration doit être crée au préalable ->`input.css`

Pour build :
```bash
npx tailwindcss -i ./input.css -o ./tailwindcss/output.css

```
Créer le CSS de style output.css optimisé avec uniquement les classes utilisé dans le HTML/JS.
Il suffit de l'importer comme un CSS classique et on n'a plus besoin de Tailwindcss