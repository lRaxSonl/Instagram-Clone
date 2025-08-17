FROM node:18

WORKDIR /app

#Копируем package.json и lock-файл
COPY package*.json ./

RUN npm install

COPY . .


#Открываем порт разработки React (по умолчанию 3000)
EXPOSE 3000

CMD ["npm", "start"]
