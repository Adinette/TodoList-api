# Backend API - Express & Node.js

Ce projet est un backend construit avec **Node.js** et **Express**, utilisant une base de données **sql** pour la gestion des données.

## 🛠️ Prérequis

Avant de commencer, assurez-vous d’avoir les éléments suivants installés :

- [Node.js](https://nodejs.org/) (v16 ou plus récent)
- [npm](https://www.npmjs.com/)
-  [SQL](https://www.mysql.com/)

## 🚀 Installation et Configuration

1. **Cloner le projet**  
   git clone https://github.com/Adinette/TodoList-api.git

2. **Installer les dépendances**
    npm install

3. **Configurer les variables d’environnement**
    Dupliquez le fichier .env.example et renommez-le en .env, puis remplissez les informations de connexion à votre base de données :

    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=mot_de_passe
    DB_NAME=nom_de_la_base
    DB_PORT=3306  # 5432 pour PostgreSQL

4. **Lancer le serveur**
    npm start
    Le serveur sera accessible sur http://localhost:5000/.

5. **API Endpoints**
    ***Authentification***
    POST /auth/login – Connexion d'un utilisateur
    POST /auth/logout
    POST /auth/forgot-password - Envoie de mail pour un nouveau mot de passe
    **Lancer le serveur**
    mailDev
    Le serveur sera accessible sur 
    MailDev webapp running at http://localhost:1080/
    MailDev SMTP Server running at localhost:1025
    POST /auth/reset-password/:token - Changer son mot de passe

    ***Utilisateurs***
    POST /user/register – Inscription d'un utilisateur
    GET /user – Récupérer tous les utilisateurs
    GET /user/:id – Récupérer un utilisateur par ID

    ***Tasks***
    POST /task - Ajpouter une tâche
    GET /task - Récupérer toute les tâches
    GET /task/:id - Récupérer une tâche
    PUT /task/:id - Modifier une tâche
    PUT /task/:id - Modifier le status d'une tâche
    DELETE /task/:id - Supprimer une tâche

     ***TaskStatus***
    POST /taskStatus - Ajpouter un status
    GET /taskStatus - Récupérer tout les status
    GET /taskStatus/:id - Récupérer un status
    PUT /taskStatus/:id - Modifier un status
    DELETE /taskStatus/:id - Supprimer un status

6.  Récupération de la base de données
    ```sql
    -- Exemple de script SQL pour créer la table `task`
    CREATE TABLE task (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        startDate DATETIME,
        endDate DATETIME
    );

    -- Exemple de script SQL pour créer la table `user`
    CREATE TABLE user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    -- Exemple de script SQL pour créer la table `taskstatus`
    CREATE TABLE taskstatus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(50) NOT NULL
    );
