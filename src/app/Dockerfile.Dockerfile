# Usa una imagen de Node como base
FROM node:24

# Establece el directorio de trabajo en la aplicación
WORKDIR /src/app

# Copia los archivos de configuración
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia los archivos de la aplicación
COPY . .

# Compila la aplicación
RUN npm run build

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 4200

# Comando para ejecutar la aplicación
CMD ["npm", "start"]