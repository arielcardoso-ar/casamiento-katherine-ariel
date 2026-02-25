# 🚀 Subir a GitHub - Método Simple

## Opción 1: Con Token (Recomendado)

### 1. Crear un Personal Access Token

1. Andá a: https://github.com/settings/tokens/new
2. Note: `casamiento-deploy`
3. Expiration: `90 days`
4. Marcá: ✅ `repo` (todos los permisos de repo)
5. Click **"Generate token"**
6. **COPIÁ EL TOKEN** (solo lo vas a ver una vez)

### 2. Crear el repositorio

1. Andá a: https://github.com/new
2. Repository name: `casamiento-katherine-ariel`
3. Public o Private
4. Click **"Create repository"**

### 3. Subir el código

Ejecutá en tu terminal (reemplazá TU-TOKEN y TU-USUARIO):

```bash
cd /Users/acardoso/Projects/casamiento-katherine-ariel

git remote add origin https://TU-TOKEN@github.com/TU-USUARIO/casamiento-katherine-ariel.git
git push -u origin main
```

---

## Opción 2: Con SSH (Más seguro)

### 1. Generar clave SSH

```bash
ssh-keygen -t ed25519 -C "arielcardoso93@gmail.com"
# Presioná Enter 3 veces (sin contraseña)

cat ~/.ssh/id_ed25519.pub
# Copiá todo el contenido
```

### 2. Agregar la clave a GitHub

1. Andá a: https://github.com/settings/ssh/new
2. Title: `Mac Ariel`
3. Key: Pegá la clave que copiaste
4. Click **"Add SSH key"**

### 3. Crear repo y subir

```bash
# Crear repo en: https://github.com/new

cd /Users/acardoso/Projects/casamiento-katherine-ariel
git remote add origin git@github.com:TU-USUARIO/casamiento-katherine-ariel.git
git push -u origin main
```

---

## ¿Cuál usar?

- **Token**: Más rápido, expira en 90 días
- **SSH**: Más seguro, permanente

Elegí el que prefieras! 🚀
